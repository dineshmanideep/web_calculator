import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends an email using the configured transporter.
 *
 * @param {Object} options - The email options.
 * @param {string} options.to - Recipient email address.
 * @param {string} options.subject - Email subject.
 * @param {string} options.text - Email body (used as HTML).
 * @param {string} [options.from] - Sender email address.
 * @returns {Promise<Object>} The nodemailer info object.
 * @throws {Error} If required mail fields are missing or if sending fails.
 */
export async function sendMail({ to, subject, text, from }) {
  try {
    // Use provided from or fallback to env or default
    const mailFrom = from || process.env.FROM_EMAIL || process.env.SMTP_USER;

    if (!to || !subject || !text) {
      throw new Error('Missing required mail fields');
    }

    const info = await transporter.sendMail({
      from: mailFrom, // Added 'from' based on logic above and nodemailer requirement
      to,
      subject,
      html: text,
    });

    // eslint-disable-next-line no-console
    console.log('Email sent:', info.messageId);

    return info;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error sending email:', err);

    throw err;
  }
}