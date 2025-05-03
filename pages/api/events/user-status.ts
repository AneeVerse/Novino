import { NextApiRequest, NextApiResponse } from 'next';
import { getTokenFromReq, verifyToken } from '@/lib/auth';
import { listenForUserBlocked } from '@/lib/server-events';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET for SSE
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Authenticate user
  const token = getTokenFromReq(req);
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  let userInfo;
  try {
    userInfo = verifyToken(token);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // Set headers for Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering

  // Send initial message
  res.write(`data: ${JSON.stringify({ event: 'connected' })}\n\n`);

  // Create a listener for when this user is blocked
  const unsubscribe = listenForUserBlocked(userInfo.userId, (userId) => {
    // Send a blocked event to the client
    res.write(`data: ${JSON.stringify({ event: 'blocked', userId })}\n\n`);
    
    // Close the connection
    res.end();
  });

  // Set up ping interval to keep connection alive
  const pingInterval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ event: 'ping', timestamp: Date.now() })}\n\n`);
  }, 30000); // Send ping every 30 seconds

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(pingInterval);
    unsubscribe();
  });
} 