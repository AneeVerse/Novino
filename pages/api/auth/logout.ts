import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Clear NextAuth session if it exists
    try {
      const session = await getServerSession(req, res, authOptions);
      if (session) {
        // Sign out from NextAuth
        // Note: NextAuth doesn't have a direct signOut in API routes,
        // but clearing cookies will invalidate the session
      }
    } catch (sessionError) {
      // Ignore session errors, continue with cookie clearing
      console.log('Session check error (non-critical):', sessionError);
    }

    // Clear the JWT token cookie - match the exact attributes used when setting the cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const secureFlag = isProduction ? '; Secure' : '';
    const expiresDate = 'Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Clear JWT token cookie with matching attributes from login
    const jwtCookie = `token=; HttpOnly; Path=/; Max-Age=0; Expires=${expiresDate}; SameSite=Strict${secureFlag}`;
    
    // Clear NextAuth session cookies (if they exist)
    const nextAuthCookies = [
      `next-auth.session-token=; HttpOnly; Path=/; Max-Age=0; Expires=${expiresDate}; SameSite=Lax${secureFlag}`,
      `__Secure-next-auth.session-token=; HttpOnly; Path=/; Max-Age=0; Expires=${expiresDate}; SameSite=None; Secure`,
      `next-auth.csrf-token=; Path=/; Max-Age=0; Expires=${expiresDate}; SameSite=Lax${secureFlag}`,
      `__Host-next-auth.csrf-token=; Path=/; Max-Age=0; Expires=${expiresDate}; SameSite=Lax; Secure`,
    ];
    
    // Set all cookies to clear
    res.setHeader('Set-Cookie', [jwtCookie, ...nextAuthCookies]);

    return res.status(200).json({ 
      message: 'Logged out successfully',
      success: true 
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    // Even if there's an error, try to clear cookies
    const isProduction = process.env.NODE_ENV === 'production';
    const secureFlag = isProduction ? '; Secure' : '';
    const expiresDate = 'Thu, 01 Jan 1970 00:00:00 GMT';
    
    const jwtCookie = `token=; HttpOnly; Path=/; Max-Age=0; Expires=${expiresDate}; SameSite=Strict${secureFlag}`;
    res.setHeader('Set-Cookie', jwtCookie);
    
    return res.status(200).json({ 
      message: 'Logged out (with warnings)',
      success: true 
    });
  }
} 