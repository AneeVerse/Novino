# Novino Authentication System - Production Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Security Features](#security-features)
3. [Setup Guide](#setup-guide)
4. [API Endpoints](#api-endpoints)
5. [Testing](#testing)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)
8. [Security Best Practices](#security-best-practices)

---

## 🔐 Overview

Novino implements a comprehensive, production-ready authentication system with the following features:

- **Email/Password Authentication** with OTP verification
- **Google OAuth 2.0** integration
- **JWT-based sessions** with HttpOnly cookies
- **Rate limiting** to prevent brute force attacks
- **Account lockout** after failed login attempts
- **Password strength validation**
- **Security headers** on all API responses
- **MongoDB** for data persistence

### Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌─────────────┐ ┌──────────────┐
│   NextAuth  │ │  Custom Auth │
│  (OAuth)    │ │   (Email)    │
└──────┬──────┘ └──────┬───────┘
       │                │
       └────────┬───────┘
                │
       ┌────────▼─────────┐
       │   Auth APIs      │
       │ - Login          │
       │ - Signup         │
       │ - Reset Password │
       │ - Send OTP       │
       └────────┬─────────┘
                │
       ┌────────▼─────────┐
       │   Middleware     │
       │ - Rate Limiting  │
       │ - Validation     │
       │ - Security       │
       └────────┬─────────┘
                │
       ┌────────▼─────────┐
       │    MongoDB       │
       │ - Users          │
       │ - OTPs           │
       └──────────────────┘
```

---

## 🛡️ Security Features

### 1. Password Security
- ✅ Minimum 8 characters
- ✅ Requires uppercase, lowercase, numbers, and special characters
- ✅ Bcrypt hashing with configurable rounds (default: 12)
- ✅ Password field excluded from queries by default

### 2. Rate Limiting
- ✅ **Login**: 5 attempts per 15 minutes
- ✅ **Signup**: 3 attempts per 15 minutes
- ✅ **OTP requests**: 3 requests per 15 minutes
- ✅ **Password reset**: 3 attempts per 15 minutes

### 3. Account Lockout
- ✅ Locks account after 5 failed login attempts
- ✅ 15-minute lockout period
- ✅ Displays remaining attempts to user
- ✅ Resets counter on successful login

### 4. Token Security
- ✅ JWT tokens with 7-day expiration
- ✅ HttpOnly cookies (not accessible via JavaScript)
- ✅ Secure flag in production (HTTPS only)
- ✅ SameSite=Strict to prevent CSRF

### 5. Security Headers
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Content-Security-Policy
- ✅ Strict-Transport-Security (production)

### 6. Input Validation
- ✅ Server-side validation on all endpoints
- ✅ Client-side validation for better UX
- ✅ Centralized validation utilities
- ✅ SQL injection prevention (MongoDB + Mongoose)
- ✅ XSS prevention

### 7. OTP System
- ✅ 6-digit numeric codes
- ✅ 5-minute expiration
- ✅ Automatic cleanup (TTL index)
- ✅ Email delivery via SMTP
- ✅ One-time use enforcement

---

## 🚀 Setup Guide

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Email SMTP credentials (for OTP)
- Google OAuth credentials (optional)

### Step 1: Environment Configuration

1. Copy the environment template:
   ```bash
   cp env-example.txt .env.local
   ```

2. Fill in your credentials:
   ```env
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

   # JWT & Auth
   JWT_SECRET=<generate-32-char-random-string>
   NEXTAUTH_SECRET=<generate-32-char-random-string>
   NEXTAUTH_URL=http://localhost:3000

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret

   # Email
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=465
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@yourdomain.com
   ```

### Step 2: Generate Secure Secrets

Generate JWT secrets using one of these methods:

**Using OpenSSL:**
```bash
openssl rand -base64 32
```

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Using Online Generator:**
- Visit: https://generate-secret.vercel.app/32

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Set Up MongoDB

1. Create a MongoDB Atlas account or set up local MongoDB
2. Create a new database named `novino`
3. Get your connection string
4. Add it to `MONGODB_URI` in `.env.local`

### Step 5: Configure Email

**For Gmail:**
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `EMAIL_PASS`

**For Other Providers:**
- Update `EMAIL_HOST` and `EMAIL_PORT` accordingly

### Step 6: Set Up Google OAuth (Optional)

Follow the detailed guide in `GOOGLE_OAUTH_SETUP.md`

Quick steps:
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `.env.local`

### Step 7: Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 📡 API Endpoints

### POST /api/auth/signup
Register a new user with email verification.

**Flow:**
1. Request OTP → `POST /api/auth/send-otp`
2. Verify OTP and create account → `POST /api/auth/signup`

**Request:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "StrongPass123!",
  "otp": "123456"
}
```

**Response (201):**
```json
{
  "message": "Signup successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username"
  }
}
```

**Validation:**
- Email: Valid email format
- Username: 3-30 chars, alphanumeric + underscore/hyphen
- Password: 8+ chars with upper, lower, number, special char
- OTP: 6-digit code, not expired

**Rate Limit:** 3 requests / 15 minutes

---

### POST /api/auth/login
Login with email/username and password.

**Request:**
```json
{
  "identifier": "user@example.com",
  "password": "StrongPass123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username"
  }
}
```

**Features:**
- Account lockout after 5 failed attempts
- Shows remaining attempts
- 15-minute lockout period

**Rate Limit:** 5 requests / 15 minutes

---

### POST /api/auth/send-otp
Request an OTP for signup, login, or password reset.

**Request:**
```json
{
  "email": "user@example.com",
  "purpose": "signup"
}
```

**Purposes:**
- `signup`: New account verification
- `login`: Two-factor login (optional)
- `reset`: Password reset

**Response (200):**
```json
{
  "message": "OTP sent"
}
```

**Rate Limit:** 3 requests / 15 minutes

---

### POST /api/auth/verify-otp
Verify an OTP code.

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "purpose": "signup"
}
```

**Response (200):**
```json
{
  "message": "OTP verified"
}
```

---

### POST /api/auth/reset-password
Reset user password with OTP verification.

**Flow:**
1. Request OTP → `POST /api/auth/send-otp` with `purpose: "reset"`
2. Verify OTP → `POST /api/auth/verify-otp`
3. Reset password → `POST /api/auth/reset-password`

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "password": "NewStrongPass123!"
}
```

**Response (200):**
```json
{
  "message": "Password reset successful"
}
```

**Rate Limit:** 3 requests / 15 minutes

---

### Google OAuth
Handled by NextAuth.js

**Endpoints:**
- Sign in: `/api/auth/signin/google`
- Callback: `/api/auth/callback/google`

**Features:**
- Automatic user creation
- Account linking for existing users
- Profile picture import

---

## 🧪 Testing

### Automated Tests

Run validation tests:
```bash
npm test
```

### Manual Testing Scripts

**Test Authentication Endpoints:**
```bash
npm run test:auth
```

This script tests:
- ✓ Email validation
- ✓ Password strength
- ✓ Username validation
- ✓ Rate limiting
- ✓ OTP flow
- ✓ Login attempts
- ✓ Account lockout

**Test Google OAuth:**
```bash
npm run test:oauth
```

This script checks:
- ✓ Environment variables
- ✓ Credentials format
- ✓ NextAuth configuration
- ✓ User model setup

### Manual Testing Checklist

- [ ] Signup with valid credentials
- [ ] Signup with weak password (should fail)
- [ ] Signup with invalid email (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail)
- [ ] Login after 5 failed attempts (should be locked)
- [ ] Request OTP
- [ ] Verify OTP
- [ ] Password reset flow
- [ ] Google OAuth login
- [ ] Google OAuth signup
- [ ] Rate limiting on each endpoint

---

## 🌐 Production Deployment

### Pre-Deployment Checklist

- [ ] All environment variables set in production
- [ ] MongoDB production database configured
- [ ] Email service configured with production credentials
- [ ] Google OAuth redirect URIs updated for production domain
- [ ] `NEXTAUTH_URL` updated to production domain
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Error logging/monitoring set up

### Environment Variables for Production

Update these values for production:

```env
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://prod_user:prod_pass@cluster.mongodb.net/novino_prod

# Generate new secrets for production (don't reuse development secrets)
JWT_SECRET=<new-production-secret>
NEXTAUTH_SECRET=<new-production-secret>

# Production email
EMAIL_FROM=noreply@yourdomain.com

# Google OAuth production URLs
# Update in Google Console:
# - Authorized origins: https://yourdomain.com
# - Redirect URIs: https://yourdomain.com/api/auth/callback/google
```

### Deployment Platforms

**Vercel (Recommended):**
```bash
vercel --prod
```

**Other Platforms:**
- Ensure Next.js 15+ compatibility
- Set all environment variables
- Enable Node.js 18+
- Configure build command: `npm run build`
- Configure start command: `npm start`

### Post-Deployment

1. **Test all flows in production:**
   - Signup
   - Login
   - Password reset
   - Google OAuth

2. **Monitor logs:**
   - Check for authentication errors
   - Monitor rate limit triggers
   - Check email delivery

3. **Set up monitoring:**
   - Error tracking (Sentry, LogRocket)
   - Uptime monitoring
   - Performance monitoring

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "JWT_SECRET not configured"
**Problem:** Environment variable missing
**Solution:**
```bash
# Add to .env.local
JWT_SECRET=your-secret-here
```

#### 2. "Failed to connect to MongoDB"
**Problem:** Invalid connection string or network issue
**Solution:**
- Check MONGODB_URI format
- Verify database password (no special chars in connection string)
- Check IP whitelist in MongoDB Atlas

#### 3. "OTP email not sending"
**Problem:** Email configuration issue
**Solution:**
- Verify EMAIL_USER and EMAIL_PASS
- For Gmail: use App Password, not regular password
- Check EMAIL_HOST and EMAIL_PORT

#### 4. "redirect_uri_mismatch" (Google OAuth)
**Problem:** Redirect URI not configured in Google Console
**Solution:**
- Go to Google Cloud Console
- Add exact redirect URI: `http://localhost:3000/api/auth/callback/google`
- For production: `https://yourdomain.com/api/auth/callback/google`

#### 5. Rate limiting triggering too quickly
**Problem:** Development testing triggering limits
**Solution:**
```env
# Adjust in .env.local for development
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000
```
(Remember to restore production values before deployment)

#### 6. "Account locked" message
**Problem:** Too many failed login attempts
**Solution:**
- Wait 15 minutes
- Or manually reset in MongoDB:
```javascript
// In MongoDB shell
db.accountLockouts.deleteMany({})
```

---

## 🔒 Security Best Practices

### For Developers

1. **Never commit secrets:**
   - Keep `.env.local` in `.gitignore`
   - Use different secrets for dev/staging/production
   - Rotate secrets periodically

2. **Use HTTPS in production:**
   - SSL/TLS certificates
   - Redirect HTTP to HTTPS
   - Enable HSTS header

3. **Keep dependencies updated:**
   ```bash
   npm audit
   npm update
   ```

4. **Monitor logs:**
   - Set up error tracking
   - Monitor authentication failures
   - Alert on suspicious activity

5. **Implement additional security:**
   - Consider adding CAPTCHA for signup/login
   - Implement device fingerprinting
   - Add email verification for login from new devices
   - Consider 2FA for sensitive operations

### For Users

1. **Strong passwords:**
   - Minimum 12 characters recommended
   - Use password manager
   - Don't reuse passwords

2. **Enable 2FA:**
   - Use Google OAuth when available
   - Keep recovery codes safe

3. **Secure email:**
   - Use secure email provider
   - Enable 2FA on email account

---

## 📚 Additional Resources

- [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) - Google OAuth setup guide
- [AUTH_IMPROVEMENTS_SUMMARY.md](./AUTH_IMPROVEMENTS_SUMMARY.md) - Recent improvements
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review error messages in logs
3. Run test scripts for diagnostics
4. Check MongoDB connection and data

---

## ✅ Completed Features

- ✅ Email/Password authentication
- ✅ Google OAuth integration
- ✅ OTP verification system
- ✅ Password strength validation
- ✅ Rate limiting
- ✅ Account lockout
- ✅ Security headers
- ✅ JWT token management
- ✅ Password reset flow
- ✅ Centralized validation
- ✅ Error handling
- ✅ Test suite
- ✅ Production-ready documentation

---

**Last Updated:** November 2024
**Version:** 2.0.0

