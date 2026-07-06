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
  const passwordSection = tempPassword 
    ? `<p>An account has been automatically created for you. Your temporary password is: <strong>${tempPassword}</strong></p><p>Please login and change it as soon as possible.</p>`
    : `<p>Log in to your account to view the project.</p>`;

  const mailOptions = {
    from: '"Taskie" <support@taskie.site>',
    to,
    subject: `You've been invited to join ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>You've been invited!</h2>
        <p>You have been added to the project <strong>${projectName}</strong> on Taskie.</p>
        ${passwordSection}
        <br>
        <p>Best regards,<br>The Taskie Team</p>
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
