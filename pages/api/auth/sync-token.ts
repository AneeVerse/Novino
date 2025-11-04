import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './[...nextauth]';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

/**
 * This endpoint syncs the JWT token cookie after Google OAuth login
 * It's called after successful NextAuth authentication to create
 * a compatible JWT token cookie for the existing auth system
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get NextAuth session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Fetch user from database
    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked' });
    }

    if (!user._id) {
      return res.status(500).json({ message: 'User ID is missing' });
    }

    // Create JWT token in the same format as regular login
    const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'developmentsecret123';
    const userId = typeof user._id === 'object' && user._id.toString ? user._id.toString() : String(user._id);
    
    const token = jwt.sign(
      {
        userId: userId,
        email: user.email,
        username: user.username
      },
      secret,
      { expiresIn: '7d' }
    );

    // Set cookie in the same format as regular login
    res.setHeader(
      'Set-Cookie',
      `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    );

    return res.status(200).json({
      message: 'Token synced successfully',
      user: {
        id: userId,
        email: user.email,
        username: user.username
      }
    });
  } catch (error: any) {
    console.error('Token sync error:', error);
    return res.status(500).json({ message: 'Error syncing token', error: error.message });
  }
}

