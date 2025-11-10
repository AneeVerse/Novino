# Analytics Setup Guide

This guide will help you set up Google Analytics, Google Search Console, and Meta Pixel for your Novino website.

## Environment Variables

Add the following environment variables to your `.env.local` file (for local development) and Vercel environment variables (for production):

```env
# Google Analytics (GA4)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Meta Pixel (Facebook Pixel)
NEXT_PUBLIC_META_PIXEL_ID=123456789012345

# Google Search Console Verification
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-code-here
```

## Setup Instructions

### 1. Google Analytics (GA4)

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property or select an existing one
3. Go to **Admin** → **Data Streams** → Select your web stream
4. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)
5. Add it to your environment variables as `NEXT_PUBLIC_GA_ID`

**Example:**
```env
NEXT_PUBLIC_GA_ID=G-ABC123XYZ
```

### 2. Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property (website URL)
3. Choose **HTML tag** verification method
4. Copy the **content** value from the meta tag
5. Add it to your environment variables as `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`

**Example:**
```env
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**Alternative Verification Methods:**
- You can also verify via HTML file upload
- Or via DNS record (if you prefer)

### 3. Meta Pixel (Facebook Pixel)

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager2)
2. Click **Connect Data Sources** → **Web**
3. Select **Facebook Pixel** and click **Connect**
4. Name your pixel and click **Continue**
5. Copy your **Pixel ID** (numeric ID)
6. Add it to your environment variables as `NEXT_PUBLIC_META_PIXEL_ID`

**Example:**
```env
NEXT_PUBLIC_META_PIXEL_ID=123456789012345
```

## Verification

After adding the environment variables:

1. **Restart your development server** (if running locally)
2. **Redeploy your application** (if on Vercel)
3. **Check the browser console** - you should see analytics scripts loading
4. **Test in Google Analytics Real-Time** - visit your site and check if events appear
5. **Test in Meta Pixel Helper** - Install the [Meta Pixel Helper Chrome Extension](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) to verify the pixel is firing

## Testing

### Google Analytics
- Visit your website
- Go to Google Analytics → **Reports** → **Realtime**
- You should see your visit appear within seconds

### Meta Pixel
- Install the [Meta Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) browser extension
- Visit your website
- The extension should show a green checkmark indicating the pixel is active

### Google Search Console
- After adding the verification code, go back to Search Console
- Click **Verify** - it should confirm ownership within a few minutes

## Custom Events (Optional)

The analytics component is set up to track page views automatically. If you want to track custom events (e.g., button clicks, purchases), you can use:

### Google Analytics Events
```typescript
// Track a custom event
if (typeof window !== 'undefined' && window.gtag) {
  window.gtag('event', 'purchase', {
    transaction_id: '12345',
    value: 29.99,
    currency: 'USD'
  });
}
```

### Meta Pixel Events
```typescript
// Track a custom event
if (typeof window !== 'undefined' && window.fbq) {
  window.fbq('track', 'Purchase', {
    value: 29.99,
    currency: 'USD'
  });
}
```

## Troubleshooting

### Analytics not working?
1. Check that environment variables are set correctly
2. Ensure variables start with `NEXT_PUBLIC_` (required for client-side access)
3. Restart your dev server or redeploy
4. Check browser console for errors
5. Verify CSP headers allow the analytics domains

### Search Console verification failing?
1. Ensure the meta tag is in the `<head>` section
2. Wait a few minutes after deployment
3. Try clearing your browser cache
4. Verify the verification code matches exactly

### Meta Pixel not firing?
1. Check the Pixel ID is correct (numeric only)
2. Use Meta Pixel Helper extension to debug
3. Check browser console for errors
4. Ensure ad blockers are disabled for testing

## Security Notes

- All analytics scripts are loaded with `strategy="afterInteractive"` for optimal performance
- Scripts only load if the corresponding environment variables are set
- The implementation follows Next.js best practices for analytics integration

