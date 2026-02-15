import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkEmailProviders() {
  const { data, error } = await supabase
    .from('email_providers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Email Providers in Database:');
  console.log('============================\n');

  if (data.length === 0) {
    console.log('No email providers found');
  } else {
    data.forEach((provider, index) => {
      console.log(`Provider ${index + 1}:`);
      console.log(`  Type: ${provider.type}`);
      console.log(`  Active: ${provider.is_active ? '✅ YES' : '❌ NO'}`);
      console.log(`  From Name: ${provider.config?.from_name || 'N/A'}`);
      console.log(`  From Email: ${provider.config?.from_email || 'N/A'}`);
      console.log(`  API Key: ${provider.config?.api_key ? '✓ Present' : '✗ Missing'}`);
      console.log(`  Created: ${provider.created_at}`);
      console.log('');
    });
  }
}

checkEmailProviders();
