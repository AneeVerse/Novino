/**
 * Tests for validation utilities
 * Run with: npm test or npx jest __tests__/lib/validation.test.ts
 */

import {
  validateEmail,
  validateUsername,
  validatePassword,
  validateOTP,
  validateIdentifier,
  sanitizeInput,
  sanitizeEmail
} from '@/lib/validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    test('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.co.uk',
        'user+tag@example.com',
        'test123@test-domain.com'
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });
    });

    test('should reject invalid email addresses', () => {
      const invalidEmails = [
        '',
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
        'a'.repeat(255) + '@example.com' // Too long
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeTruthy();
      });
    });

    test('should handle whitespace', () => {
      const result = validateEmail('  test@example.com  ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateUsername', () => {
    test('should accept valid usernames', () => {
      const validUsernames = [
        'user123',
        'test_user',
        'user-name',
        'abc',
        'test_user_123'
      ];

      validUsernames.forEach(username => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });
    });

    test('should reject invalid usernames', () => {
      const invalidCases = [
        { username: '', expectedError: 'required' },
        { username: 'ab', expectedError: 'at least 3 characters' },
        { username: 'a'.repeat(31), expectedError: 'less than 30 characters' },
        { username: 'user name', expectedError: 'can only contain' },
        { username: 'user@name', expectedError: 'can only contain' },
        { username: '123user', expectedError: 'cannot start with a number' }
      ];

      invalidCases.forEach(({ username, expectedError }) => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain(expectedError);
      });
    });
  });

  describe('validatePassword', () => {
    test('should accept strong passwords', () => {
      const strongPasswords = [
        'Password123!',
        'MyP@ssw0rd',
        'Str0ng!Pass',
        'C0mpl3x@Password'
      ];

      strongPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });
    });

    test('should reject weak passwords', () => {
      const weakPasswords = [
        { password: '', expectedError: 'required' },
        { password: 'short', expectedError: 'at least 8 characters' },
        { password: 'a'.repeat(129), expectedError: 'too long' },
        { password: 'password123!', expectedError: 'uppercase letter' },
        { password: 'PASSWORD123!', expectedError: 'lowercase letter' },
        { password: 'Password!', expectedError: 'one number' },
        { password: 'Password123', expectedError: 'special character' }
      ];

      weakPasswords.forEach(({ password, expectedError }) => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain(expectedError);
      });
    });
  });

  describe('validateOTP', () => {
    test('should accept valid OTP codes', () => {
      const validOTPs = ['123456', '000000', '999999'];

      validOTPs.forEach(otp => {
        const result = validateOTP(otp);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });
    });

    test('should reject invalid OTP codes', () => {
      const invalidOTPs = [
        { otp: '', expectedError: 'required' },
        { otp: '12345', expectedError: '6 digits' },
        { otp: '1234567', expectedError: '6 digits' },
        { otp: 'abcdef', expectedError: 'only numbers' },
        { otp: '12345a', expectedError: 'only numbers' }
      ];

      invalidOTPs.forEach(({ otp, expectedError }) => {
        const result = validateOTP(otp);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain(expectedError);
      });
    });
  });

  describe('validateIdentifier', () => {
    test('should accept valid identifiers', () => {
      const validIdentifiers = [
        'test@example.com',
        'username',
        'user_123'
      ];

      validIdentifiers.forEach(identifier => {
        const result = validateIdentifier(identifier);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });
    });

    test('should reject invalid identifiers', () => {
      const result1 = validateIdentifier('');
      expect(result1.isValid).toBe(false);
      expect(result1.error).toContain('required');

      const result2 = validateIdentifier('ab');
      expect(result2.isValid).toBe(false);
      expect(result2.error).toContain('valid');
    });
  });

  describe('sanitizeInput', () => {
    test('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
      expect(sanitizeInput('test')).toBe('test');
      expect(sanitizeInput('  ')).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    test('should trim and lowercase email', () => {
      expect(sanitizeEmail('  Test@Example.COM  ')).toBe('test@example.com');
      expect(sanitizeEmail('USER@EXAMPLE.COM')).toBe('user@example.com');
    });
  });
});

