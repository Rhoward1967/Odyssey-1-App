#!/usr/bin/env node

/**
 * FCRA Daily Monitoring Check
 * 
 * This script can be run manually or scheduled via cron/task scheduler
 * to check for approaching FCRA response deadlines.
 * 
 * Usage:
 *   node scripts/fcra-daily-check.mjs
 *   
 * For automated checks, add to Windows Task Scheduler or cron:
 *   # Every day at 9am
 *   0 9 * * * cd /path/to/Odyssey-1-App && node scripts/fcra-daily-check.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { differenceInDays, format } from 'date-fns';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkFCRADeadlines() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  FCRA COMPLIANCE MONITORING - DAILY CHECK');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`Check Time: ${format(new Date(), 'MMMM d, yyyy - h:mm a')}\n`);

  try {
    const { data: records, error } = await supabase
      .from('certified_mail_tracking')
      .select('*')
      .order('response_deadline', { ascending: true });

    if (error) throw error;

    if (!records || records.length === 0) {
      console.log('❌ No tracking records found.\n');
      return;
    }

    const now = new Date();
    const total = records.length;
    const responded = records.filter(r => r.response_received).length;
    const pending = total - responded;

    const critical = records.filter(r => {
      if (r.response_received) return false;
      const days = differenceInDays(new Date(r.response_deadline), now);
      return days < 3;
    });

    const approaching = records.filter(r => {
      if (r.response_received) return false;
      const days = differenceInDays(new Date(r.response_deadline), now);
      return days >= 3 && days <= 7;
    });

    const overdue = records.filter(r => {
      if (r.response_received) return false;
      const days = differenceInDays(new Date(r.response_deadline), now);
      return days < 0;
    });

    // Summary Stats
    console.log('📊 SUMMARY:');
    console.log(`   Total Mailings:       ${total}`);
    console.log(`   Responses Received:   ${responded}`);
    console.log(`   Pending Responses:    ${pending}`);
    console.log(`   Overdue:              ${overdue.length}`);
    console.log(`   Critical (<3 days):   ${critical.length - overdue.length}`);
    console.log(`   Approaching (3-7):    ${approaching.length}\n`);

    // Critical Items
    if (critical.length > 0) {
      console.log('🔴 CRITICAL - IMMEDIATE ATTENTION REQUIRED:');
      critical.forEach(r => {
        const days = differenceInDays(new Date(r.response_deadline), now);
        const status = days < 0 ? `OVERDUE by ${Math.abs(days)} days` : `${days} days remaining`;
        console.log(`   • ${r.entity_name} (${r.entity_type})`);
        console.log(`     Deadline: ${format(new Date(r.response_deadline), 'MMM d, yyyy')} - ${status}`);
        console.log(`     Tracking: ${r.tracking_number}\n`);
      });
    }

    // Approaching Deadlines
    if (approaching.length > 0) {
      console.log('⚠️  APPROACHING DEADLINES (3-7 days):');
      approaching.forEach(r => {
        const days = differenceInDays(new Date(r.response_deadline), now);
        console.log(`   • ${r.entity_name} (${r.entity_type}) - ${days} days remaining`);
        console.log(`     Deadline: ${format(new Date(r.response_deadline), 'MMM d, yyyy')}\n`);
      });
    }

    // All Clear
    if (critical.length === 0 && approaching.length === 0 && pending > 0) {
      console.log('✅ All pending deadlines are 8+ days away. No urgent action required.\n');
    }

    if (pending === 0) {
      console.log('✅ All mailings have received responses!\n');
    }

    // Detailed Status List
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  DETAILED STATUS');
    console.log('═══════════════════════════════════════════════════════════\n');

    records.forEach((r, index) => {
      const days = differenceInDays(new Date(r.response_deadline), now);
      let statusIcon = '⏳';
      let statusText = `${days} days remaining`;

      if (r.response_received) {
        statusIcon = '✅';
        statusText = `Response received ${format(new Date(r.response_date), 'MMM d, yyyy')}`;
        if (r.verification_provided) {
          statusText += ' (Verification provided)';
        }
      } else if (days < 0) {
        statusIcon = '🔴';
        statusText = `OVERDUE by ${Math.abs(days)} days`;
      } else if (days < 3) {
        statusIcon = '🔴';
      } else if (days <= 7) {
        statusIcon = '⚠️';
      }

      console.log(`${index + 1}. ${statusIcon} ${r.entity_name} (${r.entity_type})`);
      console.log(`   Status: ${statusText}`);
      console.log(`   Deadline: ${format(new Date(r.response_deadline), 'MMM d, yyyy')}`);
      console.log(`   Tracking #: ${r.tracking_number}`);
      if (r.notes) {
        console.log(`   Notes: ${r.notes}`);
      }
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════\n');

    // Log check to database
    await supabase.from('system_knowledge').insert({
      category: 'fcra_monitoring',
      subcategory: 'daily_check',
      key_name: `fcra_check_${format(now, 'yyyy-MM-dd')}`,
      value: `Daily check completed: ${responded}/${total} responded, ${overdue.length} overdue, ${critical.length - overdue.length} critical`,
      metadata: {
        total,
        responded,
        pending,
        overdue: overdue.length,
        critical: critical.length,
        approaching: approaching.length,
      },
    });

  } catch (error) {
    console.error('❌ Error during FCRA check:', error);
    process.exit(1);
  }
}

checkFCRADeadlines();
