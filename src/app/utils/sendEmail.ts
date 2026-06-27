import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
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
    // console.log(to, subject, html);

    await transporter.sendMail({
      from: `PerVerse UAE <${config.email_user}>`,
      to,
      subject,
      text: '',
      html,
    });

    // console.log(res);
  } catch (error) {
    console.error('Email error:', error);
  }
};
