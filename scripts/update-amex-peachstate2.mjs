import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function update() {
  console.log('\n📬 Updating AmEx deliveries + adding Peach State Letter 2...\n');

  // Update all 3 AmEx records — delivered Feb 17, Jessica Barraza
  const amexTrackings = [
    { tracking: '9589071052702244169861', label: 'AmEx Business Prime' },
    { tracking: '9589071052702244169830', label: 'AmEx Legal & Compliance (Account 1)' },
    { tracking: '9589071052702244169847', label: 'AmEx Legal & Compliance (Account 2)' },
  ];

  for (const amex of amexTrackings) {
    const { error } = await supabase
      .from('certified_mail_tracking')
      .update({
        date_delivered: '2026-02-17',
        fcra_deadline: '2026-03-19',
        status: 'delivered',
        notes: `Delivered Feb 17 2026, received by Jessica Barraza (Agent) | Legal Compliance Dept, El Paso TX | FCRA 30-day deadline: Mar 19 2026`,
      })
      .eq('tracking_number', amex.tracking);

    if (error) console.error(`  ❌ ${amex.label} — ${error.message}`);
    else console.log(`  ✅ ${amex.label} — Feb 17, Jessica Barraza, deadline Mar 19`);
  }

  // Insert second Peach State letter as new record
  const { error: insertError } = await supabase
    .from('certified_mail_tracking')
    .insert({
      entity_name: 'Peach State Federal Credit Union (Letter 2)',
      tracking_number: '9589071052702244185069',
      date_mailed: '2026-02-09',
      date_delivered: '2026-02-15',
      fcra_deadline: '2026-03-17',
      status: 'delivered',
      notes: 'Second certified letter — delivered Feb 15 2026, received by Patrick Brinn | FCRA 30-day deadline: Mar 17 2026',
    });

  if (insertError) console.error(`  ❌ Peach State Letter 2 — ${insertError.message}`);
  else console.log(`  ✅ Peach State FCU (Letter 2) — Feb 15, Patrick Brinn, deadline Mar 17`);

  console.log('\n📊 UPDATED FCRA DEADLINE BOARD:');
  console.log('  March 14 — Peach State FCU (Letter 1, C. Brown)');
  console.log('  March 17 — Peach State FCU (Letter 2, Patrick Brinn)');
  console.log('  March 18 — Citibank');
  console.log('  March 19 — Equifax Consumer, Equifax Business, Capital One Consumer');
  console.log('             JPMorgan Chase, AmEx (x3)');
  console.log('  March 20 — Intuit Financing');
  console.log('\n  ⏳ Equifax Supplemental (mailed Feb 25) — tracking number needed');
}

update().catch(console.error);
