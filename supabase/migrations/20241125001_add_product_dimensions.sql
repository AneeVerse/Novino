-- Add shipping dimensions to products table
-- Migration: Add length, width, breadth, height, weight fields

ALTER TABLE products ADD COLUMN IF NOT EXISTS length DECIMAL(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS width DECIMAL(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS breadth DECIMAL(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS height DECIMAL(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL(10,3) DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN products.length IS 'Product length in cm';
COMMENT ON COLUMN products.width IS 'Product width in cm';
COMMENT ON COLUMN products.breadth IS 'Product breadth in cm';
COMMENT ON COLUMN products.height IS 'Product height in cm';
COMMENT ON COLUMN products.weight IS 'Product weight in kg';
