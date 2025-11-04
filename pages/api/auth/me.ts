import type { NextApiRequest, NextApiResponse } from 'next';
import { getTokenFromReq, verifyToken } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { authOptions } from './[...nextauth]';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // For development/testing purposes, enable mock mode - this should be disabled in production
  const MOCK_MODE = false; 
  
  try {
    // First try to get real user data from JWT token cookie
    const token = getTokenFromReq(req);
    console.log('Token from request:', token ? 'Token found' : 'No token found');
    
    if (token) {
      try {
        const user = verifyToken(token);
        console.log('Authenticated with JWT token:', user.username);
        return res.status(200).json({ user });
      } catch (tokenError) {
        console.error('Token verification error:', tokenError);
        // Continue to check NextAuth session
      }
    }
    
    // If no JWT token, check NextAuth session (for Google OAuth users)
    try {
      const session = await getServerSession(req, res, authOptions);
      if (session?.user?.email) {
        console.log('Authenticated with NextAuth session:', session.user.email);
        
        // Fetch full user data from database
        await connectToDatabase();
        const user = await User.findOne({ email: session.user.email });
        
        if (user && !user.isBlocked && user._id) {
          // Create JWT token cookie for compatibility with existing auth system
          const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'developmentsecret123';
          const userId = typeof user._id === 'object' && user._id.toString ? user._id.toString() : String(user._id);
          
          const jwtToken = jwt.sign(
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
            `token=${jwtToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
          );

          console.log('Created JWT token cookie for NextAuth user');
          
          return res.status(200).json({
            user: {
              userId: userId,
              email: user.email,
              username: user.username,
              name: user.username,
              image: user.avatar
            }
          });
        } else if (user?.isBlocked) {
          return res.status(403).json({ message: 'Your account has been blocked' });
        }
      }
    } catch (sessionError) {
      console.error('NextAuth session error:', sessionError);
      // Continue to fallback
    }
    
    // If no token or token verification failed, and mock mode is enabled
    if (MOCK_MODE) {
      // Only use mock user data if explicitly requested or if no valid auth found
      if (req.headers['test-mock-user'] === 'true' || !token) {
        console.log('Using mock user data (fallback)');
        return res.status(200).json({
          user: {
            userId: '123456789',
            email: 'test@example.com',
            username: 'test',
            name: 'Test User'
          }
        });
      }
    }
    
    // If we reached here, authentication failed and mock mode didn't apply
    return res.status(401).json({ message: 'Not authenticated' });
  } catch (err: any) {
    console.error('Auth error:', err);
    return res.status(401).json({ message: 'Authentication error' });
  }
} 