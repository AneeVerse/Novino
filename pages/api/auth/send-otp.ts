import type { NextApiRequest, NextApiResponse } from 'next';
import OTP from '@/models/OTP';
import User from '@/models/User';
import connectToDatabase from '@/lib/db';
import { sendOtpEmail } from '@/lib/mailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Connect to the database
  await connectToDatabase();

  const { email, purpose = 'signup' } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Validate purpose
  if (!['signup', 'login', 'reset'].includes(purpose)) {
    return res.status(400).json({ message: 'Invalid purpose' });
  }

  // For password reset, check if the user exists
  if (purpose === 'reset') {
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, we still return success to avoid user enumeration
      return res.status(200).json({ message: 'If your email exists in our system, you will receive an OTP' });
    }
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  try {
    // Delete any existing OTPs for this email and purpose
    await OTP.deleteMany({ email, purpose });

    // Store new OTP
    await OTP.create({
      email,
      otp,
      purpose,
      expires
    });

    // Send OTP email
    await sendOtpEmail(email, otp);

    return res.status(200).json({ message: 'OTP sent' });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return res.status(500).json({ message: 'Error sending OTP' });
  }
} 