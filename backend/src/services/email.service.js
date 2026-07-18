import nodemailer from 'nodemailer';
import { env } from '../config/env.config.js';

const canSendEmail = Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);

const createTransporter = () =>
  nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass
    }
  });

export const sendEmail = async ({ to, subject, text }) => {
  if (!canSendEmail) {
    if (env.isProduction) {
      throw new Error('SMTP is not configured');
    }

    console.log(`[email skipped] To: ${to} | Subject: ${subject} | ${text}`);
    return;
  }

  await createTransporter().sendMail({
    from: env.smtp.from,
    to,
    subject,
    text
  });
};
