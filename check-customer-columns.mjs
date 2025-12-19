#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase.from('customers').select('*').limit(1);
if (error) console.log('Error:', error.message);
else console.log('Customer columns:', data?.[0] ? Object.keys(data[0]).join(', ') : 'No customers');
