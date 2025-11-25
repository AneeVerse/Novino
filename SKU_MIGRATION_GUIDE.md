# SKU Migration Guide

## Step 1: Apply Database Migration

Copy and paste this SQL into your **Supabase SQL Editor**:

```sql
-- Add user-friendly SKU columns
-- Migration: Add SKU fields with generators

-- Add SKU to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sku VARCHAR(50) UNIQUE;

-- Add SKU to product_categories table
ALTER TABLE product_categories 
ADD COLUMN IF NOT EXISTS sku_prefix VARCHAR(20);

-- Create function to generate SKU from product name
CREATE OR REPLACE FUNCTION generate_product_sku(product_name TEXT, sequence_num INTEGER)
RETURNS VARCHAR(50) AS $$
DECLARE
    prefix TEXT;
    clean_name TEXT;
BEGIN
    -- Clean the name: remove special chars, take first 6-8 chars, uppercase
    clean_name := UPPER(REGEXP_REPLACE(product_name, '[^a-zA-Z0-9]', '', 'g'));
    prefix := SUBSTRING(clean_name FROM 1 FOR 8);
    
    -- Format: PREFIX-NNN (e.g., BUTTER-001, LIFECYC-042)
    RETURN prefix || '-' || LPAD(sequence_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Add comments for clarity
COMMENT ON COLUMN products.sku IS 'Human-readable Stock Keeping Unit (e.g., BUTTER-001)';
COMMENT ON COLUMN product_categories.sku_prefix IS 'Category prefix for SKU generation (e.g., PAINT, ART)';

-- Create index for fast SKU lookups
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
```

## Step 2: Generate SKUs for Existing Products

After running the migration, generate SKUs for your existing product categories:

```sql
-- Generate SKUs for existing product categories (run this in Supabase SQL Editor)
UPDATE product_categories
SET sku = generate_product_sku(name, row_number() OVER (ORDER BY created_at))
WHERE sku IS NULL;
```

## Step 3: Verify SKUs

```sql
-- View all product categories with their new SKUs
SELECT id, name, sku FROM product_categories ORDER BY sku;
```

## Examples of Generated SKUs

Your SKUs will look like:
- **Butterfly** → `BUTTERFLY-001` or `BUTTER-001`
- **Life Cycle** → `LIFECYCL-001` or `LIFECYC-001`
- **Beach Sunset** → `BEACHSUN-001`
- **Abstract Art** → `ABSTRACT-001`

## How It Works

1. **Short & Readable**: Takes first 8 characters of product name
2. **Sequential**: Adds 3-digit sequence number (001, 002, 003...)
3. **Unique**: Database enforces uniqueness
4. **Easy to Search**: Much easier than `17835249535882`!

## Manual SKU Assignment (Optional)

You can also manually set SKUs in the Supabase dashboard:
1. Go to **Database** → **products** table
2. Edit the `sku` column for any product
3. Use format: `CUSTOM-001`, `MYSKU-042`, etc.
