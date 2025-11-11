# Authentication System - Quick Start Guide

Get your authentication system up and running in 5 minutes!

## 🚀 Quick Setup (5 minutes)

### Step 1: Clone and Install (1 min)

```bash
cd Novino
npm install
```

### Step 2: Environment Setup (2 min)

1. Copy environment template:
   ```bash
   cp env-example.txt .env.local
   ```

2. Generate secrets:
   ```bash
   # Run this command twice to get two different secrets
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

3. Edit `.env.local` and add:
   ```env
   # Minimum required for basic auth
   MONGODB_URI=your-mongodb-uri
   JWT_SECRET=<secret-from-step-2>
   NEXTAUTH_SECRET=<secret-from-step-2>
   NEXTAUTH_URL=http://localhost:3000
   
   # For OTP functionality
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-app-password
   ```

### Step 3: Start Development Server (1 min)

```bash
npm run dev
```

Visit: http://localhost:3000

### Step 4: Test Authentication (1 min)

Run the test script:
```bash
npm run test:auth
```

## ✅ You're Done!

Your authentication system is now running with:
- ✅ Email/Password authentication
- ✅ OTP verification
- ✅ Password reset
- ✅ Rate limiting
- ✅ Security headers

## 🎯 Next Steps

### Add Google OAuth (Optional)

1. Follow `GOOGLE_OAUTH_SETUP.md` for detailed steps
2. Test with:
   ```bash
   npm run test:oauth
   ```

### Deploy to Production

See `AUTHENTICATION_SYSTEM.md` → "Production Deployment" section

## 🔧 Common Quick Fixes

### Can't connect to MongoDB?
```env
# Use MongoDB Atlas free tier
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```
Get free MongoDB at: https://www.mongodb.com/cloud/atlas

### Email not sending?
**For Gmail:**
1. Enable 2FA on your Google account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password (not regular password) in `EMAIL_PASS`

**For other providers:**
```env
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASS=your-password
```

### "JWT_SECRET not configured"?
Make sure `.env.local` exists and contains JWT_SECRET

## 📚 Full Documentation

- `AUTHENTICATION_SYSTEM.md` - Complete guide
- `GOOGLE_OAUTH_SETUP.md` - Google OAuth setup
- `SECURITY_AUDIT_CHECKLIST.md` - Security verification

## 🆘 Need Help?

1. Check error messages in terminal
2. Review `AUTHENTICATION_SYSTEM.md` → "Troubleshooting"
3. Run diagnostic: `npm run test:auth`

---

**That's it! You're ready to build! 🎉**

