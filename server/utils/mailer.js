import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service:'gmail',
 auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail({ to, subject, text, from }) {
  try {
    // Use provided from or fallback to env or default
    const mailFrom = from || process.env.FROM_EMAIL || process.env.SMTP_USER;
    if (!to || !subject || !text) throw new Error("Missing required mail fields");
    const info = await transporter.sendMail({
      
      to,
      subject,
      html:text,
    });
    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
}


// sendMail("dineshmanideep@gmail.com","Subject","html")