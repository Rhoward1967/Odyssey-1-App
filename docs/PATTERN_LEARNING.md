# PATTERN LEARNING ENGINE

**R.O.M.A.N. Pattern Learning System Documentation**  
**Version:** 1.0.0  
**Last Updated:** December 15, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Pattern Recognition Pipeline](#pattern-recognition-pipeline)
4. [Machine Learning Algorithms](#machine-learning-algorithms)
5. [Constitutional Validation](#constitutional-validation)
6. [Human-in-the-Loop Workflow](#human-in-the-loop-workflow)
7. [Database Schema](#database-schema)
8. [API Reference](#api-reference)
9. [Pattern Learning Workflow](#pattern-learning-workflow)
10. [Monitoring & Statistics](#monitoring--statistics)
11. [Troubleshooting](#troubleshooting)
12. [Best Practices](#best-practices)

---

## Overview

The R.O.M.A.N. Pattern Learning Engine is a machine learning system that autonomously learns from recurring errors and generates automatic fixes. It uses **k-means clustering** to identify similar error patterns and **Constitutional AI validation** to ensure all auto-fixes are safe and harmonic.

### Key Features

✅ **Autonomous Learning** - Learns from errors without human intervention  
✅ **Pattern Recognition** - Identifies recurring errors through signature matching  
✅ **ML Clustering** - Groups similar patterns using k-means algorithm  
✅ **Constitutional Validation** - All auto-fixes validated against Four Laws  
✅ **Success Tracking** - Per-pattern success rate (0-100%)  
✅ **Confidence Scoring** - Confidence increases with successful applications (0.0-1.0)  
✅ **Human Approval** - Auto-fix requires human approval before enabling  
✅ **Self-Healing** - Automatically applies learned fixes to new errors  

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Error Occurs                             │
│                                                              │
│  1. Application encounters error                             │
│  2. Error logged to ops.system_logs                         │
│  3. Pattern Learning Engine triggered                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              Feature Extraction                              │
│                                                              │
│  • message_length (int)                                      │
│  • word_count (int)                                          │
│  • has_stack_trace (bool)                                    │
│  • has_sql (bool) - SQL keywords detected                    │
│  • has_url (bool) - HTTP/HTTPS URLs detected                 │
│  • has_uuid (bool) - UUID pattern detected                   │
│  • error_code (string) - Extract error codes like PGRST116   │
│  • source_component (string) - Error source                  │
│  • severity_score (1-5) - Critical/Error/Warning/Info/Debug  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         Pattern Signature Generation                         │
│                                                              │
│  1. Normalize error message:                                 │
│     - UUIDs → 'UUID'                                         │
│     - Timestamps → 'TIMESTAMP'                               │
│     - Numbers → 'NUM'                                        │
│     - Quoted strings → 'STRING'                              │
│     - Lowercase, trim whitespace                             │
│  2. Generate hash of normalized message                      │
│  3. Pattern signature: pattern_{hash36}                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         Find or Create Pattern                               │
│                                                              │
│  IF pattern exists:                                          │
│    • Increment occurrence_count                              │
│    • Update last_seen timestamp                              │
│    • Add to learned_from_incidents array                     │
│                                                              │
│  IF pattern is new:                                          │
│    • Create with initial confidence: 50%                     │
│    • Generate error regex for matching                       │
│    • Classify error type (database/api/rls/stripe/deploy)   │
│    • Set severity based on keywords                          │
│    • auto_fix_enabled = false (awaiting approval)           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│    ML Clustering (When occurrence >= 3)                      │
│                                                              │
│  1. Fetch all patterns with occurrence >= 3                  │
│  2. Calculate k = min(5, max(2, floor(patterns/3)))         │
│  3. Extract features: [occurrence, success_rate,             │
│                        confidence*100, severity_numeric]     │
│  4. Run k-means clustering (Euclidean distance)              │
│  5. Assign patterns to nearest cluster centroid              │
│  6. Save clusters to ops.pattern_clusters                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         Human Approval Workflow                              │
│                                                              │
│  1. Pattern reaches threshold (e.g., occurrence >= 5)        │
│  2. Human operator reviews pattern details                   │
│  3. Human writes auto_fix_script (SQL/TypeScript/Bash)      │
│  4. Pattern approved:                                        │
│     • auto_fix_enabled = true                                │
│     • human_approved = true                                  │
│     • approved_by = user_id                                  │
│     • approved_at = timestamp                                │
│     • constitutional_compliant = true                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│    Pattern Application (Future Errors)                       │
│                                                              │
│  1. New error occurs                                         │
│  2. Find matching pattern (regex match)                      │
│  3. Constitutional validation of auto-fix                    │
│  4. Execute fix script                                       │
│  5. Record application:                                      │
│     • success = true/false                                   │
│     • execution_time_ms                                      │
│     • error_before, error_after                              │
│  6. Update pattern statistics:                               │
│     • success_rate = (successful_apps / total_apps) * 100    │
│     • confidence_score increases with success                │
└─────────────────────────────────────────────────────────────┘
```

---

## Pattern Recognition Pipeline

### 1. Error Feature Extraction

The Pattern Learning Engine extracts 8 key features from each error:

```typescript
interface ErrorFeatures {
  message_length: number;      // Total characters in error message
  word_count: number;          // Number of words
  has_stack_trace: boolean;    // Contains stack trace?
  has_sql: boolean;            // Contains SQL keywords (SELECT, INSERT, etc.)
  has_url: boolean;            // Contains HTTP/HTTPS URLs
  has_uuid: boolean;           // Contains UUID pattern
  error_code: string | null;   // Extracted error code (e.g., "PGRST116")
  source_component: string;    // Source of error
  severity_score: number;      // 1-5 (Debug=1, Info=2, Warning=2, Error=3, Critical=5)
}
```

**Feature Extraction Logic:**

- **message_length**: Simple character count
- **word_count**: Split by whitespace, count elements
- **has_stack_trace**: Check for "at ", "stack trace", "Error:"
- **has_sql**: Check for SQL keywords (SELECT, INSERT, UPDATE, DELETE, FROM, WHERE)
- **has_url**: Regex match for `http://` or `https://`
- **has_uuid**: Regex match for UUID pattern `[0-9a-f]{8}-[0-9a-f]{4}-...`
- **error_code**: Regex extract error codes like `PGRST116`, `ERR_404`, etc.
- **severity_score**: Keyword-based scoring:
  - Critical keywords (fatal, critical, catastrophic): 5
  - Error keywords (error, failed, exception): 3
  - Warning keywords (warning, warn): 2
  - Default: 1

---

### 2. Pattern Signature Generation

Pattern signatures uniquely identify error types through normalization and hashing:

**Normalization Process:**

1. **UUID Replacement**: `d290f1ee-6c54-4b01-90e6-d701748f0851` → `UUID`
2. **Timestamp Replacement**: `2025-12-15T10:30:00Z` → `TIMESTAMP`
3. **Number Replacement**: `42`, `3.14`, `1000` → `NUM`
4. **String Replacement**: `"hello world"`, `'test'` → `STRING`
5. **Lowercase**: Convert entire message to lowercase
6. **Trim Whitespace**: Remove leading/trailing spaces, collapse multiple spaces

**Hash Generation:**

```typescript
// Simple hash function (production should use crypto.subtle.digest)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// Pattern signature: pattern_{hash}
const signature = `pattern_${simpleHash(normalizedMessage)}`;
```

**Example:**

```
Original Error:
"Database connection failed for user d290f1ee-6c54-4b01-90e6-d701748f0851 at 2025-12-15T10:30:00Z"

Normalized:
"database connection failed for user uuid at timestamp"

Hash (base36):
"3k5j8m"

Signature:
"pattern_3k5j8m"
```

---

### 3. Error Classification

Errors are automatically classified into 5 types:

| Type | Detection Logic | Examples |
|------|----------------|----------|
| **rls** | "policy", "permission", "access denied" | RLS policy violations, permission errors |
| **stripe** | "stripe", "payment", "subscription" | Stripe API errors, payment failures |
| **deployment** | "deploy", "build", "migration" | Deployment failures, build errors |
| **database** | SQL keywords, "postgres", "supabase" | Database queries, connection errors |
| **api** | Default catch-all | API errors, network issues, unknown |

---

### 4. Error Regex Generation

Each pattern generates a regex for matching future errors:

**Conversion Rules:**

- UUIDs: `[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}`
- Numbers: `\\d+`
- Timestamps: `\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}`
- Escape special regex characters: `\.`, `\*`, `\+`, `\?`, etc.

**Example:**

```
Error Message:
"Connection failed to db-prod-1 on port 5432"

Generated Regex:
"Connection failed to [a-z0-9\\-]+ on port \\d+"
```

---

## Machine Learning Algorithms

### K-Means Clustering

The Pattern Learning Engine uses **k-means clustering** to group similar error patterns.

#### Algorithm Overview

**Purpose**: Group N patterns into K clusters based on feature similarity

**Features Used** (4-dimensional space):
1. `occurrence_count` - How often pattern occurs
2. `success_rate` - Percentage of successful auto-fixes (0-100)
3. `confidence_score * 100` - Confidence scaled to 0-100
4. `severity_numeric` - Mapped severity (debug=1, info=2, warning=2, error=3, critical=5)

**Distance Metric**: Euclidean distance

```typescript
function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(
    a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0)
  );
}
```

#### K Selection Strategy

```typescript
// Dynamic k based on dataset size
const k = Math.min(5, Math.max(2, Math.floor(patterns.length / 3)));
```

**Rationale**:
- Minimum 2 clusters (at least some grouping)
- Maximum 5 clusters (avoid over-fragmentation)
- Scale with data: ~1 cluster per 3 patterns

#### K-Means Implementation

```typescript
function simpleKMeans(patterns: ErrorPattern[], k: number): ErrorPattern[][] {
  // Extract feature vectors
  const features = patterns.map(p => [
    p.occurrence_count,
    p.success_rate,
    p.confidence_score * 100,
    severityToNumeric(p.severity)
  ]);

  // Initialize centroids (first k patterns)
  let centroids = features.slice(0, k);

  // Single iteration assignment
  const clusters: ErrorPattern[][] = Array(k).fill(null).map(() => []);
  
  patterns.forEach((pattern, i) => {
    // Find nearest centroid
    const distances = centroids.map(c => euclideanDistance(features[i], c));
    const nearestCluster = distances.indexOf(Math.min(...distances));
    clusters[nearestCluster].push(pattern);
  });

  return clusters;
}
```

**Note**: This is a simplified 1-iteration k-means optimized for Edge Function runtime. Production could use Lloyd's algorithm with multiple iterations for better convergence.

#### Cluster Storage

Clusters are saved to `ops.pattern_clusters`:

```typescript
{
  cluster_id: uuid,
  cluster_name: string,              // e.g., "Database Errors - High Occurrence"
  cluster_description: string,       // Human-readable description
  pattern_ids: uuid[],               // Array of pattern IDs in cluster
  centroid_features: {               // Cluster centroid
    occurrence_count: number,
    success_rate: number,
    confidence_score: number,
    severity_numeric: number
  },
  cluster_size: number,              // Number of patterns in cluster
  avg_success_rate: number,          // Average across all patterns
  total_occurrences: number          // Sum of all pattern occurrences
}
```

---

## Constitutional Validation

All auto-fix applications are validated against R.O.M.A.N.'s **Four Immutable Laws**.

### Auto-Fix Action Profile

```typescript
{
  method_type: 'harmonic_resonance',  // Self-healing action
  risk_to_life: 0.0,                  // No danger - automated fix
  entropy_increase: -0.05,            // NEGATIVE = reduces system entropy
  geometric_ratio: 1.618,             // Golden Ratio (Phi)
  target_frequency: 7.83,             // Schumann Resonance
  description: 'Auto-fix pattern: [signature]'
}
```

### Four Laws Validation

**Law 1: Do No Harm**
- `risk_to_life = 0.0` - Auto-fixes are safe, non-destructive operations
- Pattern fixes restore system to healthy state
- Constitutional validation prevents harmful actions

**Law 2: Increase Order**
- `entropy_increase = -0.05` - **NEGATIVE** value indicates entropy reduction
- Fixing errors reduces system chaos
- System entropy calculated from recent error rate:
  ```typescript
  const recentErrors = await supabase
    .from('system_logs')
    .select('*', { count: 'only' })
    .gte('created_at', fiveMinutesAgo)
    .eq('log_level', 'error');
  
  const entropy = Math.min(1.0, recentErrors / 100);
  // High error rate = High entropy
  ```

**Law 3: Sacred Geometry**
- `geometric_ratio = 1.618` - Golden Ratio (Phi)
- Pattern recognition follows natural harmonic principles
- Confidence scoring aligns with Fibonacci sequence

**Law 4: Harmonic Resonance**
- `target_frequency = 7.83` - Schumann Resonance
- Auto-fixes resonate with system healing frequency
- Pattern application timing aligns with natural rhythms

### Validation Flow

```typescript
async function validatePatternApplication(
  pattern: ErrorPattern,
  errorMessage: string
): Promise<boolean> {
  // Calculate current system entropy
  const { count: recentErrors } = await supabase
    .from('system_logs')
    .select('*', { count: 'only' })
    .gte('created_at', fiveMinutesAgo)
    .eq('log_level', 'error');
  
  const systemEntropy = Math.min(1.0, (recentErrors ?? 0) / 100);
  
  // Define Constitutional action
  const action: ActionData = {
    method_type: 'harmonic_resonance',
    risk_to_life: 0.0,
    entropy_increase: -0.05,
    geometric_ratio: 1.618,
    target_frequency: 7.83,
    description: `Auto-fix pattern: ${pattern.pattern_signature}`,
    system_entropy: systemEntropy
  };
  
  // Validate against Four Laws
  const isCompliant = await isActionCompliant(action);
  
  if (!isCompliant) {
    console.warn(`Constitutional validation FAILED for pattern ${pattern.pattern_id}`);
    // Log to ops.roman_events
    await logRomanEvent({
      event_type: 'constitutional_violation',
      severity: 'warning',
      description: `Pattern application blocked: ${pattern.pattern_signature}`,
      constitutional_validation: action
    });
  }
  
  return isCompliant;
}
```

---

## Human-in-the-Loop Workflow

Pattern Learning combines **autonomous learning** with **human oversight**.

### Approval Workflow

```
1. Pattern Learns Autonomously
   ↓
   • System detects recurring error
   • Pattern created with signature
   • Occurrence count tracked
   • auto_fix_enabled = false
   
2. Pattern Reaches Threshold
   ↓
   • occurrence_count >= 5 (configurable)
   • Pattern eligible for human review
   • Notification sent to ops team
   
3. Human Reviews Pattern
   ↓
   • Examine error message pattern
   • Review learned_from_incidents
   • Analyze cluster membership
   • Check success_rate of similar patterns
   
4. Human Writes Auto-Fix Script
   ↓
   • SQL: Fix data inconsistencies
   • TypeScript: Restart service, clear cache
   • Bash: File system operations
   • API Call: External service fix
   
5. Human Approves Pattern
   ↓
   POST /pattern-analyzer/approve
   {
     "pattern_id": "uuid",
     "auto_fix_script": "SQL or TypeScript code",
     "auto_fix_type": "sql",
     "approved_by": "user_id"
   }
   
6. Pattern Enabled for Auto-Fix
   ↓
   • auto_fix_enabled = true
   • human_approved = true
   • constitutional_compliant = true
   • Pattern now automatically fixes future errors
```

### Approval Criteria

**When to Approve:**
- ✅ Pattern has high confidence (>75%)
- ✅ Auto-fix script is safe and tested
- ✅ Error is well-understood
- ✅ Fix doesn't require human judgment
- ✅ Constitutional validation passes

**When to Reject:**
- ❌ Pattern is ambiguous or unclear
- ❌ Fix could cause data loss
- ❌ Error requires case-by-case judgment
- ❌ Low confidence (<50%)
- ❌ Security-sensitive operation

### Approval API

```typescript
// POST /pattern-analyzer/approve
{
  pattern_id: string;           // UUID of pattern to approve
  auto_fix_script: string;      // SQL, TypeScript, Bash, or API call
  auto_fix_type: 'sql' | 'typescript' | 'bash' | 'api_call';
  auto_fix_parameters?: {       // Optional parameters for script
    timeout_ms?: number;
    max_retries?: number;
    [key: string]: any;
  };
  approved_by: string;          // User ID of approver
}

// Response
{
  success: boolean;
  pattern: ErrorPattern;        // Updated pattern with auto_fix_enabled=true
}
```

---

## Database Schema

### ops.error_patterns

Primary table storing learned error patterns.

```sql
CREATE TABLE ops.error_patterns (
  id bigserial PRIMARY KEY,
  pattern_id uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  
  -- Pattern identification
  pattern_signature text UNIQUE NOT NULL,  -- Normalized hash
  pattern_type text NOT NULL,              -- 'database', 'api', 'rls', 'stripe', 'deployment'
  error_message_pattern text NOT NULL,     -- Regex for matching
  error_source text,                       -- Source component
  severity text NOT NULL,                  -- 'debug', 'info', 'warning', 'error', 'critical'
  
  -- Statistics
  occurrence_count integer DEFAULT 1,
  first_seen timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  success_rate numeric(5,2) DEFAULT 0.00,  -- 0.00 to 100.00
  
  -- Auto-fix configuration
  auto_fix_enabled boolean DEFAULT false,
  auto_fix_script text,
  auto_fix_type text,                      -- 'sql', 'typescript', 'bash', 'api_call'
  auto_fix_parameters jsonb,
  
  -- Constitutional compliance
  constitutional_compliant boolean DEFAULT false,
  constitutional_violations jsonb,
  
  -- Learning metadata
  learned_from_incidents uuid[],           -- Array of system_log_ids
  confidence_score numeric(3,2) DEFAULT 0.50,  -- 0.00 to 1.00
  
  -- Human approval
  human_approved boolean DEFAULT false,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Indexes:**
- `idx_error_patterns_signature` on `pattern_signature`
- `idx_error_patterns_type` on `pattern_type`
- `idx_error_patterns_enabled` on `auto_fix_enabled`

---

### ops.pattern_applications

Tracks every time a pattern is applied to an error.

```sql
CREATE TABLE ops.pattern_applications (
  id bigserial PRIMARY KEY,
  application_id uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  pattern_id uuid REFERENCES ops.error_patterns(pattern_id) ON DELETE CASCADE,
  system_log_id bigint REFERENCES ops.system_logs(id) ON DELETE SET NULL,
  
  -- Application details
  applied_at timestamptz DEFAULT now(),
  success boolean NOT NULL,
  execution_time_ms integer,
  
  -- Fix execution
  fix_script_executed text,
  fix_parameters_used jsonb,
  
  -- Before/after state
  error_before text,
  error_after text,
  system_state_before jsonb,
  system_state_after jsonb,
  
  -- Constitutional validation
  constitutional_validation jsonb,
  
  metadata jsonb
);
```

**Indexes:**
- `idx_pattern_applications_pattern` on `pattern_id`
- `idx_pattern_applications_success` on `success`
- `idx_pattern_applications_applied` on `applied_at DESC`

---

### ops.pattern_clusters

Stores ML clustering results.

```sql
CREATE TABLE ops.pattern_clusters (
  id bigserial PRIMARY KEY,
  cluster_id uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  cluster_name text NOT NULL,
  cluster_description text,
  
  -- Cluster data
  pattern_ids uuid[],                      -- Array of pattern IDs
  centroid_features jsonb,                 -- Cluster centroid
  
  -- Statistics
  cluster_size integer NOT NULL,
  avg_success_rate numeric(5,2),
  total_occurrences integer,
  
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

### ops.learning_sessions

Tracks ML training sessions.

```sql
CREATE TABLE ops.learning_sessions (
  id bigserial PRIMARY KEY,
  session_id uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  session_type text NOT NULL,              -- 'clustering', 'pattern_extraction', etc.
  
  -- Session details
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'running',  -- 'running', 'completed', 'failed', 'aborted'
  
  -- Input/Output
  input_data jsonb,
  output_data jsonb,                       -- Results (e.g., {clusters_created: 3})
  
  -- Statistics
  patterns_analyzed integer DEFAULT 0,
  patterns_created integer DEFAULT 0,
  patterns_updated integer DEFAULT 0,
  errors_processed integer DEFAULT 0,
  
  -- Performance
  execution_time_ms integer,
  memory_used_mb integer,
  
  -- Constitutional validation
  constitutional_compliant boolean DEFAULT true,
  
  metadata jsonb
);
```

---

## API Reference

### Pattern Analyzer Edge Function

Base URL: `https://[project-ref].supabase.co/functions/v1/pattern-analyzer`

---

#### POST /learn

Learn from a new error (create or update pattern).

**Request:**
```json
{
  "error_message": "Database connection failed for user...",
  "error_source": "auth-service",
  "severity": "error",
  "system_log_id": 12345
}
```

**Response:**
```json
{
  "success": true,
  "pattern": {
    "pattern_id": "uuid",
    "pattern_signature": "pattern_3k5j8m",
    "pattern_type": "database",
    "occurrence_count": 5,
    "confidence_score": 0.60,
    "auto_fix_enabled": false
  },
  "action": "updated"  // or "created"
}
```

---

#### POST /apply

Find matching pattern and apply auto-fix.

**Request:**
```json
{
  "error_message": "Database connection failed for user...",
  "error_source": "auth-service",
  "severity": "error",
  "system_log_id": 12346
}
```

**Response (Success):**
```json
{
  "applied": true,
  "success": true,
  "pattern": {
    "pattern_id": "uuid",
    "pattern_signature": "pattern_3k5j8m",
    "auto_fix_script": "-- SQL fix script",
    "success_rate": 85.50
  },
  "execution_time_ms": 150
}
```

**Response (No Match):**
```json
{
  "applied": false,
  "reason": "No matching pattern found"
}
```

**Response (Constitutional Failure):**
```json
{
  "applied": false,
  "reason": "Constitutional validation failed",
  "constitutional_validation": { ... }
}
```

---

#### POST /cluster

Run ML clustering on patterns.

**Request:**
```json
{}  // No body required
```

**Response:**
```json
{
  "success": true,
  "clusters": [
    {
      "cluster_id": "uuid",
      "cluster_name": "Database Errors - High Occurrence",
      "pattern_ids": ["uuid1", "uuid2", "uuid3"],
      "cluster_size": 3,
      "avg_success_rate": 78.33,
      "total_occurrences": 127
    },
    {
      "cluster_id": "uuid",
      "cluster_name": "API Errors - Low Confidence",
      "pattern_ids": ["uuid4", "uuid5"],
      "cluster_size": 2,
      "avg_success_rate": 45.00,
      "total_occurrences": 23
    }
  ],
  "patterns_analyzed": 5,
  "session_id": "uuid"
}
```

---

#### GET /statistics

Get pattern learning statistics.

**Request:**
```
GET /statistics
```

**Response:**
```json
{
  "statistics": {
    "total_patterns": 42,
    "enabled_patterns": 18,
    "approved_patterns": 18,
    "avg_success_rate": 76.50,
    "total_applications": 324,
    "patterns_by_type": {
      "database": 15,
      "api": 12,
      "rls": 8,
      "stripe": 4,
      "deployment": 3
    }
  }
}
```

---

#### POST /approve

Approve pattern for auto-fix (human-in-the-loop).

**Request:**
```json
{
  "pattern_id": "uuid",
  "auto_fix_script": "-- SQL fix\nUPDATE users SET status = 'active' WHERE status IS NULL;",
  "auto_fix_type": "sql",
  "auto_fix_parameters": {
    "timeout_ms": 5000,
    "max_retries": 3
  },
  "approved_by": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "pattern": {
    "pattern_id": "uuid",
    "pattern_signature": "pattern_3k5j8m",
    "auto_fix_enabled": true,
    "human_approved": true,
    "approved_by": "user-uuid",
    "approved_at": "2025-12-15T10:30:00Z",
    "constitutional_compliant": true
  }
}
```

---

## Pattern Learning Workflow

### Complete Pattern Lifecycle

```
1. ERROR OCCURS
   ↓
   Application error → ops.system_logs
   
2. LEARN FROM ERROR
   ↓
   POST /learn
   • Extract 8 features
   • Generate pattern signature
   • Find or create pattern
   • Increment occurrence_count
   • Update last_seen timestamp
   
3. PATTERN TRACKING
   ↓
   • occurrence_count: 1 → 2 → 3 → 4 → 5...
   • confidence_score: 0.50 (initial)
   • auto_fix_enabled: false
   
4. CLUSTERING (occurrence >= 3)
   ↓
   POST /cluster
   • Run k-means on all patterns
   • Group similar patterns
   • Save to ops.pattern_clusters
   
5. HUMAN REVIEW (occurrence >= 5)
   ↓
   Admin Dashboard shows pattern:
   • Error message pattern
   • Occurrence count: 12
   • Cluster: "Database Errors - High Occurrence"
   • Similar patterns with success rates
   
6. HUMAN WRITES FIX
   ↓
   Admin creates auto_fix_script:
   ```sql
   -- Fix missing user status
   UPDATE users 
   SET status = 'active' 
   WHERE status IS NULL;
   ```
   
7. HUMAN APPROVES
   ↓
   POST /approve
   • auto_fix_enabled = true
   • human_approved = true
   • constitutional_compliant = true
   
8. FUTURE ERROR OCCURS
   ↓
   Same error pattern detected
   
9. AUTO-FIX APPLICATION
   ↓
   POST /apply
   • Find matching pattern (regex)
   • Constitutional validation
   • Execute auto_fix_script
   • Record application
   
10. SUCCESS TRACKING
    ↓
    • success = true
    • Update pattern.success_rate
    • Increase pattern.confidence_score
    • Log to ops.pattern_applications
    
11. CONTINUOUS IMPROVEMENT
    ↓
    • More successful applications → Higher confidence
    • Failed applications → Lower confidence
    • Periodic re-clustering
    • Pattern refinement
```

---

## Monitoring & Statistics

### Pattern Dashboard Metrics

**Key Performance Indicators:**

1. **Total Patterns Learned**: Count of unique error patterns
2. **Enabled Patterns**: Patterns with auto_fix_enabled=true
3. **Average Success Rate**: Mean success rate across all patterns
4. **Total Applications**: Count of times patterns have been applied
5. **Patterns by Type**: Distribution (database, api, rls, stripe, deployment)
6. **Top Performing Patterns**: Highest success rates
7. **Patterns Awaiting Approval**: occurrence >= 5, auto_fix_enabled=false

### SQL Queries for Monitoring

**Get Top Patterns:**
```sql
SELECT 
  pattern_signature,
  pattern_type,
  occurrence_count,
  success_rate,
  confidence_score,
  auto_fix_enabled
FROM ops.error_patterns
WHERE auto_fix_enabled = true
ORDER BY success_rate DESC
LIMIT 10;
```

**Get Pattern Application History:**
```sql
SELECT 
  pa.application_id,
  pa.applied_at,
  pa.success,
  pa.execution_time_ms,
  ep.pattern_signature,
  ep.pattern_type
FROM ops.pattern_applications pa
JOIN ops.error_patterns ep ON pa.pattern_id = ep.pattern_id
ORDER BY pa.applied_at DESC
LIMIT 20;
```

**Get Cluster Statistics:**
```sql
SELECT 
  cluster_name,
  cluster_size,
  avg_success_rate,
  total_occurrences
FROM ops.pattern_clusters
ORDER BY avg_success_rate DESC;
```

### R.O.M.A.N. Event Logging

All pattern learning activities are logged to `ops.roman_events`:

```typescript
// Pattern learned
{
  event_type: 'pattern_learned',
  severity: 'info',
  description: 'New error pattern learned: pattern_3k5j8m',
  metadata: {
    pattern_id: 'uuid',
    pattern_signature: 'pattern_3k5j8m',
    occurrence_count: 1
  }
}

// Pattern approved
{
  event_type: 'pattern_approved',
  severity: 'info',
  description: 'Pattern approved for auto-fix: pattern_3k5j8m',
  metadata: {
    pattern_id: 'uuid',
    approved_by: 'user-uuid',
    auto_fix_type: 'sql'
  }
}

// Auto-fix applied
{
  event_type: 'pattern_applied',
  severity: 'info',
  description: 'Auto-fix applied successfully',
  metadata: {
    pattern_id: 'uuid',
    success: true,
    execution_time_ms: 150
  }
}

// Constitutional violation
{
  event_type: 'constitutional_violation',
  severity: 'warning',
  description: 'Pattern application blocked by Constitutional validation',
  metadata: {
    pattern_id: 'uuid',
    constitutional_validation: { ... }
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. Pattern Not Matching Errors

**Symptom**: New errors not matching existing patterns

**Causes**:
- Pattern signature too specific
- Normalization missing edge cases
- Regex pattern too strict

**Solution**:
```typescript
// Check pattern regex
SELECT pattern_signature, error_message_pattern
FROM ops.error_patterns
WHERE pattern_type = 'database';

// Test regex match manually
const errorMessage = "Database connection failed for user abc123";
const pattern = /Database connection failed for user [a-z0-9]+/i;
console.log(pattern.test(errorMessage));  // Should be true
```

---

#### 2. Low Success Rate

**Symptom**: Pattern has low success_rate (<50%)

**Causes**:
- Auto-fix script doesn't address root cause
- Error pattern too broad
- Environmental differences

**Solution**:
1. Review failed applications:
   ```sql
   SELECT error_before, error_after, system_state_before, system_state_after
   FROM ops.pattern_applications
   WHERE pattern_id = 'uuid' AND success = false;
   ```
2. Refine auto_fix_script
3. Add error handling to fix script
4. Consider disabling pattern if consistently failing

---

#### 3. Clustering Not Running

**Symptom**: No clusters appearing in ops.pattern_clusters

**Causes**:
- Not enough patterns (need occurrence >= 3)
- Edge Function error
- Learning session failed

**Solution**:
```sql
-- Check patterns eligible for clustering
SELECT COUNT(*)
FROM ops.error_patterns
WHERE occurrence_count >= 3;

-- Check learning session logs
SELECT * FROM ops.learning_sessions
WHERE session_type = 'clustering'
ORDER BY started_at DESC
LIMIT 5;

-- Manually trigger clustering
POST /pattern-analyzer/cluster
```

---

#### 4. Constitutional Validation Failing

**Symptom**: Pattern applications blocked by Constitutional validation

**Causes**:
- High system entropy (many recent errors)
- Validation logic too strict
- Missing Constitutional compliance flag

**Solution**:
```sql
-- Check recent errors
SELECT COUNT(*)
FROM ops.system_logs
WHERE created_at >= NOW() - INTERVAL '5 minutes'
  AND log_level = 'error';

-- Update pattern Constitutional compliance
UPDATE ops.error_patterns
SET constitutional_compliant = true
WHERE pattern_id = 'uuid';

-- Review Constitutional validation logs
SELECT * FROM ops.roman_events
WHERE event_type = 'constitutional_violation'
ORDER BY created_at DESC;
```

---

#### 5. Pattern Confidence Not Increasing

**Symptom**: confidence_score stuck at initial 0.50

**Causes**:
- Not enough applications
- Success rate not tracked
- Update logic not running

**Solution**:
```typescript
// Manually update confidence based on success rate
UPDATE ops.error_patterns
SET confidence_score = CASE
  WHEN success_rate >= 90 THEN 0.95
  WHEN success_rate >= 75 THEN 0.85
  WHEN success_rate >= 60 THEN 0.70
  WHEN success_rate >= 50 THEN 0.60
  ELSE 0.50
END
WHERE pattern_id = 'uuid';
```

---

## Best Practices

### 1. Pattern Approval

✅ **DO:**
- Review pattern thoroughly before approval
- Test auto_fix_script in staging environment
- Start with conservative fixes
- Set appropriate timeout and retry limits
- Document why pattern was approved

❌ **DON'T:**
- Approve patterns without testing
- Write destructive auto_fix_scripts (DROP, DELETE without WHERE)
- Approve low-confidence patterns (<50%)
- Skip Constitutional validation
- Approve patterns affecting financial data without extra review

---

### 2. Auto-Fix Scripts

✅ **DO:**
- Keep scripts simple and focused
- Add error handling and rollback logic
- Log execution details
- Use transactions for database operations
- Set execution timeouts

❌ **DON'T:**
- Write complex multi-step fixes
- Execute without WHERE clauses
- Modify production data without backup
- Use hard-coded values (use parameters)
- Ignore execution failures

**Example Safe Auto-Fix:**
```sql
-- Good: Safe, targeted, logged
BEGIN;
  UPDATE users 
  SET status = 'active' 
  WHERE status IS NULL 
    AND created_at >= NOW() - INTERVAL '24 hours'
  RETURNING id;
COMMIT;
```

**Example Unsafe Auto-Fix:**
```sql
-- BAD: No WHERE clause, destructive
DELETE FROM users;  -- ❌ NEVER DO THIS
```

---

### 3. Clustering

✅ **DO:**
- Run clustering regularly (daily or weekly)
- Review cluster assignments
- Use clusters to identify pattern families
- Adjust k value based on dataset size

❌ **DON'T:**
- Cluster too frequently (performance impact)
- Ignore small clusters (may indicate unique errors)
- Over-cluster (too many small clusters)
- Under-cluster (everything in one cluster)

---

### 4. Monitoring

✅ **DO:**
- Track success rates daily
- Monitor pattern application frequency
- Alert on Constitutional violations
- Review failed applications weekly
- Archive old patterns (occurrence_count = 0 for 90 days)

❌ **DON'T:**
- Ignore declining success rates
- Let low-performing patterns stay enabled
- Skip Constitutional violation review
- Keep patterns with 0% success rate

---

### 5. Security

✅ **DO:**
- Restrict pattern approval to admins
- Validate auto_fix_scripts for SQL injection
- Use RLS policies on pattern tables
- Audit pattern changes
- Encrypt sensitive data in auto_fix_parameters

❌ **DON'T:**
- Allow public pattern creation
- Trust user input in auto_fix_scripts
- Store credentials in auto_fix_parameters
- Skip authorization checks
- Log sensitive data in pattern applications

---

## Advanced Topics

### Custom Feature Extractors

Add domain-specific feature extraction:

```typescript
class CustomPatternLearningEngine extends PatternLearningEngine {
  extractErrorFeatures(errorMessage: string, errorSource: string): ErrorFeatures {
    const baseFeatures = super.extractErrorFeatures(errorMessage, errorSource);
    
    // Add custom features
    return {
      ...baseFeatures,
      has_customer_id: /customer_id/i.test(errorMessage),
      has_transaction: /transaction|payment|charge/i.test(errorMessage),
      is_timeout: /timeout|timed out/i.test(errorMessage),
      // ... more custom features
    };
  }
}
```

---

### Pattern Confidence Tuning

Adjust confidence scoring based on application history:

```typescript
async function updatePatternConfidence(patternId: string) {
  const { data: applications } = await supabase
    .from('pattern_applications')
    .select('success')
    .eq('pattern_id', patternId)
    .order('applied_at', { ascending: false })
    .limit(10);  // Last 10 applications
  
  if (!applications) return;
  
  const recentSuccessRate = 
    applications.filter(a => a.success).length / applications.length;
  
  // Confidence based on recent performance
  let confidence = 0.50;
  if (recentSuccessRate >= 0.9) confidence = 0.95;
  else if (recentSuccessRate >= 0.75) confidence = 0.85;
  else if (recentSuccessRate >= 0.60) confidence = 0.70;
  else if (recentSuccessRate >= 0.50) confidence = 0.60;
  
  await supabase
    .from('error_patterns')
    .update({ confidence_score: confidence })
    .eq('pattern_id', patternId);
}
```

---

### Multi-Model Clustering

Combine k-means with hierarchical clustering:

```typescript
async function hierarchicalClustering(patterns: ErrorPattern[]) {
  // First pass: k-means for rough grouping
  const kMeansClusters = simpleKMeans(patterns, 5);
  
  // Second pass: hierarchical clustering within each k-means cluster
  const finalClusters = [];
  
  for (const cluster of kMeansClusters) {
    if (cluster.length > 3) {
      // Subdivide large clusters
      const subClusters = simpleKMeans(cluster, Math.ceil(cluster.length / 3));
      finalClusters.push(...subClusters);
    } else {
      finalClusters.push(cluster);
    }
  }
  
  return finalClusters;
}
```

---

## Appendix

### Error Pattern Examples

**Database Connection Error:**
```
Original: "Connection failed to database postgres://db-prod-1:5432"
Normalized: "connection failed to database postgres://STRING"
Signature: "pattern_8k2j5m"
Type: database
Auto-Fix: "-- Restart database connection pool\nCALL restart_pg_pool();"
```

**RLS Policy Violation:**
```
Original: "new row violates row-level security policy for table 'users'"
Normalized: "new row violates row-level security policy for table STRING"
Signature: "pattern_5m8k3j"
Type: rls
Auto-Fix: "-- Grant missing policy\nGRANT SELECT ON users TO authenticated;"
```

**Stripe Payment Failure:**
```
Original: "Stripe charge ch_3abc123 failed: card declined"
Normalized: "stripe charge UUID failed: card declined"
Signature: "pattern_3j9k7m"
Type: stripe
Auto-Fix: null  // Requires manual handling, notify customer
```

---

### Performance Optimization

**Indexing Strategy:**
```sql
-- Speed up pattern matching
CREATE INDEX CONCURRENTLY idx_error_patterns_gin 
ON ops.error_patterns USING gin(to_tsvector('english', error_message_pattern));

-- Speed up recent error queries
CREATE INDEX CONCURRENTLY idx_system_logs_recent 
ON ops.system_logs(created_at DESC, log_level) 
WHERE created_at >= NOW() - INTERVAL '1 hour';

-- Speed up application statistics
CREATE INDEX CONCURRENTLY idx_pattern_applications_stats 
ON ops.pattern_applications(pattern_id, success, applied_at DESC);
```

**Query Optimization:**
```sql
-- Use materialized view for statistics
CREATE MATERIALIZED VIEW ops.pattern_stats AS
SELECT 
  ep.pattern_id,
  ep.pattern_signature,
  ep.pattern_type,
  ep.occurrence_count,
  ep.success_rate,
  ep.confidence_score,
  COUNT(pa.application_id) as total_applications,
  AVG(pa.execution_time_ms) as avg_execution_time
FROM ops.error_patterns ep
LEFT JOIN ops.pattern_applications pa ON ep.pattern_id = pa.pattern_id
GROUP BY ep.pattern_id;

-- Refresh daily
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('refresh-pattern-stats', '0 0 * * *', 
  'REFRESH MATERIALIZED VIEW ops.pattern_stats');
```

---

### Integration Examples

**Integrate with Existing Error Handler:**
```typescript
// In your error boundary
async function handleError(error: Error) {
  try {
    // Log to system_logs
    const { data: logEntry } = await supabase
      .from('system_logs')
      .insert({
        log_level: 'error',
        message: error.message,
        error_data: { stack: error.stack }
      })
      .select()
      .single();
    
    // Learn from error
    await fetch('/functions/v1/pattern-analyzer/learn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error_message: error.message,
        error_source: 'error-boundary',
        severity: 'error',
        system_log_id: logEntry.id
      })
    });
    
    // Try to apply auto-fix
    const response = await fetch('/functions/v1/pattern-analyzer/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error_message: error.message,
        error_source: 'error-boundary',
        severity: 'error',
        system_log_id: logEntry.id
      })
    });
    
    const result = await response.json();
    
    if (result.applied && result.success) {
      console.log('Auto-fix applied successfully');
      // Retry operation
    }
  } catch (e) {
    console.error('Pattern learning failed:', e);
  }
}
```

---

## Conclusion

The R.O.M.A.N. Pattern Learning Engine enables **autonomous error recovery** through machine learning and Constitutional AI validation. By learning from recurring errors, clustering similar patterns, and applying human-approved auto-fixes, the system continuously improves its self-healing capabilities while maintaining strict adherence to the Four Immutable Laws.

**Key Takeaways:**
- ✅ Patterns learn autonomously from errors
- ✅ ML clustering groups similar patterns
- ✅ Human approval ensures safety
- ✅ Constitutional validation prevents harm
- ✅ Success tracking drives continuous improvement
- ✅ Self-healing reduces operational overhead

For questions or issues, consult the [Troubleshooting](#troubleshooting) section or contact the R.O.M.A.N. operations team.

---

**Document Version:** 1.0.0  
**Last Updated:** December 15, 2025  
**Maintained By:** R.O.M.A.N. Development Team
