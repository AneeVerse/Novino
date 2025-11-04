# Google OAuth Setup Guide for Novino

This guide will help you set up Google OAuth authentication for your Novino application.

## Prerequisites
- A Google account
- Access to Google Cloud Console

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter project name (e.g., "Novino Auth")
5. Click **"Create"**

### 2. Configure OAuth Consent Screen

1. In the Google Cloud Console, navigate to **"APIs & Services"** > **"OAuth consent screen"**
2. Select **"External"** user type (unless you have a Google Workspace)
3. Click **"Create"**
4. Fill in the required information:
   - **App name**: Novino
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **"Save and Continue"**
6. On the **Scopes** page, click **"Add or Remove Scopes"**
7. Add these scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
8. Click **"Update"** and then **"Save and Continue"**
9. Add test users (your email) if the app is in testing mode
10. Click **"Save and Continue"**, then **"Back to Dashboard"**

### 3. Create OAuth Credentials

1. Navigate to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. Select **"Web application"** as the application type
4. Configure the settings:
   - **Name**: Novino Web Client
   - **Authorized JavaScript origins**:
     - For development: `http://localhost:3000`
     - For production: `https://yourdomain.com`
   - **Authorized redirect URIs**:
     - For development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://yourdomain.com/api/auth/callback/google`
5. Click **"Create"**
6. A modal will appear with your credentials:
   - **Client ID**: Copy this
   - **Client Secret**: Copy this

### 4. Configure Environment Variables

1. Create a `.env.local` file in your project root (copy from `.env.example`)
2. Add your Google OAuth credentials:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here

# NextAuth Configuration
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=http://localhost:3000
# For production use your actual domain
```

### 5. Generate NEXTAUTH_SECRET

Run this command in your terminal to generate a secure secret:

```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and use it as your `NEXTAUTH_SECRET`.

### 6. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login or signup page
3. Click the **"Sign in with Google"** button
4. You should be redirected to Google's login page
5. After authentication, you'll be redirected back to your app

## Security Best Practices

### Development
- Use `http://localhost:3000` for local development
- Keep your `.env.local` file in `.gitignore`
- Never commit secrets to version control

### Production
1. **Update NEXTAUTH_URL**:
   ```env
   NEXTAUTH_URL=https://yourdomain.com
   ```

2. **Update Authorized Origins and Redirect URIs** in Google Console:
   - JavaScript origins: `https://yourdomain.com`
   - Redirect URIs: `https://yourdomain.com/api/auth/callback/google`

3. **Enable HTTPS**: Always use HTTPS in production

4. **Publish OAuth App**:
   - In Google Cloud Console, go to OAuth consent screen
   - Click **"Publish App"** to remove the testing mode
   - This allows any Google user to sign in (not just test users)

5. **Regenerate Secrets**: Use strong, unique secrets for production

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Ensure the redirect URI in your Google Console matches exactly
- Check for trailing slashes
- Verify the protocol (http vs https)

### Error: "Access blocked: This app's request is invalid"
- Verify your OAuth consent screen is configured
- Check that required scopes are added
- Ensure test users are added if app is in testing mode

### Error: "invalid_client"
- Double-check your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Ensure there are no extra spaces in your `.env.local` file

### User Not Created in Database
- Check MongoDB connection string
- Verify the User model has `googleId` and `avatar` fields
- Check server logs for errors

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check server logs for detailed error messages
3. Verify all environment variables are set correctly
4. Ensure MongoDB is running and accessible

---

**Note**: Keep your credentials secure and never share them publicly!

