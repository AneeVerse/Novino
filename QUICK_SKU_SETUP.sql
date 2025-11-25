-- ============================================
-- SKU MIGRATION - COPY & PASTE INTO SUPABASE
-- ============================================

-- Step 1: Add SKU columns and function
-- Copy everything below and run in Supabase SQL Editor

ALTER TABLE product_categories 
ADD COLUMN IF NOT EXISTS sku VARCHAR(50) UNIQUE;

ALTER TABLE product_categories 
ADD COLUMN IF NOT EXISTS sku_prefix VARCHAR(20);

CREATE OR REPLACE FUNCTION generate_product_sku(product_name TEXT, sequence_num INTEGER)
RETURNS VARCHAR(50) AS $$
DECLARE
    prefix TEXT;
    clean_name TEXT;
BEGIN
    clean_name := UPPER(REGEXP_REPLACE(product_name, '[^a-zA-Z0-9]', '', 'g'));
    prefix := SUBSTRING(clean_name FROM 1 FOR 8);
    RETURN prefix || '-' || LPAD(sequence_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

COMMENT ON COLUMN product_categories.sku IS 'Human-readable SKU (e.g., BUTTERFLY-001)';
COMMENT ON COLUMN product_categories.sku_prefix IS 'Category prefix for SKU generation';

CREATE INDEX IF NOT EXISTS idx_product_categories_sku ON product_categories(sku);

-- ============================================
-- Step 2: Generate SKUs for existing products
-- Run this AFTER Step 1 completes successfully
-- ============================================

UPDATE product_categories
SET sku = generate_product_sku(name, row_number() OVER (ORDER BY created_at))
WHERE sku IS NULL;

-- ============================================
-- Step 3: Verify it worked
-- ============================================

SELECT id, name, sku FROM product_categories ORDER BY sku;

-- You should see SKUs like:
-- BUTTERFLY-001
-- LIFECYCL-001
-- etc.
