import sgMail from '@sendgrid/mail';
import dotenv from "dotenv";
dotenv.config();
// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send email using SendGrid Web API
 */
export const sendMail = async ({to, subject, text}) => {
  try {
    const msg = {
      to: to,
      from: {
        email: process.env.SMTP_USER,
        name: 'Scientific Calculator',
      },
      subject: subject,
      text: text,
    };

    const response = await sgMail.send(msg);
    console.log('Email sent successfully:', response[0].statusCode);
    return response;
  } catch (error) {
    console.error('Email sending failed:', error);
    if (error.response) {
      console.error('Error details:', error.response.body);
    }
    throw error;
  }
};