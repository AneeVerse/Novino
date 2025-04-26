import nodemailer from 'nodemailer';

// Configure the SMTP transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT || 465),
  secure: Number(process.env.EMAIL_PORT || 465) === 465, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

export async function sendOtpEmail(to: string, otp: string) {
  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@example.com';
  
  console.log(`Sending OTP to ${to} with SMTP configuration:`, {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 465,
    user: process.env.EMAIL_USER ? 
      `${process.env.EMAIL_USER.substring(0, 3)}...` : 
      'Not configured'
  });

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: 'Your One-Time Password',
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
      html: `<p>Your OTP code is <strong>${otp}</strong>.</p><p>It will expire in 5 minutes.</p>`,
    });
    
    console.log('Email sent successfully');
    return info;
  } catch (error) {
    console.error('SMTP Error:', error);
    throw error;
  }
} 