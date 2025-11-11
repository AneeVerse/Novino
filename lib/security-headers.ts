/**
 * Security headers middleware for API routes
 * Implements OWASP security best practices
 */

import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Apply security headers to API responses
 */
export function applySecurityHeaders(res: NextApiResponse): void {
  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection in older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
  );
  
  // Permissions Policy (formerly Feature Policy)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );
  
  // HTTPS Strict Transport Security (only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
}

/**
 * Middleware wrapper to apply security headers to API route
 */
export function withSecurityHeaders(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    applySecurityHeaders(res);
    return handler(req, res);
  };
}

/**
 * Apply CORS headers for API routes
 */
export function applyCorsHeaders(
  res: NextApiResponse,
  allowedOrigins: string[] = []
): void {
  const origin = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  // In production, you should specify exact origins
  if (process.env.NODE_ENV === 'production' && allowedOrigins.length > 0) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins.join(', '));
  } else {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

