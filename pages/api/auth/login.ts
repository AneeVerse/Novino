import type { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/User';
import connectToDatabase from '@/lib/db';
import jwt from 'jsonwebtoken';
import { rateLimit, AccountLockoutManager } from '@/lib/rate-limit';
import { validateIdentifier } from '@/lib/validation';

// Create rate limiter (5 requests per 15 minutes)
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later'
});

// Create account lockout manager (5 failed attempts, 15 minute lockout)
const lockoutManager = new AccountLockoutManager({
  maxAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Apply rate limiting
  if (!loginRateLimit.check(req, res)) {
    return; // Response already sent by rate limiter
  }

  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ message: 'Identifier and password are required' });
  }

  // Validate identifier
  const identifierValidation = validateIdentifier(identifier);
  if (!identifierValidation.isValid) {
    return res.status(400).json({ message: identifierValidation.error });
  }

  try {
    // Connect to the database
    await connectToDatabase();
    
    // Find the user by email or username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier }
      ]
    }).select('+password'); // Include password field which is excluded by default

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check account lockout BEFORE checking password
    if (lockoutManager.isLocked(user.email)) {
      const timeRemaining = lockoutManager.getLockoutTimeRemaining(user.email);
      return res.status(429).json({ 
        message: `Account temporarily locked due to too many failed login attempts. Please try again in ${Math.ceil(timeRemaining / 60)} minutes.`,
        lockedUntil: timeRemaining
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Record failed attempt
      lockoutManager.recordFailedAttempt(user.email);
      const attemptsRemaining = lockoutManager.getAttemptsRemaining(user.email);
      
      if (attemptsRemaining > 0) {
        return res.status(401).json({ 
          message: 'Invalid credentials',
          attemptsRemaining
        });
      } else {
        return res.status(429).json({ 
          message: 'Too many failed login attempts. Your account has been temporarily locked.',
          lockedUntil: lockoutManager.getLockoutTimeRemaining(user.email)
        });
      }
    }

    // Reset failed attempts on successful login
    lockoutManager.resetAttempts(user.email);

    // Create JWT
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ message: 'Server configuration error' });
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

    return res.status(200).json({ 
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      message: 'Error during login',
      error: error.message 
    });
  }
} 