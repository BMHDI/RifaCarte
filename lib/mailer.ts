import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();


// 1️⃣ Create transporter
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER, // your Gmail address
    pass: process.env.SMTP_PASS, // your 16-character App Password
  },
});

// 2️⃣ Send email function
export async function sendContactEmail({
  firstName,
  lastName,
  email,
  phone,
  status,
  address,
  message,
}: any) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_RECEIVER, // your email to receive requests
      subject: `Nouvelle demande de contact de ${firstName} ${lastName}`,
      text: `
Nom: ${firstName || 'Non fourni'} ${lastName || 'Non fourni'}
Email: ${email || 'Non fourni'}
Téléphone: ${phone || 'Non fourni'}
Statut: ${status || 'Non fourni'}
Adresse: ${address || 'Non fourni'}
Message: ${message || 'Non fourni'}
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response); // log Gmail server response
    return info;
  } catch (err) {
    console.error('❌ Email failed:', err);
    throw err;
  }
}
