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
  .select('id, created_at, message')
  .eq('message', 'Administrative Commit: Legal defense expansion recorded (Feb 4, 2026)')
  .order('created_at', { ascending: false })
  .limit(1);

if (error) {
  console.error('Query failed:', error.message);
  process.exit(1);
}

console.log(data && data[0] ? data[0] : 'No entry found');
