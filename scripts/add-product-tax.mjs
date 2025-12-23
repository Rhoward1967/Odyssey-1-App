// Add tax_rate and tax_category to products table
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function addTaxFields() {
  console.log('🔧 Adding tax fields to products table...\n');

  // Add tax_rate column
  const { error: taxRateError } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,4) DEFAULT 0.0875;
    `
  });

  if (taxRateError && !taxRateError.message.includes('already exists')) {
    console.error('❌ Error adding tax_rate:', taxRateError);
  } else {
    console.log('✅ tax_rate column added (default 8.75%)');
  }

  // Add tax_category column
  const { error: taxCategoryError } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS tax_category TEXT DEFAULT 'standard';
    `
  });

  if (taxCategoryError && !taxCategoryError.message.includes('already exists')) {
    console.error('❌ Error adding tax_category:', taxCategoryError);
  } else {
    console.log('✅ tax_category column added (default: standard)');
  }

  // Update existing products
  const { error: updateError } = await supabase
    .from('products')
    .update({ 
      tax_rate: 0.0875,
      tax_category: 'standard'
    })
    .is('tax_rate', null);

  if (updateError) {
    console.error('❌ Error updating existing products:', updateError);
  } else {
    console.log('✅ Existing products updated with tax info');
  }

  console.log('\n📊 Tax Fields Summary:');
  console.log('  - tax_rate: DECIMAL(5,4) - e.g., 0.0875 = 8.75%');
  console.log('  - tax_category: TEXT - standard, food, exempt, luxury');
  console.log('  - is_taxable: BOOLEAN - existing field, controls if tax applies');
  console.log('\n💡 Usage:');
  console.log('  • Set tax_rate per product (different rates for different items)');
  console.log('  • Use tax_category to group similar items');
  console.log('  • Toggle is_taxable to completely exempt items');
}

addTaxFields().catch(console.error);
