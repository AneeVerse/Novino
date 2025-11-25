-- Add user-friendly SKU columns
-- Migration: Add SKU fields with generators

-- Add SKU to product_categories table (this is your main products table)
ALTER TABLE product_categories 
ADD COLUMN IF NOT EXISTS sku VARCHAR(50) UNIQUE;

-- Add SKU prefix for category-based SKU generation
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
COMMENT ON COLUMN product_categories.sku IS 'Human-readable Stock Keeping Unit (e.g., BUTTERFLY-001)';
COMMENT ON COLUMN product_categories.sku_prefix IS 'Category prefix for SKU generation (e.g., PAINT, ART)';

-- Create index for fast SKU lookups
CREATE INDEX IF NOT EXISTS idx_product_categories_sku ON product_categories(sku);
