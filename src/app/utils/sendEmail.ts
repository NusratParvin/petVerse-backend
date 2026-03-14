import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    // secure: config.NODE_ENV === 'production',
    secure: false,
    auth: {
      user: config.email_user,
      pass: config.email_pass,
    },
  });

  await transporter.sendMail({
    from: `PerVerse UAE <${config.email_user}>`,
    to,
    subject,
    text: '',
    html,
  });
};
