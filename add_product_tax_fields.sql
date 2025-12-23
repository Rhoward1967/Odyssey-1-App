-- Add tax_rate column to products table
-- This allows different products to have different tax rates (e.g., food vs non-food)

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,4) DEFAULT 0.0875;
-- Default to 8.75% (common US sales tax), but can be customized per product

-- Add optional tax_category for grouping
ALTER TABLE products
ADD COLUMN IF NOT EXISTS tax_category TEXT DEFAULT 'standard';
-- Values: 'standard', 'food', 'exempt', 'luxury', etc.

-- Comment the columns
COMMENT ON COLUMN products.tax_rate IS 'Tax rate as decimal (0.0875 = 8.75%)';
COMMENT ON COLUMN products.tax_category IS 'Tax category: standard, food, exempt, luxury';

-- Update existing products to be taxable with default rate
UPDATE products 
SET tax_rate = 0.0875,
    tax_category = 'standard'
WHERE tax_rate IS NULL;
