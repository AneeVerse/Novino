# Supabase Database Migration Instructions

## Prerequisites
You need to run these migrations either through:
1. Supabase Dashboard SQL Editor
2. Supabase CLI

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/ykoihrhommamxbxcybpa
2. Navigate to **SQL Editor** in the left sidebar
3. Run each migration file in order:

### Migration Order:
```
202411210001_create_profiles_table.sql  (✅ Already exists)
202411210002_add_email_to_profiles.sql  (✅ Already exists)
202411210003_create_carts_table.sql     (🆕 NEW)
202411210004_create_addresses_table.sql (🆕 NEW)
202411210005_create_orders_table.sql    (🆕 NEW)
202411210006_create_payments_table.sql  (🆕 NEW)
202411210007_create_shipments_table.sql (🆕 NEW)
```

For each file:
- Click "New Query"
- Copy the entire content of the migration file
- Paste into the SQL editor
- Click "Run" or press Ctrl+Enter
- Verify no errors appear

## Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Link to your project (one-time setup)
npx supabase link --project-ref ykoihrhommamxbxcybpa

# Push all migrations
npx supabase db push
```

## Verification

After running all migrations, verify in your Supabase Dashboard:

1. Go to **Table Editor**
2. You should see these tables:
   - `profiles` (auth users)
   - `carts`
   - `addresses`
   - `orders`
   - `payments`
   - `shipments`

3. Click on each table to verify:
   - Columns are created correctly
   - RLS (Row Level Security) is enabled
   - Policies are in place

## Next Steps

Once migrations are complete, we'll:
1. Update all API routes to use Supabase instead of MongoDB
2. Update frontend to use Supabase auth
3. Remove all MongoDB dependencies
