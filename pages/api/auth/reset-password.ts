import type { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/User';
import OTP from '@/models/OTP';
import connectToDatabase from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Connect to the database
  await connectToDatabase();

  const { email, password, otp } = req.body;
  if (!email || !password || !otp) {
    return res.status(400).json({ message: 'Email, password and OTP are required' });
  }

  try {
    // Verify OTP
    const otpRecord = await OTP.findOne({ 
      email, 
      otp,
      purpose: 'reset'
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > otpRecord.expires) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    user.password = password; // Will be hashed by the pre-save hook
    await user.save();

    // Delete OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error: any) {
    console.error('Password reset error:', error);
    return res.status(500).json({ 
      message: 'Error resetting password',
      error: error.message
    });
  }
} 