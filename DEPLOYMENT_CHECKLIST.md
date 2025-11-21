# 🚀 Supabase Migration - Deployment Checklist

## Pre-Deployment

### 1. Run Database Migrations
- [ ] Open [Supabase SQL Editor](https://supabase.com/dashboard/project/ykoihrhommamxbxcybpa/sql)
- [ ] Run migration: `202411210003_create_carts_table.sql`
- [ ] Run migration: `202411210004_create_addresses_table.sql`
- [ ] Run migration: `202411210005_create_orders_table.sql`
- [ ] Run migration: `202411210006_create_payments_table.sql`
- [ ] Run migration: `202411210007_create_shipments_table.sql`
- [ ] Verify all tables exist in Table Editor

### 2. Configure Supabase Auth
- [ ] Go to [Auth → Providers](https://supabase.com/dashboard/project/ykoihrhommamxbxcybpa/auth/providers)
- [ ] Enable Email provider with confirmations
- [ ] Enable Google OAuth provider
- [ ] Add Google Client ID and Secret
- [ ] Add redirect URLs: `http://localhost:3000/auth/callback` and `https://yourdomain.com/auth/callback`
- [ ] Set Site URL in URL Configuration

### 3. Environment Variables
- [ ] Verify `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] Remove `MONGODB_URI` (if not used elsewhere)
- [ ] Remove `JWT_SECRET` (if not used elsewhere)
- [ ] Remove `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
- [ ] Keep `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- [ ] Keep Razorpay and Shiprocket credentials

---

## Local Testing

### 4. Authentication Tests
- [ ] Test signup with email verification
- [ ] Test login with email
- [ ] Test login with username
- [ ] Test Google OAuth signup
- [ ] Test Google OAuth login
- [ ] Test password reset flow
- [ ] Test logout

### 5. Cart & Checkout Tests
- [ ] Add items to cart (guest)
- [ ] Login and verify cart syncs
- [ ] Update cart quantities
- [ ] Remove cart items
- [ ] Create test order with Razorpay (use test mode)
- [ ] Verify order appears in orders list
- [ ] Verify cart is cleared after order

### 6. Address Management
- [ ] Add new address
- [ ] Set default address
- [ ] Edit address
- [ ] Delete address

### 7. Order & Shipment
- [ ] Complete payment for test order
- [ ] Verify order status updates
- [ ] Check shipment creation (if Shiprocket is configured)
- [ ] Verify tracking URL available

---

## Production Deployment

### 8. Update Production Environment
- [ ] Add Supabase environment variables to hosting platform (Vercel/etc)
- [ ] Update Google OAuth redirect URLs to include production domain
- [ ] Update Supabase Site URL to production domain
- [ ] Remove MongoDB credentials from production env

### 9. Deploy Code
- [ ] Commit all changes to git
- [ ] Push to production branch
- [ ] Deploy to hosting platform
- [ ] Verify build succeeds

### 10. Post-Deploy Verification
- [ ] Test signup on production
- [ ] Test login on production  
- [ ] Test Google OAuth on production
- [ ] Test cart and checkout flow
- [ ] Test order creation
- [ ] Monitor error logs for 24 hours

---

## Monitoring

### 11. Check Supabase Dashboard
- [ ] Monitor Auth → Users (check new signups)
- [ ] Monitor Table Editor → carts (check cart data)
- [ ] Monitor Table Editor → orders (check order creation)
- [ ] Monitor Logs → API (check for errors)

### 12. Check Application Logs
- [ ] Verify no MongoDB connection errors
- [ ] Verify no NextAuth errors
- [ ] Check Razorpay integration logs
- [ ] Check Shiprocket integration logs

---

## Rollback Plan (if needed)

If critical issues occur:

1. **Revert deployment** to previous version
2. **Re-enable MongoDB** credentials
3. **Restore MongoDB collections** from backup
4. **Notify users** of temporary service issues

---

## Success Criteria

✅ Users can sign up and verify email  
✅ Users can login with email/username  
✅ Google OAuth works  
✅ Cart syncs after login  
✅ Orders can be created  
✅ Razorpay payments process  
✅ Shiprocket shipments create  
✅ No auth-related errors in logs  

---

## Notes

- **Email verification is now required** - Users must verify email before logging in
- **Old MongoDB users cannot login** - They need to sign up again (this is a fresh start)
- **Session now managed by Supabase** - Auto-refreshes, more secure
- **RLS policies protect data** - Users can only access their own data
- **Razorpay & Shiprocket** - No changes to integration, just data storage location

---

## Quick Commands

```bash
# Check if migrations are needed
npx supabase db diff

# Link to your project (one-time)
npx supabase link --project-ref ykoihrhommamxbxcybpa

# Push migrations
npx supabase db push

# Generate types (optional but recommended)
npx supabase gen types typescript --local > types/supabase.ts
```

---

## Contact

For issues or questions:
- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: Create an issue in your repo

---

**Deployment Date:** _____________________  
**Deployed By:** _____________________  
**Status:** ⬜ Success ⬜ Partial ⬜ Rollback

