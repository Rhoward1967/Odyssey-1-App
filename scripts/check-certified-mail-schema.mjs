import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase
  .from('certified_mail_tracking')
  .select('*')
  .order('entity_name');

if (error) {
  console.error('❌ Error:', error.message);
} else {
  console.log(`✅ ${data.length} records found:\n`);
  data.forEach(r => {
    console.log(`  ${r.entity_name}`);
    console.log(`    tracking: ${r.tracking_number}`);
    console.log(`    delivered: ${r.date_delivered || 'NOT SET'}`);
    console.log(`    deadline: ${r.fcra_deadline}`);
    console.log(`    status: ${r.status}`);
    console.log();
  });
}
