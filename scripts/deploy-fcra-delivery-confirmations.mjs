#!/usr/bin/env node
/**
 * Deploy FCRA Certified Mail Delivery Confirmations
 * Updates certified_mail_tracking with actual delivery dates from return receipts
 * Feb 23, 2026
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deploy() {
  console.log('\n📬 Deploying FCRA Delivery Confirmation Updates...\n');

  const updates = [
    {
      label: 'Equifax (Consumer) — Feb 17 delivery, James Mcs',
      tracking: '9589071052702244169755',
      data: {
        date_delivered: '2026-02-17',
        fcra_deadline: '2026-03-19',
        status: 'delivered',
        notes: 'Delivered Feb 17 2026, received by James Mcs | FCRA 30-day clock resets: deadline Mar 19 2026',
      }
    },
    {
      label: 'Equifax Business — Feb 17 delivery, James Mckers',
      tracking: '9589071052702244169748',
      data: {
        date_delivered: '2026-02-17',
        fcra_deadline: '2026-03-19',
        status: 'delivered',
        notes: 'Delivered Feb 17 2026, received by James Mckers | FCRA 30-day clock resets: deadline Mar 19 2026',
      }
    },
    {
      label: 'Capital One (Consumer) — Feb 17 delivery',
      tracking: '9589071052702244185038',
      data: {
        date_delivered: '2026-02-17',
        fcra_deadline: '2026-03-19',
        status: 'delivered',
        notes: 'Delivered Feb 17 2026, signature on file | FCRA 30-day clock resets: deadline Mar 19 2026',
      }
    },
    {
      label: 'Peach State FCU — Feb 12 delivery, C. Brown',
      tracking: '9589071052702244169793',
      data: {
        date_delivered: '2026-02-12',
        fcra_deadline: '2026-03-14',
        status: 'delivered',
        notes: 'Delivered Feb 12 2026, received by C. Brown | FCRA 30-day clock resets: deadline Mar 14 2026',
      }
    },
    {
      label: 'JPMorgan Chase — delivery confirmed, Brahima Trecro',
      tracking: '9589071052702244169878',
      data: {
        status: 'delivered',
        notes: 'Delivery confirmed, received by Brahima Trecro (JPMorgan Chase) | Date on receipt unclear — deadline under review, holding Mar 11',
      }
    },
    {
      label: 'Citibank — delivery confirmed, date unclear',
      tracking: '9589071052702244169823',
      data: {
        status: 'delivered',
        notes: 'Delivery confirmed, signature on file | Date on receipt unclear — deadline under review, holding Mar 11',
      }
    },
    {
      label: 'Intuit Financing — delivery confirmed, Sergio',
      tracking: '9589071052702244185021',
      data: {
        status: 'delivered',
        notes: 'Delivery confirmed, received by Sergio | Date on receipt unclear — deadline under review, holding Mar 11',
      }
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const update of updates) {
    const { error } = await supabase
      .from('certified_mail_tracking')
      .update(update.data)
      .eq('tracking_number', update.tracking);

    if (error) {
      console.error(`  ❌ ${update.label}`);
      console.error(`     ${error.message}`);
      failed++;
    } else {
      console.log(`  ✅ ${update.label}`);
      passed++;
    }
  }

  console.log(`\n📊 Results: ${passed} updated, ${failed} failed`);

  if (passed > 0) {
    console.log('\n⚖️  Active FCRA Deadlines:');
    console.log('  March 14 — Peach State FCU');
    console.log('  March 19 — Equifax Consumer, Equifax Business, Capital One Consumer');
    console.log('  March 11 — Chase, Citi, Intuit (date TBD, original deadline holds)');
    console.log('\n  7 entities now in DELIVERED status. R.O.M.A.N. clock is running.');
  }
}

deploy().catch(console.error);
