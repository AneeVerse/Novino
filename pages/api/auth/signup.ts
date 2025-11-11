import type { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/User';
import OTP from '@/models/OTP';
import connectToDatabase from '@/lib/db';
import jwt from 'jsonwebtoken';
import { rateLimit } from '@/lib/rate-limit';
import { validateEmail, validateUsername, validatePassword, validateOTP } from '@/lib/validation';

// Create rate limiter for signup (3 requests per 15 minutes)
const signupRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: 'Too many signup attempts, please try again later'
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Apply rate limiting
  if (!signupRateLimit.check(req, res)) {
    return; // Response already sent by rate limiter
  }

  // Connect to the database
  await connectToDatabase();

  const { email, username, password, otp } = req.body;
  if (!email || !username || !password || !otp) {
    return res.status(400).json({ message: 'Email, username, password and OTP are required' });
  }

  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return res.status(400).json({ message: emailValidation.error });
  }

  // Validate username
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    return res.status(400).json({ message: usernameValidation.error });
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({ message: passwordValidation.error });
  }

  // Validate OTP
  const otpValidation = validateOTP(otp);
  if (!otpValidation.isValid) {
    return res.status(400).json({ message: otpValidation.error });
  }

  try {
    // Verify OTP
    const otpRecord = await OTP.findOne({ 
      email, 
      otp,
      purpose: 'signup'
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > otpRecord.expires) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Check if user already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Create new user
    const user = await User.create({
      email,
      username,
      password // Will be hashed by the pre-save hook
    });

    // Delete OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    // Create JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT secret not configured' });
    }

    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        username: user.username 
      }, 
      secret, 
      { expiresIn: '1d' }
    );

    // Set cookie
    res.setHeader(
      'Set-Cookie', 
      `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    );

    return res.status(201).json({ 
      message: 'Signup successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ 
      message: 'Error creating user',
      error: error.message
    });
  }
} 