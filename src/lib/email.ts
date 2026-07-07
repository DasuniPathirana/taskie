import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.spacemail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'support@taskie.site',
    pass: process.env.SMTP_PASS || 'Taskie@123',
  },
});

export const sendWelcomeEmail = async (to: string, name: string) => {
  const mailOptions = {
    from: '"Taskie" <support@taskie.site>',
    to,
    subject: 'Welcome to Taskie!',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to Taskie, ${name}!</h2>
        <p>We are thrilled to have you on board. You can now start creating projects, adding tasks, and collaborating with your team.</p>
        <br>
        <p>Best regards,<br>The Taskie Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendProjectInviteEmail = async (to: string, projectName: string, tempPassword?: string) => {
  const loginUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.taskie.site';
  
  const passwordSection = tempPassword 
    ? `<p>An account has been automatically created for you. Your temporary password is: <strong>${tempPassword}</strong></p><p>Please login and change it as soon as possible.</p>`
    : `<p>Log in to your account to view the project.</p>`;

  const mailOptions = {
    from: '"Taskie" <support@taskie.site>',
    to,
    subject: `You've been invited to join ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h2 style="color: #111827;">You've been invited!</h2>
        <p style="color: #4b5563; line-height: 1.6;">You have been added to the project <strong>${projectName}</strong> on Taskie.</p>
        <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          ${passwordSection}
        </div>
        <div style="margin: 32px 0;">
          <a href="${loginUrl}/login" style="display: inline-block; padding: 12px 24px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Log in to Taskie</a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Best regards,<br>The Taskie Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendTaskAssignmentEmail = async (to: string, taskTitle: string, projectName: string) => {
  const mailOptions = {
    from: '"Taskie" <support@taskie.site>',
    to,
    subject: `New Task Assigned: ${taskTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>You have a new task!</h2>
        <p>You have been assigned the task <strong>${taskTitle}</strong> in the project <strong>${projectName}</strong>.</p>
        <p>Log in to Taskie to view the details and update its status.</p>
        <br>
        <p>Best regards,<br>The Taskie Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
