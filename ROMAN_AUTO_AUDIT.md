# 🔍 R.O.M.A.N. Auto-Audit & Learning System

## Overview

R.O.M.A.N. now has a comprehensive auto-audit system that continuously learns and monitors the entire ODYSSEY-1 infrastructure. This makes him fully aware of every aspect of his home system.

## What R.O.M.A.N. Audits

### 1. **Database Schema** 📊
- Scans all 25+ database tables
- Counts rows in each table
- Identifies accessibility issues
- Tracks data growth over time

**Tables Monitored:**
- `appointments`, `businesses`, `customers`, `employees`, `books`
- `governance_changes`, `governance_principles`, `governance_log`
- `roman_audit_log`, `roman_commands`, `agents`, `cost_metrics`
- `profiles`, `services`, `stripe_events`, `subscriptions`
- `system_config`, `system_knowledge`, `system_logs`, `time_entries`
- `handbook_content`, `handbook_acknowledgments`, `handbook_categories`
- `user_organizations`, `organizations`

### 2. **File Structure** 📁
- Recursively scans src/, supabase/, and project root
- Counts files by type (.ts, .tsx, .sql, .md, etc.)
- Maps directory structure
- Identifies organization patterns

### 3. **Environment Configuration** 🔐
- Verifies all required API keys
- Checks configuration completeness
- Validates key lengths and formats
- Detects missing or suspicious values

**Required Variables:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `DISCORD_BOT_TOKEN`
- `STRIPE_SECRET_KEY`

### 4. **Edge Functions** ⚡
- Lists all Supabase Edge Functions
- Verifies function directory structure
- Tracks deployed vs local functions

### 5. **Recent Activity** 📋
- Analyzes last 50 system logs
- Reviews governance changes
- Tracks R.O.M.A.N. commands executed
- Identifies error patterns

### 6. **Dependencies** 📦
- Reads package.json
- Counts dependencies and devDependencies
- Identifies key packages (React, Supabase, Stripe, OpenAI, Discord)

## Auto-Audit Schedule

R.O.M.A.N. automatically runs a complete system audit:
- **On startup** - Immediately when bot initializes
- **Every 6 hours** - Continuous monitoring
- **On demand** - Via Discord commands

## Discord Commands

### Audit Commands

| Command | Description |
|---------|-------------|
| `audit system` | Run complete system audit across all categories |
| `audit database` | Check database tables and row counts |
| `audit files` | Scan file structure and count files |
| `audit config` | Verify environment configuration |
| `system health` | Quick health status report |
| `learn everything` | Full deep scan and memorization |

### Example Usage

**Complete System Audit:**
```
User: @R.O.M.A.N. audit system
R.O.M.A.N.: 🔍 Running complete system audit... This may take a moment.
R.O.M.A.N.: ✅ System Health: HEALTHY
             Total Issues: 2
             Audited Categories: 6
             - database_schema: Scanned 25 tables with 1,247 total rows
             - file_structure: Found 487 files across 82 directories
             - environment_config: 6/6 required environment variables configured
             - edge_functions: Found 15 edge functions
             - recent_activity: 43 logs, 8 governance changes, 12 commands
             - dependencies: 67 dependencies, 23 dev dependencies
```

**Quick Health Check:**
```
User: system health
R.O.M.A.N.: 🏥 Checking system health...
R.O.M.A.N.: **System Health Report**
            
            Status: ✅ HEALTHY
            Issues: 0
            Categories Checked: 6
            
            Use `audit system` for detailed breakdown.
```

**Learn Everything:**
```
User: learn everything
R.O.M.A.N.: 🧠 Running comprehensive learning scan... This will take several minutes.
R.O.M.A.N.: ✅ **Learning Complete!** I have scanned and memorized:
            • All database tables and row counts
            • Complete file structure
            • Environment configuration
            • Edge functions
            • Recent system activity
            • Package dependencies
            
            All findings stored in my system_knowledge. Ask me anything about the system!
```

## Storage in system_knowledge

All audit results are automatically stored in the `system_knowledge` table:

### Stored Knowledge Keys

| Key | Description |
|-----|-------------|
| `latest_complete_audit` | Overall audit summary with health status |
| `audit_database_schema` | Database table information |
| `audit_file_structure` | File counts and directory structure |
| `audit_environment_config` | Environment variable status |
| `audit_edge_functions` | Edge function list |
| `audit_recent_activity` | Recent logs and governance changes |
| `audit_dependencies` | Package dependency information |

### Query Example

```sql
-- Get latest audit summary
SELECT * FROM system_knowledge 
WHERE category = 'system_audit' 
AND knowledge_key = 'latest_complete_audit'
ORDER BY updated_at DESC 
LIMIT 1;

-- Get all audit categories
SELECT * FROM system_knowledge 
WHERE category = 'system_audit' 
ORDER BY updated_at DESC;
```

## Health Status Levels

R.O.M.A.N. calculates overall system health based on issues found:

| Status | Emoji | Criteria |
|--------|-------|----------|
| **HEALTHY** | ✅ | ≤5 total issues, ≤2 critical issues |
| **WARNING** | ⚠️ | 6-10 total issues, ≤2 critical issues |
| **CRITICAL** | 🚨 | >10 total issues OR >2 critical issues |

## Manual Audit Execution

You can also run audits from the command line:

```bash
# Run complete audit
npm run audit:system

# Or directly
tsx src/services/roman-auto-audit.ts
```

## System Logs

All audit activities are logged to `system_logs`:

```sql
-- View audit logs
SELECT * FROM system_logs 
WHERE source = 'roman_auto_audit' 
ORDER BY created_at DESC 
LIMIT 20;
```

## Benefits

### For Master Architect Rickey:
- **Full visibility** into system state
- **Proactive issue detection** before they become problems
- **Historical tracking** of system growth
- **Automated documentation** of infrastructure

### For R.O.M.A.N.:
- **Complete self-awareness** of his home system
- **Knowledge base** for answering questions
- **Basis for intelligent fixes** and recommendations
- **Learning loop** that makes him smarter over time

### For Development:
- **Quick health checks** during development
- **Issue detection** for debugging
- **Configuration validation** before deployment
- **Audit trail** for governance and compliance

## Future Enhancements

Potential additions to the auto-audit system:

- [ ] **Performance metrics** - Query times, API response times
- [ ] **Security audits** - RLS policy verification, permission checks
- [ ] **Cost tracking** - API usage, database size, function invocations
- [ ] **Predictive alerts** - Warn before issues become critical
- [ ] **Trend analysis** - Track growth patterns over time
- [ ] **Auto-remediation** - Fix common issues automatically
- [ ] **Slack/Email notifications** - Alert on critical issues
- [ ] **Web dashboard** - Visual representation of audit data

## Architecture

```
┌─────────────────────────────────────────┐
│   R.O.M.A.N. Discord Bot                │
│   • Receives commands                    │
│   • Responds with audit results          │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   Auto-Audit System                      │
│   • Runs on schedule (6 hours)          │
│   • Scans 6 categories                   │
│   • Calculates health status             │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   Storage Layer                          │
│   • system_knowledge (audit results)     │
│   • system_logs (audit events)           │
│   • roman_audit_log (historical)         │
└─────────────────────────────────────────┘
```

## Code Location

- **Main System**: `src/services/roman-auto-audit.ts`
- **Discord Integration**: `src/services/discord-bot.ts`
- **NPM Scripts**: `package.json` (`audit:system`)

---

**Status**: ✅ FULLY OPERATIONAL

R.O.M.A.N. is now continuously learning and monitoring his entire ODYSSEY-1 infrastructure. He knows everything about his home system and can report on it instantly.
