import type { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/User';
import connectToDatabase from '@/lib/db';
import { getTokenFromReq, verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get token from request
    const token = getTokenFromReq(req);
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Verify token
    const userInfo = verifyToken(token);
    
    // If this is an admin token, they're always allowed (admins can't be blocked)
    if (userInfo.isAdmin) {
      return res.status(200).json({ status: 'active' });
    }

    // Connect to database
    await connectToDatabase();

    // Check if user exists and is not blocked
    const user = await User.findById(userInfo.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get token issuance time (the iat claim is automatically added by jwt.sign)
    const tokenIssuedAt = userInfo.iat ? new Date(userInfo.iat * 1000) : null;

    // Check if user is blocked
    if (user.isBlocked) {
      // If the user has a lastBlockedAt timestamp and the token was issued before the user was blocked,
      // or if there's no lastBlockedAt but the user is blocked, then the token should be invalidated
      if ((user.lastBlockedAt && tokenIssuedAt && user.lastBlockedAt > tokenIssuedAt) || !tokenIssuedAt) {
        return res.status(403).json({ 
          status: 'blocked',
          message: 'Your account has been blocked. Please contact support.'
        });
      }
    }

    // User is active
    return res.status(200).json({ status: 'active' });
  } catch (err: any) {
    console.error('Error checking user status:', err);
    return res.status(500).json({ message: 'Error checking user status' });
  }
} 