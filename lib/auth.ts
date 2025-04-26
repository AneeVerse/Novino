import jwt from 'jsonwebtoken'
import { NextApiRequest } from 'next'
import cookie from 'cookie'

export function getTokenFromReq(req: NextApiRequest): string | null {
  try {
    // Check if cookie headers exist
    if (!req.headers.cookie) {
      return null;
    }
    
    // Manual parsing as a fallback in case the cookie module fails
    try {
      const cookies = cookie.parse(req.headers.cookie);
      return typeof cookies.token === 'string' ? cookies.token : null;
    } catch (cookieError) {
      // Manual basic parsing as last resort
      const tokenCookie = req.headers.cookie
        .split(';')
        .find(c => c.trim().startsWith('token='));
      
      if (tokenCookie) {
        const token = tokenCookie.split('=')[1];
        return token || null;
      }
      return null;
    }
  } catch (error) {
    console.error('Error parsing cookies:', error);
    return null;
  }
}

export function verifyToken(token: string): { email: string; username: string; userId: string } {
  try {
    const secret = process.env.JWT_SECRET || 'developmentsecret123';
    return jwt.verify(token, secret) as { email: string; username: string; userId: string };
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
} 