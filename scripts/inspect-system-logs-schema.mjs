import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

const { data, error } = await supabase
  .from('system_logs')
  .select('*')
  .limit(1);

if (error) {
  console.error('Query failed:', error.message);
  process.exit(1);
}

console.log(data && data[0] ? Object.keys(data[0]) : 'No rows found');
