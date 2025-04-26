import type { NextApiRequest, NextApiResponse } from 'next';
import OTP from '@/models/OTP';
import connectToDatabase from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Connect to the database
  await connectToDatabase();

  const { email, otp, purpose = 'signup' } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    // Find the OTP record
    const otpRecord = await OTP.findOne({
      email,
      otp,
      purpose
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expires) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'OTP expired' });
    }

    // OTP is valid, but don't delete it yet if it's needed for other operations
    // like password reset or signup (will be deleted there after use)
    if (purpose === 'login') {
      await OTP.deleteOne({ _id: otpRecord._id });
    }

    return res.status(200).json({ message: 'OTP verified' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ message: 'Server error' });
  }
} 