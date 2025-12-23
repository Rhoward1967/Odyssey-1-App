// Verify tax columns and show product tax configuration
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function showProductTax() {
  console.log('📊 Products Tax Configuration\n');

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('sku');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Found ${products.length} products:\n`);

  if (products.length > 0) {
    console.log('Available columns:', Object.keys(products[0]).join(', '));
    console.log('');
  }

  products.forEach(p => {
    const price = (p.price_per_case_cents / 100).toFixed(2);
    const taxRate = p.tax_rate ? (p.tax_rate * 100).toFixed(2) + '%' : 'N/A';
    
    console.log(`${p.sku} - ${p.name}`);
    console.log(`  Price: $${price} | Tax Rate: ${taxRate} | Category: ${p.tax_category || 'N/A'}`);
    console.log('');
  });

  console.log('\n💡 Tax Options:');
  console.log('  • tax_rate: 0.0875 = 8.75%, 0.06 = 6%, 0.10 = 10%');
  console.log('  • tax_category: standard, food, exempt, luxury');
  console.log('  • is_taxable: true/false (master switch)');
}

showProductTax().catch(console.error);
