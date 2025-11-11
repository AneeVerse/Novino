/**
 * Centralized validation utilities for authentication
 * These functions are used across both frontend and backend
 */

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Validates email address format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  // Trim whitespace
  email = email.trim();
  
  // Check length
  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }
  
  // Email regex pattern - RFC 5322 compliant (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validates username
 */
export function validateUsername(username: string): ValidationResult {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }
  
  username = username.trim();
  
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (username.length > 30) {
    return { isValid: false, error: 'Username must be less than 30 characters' };
  }
  
  // Only letters, numbers, underscores, and hyphens
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }
  
  // Cannot start with a number
  if (/^[0-9]/.test(username)) {
    return { isValid: false, error: 'Username cannot start with a number' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validates password strength
 * Requirements:
 * - At least 8 characters
 * - Maximum 128 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long (max 128 characters)' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validates OTP code
 */
export function validateOTP(otp: string): ValidationResult {
  if (!otp) {
    return { isValid: false, error: 'OTP is required' };
  }
  
  const otpTrimmed = otp.trim();
  
  if (otpTrimmed.length !== 6) {
    return { isValid: false, error: 'OTP must be 6 digits' };
  }
  
  if (!/^\d{6}$/.test(otpTrimmed)) {
    return { isValid: false, error: 'OTP must contain only numbers' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validates identifier (can be email or username)
 */
export function validateIdentifier(identifier: string): ValidationResult {
  if (!identifier) {
    return { isValid: false, error: 'Email or username is required' };
  }
  
  identifier = identifier.trim();
  
  if (identifier.length < 3) {
    return { isValid: false, error: 'Please enter a valid email or username' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Sanitizes user input by trimming whitespace
 */
export function sanitizeInput(input: string): string {
  return input.trim();
}

/**
 * Sanitizes email by trimming and lowercasing
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

