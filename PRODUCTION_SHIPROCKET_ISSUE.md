# 🔍 Production Shiprocket Issue - Diagnostic Guide

## Problem
Orders from **production** show in profile but NOT in dashboard/Shiprocket.  
Orders from **local** work fine everywhere.

## Root Cause
Shiprocket shipment creation is **failing silently** in production but succeeding locally.

---

## ✅ Fixes Applied

### 1. **Enhanced Error Logging**
Added comprehensive logging to track Shiprocket failures:
```typescript
console.log('Creating Shiprocket shipment for order:', {...});
console.log('Shiprocket shipment created successfully:', {...});
console.error('❌ SHIPROCKET SHIPMENT CREATION FAILED', {...});
```

### 2. **Error Tracking in Database**
Failed shipments are now stored in the `shipments` table with status `'failed'`:
```typescript
await supabase.from('shipments').insert({
  order_id: order.id,
  status: 'failed',
  metadata: {
    error: {...},
    tracking_events: [...]
  }
});
```

### 3. **Better Status Messages**
Order status timeline now includes error details:
```
"⚠️ Payment captured but shipment creation failed: [error message]. Support team notified."
```

---

## 🔍 How to Diagnose Production Issue

### Step 1: Check Production Logs
After placing an order on production, check your  deployment logs (Vercel/Netlify/etc.):

Look for:
```
❌ SHIPROCKET SHIPMENT CREATION FAILED
{
  environment: "production",
  orderId: "...",
  error: "THE ACTUAL ERROR MESSAGE",  ← This is the key!
  ...
}
```

### Step 2: Check Shipments Table
Query your Supabase `shipments` table:
```sql
SELECT 
  order_id, 
  status, 
  metadata 
FROM shipments 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

This will show you all failed shipments and their error messages.

### Step 3: Check Environment Variables
Verify these are set correctly in production:

**Required Shiprocket Environment Variables:**
```bash
SHIPROCKET_EMAIL=your-email@example.com
SHIPROCKET_PASSWORD=your-password
SHIPROCKET_API_KEY=your-api-key  # or
SHIPROCKET_PICKUP_LOCATION=Primary
```

**To check in Vercel:**
1. Go to Settings → Environment Variables
2. Verify all Shiprocket variables are set
3. Make sure they're available for "Production" (not just Preview/Development)

### Step 4: Check Shiprocket API Access
The issue might be:
- ❌ Wrong API credentials in production
- ❌ Different Shiprocket account for production
- ❌ IP whitelist restrictions
- ❌ Shiprocket API rate limiting
- ❌ Missing permissions in production Shiprocket account

---

## 🛠️ Common Fixes

### Fix 1: Environment Variables Mismatch
**Problem**: Production using wrong/missing Shiprocket credentials

**Solution**:
1. Go to your deployment platform (Vercel/Netlify)
2. Settings → Environment Variables
3. Add/update:
   ```
   SHIPROCKET_EMAIL=production-email@example.com
   SHIPROCKET_PASSWORD=production-password
   NEXT_PUBLIC_SHIPROCKET_PICKUP_LOCATION=Primary
   ```
4. Redeploy

### Fix 2: Shiprocket Account Issues
**Problem**: Using test account locally, different account in production

**Solution**:
- Verify you're using the same Shiprocket account
- Check if production account has proper permissions
- Ensure pickup location exists in production Shiprocket account

### Fix 3: API Rate Limiting
**Problem**: Too many requests hitting Shiprocket API

**Solution**:
- Check Shiprocket dashboard for API usage
- Implement retry logic (already in code)
- Contact Shiprocket to increase rate limits

---

## 🎯 Immediate Action Steps

1. **Place a test order** on production
2. **Check deployment logs** immediately (within 1 minute)
3. **Look for the error message** in logs
4. **Share the error** with me so I can provide specific fix

---

## 📊 What to Look For in Logs

### Success (Local):
```
Creating Shiprocket shipment for order: { orderId: '...', ... }
✓ Shiprocket shipment created successfully: { order_id: 123, shipment_id: 456 }
```

### Failure (Production):
```
Creating Shiprocket shipment for order: { orderId: '...', ... }
❌ SHIPROCKET SHIPMENT CREATION FAILED {
  environment: "production",
  error: "LOOK HERE FOR THE ACTUAL ERROR",  ← This tells us what's wrong!
  ...
}
```

---

## 🔧 Quick Test

Run this command to test Shiprocket connection:
```bash
# Check if Shiprocket credentials are accessible
curl -X POST https://apiv2.shiprocket.in/v1/external/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "YOUR_PRODUCTION_EMAIL",
    "password": "YOUR_PRODUCTION_PASSWORD"
  }'
```

If this fails, your credentials are wrong.

---

## 📝 Next Steps

1. ✅ Deploy the updated code with enhanced logging
2. ✅ Place a test order on production
3. ✅ Check logs for the error message
4. ✅ Share the error with me
5. ⏳ I'll provide the exact fix based on the error

---

**Question**: Where are you deploying? (Vercel, Netlify, other?)

This will help me give you specific instructions for checking logs!
