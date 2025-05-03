import type { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/User';
import connectToDatabase from '@/lib/db';
import { getTokenFromReq, verifyToken } from '@/lib/auth';

// Import the server-sent events helper (will create this next)
import { broadcastUserBlocked } from '@/lib/server-events';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow PATCH for updating user status
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify admin authentication
    const token = getTokenFromReq(req);
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      verifyToken(token);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Connect to database
    await connectToDatabase();

    const userId = req.query.id as string;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle user status
    const currentStatus = user.isBlocked || false;
    user.isBlocked = !currentStatus;
    
    // If the user is now blocked, update their lastBlockedAt timestamp
    if (user.isBlocked) {
      user.lastBlockedAt = new Date();
      
      // Broadcast a notification to force-logout this user
      try {
        broadcastUserBlocked(userId.toString());
      } catch (error) {
        console.error('Error broadcasting user blocked event:', error);
        // Continue with the request even if the broadcast fails
      }
    }
    
    // Save updated user
    await user.save();

    // Return success response
    return res.status(200).json({ 
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isBlocked: user.isBlocked,
        lastBlockedAt: user.lastBlockedAt
      }
    });
  } catch (err: any) {
    console.error('Error updating user status:', err);
    return res.status(500).json({ message: 'Error updating user status' });
  }
} 