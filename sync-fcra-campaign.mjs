/**
 * FCRA Campaign Sync — Feb 9, 2026 Campaign
 * Inserts all 17 certified mail records into the live certified_mail_tracking table.
 *
 * ACTUAL production schema (probed live):
 *   id, entity_name, tracking_number, date_mailed, notes, fcra_deadline, status, created_at, updated_at
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE
);

const DATE_MAILED   = '2026-02-09';
const FCRA_DEADLINE = '2026-03-11';

const ALL_17 = [
  // FINANCIAL INSTITUTIONS
  {
    entity_name:      'Peach State Federal Credit Union',
    tracking_number:  '9589071052702244169793',
    date_mailed:      DATE_MAILED,
    fcra_deadline:    FCRA_DEADLINE,
    status:           'delivered',
    notes:            'Accounts: 139209-71, -72, -73 | RETURN RECEIPT CONFIRMED Feb 20, 2026. 30-day clock running.'
  },
  {
    entity_name:      'JPMorgan Chase Bank',
    tracking_number:  '9589071052702244169878',
    date_mailed:      DATE_MAILED,
    fcra_deadline:    FCRA_DEADLINE,
    status:           'sent',
    notes:            'Account: #4147 4004 0372 4568'
  },
  {
    entity_name:      'Capital One - Spark Business',
    tracking_number:  '9589071052702244185045',
    date_mailed:      DATE_MAILED,
    fcra_deadline:    FCRA_DEADLINE,
    status:           'sent',
    notes:            'Account: #4802 1398 29566031'
  },
  {
    entity_name:      'Capital One - Consumer',
    tracking_number:  '9589071052702244185038',
    date_mailed:      DATE_MAILED,
    fcra_deadline:    FCRA_DEADLINE,
    status:           'sent',
    notes:            'Account: #5178 0588 0973 0768'
  },
  {
    entity_name:      'Citibank',
    tracking_number:  '9589071052702244169823',
    date_mailed:      DATE_MAILED,
    fcra_deadline:    FCRA_DEADLINE,
    status:           'sent',
    notes:            'Account: #5424 1815 7366 2751'
  },
  {
    entity_name:      'American Express - Legal & Compliance (Account 1)',
    tracking_number:  'PENDING-AMEX-ACCT1-020926',
    date_mailed:      DATE_MAILED,
    fcra_deadline:    FCRA_DEADLINE,
    status:           'sent',
    notes:            'Account: ...21007 | Tracking number to be confirmed'
  },
  {
    entity_name:      'American Express - Legal & Compliance (Account 2)',
    tracking_number:  'PENDING-AMEX-ACCT2-020926',
    date_mailed:      DATE_MAILED,
    fcra_deadline:    FCRA_DEADLINE,
    status:           'sent',
    notes:            'Account: ...61001 | Tracking number to be confirmed'
  },
  {
    entity_name:      'American Express - Business Prime',
    tracking_number:  'PENDING-AMEX-BIZPRIME-020926',
    date_mailed:      DATE_MAILED,
    fcra_deadline:    FCRA_DEADLINE,
    status:           'sent',
    notes:            'Account: #3792 3675 1681 001 | Tracking number to be confirmed'
  },
  {
    entity_name:      'Synchrony Bank / Sams Club Mastercard',
    tracking_number:  'PENDING-SYNCHRONY-020926',
    date_mailed:      DATE_MAILED,
    fcra_deadline:    FCRA_DEADLINE,
    status:           'sent',
    notes:            'Account: #5213 3314 1207 1798 | Tracking number to be confirmed'
  },
  {
    entity_name:      'Intuit Financing (QuickBooks Capital)',
    tracking_number:  '9589071052702244185021',
    date_mailed:      DATE_MAILED,
    fcra_deadline:    FCRA_DEADLINE,
    status:           'sent',
    notes:            'Loan ID: 5ddbbef49b4406fb36932294a4c676a | QB Capital loan + MOSA restructuring notice'
  },
  {
    entity_name:      'Bank of America - Vehicle Loan Servicing',
    tracking_number:  '9589071052702244185052',
    date_mailed:      DATE_MAILED,
    fcra_deadline:    FCRA_DEADLINE,
    status:           'sent',
    notes:            'Jeep Wrangler Loan #63010066944180 | Corrected address: PO Box 982235, El Paso TX 79998-2235'
  },
  // CREDIT BUREAUS
  {
    entity_name:      'Equifax (Consumer)',
    tracking_number:  'PENDING-EQUIFAX-CONSUMER-020926',
    date_mailed:      DATE_MAILED,
    fcra_deadline:    FCRA_DEADLINE,
    status:           'sent',
    notes:            'Consumer credit profile dispute | Tracking number to be confirmed'
  },
  {
    entity_name:      'Equifax Business',
    tracking_number:  '9589071052702244169748',
    date_mailed:      DATE_MAILED,
    fcra_deadline:    FCRA_DEADLINE,
    status:           'sent',
    notes:            'Business credit profile dispute'
  },
  {
    entity_name:      'Experian (Consumer)',
    tracking_number:  'PENDING-EXPERIAN-CONSUMER-020926',
    date_mailed:      DATE_MAILED,
    fcra_deadline:    FCRA_DEADLINE,
    status:           'sent',
    notes:            'Consumer credit profile dispute | Tracking number to be confirmed'
  },
  {
    entity_name:      'Experian Business',
    tracking_number:  '9589071052702244169731',
    date_mailed:      DATE_MAILED,
    fcra_deadline:    FCRA_DEADLINE,
    status:           'sent',
    notes:            'Business credit profile dispute'
  },
  {
    entity_name:      'TransUnion',
    tracking_number:  '9589071052702244169779',
    date_mailed:      DATE_MAILED,
    fcra_deadline:    FCRA_DEADLINE,
    status:           'sent',
    notes:            'Consumer credit profile dispute'
  },
  {
    entity_name:      'Dun & Bradstreet',
    tracking_number:  '9589071052702244169724',
    date_mailed:      DATE_MAILED,
    fcra_deadline:    FCRA_DEADLINE,
    status:           'sent',
    notes:            'Business credit profile dispute'
  }
];

async function run() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║       FCRA CAMPAIGN SYNC — Feb 9, 2026 Campaign               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  let inserted = 0, updated = 0, skipped = 0, errors = 0;

  for (const rec of ALL_17) {
    const { data: existing } = await supabase
      .from('certified_mail_tracking')
      .select('id')
      .ilike('entity_name', `%${rec.entity_name.split(' ').slice(0, 3).join(' ')}%`)
      .limit(1);

    if (existing && existing.length > 0) {
      // Update existing record
      const { error: upErr } = await supabase
        .from('certified_mail_tracking')
        .update({
          tracking_number: rec.tracking_number,
          fcra_deadline:   rec.fcra_deadline,
          status:          rec.status,
          notes:           rec.notes,
          date_mailed:     rec.date_mailed
        })
        .eq('id', existing[0].id);

      if (upErr) {
        console.log(`  ❌ ERROR updating ${rec.entity_name}: ${upErr.message}`);
        errors++;
      } else {
        console.log(`  🔄 Updated:  ${rec.entity_name} → status=${rec.status}`);
        updated++;
      }
    } else {
      // Insert new record
      const { error: insErr } = await supabase
        .from('certified_mail_tracking')
        .insert(rec);

      if (insErr) {
        if (insErr.code === '23505') {
          console.log(`  ⏭️  Skipped (duplicate): ${rec.entity_name}`);
          skipped++;
        } else {
          console.log(`  ❌ ERROR inserting ${rec.entity_name}: ${insErr.message}`);
          errors++;
        }
      } else {
        console.log(`  ✅ Inserted: ${rec.entity_name}`);
        inserted++;
      }
    }
  }

  console.log(`\n  Summary: ${inserted} inserted | ${updated} updated | ${skipped} skipped | ${errors} errors`);

  // Final report
  console.log('\n─────────────────────────────────────────────────────────────────');
  const { data: final } = await supabase
    .from('certified_mail_tracking')
    .select('entity_name, tracking_number, fcra_deadline, status')
    .order('entity_name');

  if (final) {
    console.log(`\n  TOTAL RECORDS: ${final.length}/17 | Deadline: ${FCRA_DEADLINE}\n`);
    final.forEach(r => {
      const trk  = r.tracking_number?.startsWith('PENDING') ? '⚠️  PENDING TRK' : '✅ TRK';
      const stat = r.status === 'delivered' ? '✅ DELIVERED' : '📬 SENT';
      console.log(`  ${stat} | ${trk} | ${r.entity_name}`);
    });

    const pending = final.filter(r => r.tracking_number?.startsWith('PENDING')).length;
    if (pending > 0) {
      console.log(`\n  ⚠️  ${pending} records still have placeholder tracking numbers.`);
      console.log(`     Update these when actual USPS tracking numbers are available.`);
    }

    if (final.length === 17) {
      console.log('\n  ✅ All 17 records present. R.O.M.A.N. FCRA monitoring is LIVE.');
    } else {
      console.log(`\n  ⚠️  Only ${final.length}/17 records present.`);
    }
  }

  console.log('\n  Days until FCRA deadline (March 11, 2026):');
  const today = new Date('2026-02-21');
  const deadline = new Date('2026-03-11');
  const days = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
  console.log(`  ⏱️  ${days} days remaining`);

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  SYNC COMPLETE — R.O.M.A.N. FCRA monitoring active           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
