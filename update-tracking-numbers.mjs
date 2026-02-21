/**
 * Update PENDING tracking numbers with real USPS tracking numbers
 * from the Feb 9, 2026 FCRA campaign CSV.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE
);

// Real tracking numbers from verified USPS CSV (spaces removed)
const UPDATES = [
  {
    entity_name:       'Equifax (Consumer)',
    old_tracking:      'PENDING-EQUIFAX-CONSUMER-020926',
    new_tracking:      '9589071052702244169755',
  },
  {
    entity_name:       'Experian (Consumer)',
    old_tracking:      'PENDING-EXPERIAN-CONSUMER-020926',
    new_tracking:      '9589071052702244169762',
  },
  {
    entity_name:       'Synchrony Bank / Sams Club Mastercard',
    old_tracking:      'PENDING-SYNCHRONY-020926',
    new_tracking:      '9589071052702244169809',
  },
  {
    entity_name:       'American Express - Legal & Compliance (Account 1)',
    old_tracking:      'PENDING-AMEX-ACCT1-020926',
    new_tracking:      '9589071052702244169830',
  },
  {
    entity_name:       'American Express - Legal & Compliance (Account 2)',
    old_tracking:      'PENDING-AMEX-ACCT2-020926',
    new_tracking:      '9589071052702244169847',
  },
  {
    entity_name:       'American Express - Business Prime',
    old_tracking:      'PENDING-AMEX-BIZPRIME-020926',
    new_tracking:      '9589071052702244169861',
  },
  {
    entity_name:       'Bank of America - Vehicle Loan Servicing',
    old_tracking:      '9589071052702244185052',  // was incorrect
    new_tracking:      '9589071052702244185069',  // corrected from CSV
  },
];

async function run() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║    UPDATE TRACKING NUMBERS — USPS CSV → Live DB               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  let ok = 0, failed = 0;

  for (const u of UPDATES) {
    const { data, error } = await supabase
      .from('certified_mail_tracking')
      .update({ tracking_number: u.new_tracking })
      .eq('tracking_number', u.old_tracking)
      .select('id, entity_name, tracking_number');

    if (error) {
      console.log(`  ❌ ERROR [${u.entity_name}]: ${error.message}`);
      failed++;
    } else if (!data || data.length === 0) {
      console.log(`  ⚠️  NOT FOUND [${u.entity_name}] — old tracking: ${u.old_tracking}`);
      failed++;
    } else {
      console.log(`  ✅ Updated: ${u.entity_name}`);
      console.log(`     ${u.old_tracking}`);
      console.log(`     → ${u.new_tracking}`);
      ok++;
    }
  }

  console.log(`\n  Summary: ${ok} updated | ${failed} failed\n`);

  // Final state of all 17 records
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('  FINAL STATE — All certified_mail_tracking records:\n');

  const { data: all } = await supabase
    .from('certified_mail_tracking')
    .select('entity_name, tracking_number, status, fcra_deadline')
    .order('entity_name');

  if (all) {
    let pendingCount = 0;
    all.forEach(r => {
      const isPending = r.tracking_number?.startsWith('PENDING');
      const trkIcon  = isPending ? '⚠️  PENDING' : '✅ REAL TRK';
      const statIcon = r.status === 'delivered' ? '📬 DELIVERED'
                     : r.status === 'responded'  ? '✅ RESPONDED'
                     : '📨 SENT';
      console.log(`  ${statIcon} | ${trkIcon} | ${r.entity_name}`);
      if (!isPending) console.log(`              ${r.tracking_number}`);
      if (isPending) pendingCount++;
    });

    console.log(`\n  TOTAL: ${all.length}/17 records`);
    if (pendingCount === 0) {
      console.log('  ✅ All tracking numbers are REAL USPS numbers. No PENDING placeholders remain.');
    } else {
      console.log(`  ⚠️  ${pendingCount} records still have PENDING tracking numbers.`);
    }
  }

  const today    = new Date('2026-02-21');
  const deadline = new Date('2026-03-11');
  const days     = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
  console.log(`\n  ⏱️  ${days} days until FCRA deadline (March 11, 2026)`);
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  UPDATE COMPLETE — R.O.M.A.N. FCRA tracking fully updated    ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
