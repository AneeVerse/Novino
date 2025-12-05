-- Add design_story column to product_categories table
-- This column will store the design theme/pattern name (e.g., 'butterfly', 'life_cycle', 'the_sun')
-- to enable cross-category product grouping

ALTER TABLE product_categories 
ADD COLUMN IF NOT EXISTS design_story TEXT;

-- Add index for faster filtering by design_story
CREATE INDEX IF NOT EXISTS idx_product_categories_design_story 
ON product_categories(design_story);

-- Add comment explaining the column
COMMENT ON COLUMN product_categories.design_story IS 'Design theme/pattern name for cross-category grouping (e.g., butterfly, life_cycle, mandala). Products with the same design_story will be shown together regardless of category.';

-- Note: The design_story column is initially NULL for existing products.
-- The frontend code will automatically extract design from the URL as a fallback.
-- You can manually populate this column using queries like:
-- 
-- UPDATE product_categories SET design_story = 'butterfly' WHERE name ILIKE '%butterfly%';
-- UPDATE product_categories SET design_story = 'life_cycle' WHERE name ILIKE '%life%cycle%';

-- Verification query - check current state
SELECT 
  id,
  name,
  design_story,
  sku
FROM product_categories
ORDER BY name
LIMIT 20;
