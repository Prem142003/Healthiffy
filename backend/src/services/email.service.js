import nodemailer from 'nodemailer';
import { env } from '../config/env.config.js';

let transporter;

const getMissingSmtpKeys = () =>
  [
    ['host', env.smtp.host],
    ['user', env.smtp.user],
    ['pass', env.smtp.pass]
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

const canSendEmail = () => getMissingSmtpKeys().length === 0;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure || env.smtp.port === 465,
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
      tls: {
        minVersion: 'TLSv1.2'
      },
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass
      }
    });
  }

  return transporter;
};

const sanitizeEmailError = (error) => ({
  message: error.message,
  stack: error.stack,
  code: error.code,
  command: error.command,
  responseCode: error.responseCode,
  response: error.response
});

export const verifyEmailTransporter = async () => {
  const missingKeys = getMissingSmtpKeys();
  console.log('[email] SMTP config check', {
    host: env.smtp.host || null,
    port: env.smtp.port,
    secure: env.smtp.secure || env.smtp.port === 465,
    userConfigured: Boolean(env.smtp.user),
    passConfigured: Boolean(env.smtp.pass),
    from: env.smtp.from,
    frontendUrl: env.clientUrl,
    missingKeys
  });

  if (!canSendEmail()) {
    const message = `SMTP is not configured. Missing: ${missingKeys.join(', ')}`;
    if (env.isProduction) {
      console.error(`[email] ${message}`);
    } else {
      console.warn(`[email] ${message}. Emails will be skipped in development.`);
    }
    return false;
  }

  try {
    await getTransporter().verify();
    console.log('[email] SMTP transporter verified successfully');
    return true;
  } catch (error) {
    console.error('[email] SMTP transporter verification failed', sanitizeEmailError(error));
    if (env.isProduction) {
      throw error;
    }
    return false;
  }
};

export const sendEmail = async ({ to, subject, text, html }) => {
  console.log('[email] Send requested', {
    to,
    subject,
    host: env.smtp.host || null,
    from: env.smtp.from
  });

  if (!canSendEmail()) {
    const missingKeys = getMissingSmtpKeys();
    if (env.isProduction) {
      throw new Error(`SMTP is not configured. Missing: ${missingKeys.join(', ')}`);
    }

    console.warn('[email] Skipped because SMTP is not configured', { to, subject, missingKeys });
    return { skipped: true, missingKeys };
  }

  try {
    const info = await getTransporter().sendMail({
      from: env.smtp.from,
      to,
      subject,
      text,
      html
    });

    console.log('[email] Sent successfully', {
      to,
      subject,
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected
    });

    return info;
  } catch (error) {
    console.error('[email] Send failed', {
      to,
      subject,
      ...sanitizeEmailError(error)
    });
    throw error;
  }
};
