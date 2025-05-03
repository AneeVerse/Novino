import jwt from 'jsonwebtoken'
import { NextApiRequest } from 'next'
import cookie from 'cookie'

// Function to decode Base64 safely in both browser and Node.js environments
function safeAtob(base64: string): string {
  try {
    // For browser
    if (typeof window !== 'undefined' && window.atob) {
      return window.atob(base64);
    }
    // For Node.js
    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch (error) {
    console.error('Error decoding base64:', error);
    throw error;
  }
}

export function getTokenFromReq(req: NextApiRequest): string | null {
  try {
    // Check for Authorization header first (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    
    // If no Authorization header, check for the value in localStorage via custom header
    if (req.headers['x-admin-token']) {
      return req.headers['x-admin-token'] as string;
    }
    
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

export function verifyToken(token: string): { email: string; username: string; userId: string; isAdmin?: boolean; iat?: number } {
  try {
    // First try to decode as a JWT using the secret
    const secret = process.env.JWT_SECRET || 'developmentsecret123';
    try {
      return jwt.verify(token, secret) as { email: string; username: string; userId: string; iat: number };
    } catch (jwtError) {
      // If JWT verification fails, try to decode as our custom admin token
      try {
        const decodedToken = JSON.parse(safeAtob(token));
        
        // Verify it's an admin token
        if (decodedToken && decodedToken.isAdmin) {
          return {
            email: decodedToken.email,
            username: decodedToken.username,
            userId: decodedToken.userId,
            isAdmin: true,
            iat: decodedToken.createdAt ? Math.floor(new Date(decodedToken.createdAt).getTime() / 1000) : undefined
          };
        }
        
        throw new Error('Invalid admin token');
      } catch (adminTokenError) {
        // If both methods fail, throw the original JWT error
        throw jwtError;
      }
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
} 