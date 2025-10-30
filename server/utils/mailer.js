/**
 * Author: P. Dinesh Manideep
 * Description: Email utility module for sending mails using Nodemailer with Gmail service and environment-based configuration.
 */

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
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
    const mailFrom = from || process.env.FROM_EMAIL || process.env.SMTP_USER;

    if (!to || !subject || !text) {
      throw new Error("Missing required mail fields");
    }

    const info = await transporter.sendMail({
      from: mailFrom,
      to,
      subject,
      html: text,
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
}
