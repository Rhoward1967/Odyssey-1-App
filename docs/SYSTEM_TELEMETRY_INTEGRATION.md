# SYSTEM TELEMETRY INTEGRATION GUIDE

**Date**: November 22, 2025  
**Purpose**: Integrate comprehensive observability into ODYSSEY-1 ecosystem

---

## 🎯 WHAT WE BUILT

### 1. **SystemTelemetryService** (`src/services/systemTelemetry.ts`)

Comprehensive monitoring service that tracks:

- ✅ **Performance**: Response times, latency, throughput, error rates
- ✅ **Availability**: Uptime, downtime, health checks
- ✅ **Reliability**: Success/failure rates, retries
- ✅ **Usage**: Feature adoption, user engagement
- ✅ **Business**: Revenue, costs, conversions
- ✅ **Security**: Auth attempts, violations
- ✅ **AI Intelligence**: R.O.M.A.N. decisions, accuracy, confidence
- ✅ **Compliance**: Policy checks, violations, remediation

### 2. **Database Schema** (`supabase/migrations/20251122_system_telemetry.sql`)

7 specialized tables:

- `system_metrics` - All telemetry data (auto-indexed, optimized queries)
- `system_alerts` - Critical/high/medium/low incidents
- `user_sessions` - Activity tracking (last 15 min = active)
- `performance_snapshots` - Pre-calculated aggregates (updated every 5 min)
- `feature_usage` - Individual feature interactions
- `ai_intelligence_metrics` - R.O.M.A.N. decision tracking
- `compliance_checks` - Violation monitoring

### 3. **Admin Dashboard** (`src/components/SystemObservabilityDashboard.tsx`)

Real-time visualization with 5 tabs:

- **Performance**: Response times (avg, P95, P99), throughput, DB query times
- **R.O.M.A.N. AI**: Decision accuracy, confidence scores, execution times
- **Compliance**: Score (%), violations, remediation progress
- **Features**: Top 10 by usage, success rates, unique users
- **Business**: Revenue, costs, profit, user growth

---

## 🚀 HOW TO DEPLOY

### Step 1: Run Database Migration

```bash
# Connect to Supabase
cd C:\Users\gener\Odyssey-1-App

# Apply migration
supabase migration up

# Or manually run in Supabase SQL Editor:
# Copy contents of supabase/migrations/20251122_system_telemetry.sql
# Paste into SQL Editor → Run
```

**Verify tables created**:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'system_%';
```

Should return:

- system_metrics
- system_alerts
- user_sessions
- performance_snapshots
- feature_usage
- ai_intelligence_metrics
- compliance_checks

### Step 2: Integrate Telemetry into Services

Add monitoring to existing code:

#### Example 1: Track API Performance

```typescript
import { timeOperation, recordPerformance } from '@/services/systemTelemetry';

// Option A: Automatic timing with timeOperation
export async function fetchUserData(userId: string) {
  return await timeOperation(
    'fetch_user_data',
    async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    { user_id: userId } // Optional metadata
  );
}

// Option B: Manual timing
export async function fetchUserData(userId: string) {
  const startTime = performance.now();
  let success = true;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      success = false;
      throw error;
    }

    return data;
  } finally {
    const duration = performance.now() - startTime;
    recordPerformance('fetch_user_data', duration, success, {
      user_id: userId,
    });
  }
}
```

#### Example 2: Track R.O.M.A.N. AI Decisions

```typescript
import { recordAIIntelligence } from '@/services/systemTelemetry';

export async function romanMakeDecision(context: any) {
  const decision = await romanAI.analyze(context);

  // Record decision metrics
  recordAIIntelligence(
    'bias_detection', // Decision type
    decision.confidence, // 0-1 confidence score
    'pending', // Outcome (will update later when validated)
    {
      context_type: context.type,
      decision: decision.action,
      reasoning: decision.reasoning,
    }
  );

  return decision;
}

// Later, when outcome known:
export async function validateDecision(
  decisionId: string,
  wasCorrect: boolean
) {
  recordAIIntelligence(
    'bias_detection_validation',
    1.0,
    wasCorrect ? 'correct' : 'incorrect',
    { decision_id: decisionId }
  );
}
```

#### Example 3: Track Compliance Checks

```typescript
import { recordCompliance } from '@/services/systemTelemetry';

export async function checkGDPRCompliance(userId: string) {
  const results = await performGDPRAudit(userId);

  // Record each check
  for (const check of results.checks) {
    recordCompliance('gdpr_compliance', check.passed, check.severity, {
      user_id: userId,
      check_name: check.name,
      regulation: 'GDPR Article ' + check.article,
    });
  }

  return results;
}
```

#### Example 4: Track Feature Usage

```typescript
import { recordUsage } from '@/services/systemTelemetry';

export function PatentSearchModal() {
  const handleSearch = async (query: string) => {
    // Record feature usage
    recordUsage('patent_search', currentUserId, {
      query_length: query.length,
      filters_applied: selectedFilters.length
    });

    const results = await searchPatents(query);
    return results;
  };

  return (/* modal JSX */);
}
```

#### Example 5: Track Business Metrics

```typescript
import { recordBusiness } from '@/services/systemTelemetry';

export async function processPayment(amount: number, userId: string) {
  const payment = await stripe.charges.create({
    amount: amount * 100,
    currency: 'usd',
    customer: userId,
  });

  if (payment.status === 'succeeded') {
    // Record revenue
    recordBusiness('revenue', amount, 'USD', {
      user_id: userId,
      payment_id: payment.id,
      source: 'stripe',
    });
  }

  return payment;
}

export async function trackAPIUsage(userId: string, endpoint: string) {
  const cost = calculateAPIcost(endpoint); // e.g., $0.001 per call

  recordBusiness('api_cost', cost, 'USD', {
    user_id: userId,
    endpoint: endpoint,
  });
}
```

### Step 3: Add Dashboard to Admin Panel

#### Update Admin Routes

```typescript
// In your admin routing file
import SystemObservabilityDashboard from '@/components/SystemObservabilityDashboard';

export const adminRoutes = [
  // ... existing routes
  {
    path: '/admin/observability',
    component: SystemObservabilityDashboard,
    requiresAdmin: true,
  },
];
```

#### Add Navigation Link

```tsx
// In admin sidebar/navigation
<NavLink to='/admin/observability'>
  <Activity className='h-5 w-5 mr-2' />
  System Observability
</NavLink>
```

### Step 4: Set Up Alerts (Optional)

Create alert thresholds:

```typescript
import {
  createAlert,
  getPerformanceSnapshot,
} from '@/services/systemTelemetry';

// Run this periodically (e.g., every 5 minutes)
export async function checkSystemHealth() {
  const snapshot = await getPerformanceSnapshot();

  // Alert if error rate too high
  if (snapshot.error_rate_percent > 10) {
    await createAlert(
      'critical',
      'high_error_rate',
      `Error rate is ${snapshot.error_rate_percent.toFixed(1)}% (threshold: 10%)`,
      { error_rate: snapshot.error_rate_percent }
    );
  }

  // Alert if response time too slow
  if (snapshot.avg_response_time_ms > 2000) {
    await createAlert(
      'high',
      'slow_response_time',
      `Average response time is ${snapshot.avg_response_time_ms.toFixed(0)}ms (threshold: 2000ms)`,
      { avg_response_time: snapshot.avg_response_time_ms }
    );
  }

  // Alert if active users drop suddenly (possible outage)
  const previousSnapshot = await getPreviousSnapshot();
  if (snapshot.active_users_now < previousSnapshot.active_users_now * 0.5) {
    await createAlert(
      'critical',
      'user_drop',
      `Active users dropped ${((1 - snapshot.active_users_now / previousSnapshot.active_users_now) * 100).toFixed(0)}%`,
      {
        current: snapshot.active_users_now,
        previous: previousSnapshot.active_users_now,
      }
    );
  }
}
```

---

## 📊 KEY INTEGRATIONS TO ADD

### Priority 1: Core System Performance

**Where**: All API routes, database queries, external API calls

**Add**:

```typescript
import { timeOperation } from '@/services/systemTelemetry';

// Wrap any async operation
const result = await timeOperation('operation_name', async () => {
  // your code here
});
```

### Priority 2: R.O.M.A.N. AI Intelligence

**Where**: `src/services/romanAIIntelligence.ts`

**Add**:

```typescript
import { recordAIIntelligence } from '@/services/systemTelemetry';

// After each decision
recordAIIntelligence(decisionType, confidenceScore, outcome, metadata);
```

### Priority 3: Compliance Engine

**Where**: `src/services/perpetualComplianceEngine.ts`, `src/services/complianceMonitorService.ts`

**Add**:

```typescript
import { recordCompliance } from '@/services/systemTelemetry';

// After each compliance check
recordCompliance(checkType, passed, severityLevel, metadata);
```

### Priority 4: Feature Usage

**Where**: Every major component (PatentSearchModal, AdminDashboard, EmployeeScheduling, etc.)

**Add**:

```typescript
import { recordUsage } from '@/services/systemTelemetry';

// When user interacts with feature
recordUsage('feature_name', userId, metadata);
```

### Priority 5: Business Metrics

**Where**: Payment processing, subscription management, cost tracking

**Add**:

```typescript
import { recordBusiness } from '@/services/systemTelemetry';

// Revenue events
recordBusiness('revenue', amount, 'USD', metadata);

// Cost events
recordBusiness('cost', amount, 'USD', metadata);
```

---

## 🔍 HOW TO USE THE DASHBOARD

### Access Dashboard

1. Login as admin user
2. Navigate to `/admin/observability`
3. Dashboard auto-refreshes every 30 seconds (toggle ON/OFF as needed)

### Key Metrics to Watch

**System Health**:

- ✅ Green = healthy (uptime >95%, error rate <5%, response time <1s)
- ⚠️ Yellow = degraded (uptime 90-95%, error rate 5-10%, response time 1-2s)
- 🚨 Red = critical (uptime <90%, error rate >10%, response time >2s)

**R.O.M.A.N. AI**:

- Accuracy >90% = good
- Accuracy 80-90% = needs tuning
- Accuracy <80% = investigate model

**Compliance**:

- Score >95% = excellent
- Score 85-95% = acceptable
- Score <85% = requires immediate attention

**Features**:

- Top 10 shows most-used features
- Success rate should be >95% for production features
- Low usage = consider deprecation or better UX

**Business**:

- Net profit should be positive (revenue > costs)
- New users = growth indicator
- Track trends over time

---

## 🧪 TESTING

### Test Telemetry Service

```typescript
import {
  recordMetric,
  recordPerformance,
  getPerformanceSnapshot,
} from '@/services/systemTelemetry';

// Test recording metrics
recordMetric('performance', 'test_operation', 123, 'milliseconds');
recordPerformance('test_api_call', 456, true);

// Wait 10 seconds for auto-flush
await new Promise(resolve => setTimeout(resolve, 11000));

// Check if metrics saved
const snapshot = await getPerformanceSnapshot();
console.log('Snapshot:', snapshot);
```

### Test Dashboard

1. Open dashboard at `/admin/observability`
2. Check all 5 tabs load without errors
3. Verify metrics display (may be zeros if no data yet)
4. Click "Refresh Now" button - should reload without errors
5. Toggle "Auto-Refresh" - should stop/start 30-second interval

---

## 🔧 TROUBLESHOOTING

### Issue: No metrics showing in dashboard

**Check**:

1. Database migration ran successfully (tables exist)
2. Telemetry service is recording metrics (check browser console for errors)
3. RLS policies allow admin users to read metrics
4. Auto-flush is working (metrics buffer cleared every 10 seconds)

**Fix**:

```sql
-- Verify tables exist
SELECT * FROM system_metrics LIMIT 10;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'system_metrics';

-- Temporarily disable RLS for testing (re-enable after!)
ALTER TABLE system_metrics DISABLE ROW LEVEL SECURITY;
```

### Issue: Dashboard slow to load

**Check**:

- How many metrics in database? (`SELECT COUNT(*) FROM system_metrics;`)
- Are indexes created? (`SELECT * FROM pg_indexes WHERE tablename = 'system_metrics';`)
- Is auto-snapshot generation running? (should create performance_snapshots every 5 min)

**Fix**:

```sql
-- Use pre-calculated snapshots instead of raw metrics
SELECT * FROM performance_snapshots ORDER BY timestamp DESC LIMIT 1;

-- Archive old metrics (keep last 30 days)
DELETE FROM system_metrics WHERE timestamp < NOW() - INTERVAL '30 days';
```

### Issue: Alerts not appearing

**Check**:

1. Alerts being created? (`SELECT * FROM system_alerts;`)
2. Severity threshold correct?
3. RLS policy allowing admin to read alerts?

**Fix**:

```typescript
// Test alert creation
import { createAlert } from '@/services/systemTelemetry';

await createAlert('critical', 'test_alert', 'This is a test alert', {
  test: true,
});
```

---

## 📈 NEXT STEPS

1. **Run migration** - Create database tables
2. **Integrate telemetry** - Add to existing services (start with highest-traffic areas)
3. **Add dashboard route** - Make accessible in admin panel
4. **Monitor for 1 week** - Gather baseline metrics
5. **Set up alerts** - Define thresholds based on baseline
6. **Optimize** - Improve slow operations identified in dashboard
7. **Scale** - Add more detailed tracking as needed

---

## 💡 BENEFITS

### For Development

- **Find bottlenecks**: See which operations are slow
- **Catch errors early**: Monitor error rates in real-time
- **Validate AI**: Track R.O.M.A.N. decision accuracy
- **Prove compliance**: Show audit trail of policy checks

### For Business

- **Revenue tracking**: Know exactly how much you're making
- **Cost control**: Monitor API usage, server costs
- **User engagement**: See which features are actually used
- **Growth metrics**: Track new users, active sessions

### For Operations

- **System health**: Know when something's wrong before users complain
- **Capacity planning**: See usage trends, plan for scale
- **Incident response**: Detailed logs when things break
- **Performance optimization**: Data-driven decisions on what to improve

---

**This system gives you complete visibility into ODYSSEY-1, R.O.M.A.N., and all subsystems. You'll never be blind again.** 👁️📊✅
