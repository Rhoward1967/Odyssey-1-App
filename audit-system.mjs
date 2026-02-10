import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          ODYSSEY-1 SYSTEM AUDIT - TRUTH CHECK              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // 1. Check business_entities (trust data)
  console.log('📊 TABLE: business_entities (Trust Data)');
  const { data: entities, error: entErr } = await supabase.from('business_entities').select('*');
  if (entErr) {
    console.log('  ❌ ERROR:', entErr.message);
  } else {
    console.log('  ✅ Rows:', entities?.length || 0);
    entities?.forEach(e => {
      console.log(`     - ${e.trust_id}: ${e.trust_name}, Val: $${(e.valuation_tier_1_optimistic / 1000000000).toFixed(2)}B, UCC1: $${(e.ucc1_combined_lien / 1000000).toFixed(2)}M`);
    });
  }

  // 2. Check system_knowledge
  console.log('\n📋 TABLE: system_knowledge (Learned Data)');
  const { data: knowledge, error: knowErr } = await supabase.from('system_knowledge').select('*').limit(5);
  if (knowErr) {
    console.log('  ❌ ERROR:', knowErr.message);
  } else {
    console.log('  ✅ Rows:', knowledge?.length || 0);
    knowledge?.forEach(k => {
      console.log(`     - [${k.category}] ${k.knowledge_key}`);
    });
  }

  // 3. Check system_logs
  console.log('\n📝 TABLE: system_logs (Audit Logs)');
  const { data: logs, error: logErr } = await supabase.from('system_logs').select('*').order('created_at', { ascending: false }).limit(5);
  if (logErr) {
    console.log('  ❌ ERROR:', logErr.message);
  } else {
    console.log('  ✅ Rows:', logs?.length || 0);
    logs?.forEach(l => {
      console.log(`     - [${l.source}] ${l.message?.substring(0, 60)}`);
    });
  }

  // 4. Check roman_commands
  console.log('\n⚡ TABLE: roman_commands (Executed Commands)');
  const { data: commands, error: cmdErr } = await supabase.from('roman_commands').select('*').limit(5);
  if (cmdErr) {
    console.log('  ❌ ERROR:', cmdErr.message);
  } else {
    console.log('  ✅ Rows:', commands?.length || 0);
    commands?.forEach(c => {
      console.log(`     - ${c.command_type}: ${c.status}`);
    });
  }

  // 5. Check roman_events
  console.log('\n🎯 TABLE: roman_events (Event Log)');
  const { data: events, error: evErr } = await supabase.from('roman_events').select('*').order('created_at', { ascending: false }).limit(5);
  if (evErr) {
    console.log('  ❌ ERROR:', evErr.message);
  } else {
    console.log('  ✅ Rows:', events?.length || 0);
    events?.forEach(e => {
      console.log(`     - [${e.action_type}] Severity: ${e.severity}`);
    });
  }

  // 6. Check QuickBooks sync tables
  console.log('\n💰 TABLE: quickbooks_sync (QB Integration)');
  const { data: qb, error: qbErr } = await supabase.from('quickbooks_sync').select('*').limit(5);
  if (qbErr) {
    console.log('  ⚠️  ERROR or TABLE MISSING:', qbErr.message);
  } else {
    console.log('  ✅ Rows:', qb?.length || 0);
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                   AUDIT COMPLETE                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  process.exit(0);
})().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
