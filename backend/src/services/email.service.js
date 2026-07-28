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
const canSendResendEmail = () => Boolean(env.resend.apiKey && env.smtp.from);

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
  if (env.emailProvider === 'resend') {
    console.log('[email] Resend config check', {
      provider: env.emailProvider,
      apiKeyConfigured: Boolean(env.resend.apiKey),
      from: env.smtp.from,
      frontendUrl: env.clientUrl
    });

    if (!canSendResendEmail()) {
      throw new Error('Resend is not configured. Missing RESEND_API_KEY or EMAIL_FROM.');
    }

    console.log('[email] Resend email provider configured successfully');
    return true;
  }

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

const sendWithResend = async ({ to, subject, text, html }) => {
  console.log('[email] Resend send requested', {
    to,
    subject,
    from: env.smtp.from
  });

  if (!canSendResendEmail()) {
    throw new Error('Resend is not configured. Missing RESEND_API_KEY or EMAIL_FROM.');
  }

  const response = await fetch(env.resend.apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resend.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Healthiffy Backend'
    },
    body: JSON.stringify({
      from: env.smtp.from,
      to: [to],
      subject,
      text,
      html
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || data.error || 'Resend email send failed');
    error.code = `RESEND_${response.status}`;
    error.responseCode = response.status;
    error.response = data;
    console.error('[email] Resend send failed', {
      to,
      subject,
      status: response.status,
      response: data
    });
    throw error;
  }

  console.log('[email] Resend sent successfully', {
    to,
    subject,
    messageId: data.id,
    response: data
  });

  return data;
};

const sendWithSmtp = async ({ to, subject, text, html }) => {
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

export const sendEmail = async ({ to, subject, text, html }) => {
  if (env.emailProvider === 'resend') {
    return sendWithResend({ to, subject, text, html });
  }

  return sendWithSmtp({ to, subject, text, html });
};
