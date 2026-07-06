'use server';

import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/email';

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    throw new Error('Missing fields');
  }

  const existingUser = await db.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    }
  });

  // Try to send email, but don't fail registration if it fails
  try {
    await sendWelcomeEmail(email, name);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }

  return { success: true };
}
