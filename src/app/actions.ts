'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProject(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name) throw new Error('Project name is required');

  const project = await db.project.create({
    data: {
      name,
      description,
      status: 'Active',
    }
  });

  revalidatePath('/');
  revalidatePath('/projects');
  redirect(`/projects/${project.id}`);
}

export async function createTask(projectId: string, formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  if (!title) throw new Error('Task title is required');

  await db.task.create({
    data: {
      projectId,
      title,
      description,
      status: 'Todo',
      progress: 0,
      timeSpent: 0
    }
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function updateTaskStatus(taskId: string, status: string, projectId: string) {
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

export async function deleteTask(taskId: string, projectId: string) {
  await db.task.delete({
    where: { id: taskId }
  });
  
  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/');
}
