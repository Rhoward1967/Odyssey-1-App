import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function update() {
  console.log('\n⚖️  Final FCRA Deadline Updates from Physical Receipts...\n');

  const updates = [
    {
      label: 'JPMorgan Chase — Feb 17 confirmed, deadline Mar 19',
      tracking: '9589071052702244169878',
      data: {
        date_delivered: '2026-02-17',
        fcra_deadline: '2026-03-19',
        notes: 'Delivered Feb 17 2026, received by Brahima Trecro (JPMorgan Chase) | FCRA 30-day deadline: Mar 19 2026',
      }
    },
    {
      label: 'Intuit Financing — Feb 18 (best read), deadline Mar 20',
      tracking: '9589071052702244185021',
      data: {
        date_delivered: '2026-02-18',
        fcra_deadline: '2026-03-20',
        notes: 'Delivered approx Feb 18 2026, received by Sergio | Date partially legible on receipt | FCRA 30-day deadline: Mar 20 2026',
      }
    },
    {
      label: 'Citibank — no signature, holding Mar 11 deadline',
      tracking: '9589071052702244169823',
      data: {
        notes: 'Return receipt returned with no signature | Delivery unconfirmed — FCRA clock holds from mail date Feb 9 | Deadline: Mar 11 2026 | FOLLOW UP: verify delivery via USPS tracking',
      }
    },
  ];

  for (const update of updates) {
    const { error } = await supabase
      .from('certified_mail_tracking')
      .update(update.data)
      .eq('tracking_number', update.tracking);

    if (error) {
      console.error(`  ❌ ${update.label} — ${error.message}`);
    } else {
      console.log(`  ✅ ${update.label}`);
    }
  }

  console.log('\n📊 FINAL FCRA DEADLINE BOARD:');
  console.log('  March 11 — Citibank (no signature — verify USPS tracking)');
  console.log('  March 14 — Peach State FCU');
  console.log('  March 19 — Equifax Consumer, Equifax Business, Capital One Consumer, JPMorgan Chase');
  console.log('  March 20 — Intuit Financing');
  console.log('\n  ⚠️  Citibank: Run USPS tracking on 9589071052702244169823');
  console.log('      If delivered, update date_delivered + fcra_deadline accordingly.');
}

update().catch(console.error);
