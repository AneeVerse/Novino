## Supabase Auth Backend Checklist

Use this as the source of truth while we transition off NextAuth/Mongo. Anything marked ✅ can be confirmed in-code; anything with ⚠️ still needs action in the Supabase dashboard or env.

### 1. Providers & Redirects (Dashboard)
- ⚠️ **Enable Email/Password** under Authentication → Providers.
- ⚠️ **Enable Google** provider:
  - Set client ID/secret from Google Cloud (already stored in `.env.local` if present).
  - Add authorized redirect URIs for every environment (e.g. `http://localhost:3000`, `https://novino.app`).
- ⚠️ **Add Site URLs** in Authentication → URL Configuration:
  - `Site URL`: main domain.
  - `Additional Redirect URLs`: include localhost, preview deploys, and `/auth/callback` paths.

### 2. Environment Variables
- ✅ `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` placeholders live in `env-example.txt`.
- ⚠️ Ensure `.env.local` has the actual values plus the `NEXT_PUBLIC_*` counterparts so the browser client can call Supabase.
- ⚠️ Remove `NEXTAUTH_*` once Phase 3 is complete.

### 3. RLS / Database
- ✅ `public.profiles` table + triggers/policies added via `supabase/migrations/202411210001_create_profiles_table.sql`.
- ⚠️ Run `supabase db push` (or `supabase migration up`) so the project DB picks up the migration.
- ⚠️ After migration, verify policies in Supabase dashboard → Table editor → `profiles`.

### 4. Service Role Usage
- ✅ `lib/supabase-server.ts` now caches a service-role client + request helper for API routes.
- ⚠️ Store the service-role key securely (Vercel project env + local `.env.local`). Never expose to the browser.

### 5. Testing Plan
- ⚠️ After rewiring `/api/auth/*`, test:
  - Email/password login (Supabase hosted magic link / password flow).
  - Google OAuth → confirm profile row auto-seeded.
  - Blocked user behavior (`profiles.is_blocked = true` should 403).
- ⚠️ Document any custom OTP/reset flows that need to call Supabase instead of Mongo.

> Once these dashboard/env steps are done, we can remove NextAuth + Mongo auth code confidently.


