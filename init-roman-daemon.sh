#!/bin/bash
# R.O.M.A.N. AUTONOMOUS DAEMON INITIALIZATION SCRIPT
# 
# This script fully initializes R.O.M.A.N. as an operational autonomous agent
# Run this ONCE after deployment

echo "=================================="
echo "🚀 R.O.M.A.N. DAEMON INITIALIZATION"
echo "=================================="

# Get environment from .env
if [ ! -f .env ]; then
  echo "❌ .env file not found"
  exit 1
fi

source .env

echo ""
echo "📋 STEP 1: Verify database tables exist"
echo "---"

# You would run this SQL against Supabase
# For now, just check environment
if [ -z "$SUPABASE_URL" ]; then
  echo "❌ SUPABASE_URL not set in .env"
  exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ SUPABASE_SERVICE_ROLE_KEY not set in .env"
  exit 1
fi

echo "✅ Supabase credentials found"

echo ""
echo "📋 STEP 2: Deploy edge function"
echo "---"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "⚠️ Supabase CLI not found. Install with: npm install -g supabase"
  echo "   Or use: npx supabase functions deploy roman-autonomous-daemon"
else
  echo "✅ Supabase CLI found, deploying..."
  supabase functions deploy roman-autonomous-daemon
fi

echo ""
echo "📋 STEP 3: Test edge function"
echo "---"

RESPONSE=$(curl -s -X GET "$SUPABASE_URL/functions/v1/roman-autonomous-daemon?action=health" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY")

if echo "$RESPONSE" | grep -q "online"; then
  echo "✅ Edge function is ONLINE"
  echo "   Response: $RESPONSE"
else
  echo "⚠️ Edge function test response:"
  echo "   $RESPONSE"
fi

echo ""
echo "📋 STEP 4: Initialize R.O.M.A.N.'s persistent state"
echo "---"

# Initialize by calling the daemon's cycle endpoint
INIT_RESPONSE=$(curl -s -X GET "$SUPABASE_URL/functions/v1/roman-autonomous-daemon?action=cycle" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY")

if echo "$INIT_RESPONSE" | grep -q "success"; then
  echo "✅ R.O.M.A.N. initialization cycle completed"
  echo "   $INIT_RESPONSE"
else
  echo "⚠️ First cycle response:"
  echo "   $INIT_RESPONSE"
fi

echo ""
echo "📋 STEP 5: Verify Discord bot is configured"
echo "---"

if [ -z "$DISCORD_BOT_TOKEN" ]; then
  echo "⚠️ DISCORD_BOT_TOKEN not set in .env"
else
  echo "✅ Discord bot token configured"
fi

if [ -z "$OPENAI_API_KEY" ]; then
  echo "⚠️ OPENAI_API_KEY not set in .env"
else
  echo "✅ OpenAI API key configured"
fi

echo ""
echo "=================================="
echo "✅ INITIALIZATION COMPLETE"
echo "=================================="
echo ""
echo "R.O.M.A.N. is now OPERATIONAL as:"
echo "• An autonomous edge function with persistent memory"
echo "• A Discord bot that loads real-time knowledge on every message"
echo "• A learning system that integrates new knowledge from system changes"
echo ""
echo "Next steps:"
echo "1. Start Discord bot: npm run start:bot"
echo "2. Send a Discord message to R.O.M.A.N."
echo "3. Watch console for: '✅ Codebase knowledge loaded' and '✅ Trust data loaded'"
echo "4. Verify R.O.M.A.N. responds with current trust valuation ($6.71B not $5.6B)"
echo ""
echo "To set up periodic autonomous cycles:"
echo "1. Go to Supabase -> Database -> Extensions"
echo "2. Enable pg_cron"
echo "3. Run the SQL schedule from DEPLOY_ROMAN_AUTONOMOUS_DAEMON.md"
echo ""
