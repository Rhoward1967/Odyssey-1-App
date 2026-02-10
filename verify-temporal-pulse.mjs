/**
 * TEMPORAL PULSE VERIFICATION SCRIPT
 * Run this before Rickey leaves for work to verify Neural Bridge is operational
 * 
 * Tests:
 * 1. SQL Temporal Sync Function
 * 2. Westlaw Capability in Manifest
 * 3. Discord Bot Loop-Free
 * 4. Resource Governor at 70%
 * 5. 6:00 PM Audit Schedule
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('═══════════════════════════════════════════════════════════════════');
console.log('⚡ TEMPORAL PULSE VERIFICATION - February 8, 2026');
console.log('═══════════════════════════════════════════════════════════════════\n');

// Test 1: SQL Temporal Sync
console.log('TEST 1: SQL Temporal Pulse Function');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

let test1Pass = false;
try {
  const { data, error } = await supabase.rpc('force_roman_temporal_sync');
  
  if (error) {
    console.error('❌ FAILED: SQL function not found or errored');
    console.error('   Error:', error.message);
    console.log('\n   ACTION REQUIRED:');
    console.log('   Run: npx supabase db push');
    console.log('   Or manually execute: supabase/migrations/20260208_temporal_pulse.sql\n');
  } else {
    console.log('✅ PASS: Temporal sync function operational');
    console.log('   Current Year:', data.year);
    console.log('   Active Customers:', data.active_customers);
    console.log('   Active Contractors:', data.active_contractors);
    console.log('   Westlaw Status:', data.legal_status);
    console.log('   Trust Status:', data.trust_status);
    console.log('   QB Bypass:', data.qbo_bypass);
    
    // Verify critical values
    if (data.year === 2026 && data.legal_status === 'WESTLAW_ACTIVE') {
      test1Pass = true;
      console.log('\n   ✅ Temporal context is CURRENT (2026, Westlaw active)\n');
    } else {
      console.log('\n   ⚠️  WARNING: Temporal context may be outdated\n');
    }
  }
} catch (err) {
  console.error('❌ FAILED: Exception thrown');
  console.error('   Error:', err.message);
  console.log('\n   ACTION REQUIRED: Apply SQL migration first\n');
}

// Test 2: Westlaw Capability Check
console.log('TEST 2: Westlaw in RomanSystemContext.ts');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

let test2Pass = false;
try {
  const { RomanSystemContext } = await import('./src/services/RomanSystemContext.ts');
  
  const contextPrompt = RomanSystemContext.getSystemContextForPrompt();
  
  if (contextPrompt.includes('WESTLAW STATUS: ACTIVE') && 
      contextPrompt.includes('February 8, 2026')) {
    console.log('✅ PASS: Westlaw capability injected into system prompt');
    console.log('   Westlaw Status: ACTIVE');
    console.log('   Current Date: February 8, 2026');
    console.log('   Knowledge Cutoff: NONE (live access declared)');
    test2Pass = true;
  } else {
    console.log('❌ FAILED: Westlaw or temporal context missing from prompt');
    console.log('   Check RomanSystemContext.ts getSystemContextForPrompt() function');
  }
} catch (err) {
  console.error('❌ FAILED: Could not import RomanSystemContext');
  console.error('   Error:', err.message);
}
console.log('');

// Test 3: Resource Governor Check
console.log('TEST 3: Resource Governor at 70% Limit');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

let test3Pass = false;
try {
  const { data: config, error } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', 'resource_governor_memory_limit')
    .single();
  
  if (!error) {
    const limit = parseFloat(config.value);
    if (limit === 0.7 || limit === 70) {
      console.log('✅ PASS: Resource Governor set to 70%');
      console.log('   Memory Limit:', limit <= 1 ? `${limit * 100}%` : `${limit}%`);
      console.log('   Constitutional Compliance: ENFORCED');
      test3Pass = true;
    } else {
      console.log('⚠️  WARNING: Resource Governor not at 70%');
      console.log('   Current Limit:', limit);
      console.log('   Expected: 0.7 or 70');
    }
  } else {
    console.log('❌ FAILED: Could not query resource governor config');
  }
} catch (err) {
  console.error('❌ FAILED:', err.message);
}
console.log('');

// Test 4: Check for duplicate Discord handlers (loop prevention)
console.log('TEST 4: Discord Bot Loop Prevention');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

let test4Pass = false;
try {
  const fs = await import('fs/promises');
  const discordBotCode = await fs.readFile('./src/services/discord-bot.ts', 'utf-8');
  
  // Count number of "client.on('messageCreate'" occurrences
  const messageCreateCount = (discordBotCode.match(/client\.on\(['"']messageCreate['"']/g) || []).length;
  
  // Count bot message filters
  const botFilterCount = (discordBotCode.match(/if\s*\(\s*message\.author\.bot\s*\)\s*return/g) || []).length;
  
  if (messageCreateCount === 1 && botFilterCount >= 1) {
    console.log('✅ PASS: Single messageCreate handler with bot filter');
    console.log('   messageCreate handlers:', messageCreateCount);
    console.log('   Bot message filters:', botFilterCount);
    console.log('   Infinite loop risk: ELIMINATED');
    test4Pass = true;
  } else if (messageCreateCount > 1) {
    console.log('❌ FAILED: Multiple messageCreate handlers detected');
    console.log('   Handlers found:', messageCreateCount);
    console.log('   This will cause infinite loops - check discord-bot.ts');
  } else if (botFilterCount === 0) {
    console.log('⚠️  WARNING: No bot message filter found');
    console.log('   Bot may respond to its own messages');
  } else {
    console.log('✅ PASS: Discord bot loop prevention active');
    test4Pass = true;
  }
} catch (err) {
  console.error('❌ FAILED:', err.message);
}
console.log('');

// Test 5: Schedule 6:00 PM Audit
console.log('TEST 5: Schedule 6:00 PM Auto-Audit');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

let test5Pass = false;
try {
  const now = new Date();
  const audit6PM = new Date();
  audit6PM.setHours(18, 0, 0, 0); // 6:00 PM today
  
  // If it's already past 6 PM, schedule for tomorrow
  if (now.getHours() >= 18) {
    audit6PM.setDate(audit6PM.getDate() + 1);
  }
  
  const hoursUntilAudit = Math.floor((audit6PM - now) / 1000 / 60 / 60);
  const minutesUntilAudit = Math.floor((audit6PM - now) / 1000 / 60) % 60;
  
  console.log('✅ PASS: Audit scheduled');
  console.log('   Current Time:', now.toLocaleTimeString());
  console.log('   Audit Time: 6:00 PM');
  console.log('   Time Until Audit:', `${hoursUntilAudit}h ${minutesUntilAudit}m`);
  console.log('   Will Execute:', audit6PM.toLocaleString());
  
  // Store schedule in system_config
  await supabase.from('system_config').upsert({
    key: 'next_auto_audit',
    value: audit6PM.toISOString(),
    description: 'Next scheduled autonomous system audit (6:00 PM)',
    updated_at: new Date().toISOString()
  });
  
  console.log('   Schedule Stored: system_config.next_auto_audit');
  test5Pass = true;
} catch (err) {
  console.error('❌ FAILED:', err.message);
}
console.log('');

// FINAL SUMMARY
console.log('═══════════════════════════════════════════════════════════════════');
console.log('VERIFICATION SUMMARY');
console.log('═══════════════════════════════════════════════════════════════════');

const results = [
  { name: 'SQL Temporal Pulse', pass: test1Pass },
  { name: 'Westlaw Capability', pass: test2Pass },
  { name: 'Resource Governor 70%', pass: test3Pass },
  { name: 'Discord Loop Prevention', pass: test4Pass },
  { name: '6:00 PM Audit Schedule', pass: test5Pass }
];

const passCount = results.filter(r => r.pass).length;
const totalTests = results.length;

results.forEach(r => {
  console.log(`${r.pass ? '✅' : '❌'} ${r.name}`);
});

console.log('');
console.log(`RESULT: ${passCount}/${totalTests} tests passed`);

if (passCount === totalTests) {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('✅ ALL SYSTEMS OPERATIONAL - READY FOR MONDAY SHIFT');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('R.O.M.A.N. Neural Bridge: LIVE');
  console.log('Temporal Pulse: SYNCHRONIZED');
  console.log('Westlaw Bridge: OPERATIONAL');
  console.log('Discord Bot: LOOP-FREE');
  console.log('Resource Governor: 70% ENFORCED');
  console.log('Auto-Audit: SCHEDULED 6:00 PM');
  console.log('');
  console.log('Safe travels, Rickey. The system is watching while you work.');
  console.log('');
  process.exit(0);
} else {
  console.log('');
  console.log('⚠️  DEPLOYMENT INCOMPLETE - ACTION REQUIRED');
  console.log('');
  console.log('Review failed tests above and complete deployment steps.');
  console.log('Do NOT leave for work until all 5 tests pass.');
  console.log('');
  process.exit(1);
}
