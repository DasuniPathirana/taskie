'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { sendProjectInviteEmail, sendTaskAssignmentEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';

export async function createProject(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name) throw new Error('Project name is required');

  const project = await db.project.create({
    data: {
      name,
      description,
      status: 'Active',
      members: {
        create: {
          userId: session.user.id,
          role: 'OWNER'
        }
      }
    }
  });

  revalidatePath('/');
  revalidatePath('/projects');
  redirect(`/projects/${project.id}`);
}

export async function inviteUserToProject(projectId: string, email: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not authenticated' };

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return { error: 'Project not found' };

  let user = await db.user.findUnique({ where: { email } });
  let tempPassword = '';

  if (!user) {
    tempPassword = Math.random().toString(36).slice(-8) + 'A1!'; // Generate simple strong password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    user = await db.user.create({
      data: {
        email,
        name: email.split('@')[0],
        password: hashedPassword,
      }
    });
  }

  // Check if already a member
  const existingMember = await db.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId: user.id }
    }
  });

  if (existingMember) return { error: 'User is already a member of this project' };

  await db.projectMember.create({
    data: {
      projectId,
      userId: user.id,
      role: 'MEMBER'
    }
  });

  try {
    await sendProjectInviteEmail(email, project.name, tempPassword || undefined);
  } catch (err) {
    console.error('Failed to send invite email', err);
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function handleCreateTask(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const assigneeId = formData.get('assigneeId') as string;
  const startDateStr = formData.get('startDate') as string;
  const endDateStr = formData.get('endDate') as string;
  const estimatedHoursStr = formData.get('estimatedHours') as string;

  if (!title) throw new Error('Task title is required');

  const task = await db.task.create({
    data: {
      projectId,
      title,
      description: description || null,
      assigneeId: assigneeId || null,
      startDate: startDateStr ? new Date(startDateStr) : null,
      endDate: endDateStr ? new Date(endDateStr) : null,
      estimatedHours: estimatedHoursStr ? parseFloat(estimatedHoursStr) : null,
      status: 'New',
      progress: 0,
      timeSpent: 0
    }
  });

  if (assigneeId && assigneeId !== session.user.id) {
    await db.notification.create({
      data: {
        userId: assigneeId,
        type: 'ASSIGNMENT',
        message: `${session.user.name} assigned you a new task: "${title}".`,
        link: `/projects/${projectId}?task=${task.id}`
      }
    });
  }

  revalidatePath(`/projects/${projectId}`);
}

export async function handleUpdateTaskStatus(taskId: string, status: string, projectId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const task = await db.task.update({
    where: { id: taskId },
    data: { 
      status,
      progress: status === 'Done' ? 100 : undefined
    }
  });

  if (task.assigneeId && task.assigneeId !== session.user.id) {
    await db.notification.create({
      data: {
        userId: task.assigneeId,
        type: 'STATUS',
        message: `Task "${task.title}" status was updated to ${status} by ${session.user.name}.`,
        link: `/projects/${projectId}?task=${taskId}`
      }
    });
  }
  
  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/');
}

export async function assignTask(taskId: string, assigneeId: string, projectId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const task = await db.task.update({
    where: { id: taskId },
    data: { assigneeId },
    include: { project: true, assignee: true }
  });

  if (task.assigneeId && task.assigneeId !== session.user.id) {
    await db.notification.create({
      data: {
        userId: task.assigneeId,
        type: 'ASSIGNMENT',
        message: `${session.user.name} assigned you a task: "${task.title}".`,
        link: `/projects/${projectId}?task=${taskId}`
      }
    });
  }

  if (task.assignee?.email && task.assigneeId !== session.user.id) {
    try {
      await sendTaskAssignmentEmail(task.assignee.email, task.title, task.project.name);
    } catch (err) {
      console.error('Failed to send assignment email', err);
    }
  }

  revalidatePath(`/projects/${projectId}`);
}

export async function handleDeleteTask(taskId: string, projectId: string) {
  await db.task.delete({
    where: { id: taskId }
  });
  
  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/');
}

export async function deleteProject(projectId: string) {
  const session = await auth();
  if (session?.user?.role !== 'Admin') throw new Error('Unauthorized');

  await db.project.delete({
    where: { id: projectId }
  });
  
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function handleInviteUser(projectId: string, formData: FormData) {
  const email = formData.get('email') as string;
  if (email) {
    try {
      return await inviteUserToProject(projectId, email);
    } catch (error: any) {
      return { error: error.message || 'Failed to invite user' };
    }
  }
  return { error: 'Email is required' };
}

export async function handleAssignTask(taskId: string, projectId: string, formData: FormData) {
  const assigneeId = formData.get('assigneeId') as string;
  if (assigneeId) {
    await assignTask(taskId, assigneeId, projectId);
  }
}

export async function handleUpdateTaskStatusForm(taskId: string, projectId: string, formData: FormData) {
  const status = formData.get('status') as string;
  if (status) {
    await handleUpdateTaskStatus(taskId, status, projectId);
  }
}

export async function handleAddComment(taskId: string, projectId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const content = formData.get('content') as string;
  if (!content) return;

  const comment = await db.comment.create({
    data: {
      taskId,
      userId: session.user.id,
      content
    }
  });

  // Parse mentions (e.g., @John Doe or @johndoe)
  const projectMembers = await db.projectMember.findMany({
    where: { projectId },
    include: { user: true }
  });

  for (const member of projectMembers) {
    if (member.userId === session.user.id) continue;
    
    // Check if the exact name or first name is mentioned
    const mentionString = `@${member.user.name}`;
    const mentionFirstName = `@${member.user.name.split(' ')[0]}`;
    
    if (content.includes(mentionString) || content.includes(mentionFirstName)) {
      await db.notification.create({
        data: {
          userId: member.userId,
          type: 'MENTION',
          message: `${session.user.name} mentioned you in a comment.`,
          link: `/projects/${projectId}?task=${taskId}`
        }
      });
    }
  }

  revalidatePath(`/projects/${projectId}`);
}

// Subtask Actions
export async function handleAddSubtask(taskId: string, projectId: string, title: string) {
  if (!title) return;
  await db.subtask.create({
    data: { taskId, title }
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function handleToggleSubtask(subtaskId: string, projectId: string, isCompleted: boolean) {
  await db.subtask.update({
    where: { id: subtaskId },
    data: { isCompleted }
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function handleDeleteSubtask(subtaskId: string, projectId: string) {
  await db.subtask.delete({
    where: { id: subtaskId }
  });
  revalidatePath(`/projects/${projectId}`);
}

// Notification Actions
export async function handleMarkNotificationRead(notificationId: string) {
  await db.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  });
}
