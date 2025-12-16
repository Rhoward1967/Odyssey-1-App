# ROLLBACK PROCEDURES

**ODYSSEY-1 Auto-Rollback System Documentation**  
**Version:** 1.0.0  
**Last Updated:** December 15, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Constitutional Validation](#constitutional-validation)
4. [Automatic Rollback Triggers](#automatic-rollback-triggers)
5. [Manual Rollback Procedures](#manual-rollback-procedures)
6. [Database Schema](#database-schema)
7. [API Reference](#api-reference)
8. [Monitoring & Alerts](#monitoring--alerts)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Overview

The R.O.M.A.N. Auto-Rollback System provides automated and manual rollback capabilities with **Constitutional AI validation**. All rollback operations are validated against the Four Immutable Laws to ensure system safety and harmonic restoration.

### Key Features

✅ **Automatic Rollback Detection** - Monitors deployment health and triggers rollbacks when needed  
✅ **Constitutional Validation** - Every rollback validated against Sacred Geometry principles  
✅ **System Snapshots** - Pre-deployment and pre-rollback state capture  
✅ **Audit Trail** - Complete history of all rollback events  
✅ **Health Monitoring** - Real-time system health checks  
✅ **Zero-Downtime** - Rollback executes without service interruption  

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD Pipeline (GitHub Actions)          │
│                                                              │
│  1. Deploy to Staging/Production                            │
│  2. Record deployment in ops.deployments                    │
│  3. Create post-deployment snapshot                         │
│  4. Monitor health (5-minute window)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              Health Monitoring (Continuous)                  │
│                                                              │
│  • Error rate < 1/minute = Healthy                          │
│  • Error rate > 5/minute = Auto-rollback triggered          │
│  • Recent errors > 50 = Auto-rollback triggered             │
│  • DB connections > 90% = Auto-rollback triggered           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         R.O.M.A.N. Constitutional Validation                │
│                                                              │
│  1. Evaluate rollback action against Four Laws              │
│  2. Calculate system entropy (error rate)                   │
│  3. Approve or reject rollback                              │
│  4. Log decision to ops.roman_events                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              Rollback Execution (If Approved)               │
│                                                              │
│  1. Create pre-rollback snapshot                            │
│  2. Identify rollback target (last successful deployment)   │
│  3. Update deployment status to 'rolled_back'               │
│  4. Trigger GitHub Actions rollback workflow                │
│  5. Deploy previous known-good version                      │
│  6. Run health checks on rolled-back system                 │
│  7. Update rollback event with results                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Constitutional Validation

All rollback operations are validated against R.O.M.A.N.'s **Four Immutable Laws**:

### Rollback Action Profile

```typescript
{
  method_type: 'harmonic_resonance',  // Healing action
  risk_to_life: 0.0,                  // No danger - restoring known state
  entropy_increase: -0.1,             // NEGATIVE = entropy reduction
  geometric_ratio: 1.618,             // Golden Ratio (Phi)
  target_frequency: 7.83,             // Schumann Resonance
  description: 'Rollback deployment: [reason]'
}
```

### Validation Process

1. **Law of Inhabitance** - Rollback has `risk_to_life = 0` ✅
2. **Law of Harmonic Attraction** - Uses `harmonic_resonance` method ✅
3. **Law of Total Coherence** - **Reduces** entropy (negative value) ✅
4. **Law of Structural Integrity** - Adheres to Golden Ratio ✅

**Result:** Rollbacks are inherently Constitutional because they **restore harmony** and **reduce chaos**.

### Constitutional Rejection Scenarios

Rollback would be rejected only if:

- System already stable (error rate < 1/minute)
- Rollback target unavailable (no previous successful deployment)
- Database in inconsistent state (manual intervention required)

---

## Automatic Rollback Triggers

### Trigger Conditions

| Condition | Threshold | Action |
|-----------|-----------|--------|
| **Error Rate** | > 5 errors/minute | Immediate rollback |
| **Recent Errors** | > 50 errors in 5 minutes | Immediate rollback |
| **DB Connections** | > 90% utilization | Immediate rollback |
| **Response Time** | > 5 seconds (P95) | Warning only |
| **Memory Usage** | > 95% | Warning only |

### Automatic Rollback Flow

```mermaid
graph TD
    A[Deployment Completes] --> B[Monitor Health 5 Minutes]
    B --> C{Health Check}
    C -->|Healthy| D[Continue Monitoring]
    C -->|Unhealthy| E[Check Trigger Conditions]
    E -->|Triggered| F[Constitutional Validation]
    F -->|Approved| G[Execute Rollback]
    F -->|Rejected| H[Manual Intervention Required]
    G --> I[Restore Previous Version]
    I --> J[Verify Health]
    J -->|Healthy| K[Rollback Complete]
    J -->|Still Unhealthy| L[Alert DevOps Team]
```

### Example Auto-Rollback Scenario

**Deployment:** `v2.5.3` deployed to production at 14:00  
**T+2 min:** Error rate spikes to 8/minute  
**T+2.5 min:** R.O.M.A.N. detects threshold breach  
**T+3 min:** Constitutional validation passes  
**T+3 min:** Rollback initiated to `v2.5.2` (last good version)  
**T+5 min:** Rollback complete, error rate returns to 0.2/minute  
**T+6 min:** DevOps team notified via Discord  

---

## Manual Rollback Procedures

### When to Use Manual Rollback

- Deployment caused known bug (not yet triggering auto-rollback)
- Feature needs to be disabled immediately
- Security vulnerability discovered
- Customer-facing issue detected

### Manual Rollback Steps

#### 1. Via Discord (R.O.M.A.N.)

```
@R.O.M.A.N. /approve rollback deployment_id=abc-123 reason="Critical bug in payment flow"
```

**R.O.M.A.N. Response:**
```
✅ Rollback approved by R.O.M.A.N.

Deployment: abc-123
Reason: Critical bug in payment flow
Target: v2.5.2 (commit: a7f3b29)
Constitutional Validation: PASSED

Executing rollback...
[Progress bar]
✅ Rollback complete (4.2 seconds)
```

#### 2. Via Edge Function (API)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/auto-rollback \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "deployment_id": "abc-123",
    "trigger_reason": "Critical bug in payment flow",
    "initiated_by": "user-uuid-here"
  }'
```

**Response:**
```json
{
  "success": true,
  "event_id": "rollback-event-uuid",
  "target_deployment": {
    "deployment_id": "previous-uuid",
    "version": "v2.5.2",
    "git_commit": "a7f3b29",
    "deployed_at": "2025-12-15T13:45:00Z"
  },
  "snapshot_id": "snapshot-uuid",
  "validation": {
    "compliant": true,
    "violations": [],
    "warnings": []
  }
}
```

#### 3. Via TypeScript Service

```typescript
import RollbackService from '@/services/rollbackService';

const rollbackService = new RollbackService(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const result = await rollbackService.executeRollback(
  'deployment-uuid',
  'Critical bug in payment flow',
  'user-uuid' // Optional
);

if (result.success) {
  console.log('✅ Rollback successful');
  console.log('Target:', result.target_deployment);
} else {
  console.error('❌ Rollback failed:', result.error);
}
```

---

## Database Schema

### ops.deployments

Tracks all deployments to staging and production.

```sql
CREATE TABLE ops.deployments (
  id bigserial PRIMARY KEY,
  deployment_id uuid UNIQUE NOT NULL,
  environment text NOT NULL,  -- 'staging' | 'production'
  version text NOT NULL,
  git_commit text NOT NULL,
  git_branch text NOT NULL,
  deployed_by uuid REFERENCES auth.users(id),
  deployed_at timestamptz DEFAULT now(),
  status text NOT NULL,  -- 'pending' | 'in_progress' | 'success' | 'failed' | 'rolled_back'
  rollback_from uuid REFERENCES ops.deployments(deployment_id),
  health_check_passed boolean DEFAULT false,
  health_check_details jsonb,
  constitutional_validation jsonb,
  metadata jsonb,
  completed_at timestamptz,
  rolled_back_at timestamptz
);
```

### ops.rollback_events

Records all rollback events.

```sql
CREATE TABLE ops.rollback_events (
  id bigserial PRIMARY KEY,
  event_id uuid UNIQUE NOT NULL,
  deployment_id uuid REFERENCES ops.deployments(deployment_id),
  trigger_type text NOT NULL,  -- 'automatic' | 'manual' | 'constitutional_violation'
  trigger_reason text NOT NULL,
  initiated_by uuid REFERENCES auth.users(id),
  initiated_at timestamptz DEFAULT now(),
  status text NOT NULL,  -- 'pending' | 'in_progress' | 'success' | 'failed' | 'aborted'
  rollback_plan jsonb,
  rollback_steps jsonb[],
  constitutional_validation jsonb,
  completed_at timestamptz,
  metadata jsonb
);
```

### ops.system_snapshots

Stores system state before deployments/rollbacks.

```sql
CREATE TABLE ops.system_snapshots (
  id bigserial PRIMARY KEY,
  snapshot_id uuid UNIQUE NOT NULL,
  deployment_id uuid REFERENCES ops.deployments(deployment_id),
  snapshot_type text NOT NULL,  -- 'pre_deployment' | 'post_deployment' | 'pre_rollback'
  database_schema_hash text,
  table_counts jsonb,
  key_metrics jsonb,
  environment_config jsonb,
  created_at timestamptz DEFAULT now()
);
```

### ops.migration_history

Tracks database migrations with rollback scripts.

```sql
CREATE TABLE ops.migration_history (
  id bigserial PRIMARY KEY,
  deployment_id uuid REFERENCES ops.deployments(deployment_id),
  migration_name text UNIQUE NOT NULL,
  migration_hash text NOT NULL,
  applied_at timestamptz DEFAULT now(),
  rolled_back_at timestamptz,
  rollback_successful boolean,
  execution_time_ms integer,
  error_message text,
  rollback_script text,  -- SQL to undo this migration
  metadata jsonb
);
```

---

## API Reference

### Edge Function: `/auto-rollback`

#### POST /auto-rollback

Execute rollback for a deployment.

**Request:**
```json
{
  "deployment_id": "uuid",
  "trigger_reason": "string",
  "initiated_by": "uuid" // optional
}
```

**Response (Success):**
```json
{
  "success": true,
  "event_id": "uuid",
  "target_deployment": {
    "deployment_id": "uuid",
    "version": "v2.5.2",
    "git_commit": "a7f3b29",
    "deployed_at": "2025-12-15T13:45:00Z",
    "health_check_passed": true
  },
  "snapshot_id": "uuid",
  "validation": {
    "compliant": true,
    "violations": [],
    "warnings": []
  }
}
```

**Response (Constitutional Rejection):**
```json
{
  "success": false,
  "error": "Constitutional validation failed",
  "validation": {
    "compliant": false,
    "violations": [
      "Law of Total Coherence violated: Cannot increase entropy when system unstable"
    ],
    "warnings": []
  }
}
```

#### POST /auto-rollback/check

Check if deployment needs rollback.

**Request:**
```json
{
  "deployment_id": "uuid"
}
```

**Response:**
```json
{
  "should_rollback": true,
  "reason": "High error rate: 8.5 errors/minute",
  "health": {
    "healthy": false,
    "error_rate_per_minute": 8.5,
    "recent_errors": 42,
    "database_connections": 45,
    "active_queries": 12,
    "timestamp": "2025-12-15T14:35:00Z"
  }
}
```

#### GET /auto-rollback/history?limit=10

Get rollback history.

**Response:**
```json
{
  "rollbacks": [
    {
      "id": 1,
      "event_id": "uuid",
      "deployment_id": "uuid",
      "trigger_type": "automatic",
      "trigger_reason": "High error rate: 8.5 errors/minute",
      "initiated_by": null,
      "initiated_at": "2025-12-15T14:35:00Z",
      "status": "success",
      "rollback_steps": [...],
      "completed_at": "2025-12-15T14:36:15Z"
    }
  ]
}
```

---

## Monitoring & Alerts

### Real-Time Health Monitoring

**SQL Query:**
```sql
SELECT 
  d.deployment_id,
  d.version,
  d.environment,
  d.deployed_at,
  ops.get_deployment_health(d.deployment_id) as health
FROM ops.deployments d
WHERE d.status = 'success'
  AND d.environment = 'production'
ORDER BY d.deployed_at DESC
LIMIT 1;
```

### Discord Alerts

R.O.M.A.N. sends alerts to Discord for:

- ⚠️ **Rollback triggered** (automatic or manual)
- ✅ **Rollback completed successfully**
- ❌ **Rollback failed** (requires manual intervention)
- 🚨 **Constitutional violation** (rollback rejected)

**Example Alert:**
```
🚨 ROLLBACK INITIATED

Deployment: v2.5.3 (abc-123)
Environment: production
Reason: High error rate (8.5 errors/minute)
Trigger: Automatic
Target: v2.5.2 (a7f3b29)
Constitutional Status: APPROVED

R.O.M.A.N. is executing rollback...
```

### Monitoring Dashboard

View rollback status at: `https://your-app.com/app/admin/roman-dashboard`

**Metrics Displayed:**
- Active deployments
- Recent rollbacks (last 24 hours)
- Rollback success rate
- Average rollback time
- Constitutional approval rate

---

## Troubleshooting

### Issue: Rollback Not Triggering Automatically

**Symptoms:**
- Deployment unhealthy (high error rate)
- No automatic rollback initiated

**Diagnosis:**
```sql
-- Check if deployment exists
SELECT * FROM ops.deployments 
WHERE deployment_id = 'your-deployment-uuid';

-- Check health status
SELECT ops.get_deployment_health('your-deployment-uuid');

-- Check recent R.O.M.A.N. events
SELECT * FROM ops.roman_events 
WHERE metadata->>'deployment_id' = 'your-deployment-uuid'
ORDER BY timestamp DESC
LIMIT 10;
```

**Solutions:**
1. Verify deployment was recorded in `ops.deployments`
2. Check if health monitoring is running
3. Verify error rate exceeds thresholds
4. Check R.O.M.A.N. Constitutional Core is initialized

---

### Issue: Constitutional Validation Failing

**Symptoms:**
- Rollback rejected by R.O.M.A.N.
- Error: "Constitutional validation failed"

**Diagnosis:**
```sql
SELECT * FROM ops.roman_events 
WHERE event_type = 'rollback_validation'
  AND severity = 'error'
ORDER BY timestamp DESC
LIMIT 5;
```

**Solutions:**
1. Review violation details in `ops.roman_events`
2. If system already stable, manual rollback not needed
3. If data risk present, use `/approve` with Constitutional override
4. Check system entropy level (should be > 0.1 for rollback)

---

### Issue: No Valid Rollback Target

**Symptoms:**
- Error: "No valid rollback target found"
- No previous successful deployment

**Diagnosis:**
```sql
-- Check for successful deployments
SELECT * FROM ops.deployments 
WHERE environment = 'production'
  AND status = 'success'
  AND health_check_passed = true
ORDER BY deployed_at DESC
LIMIT 5;
```

**Solutions:**
1. Ensure at least one previous deployment marked as `success`
2. Verify health checks passed on previous deployment
3. If first deployment, cannot rollback (manual fix required)
4. Consider restoring from database backup

---

## Best Practices

### ✅ DO

- **Monitor First 5 Minutes** - Highest risk period after deployment
- **Run Health Checks** - Always verify deployment health before marking success
- **Create Snapshots** - Pre-deployment snapshots enable comparison
- **Document Reason** - Clear rollback reasons help future debugging
- **Test Locally** - Verify changes locally before deploying
- **Use Staging** - Deploy to staging first, verify, then production

### ❌ DON'T

- **Skip Health Checks** - Never mark deployment success without verification
- **Ignore Warnings** - R.O.M.A.N. warnings indicate potential issues
- **Rush Deployments** - Wait 5 minutes before declaring success
- **Override Constitution** - Manual approval without understanding violations
- **Deploy Unreviewed Code** - All code must pass CI/CD and review
- **Disable Auto-Rollback** - Keep automatic rollback enabled in production

---

## Rollback Decision Matrix

| Scenario | Auto-Rollback? | Manual Rollback? | Action |
|----------|---------------|-----------------|--------|
| Error rate > 5/min | ✅ Yes (immediate) | ✅ Yes | Automatic trigger |
| Error rate 1-5/min | ❌ No | ✅ Yes | Monitor, manual if worsens |
| Feature bug (no errors) | ❌ No | ✅ Yes | Manual rollback |
| Security vulnerability | ❌ No | ✅ Yes | Immediate manual rollback |
| Performance degradation | ❌ No | ✅ Yes | Manual rollback if severe |
| Database migration issue | ❌ No | ✅ Yes | Manual rollback + DB restore |

---

## Quick Reference Commands

### Check Deployment Health
```bash
curl https://your-project.supabase.co/functions/v1/auto-rollback/check \
  -H "Authorization: Bearer KEY" \
  -d '{"deployment_id":"uuid"}'
```

### Execute Manual Rollback
```bash
curl -X POST https://your-project.supabase.co/functions/v1/auto-rollback \
  -H "Authorization: Bearer KEY" \
  -d '{"deployment_id":"uuid","trigger_reason":"reason"}'
```

### View Rollback History
```sql
SELECT * FROM ops.rollback_events 
ORDER BY initiated_at DESC 
LIMIT 10;
```

### Get Latest Deployment
```sql
SELECT * FROM ops.deployments 
WHERE environment = 'production' 
ORDER BY deployed_at DESC 
LIMIT 1;
```

---

## Emergency Contacts

**Rollback Issues:**
- R.O.M.A.N. Discord: `@R.O.M.A.N. /help rollback`
- DevOps Lead: rhoward@hjsservices.us
- GitHub Issues: https://github.com/Rhoward1967/Odyssey-1-App/issues

**Constitutional Questions:**
- See: `docs/ROMAN_OPERATIONS_MANUAL.md`
- Discord: #roman-support channel

---

**© 2025 ODYSSEY-1 AI LLC. All Rights Reserved.**
