import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();


async function testMailer() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.CONTACT_RECEIVER,
    subject: 'Test Nodemailer',
    text: 'Hello! This is a test email from Nodemailer.',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.response);
  } catch (err) {
    console.error('❌ Email failed:', err);
  }
}

testMailer();
