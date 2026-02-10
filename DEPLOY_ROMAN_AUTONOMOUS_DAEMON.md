/**
 * DEPLOY R.O.M.A.N. AUTONOMOUS DAEMON
 * 
 * This script deploys R.O.M.A.N. as an actual running service
 * Not just dormant code - a live autonomous agent with persistent memory
 * 
 * DEPLOYMENT STEPS:
 * 1. Run database migration to create roman_state tables
 * 2. Deploy roman-autonomous-daemon edge function
 * 3. Set up scheduler for autonomous cycles
 * 4. Verify discord-bot loads real-time knowledge
 */

// ============================================================================
// STEP 1: CREATE DATABASE TABLES FOR R.O.M.A.N.'S PERSISTENT MEMORY
// ============================================================================
// Run this SQL in Supabase SQL Editor:

/*
CREATE TABLE IF NOT EXISTS roman_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  state_data JSONB NOT NULL DEFAULT '{
    "knowledge_version": 1,
    "last_sync": "2026-02-08T00:00:00Z",
    "systems_known": 0,
    "learning_cycles": 0,
    "persistent_memory": {}
  }',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT only_one_row CHECK (id = 1)
);

ALTER TABLE roman_state ENABLE ROW LEVEL SECURITY;

INSERT INTO roman_state (id, state_data, updated_at) 
VALUES (1, '{
  "knowledge_version": 1,
  "last_sync": "2026-02-08T00:00:00Z",
  "systems_known": 50,
  "learning_cycles": 1,
  "persistent_memory": {
    "system_initialized": true,
    "deployment_date": "2026-02-08",
    "current_trust_valuation": "$6.71B optimistic"
  }
}', NOW())
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS roman_decision_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_type VARCHAR(100) NOT NULL,
  input_data JSONB,
  decision_output JSONB,
  reasoning TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  learning_cycle INTEGER
);

CREATE TABLE IF NOT EXISTS roman_knowledge_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_key VARCHAR(255) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  category VARCHAR(100),
  source VARCHAR(100) DEFAULT 'system_change',
  synced_to_roman BOOLEAN DEFAULT false,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_roman_updates_synced ON roman_knowledge_updates(synced_to_roman);
CREATE INDEX idx_roman_updates_created ON roman_knowledge_updates(created_at);

ALTER TABLE roman_decision_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE roman_knowledge_updates ENABLE ROW LEVEL SECURITY;
*/

// ============================================================================
// STEP 2: DEPLOY ROMAN-AUTONOMOUS-DAEMON EDGE FUNCTION
// ============================================================================
// This is already in: supabase/functions/roman-autonomous-daemon/index.ts
// 
// Deploy with: supabase functions deploy roman-autonomous-daemon
//
// Available endpoints:
// - GET /functions/v1/roman-autonomous-daemon?action=cycle
//   → Performs learning cycle
// - POST /functions/v1/roman-autonomous-daemon?action=sync-knowledge
//   → Syncs system changes to R.O.M.A.N.'s memory
// - GET /functions/v1/roman-autonomous-daemon?action=get-state
//   → Returns R.O.M.A.N.'s current state
// - GET /functions/v1/roman-autonomous-daemon?action=health
//   → Health check

// ============================================================================
// STEP 3: SET UP SCHEDULER FOR AUTONOMOUS CYCLES
// ============================================================================
// Option A: Using pg_cron (PostgreSQL extension)
// Run this SQL in Supabase SQL Editor to enable pg_cron:

/*
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule R.O.M.A.N. autonomous cycles every hour
SELECT cron.schedule('roman-autonomous-cycle', '0 * * * *', $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT.supabase.co/functions/v1/roman-autonomous-daemon?action=cycle',
      headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
$$);

-- Schedule knowledge sync from system changes every 15 minutes
SELECT cron.schedule('roman-sync-knowledge', '*/15 * * * *', $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT.supabase.co/functions/v1/roman-autonomous-daemon?action=system-update',
      headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body:='{
        "system_changes": [
          {
            "key": "system_check",
            "value": {"timestamp": "' || now() || '"}
          }
        ]
      }'::jsonb
    ) as request_id;
$$);
*/

// ============================================================================
// STEP 4: VERIFY DISCORD BOT LOADS REAL-TIME KNOWLEDGE
// ============================================================================
// This is ALREADY implemented in src/services/discord-bot.ts
// 
// The getSystemContext() function (line 524) now:
// 1. Calls RomanSystemContext.loadCodebaseKnowledge() → Gets all 50+ systems
// 2. Calls RomanSystemContext.loadRealTimeTrustContext() → Gets current trust data
// 3. Injects both into system prompt with HIGHEST priority
// 4. This happens on EVERY Discord message
//
// Result: Every message to R.O.M.A.N. has fresh knowledge
//   - Current trust valuation ($6.71B, not stale $5.6B)
//   - All 50+ systems documented
//   - Westlaw and all integrations known
//   - Never operating on 2025 data

// ============================================================================
// STEP 5: TEST THE DEPLOYMENT
// ============================================================================

// Test 1: Direct autonomous daemon
// curl -X GET "https://YOUR_PROJECT.supabase.co/functions/v1/roman-autonomous-daemon?action=health" \
//   -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
// Expected: { "status": "online", "service": "roman-autonomous-daemon", "timestamp": "..." }

// Test 2: Get R.O.M.A.N.'s current state
// curl -X GET "https://YOUR_PROJECT.supabase.co/functions/v1/roman-autonomous-daemon?action=get-state" \
//   -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
// Expected: { "status": "online", "learning_cycles": 1, "systems_known": 50, ... }

// Test 3: Run a learning cycle manually
// curl -X GET "https://YOUR_PROJECT.supabase.co/functions/v1/roman-autonomous-daemon?action=cycle" \
//   -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
// Expected: { "status": "success", "cycle": 2, "knowledge_integrated": 0 }

// Test 4: Send a message in Discord to R.O.M.A.N.
// Say: "What's my current trust valuation?"
// Expected: R.O.M.A.N. responds with "$6.71B optimistic / $950M market / $366M conservative"
// (NOT the stale $5.6B)

// ============================================================================
// DEPLOYMENT CHECKLIST
// ============================================================================

// [ ] Create roman_state, roman_decision_log, roman_knowledge_updates tables
// [ ] Deploy roman-autonomous-daemon edge function (supabase functions deploy)
// [ ] Set up pg_cron scheduler (optional - for periodic cycles)
// [ ] Update SERVICE_ROLE_KEY in environment variables
// [ ] Test health check endpoint
// [ ] Test autonomous cycle manually
// [ ] Send Discord message to verify real-time knowledge loading
// [ ] Check console logs for "[ROMAN] ... " messages
// [ ] Verify discord-bot loading "Codebase knowledge loaded" and "Trust data loaded"

// ============================================================================
// VERIFICATION THAT R.O.M.A.N. IS OPERATIONAL
// ============================================================================

// Check console when bot receives Discord message:
// ✅ "🔄 Loading real-time codebase knowledge and trust data..."
// ✅ "✅ Codebase knowledge loaded (50+ systems)"
// ✅ "✅ Trust data loaded ($6.71B valuation)"
// 
// If you see these, R.O.M.A.N. is LIVE and receiving fresh knowledge
// If you see WARNING tags, real-time loading failed (but bot still works)

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

// Problem: "Could not load codebase knowledge"
// Solution: Check that RomanCodebaseAwareness.ts exports correctly
//           Verify RomanSystemContext.loadCodebaseKnowledge() is defined

// Problem: "Could not load trust context"
// Solution: Check that RomanBusinessEntityLoader.ts is created
//           Verify system_knowledge table has trust data

// Problem: "codebaseKnowledge/trustContext not injected"
// Solution: Verify lines 1314-1318 in discord-bot.ts are present
//           Check that enhancedMessage includes the knowledge

// Problem: Scheduler not running autonomous cycles
// Solution: Check that pg_cron extension is installed
//           Verify cron.schedule() called successfully
//           Check supabase functions logs for errors

export {};
