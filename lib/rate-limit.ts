/**
 * Rate limiting middleware for API routes
 * Prevents brute force attacks on authentication endpoints
 */

import { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting (use Redis for production distributed systems)
const rateLimitStore: RateLimitStore = {};

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 60 * 60 * 1000);

export interface RateLimitConfig {
  windowMs?: number; // Time window in milliseconds
  max?: number; // Max requests per window
  message?: string; // Error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
}

/**
 * Creates a rate limiter middleware
 */
export function rateLimit(config: RateLimitConfig = {}) {
  const {
    windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
    max = parseInt(process.env.RATE_LIMIT_MAX || '5'), // 5 requests default
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false
  } = config;

  return {
    check: (req: NextApiRequest, res: NextApiResponse): boolean => {
      // Get IP address
      const ip = getClientIp(req);
      const key = `${ip}:${req.url}`;
      const now = Date.now();

      // Initialize or get existing record
      if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
        rateLimitStore[key] = {
          count: 1,
          resetTime: now + windowMs
        };
        return true;
      }

      // Increment count
      rateLimitStore[key].count++;

      // Check if limit exceeded
      if (rateLimitStore[key].count > max) {
        const retryAfter = Math.ceil((rateLimitStore[key].resetTime - now) / 1000);
        res.setHeader('Retry-After', retryAfter.toString());
        res.status(429).json({ 
          message,
          retryAfter 
        });
        return false;
      }

      return true;
    },
    reset: (req: NextApiRequest) => {
      if (skipSuccessfulRequests) {
        const ip = getClientIp(req);
        const key = `${ip}:${req.url}`;
        if (rateLimitStore[key]) {
          rateLimitStore[key].count = Math.max(0, rateLimitStore[key].count - 1);
        }
      }
    }
  };
}

/**
 * Get client IP address from request
 */
function getClientIp(req: NextApiRequest): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
  }

  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  // Fallback to socket address
  return req.socket.remoteAddress || 'unknown';
}

/**
 * Account lockout tracker for failed login attempts
 */
interface AccountLockout {
  [email: string]: {
    attempts: number;
    lockedUntil: number;
  };
}

const accountLockouts: AccountLockout = {};

// Cleanup old lockouts every hour
setInterval(() => {
  const now = Date.now();
  Object.keys(accountLockouts).forEach(email => {
    if (accountLockouts[email].lockedUntil < now && accountLockouts[email].attempts === 0) {
      delete accountLockouts[email];
    }
  });
}, 60 * 60 * 1000);

export interface AccountLockoutConfig {
  maxAttempts?: number; // Max failed attempts before lockout
  lockoutDurationMs?: number; // How long to lock the account (in ms)
}

/**
 * Account lockout manager to prevent brute force on specific accounts
 */
export class AccountLockoutManager {
  private maxAttempts: number;
  private lockoutDurationMs: number;

  constructor(config: AccountLockoutConfig = {}) {
    this.maxAttempts = config.maxAttempts || 5;
    this.lockoutDurationMs = config.lockoutDurationMs || 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Check if account is locked
   */
  isLocked(email: string): boolean {
    const record = accountLockouts[email];
    if (!record) return false;

    const now = Date.now();
    if (record.lockedUntil > now) {
      return true;
    }

    // Lockout expired, reset
    if (record.lockedUntil <= now) {
      record.attempts = 0;
      record.lockedUntil = 0;
    }

    return false;
  }

  /**
   * Get time remaining in lockout (in seconds)
   */
  getLockoutTimeRemaining(email: string): number {
    const record = accountLockouts[email];
    if (!record) return 0;

    const now = Date.now();
    if (record.lockedUntil > now) {
      return Math.ceil((record.lockedUntil - now) / 1000);
    }

    return 0;
  }

  /**
   * Record a failed login attempt
   */
  recordFailedAttempt(email: string): void {
    const normalizedEmail = email.toLowerCase().trim();

    if (!accountLockouts[normalizedEmail]) {
      accountLockouts[normalizedEmail] = {
        attempts: 1,
        lockedUntil: 0
      };
      return;
    }

    accountLockouts[normalizedEmail].attempts++;

    // Lock account if max attempts reached
    if (accountLockouts[normalizedEmail].attempts >= this.maxAttempts) {
      accountLockouts[normalizedEmail].lockedUntil = Date.now() + this.lockoutDurationMs;
    }
  }

  /**
   * Reset failed attempts (call on successful login)
   */
  resetAttempts(email: string): void {
    const normalizedEmail = email.toLowerCase().trim();
    if (accountLockouts[normalizedEmail]) {
      accountLockouts[normalizedEmail].attempts = 0;
      accountLockouts[normalizedEmail].lockedUntil = 0;
    }
  }

  /**
   * Get number of attempts remaining
   */
  getAttemptsRemaining(email: string): number {
    const record = accountLockouts[email?.toLowerCase().trim()];
    if (!record) return this.maxAttempts;
    return Math.max(0, this.maxAttempts - record.attempts);
  }
}

