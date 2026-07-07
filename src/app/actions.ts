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

  await db.task.create({
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

  revalidatePath(`/projects/${projectId}`);
}

export async function handleUpdateTaskStatus(taskId: string, status: string, projectId: string) {
  await db.task.update({
    where: { id: taskId },
    data: { 
      status,
      progress: status === 'Done' ? 100 : undefined
    }
  });
  
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

  await db.comment.create({
    data: {
      taskId,
      userId: session.user.id,
      content
    }
  });

  revalidatePath(`/projects/${projectId}`);
}
