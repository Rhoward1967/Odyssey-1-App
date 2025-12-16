# ODYSSEY-1 Database Schema Documentation

**Database:** PostgreSQL 15.x (Supabase)  
**Last Updated:** December 15, 2025  
**Schema Version:** 2.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Schema Organization](#schema-organization)
3. [Core Tables](#core-tables)
4. [Business Tables](#business-tables)
5. [AI & R.O.M.A.N. Tables](#ai--roman-tables)
6. [Subscription & Billing](#subscription--billing)
7. [Educational Platform](#educational-platform)
8. [Security & RLS](#security--rls)
9. [Indexes & Performance](#indexes--performance)
10. [Migrations](#migrations)

---

## Overview

The ODYSSEY-1 database uses PostgreSQL with Supabase extensions including:
- **Row Level Security (RLS)** - All tables enforce user-level access control
- **Realtime** - WebSocket subscriptions for live data
- **Storage** - File uploads via Supabase Storage buckets
- **Auth** - Built-in authentication with JWT tokens

**Schemas:**
- `public` - Application tables
- `ops` - Operational/R.O.M.A.N. tables
- `auth` - Supabase Auth (managed)
- `storage` - Supabase Storage (managed)

---

## Schema Organization

```
Database: Odyssey-1
│
├── public (Application Data)
│   ├── User Management (profiles, user_organizations)
│   ├── Business Operations (organizations, employees, customers, bids, invoices)
│   ├── Subscriptions (subscription_plans, subscriptions, payments)
│   ├── AI Services (ai_usage_logs, ai_compliance_logs)
│   ├── Educational (study_groups, tutoring_sessions, academic_search_results)
│   └── System (system_logs, system_config, system_knowledge)
│
├── ops (R.O.M.A.N. Operations)
│   ├── roman_events (Autonomous actions log)
│   ├── roman_commands (Command history)
│   ├── agents (AI agent registry)
│   └── system_health (Health monitoring)
│
├── auth (Supabase Auth - Managed)
│   ├── users
│   ├── sessions
│   └── refresh_tokens
│
└── storage (Supabase Storage - Managed)
    ├── odyssey_documents
    ├── user_avatars
    └── academic_papers
```

---

## Core Tables

### `public.profiles`

User profile information extending Supabase Auth users.

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  phone text,
  is_admin boolean DEFAULT false,
  is_onboarded boolean DEFAULT false,
  onboarding_completed_at timestamptz,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Relationships:**
- `id` → `auth.users.id` (one-to-one)
- `user_organizations` (one-to-many)

**RLS Policies:**
- Users can read their own profile
- Users can update their own profile
- Admins can read all profiles

**Indexes:**
- `idx_profiles_email` on `email`
- `idx_profiles_is_admin` on `is_admin` WHERE `is_admin = true`

---

### `public.organizations`

Companies/businesses using the platform.

```sql
CREATE TABLE organizations (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  industry text,
  tax_id text UNIQUE,
  address jsonb,
  phone text,
  email text,
  website text,
  logo_url text,
  stripe_customer_id text UNIQUE,
  subscription_id bigint REFERENCES subscription_plans(id),
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Relationships:**
- `subscription_id` → `subscription_plans.id`
- `employees` (one-to-many)
- `customers` (one-to-many)
- `bids` (one-to-many)
- `invoices` (one-to-many)

**RLS Policies:**
- Users can only see organizations they belong to
- Organization admins can update organization

**Indexes:**
- `idx_organizations_stripe_customer` on `stripe_customer_id`
- `idx_organizations_subscription` on `subscription_id`

---

### `public.user_organizations`

Junction table for user-organization membership.

```sql
CREATE TABLE user_organizations (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id bigint REFERENCES organizations(id) ON DELETE CASCADE,
  role text DEFAULT 'member', -- 'owner', 'admin', 'member'
  permissions jsonb DEFAULT '[]',
  joined_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, organization_id)
);
```

**Relationships:**
- `user_id` → `auth.users.id`
- `organization_id` → `organizations.id`

**RLS Policies:**
- Users can see their own memberships
- Organization owners can manage memberships

**Indexes:**
- `idx_user_org_user` on `user_id`
- `idx_user_org_org` on `organization_id`
- `idx_user_org_role` on `role`

---

### `public.system_logs`

Centralized logging for all system events.

```sql
CREATE TABLE system_logs (
  id bigserial PRIMARY KEY,
  timestamp timestamptz DEFAULT now(),
  severity text CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  source text NOT NULL, -- 'discord_bot', 'web_app', 'edge_function', etc.
  message text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  organization_id bigint REFERENCES organizations(id),
  metadata jsonb,
  stack_trace text,
  correlation_id uuid
);
```

**Usage:**
- Application errors
- R.O.M.A.N. activities
- User actions
- System events

**RLS Policies:**
- Admins can read all logs
- Users can read their own logs
- R.O.M.A.N. (service role) can insert logs

**Indexes:**
- `idx_system_logs_timestamp` on `timestamp DESC`
- `idx_system_logs_severity` on `severity`
- `idx_system_logs_source` on `source`
- `idx_system_logs_user` on `user_id`
- `idx_system_logs_correlation` on `correlation_id`

---

## Business Tables

### `public.employees`

Employee records for organizations.

```sql
CREATE TABLE employees (
  id bigserial PRIMARY KEY,
  organization_id bigint REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  employee_number text UNIQUE,
  full_name text NOT NULL,
  email text,
  phone text,
  hire_date date,
  termination_date date,
  job_title text,
  department text,
  hourly_rate numeric(10,2),
  salary numeric(10,2),
  pay_type text CHECK (pay_type IN ('hourly', 'salary')),
  employment_type text CHECK (employment_type IN ('full_time', 'part_time', 'contractor')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  tax_info jsonb,
  direct_deposit jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Relationships:**
- `organization_id` → `organizations.id`
- `user_id` → `auth.users.id` (optional link to platform user)
- `time_entries` (one-to-many)
- `paystubs` (one-to-many)

**RLS Policies:**
- Organization members can read employees
- Organization admins can manage employees
- Employees can read their own record

**Indexes:**
- `idx_employees_org` on `organization_id`
- `idx_employees_user` on `user_id`
- `idx_employees_status` on `status`

---

### `public.customers`

Customer/client records for organizations.

```sql
CREATE TABLE customers (
  id bigserial PRIMARY KEY,
  organization_id bigint REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  address jsonb,
  company text,
  tax_id text,
  customer_since date DEFAULT CURRENT_DATE,
  lifetime_value numeric(12,2) DEFAULT 0,
  notes text,
  tags text[],
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Relationships:**
- `organization_id` → `organizations.id`
- `bids` (one-to-many)
- `invoices` (one-to-many)
- `appointments` (one-to-many)

**RLS Policies:**
- Organization members can read/write customers

**Indexes:**
- `idx_customers_org` on `organization_id`
- `idx_customers_email` on `email`
- `idx_customers_stripe` on `stripe_customer_id`
- `idx_customers_search` GIN on `to_tsvector('english', name || ' ' || COALESCE(email, '') || ' ' || COALESCE(company, ''))`

---

### `public.bids`

Bid proposals for customer projects.

```sql
CREATE TABLE bids (
  id bigserial PRIMARY KEY,
  organization_id bigint REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id bigint REFERENCES customers(id) ON DELETE CASCADE,
  bid_number text UNIQUE,
  title text NOT NULL,
  description text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  subtotal numeric(12,2) NOT NULL,
  tax_rate numeric(5,4) DEFAULT 0,
  tax_amount numeric(12,2) DEFAULT 0,
  total numeric(12,2) NOT NULL,
  margin_percentage numeric(5,2),
  estimated_hours numeric(8,2),
  line_items jsonb DEFAULT '[]',
  notes text,
  terms text,
  valid_until date,
  sent_at timestamptz,
  accepted_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Relationships:**
- `organization_id` → `organizations.id`
- `customer_id` → `customers.id`
- `created_by` → `auth.users.id`

**RLS Policies:**
- Organization members can manage bids

**Indexes:**
- `idx_bids_org` on `organization_id`
- `idx_bids_customer` on `customer_id`
- `idx_bids_status` on `status`
- `idx_bids_created_at` on `created_at DESC`

---

### `public.invoices`

Invoices for customer payments.

```sql
CREATE TABLE invoices (
  id bigserial PRIMARY KEY,
  organization_id bigint REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id bigint REFERENCES customers(id) ON DELETE CASCADE,
  bid_id bigint REFERENCES bids(id),
  invoice_number text UNIQUE NOT NULL,
  issue_date date DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  subtotal numeric(12,2) NOT NULL,
  tax_rate numeric(5,4) DEFAULT 0,
  tax_amount numeric(12,2) DEFAULT 0,
  total numeric(12,2) NOT NULL,
  amount_paid numeric(12,2) DEFAULT 0,
  balance_due numeric(12,2) NOT NULL,
  line_items jsonb DEFAULT '[]',
  notes text,
  terms text,
  payment_method text,
  stripe_payment_intent_id text,
  paid_at timestamptz,
  sent_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Relationships:**
- `organization_id` → `organizations.id`
- `customer_id` → `customers.id`
- `bid_id` → `bids.id` (optional - invoice from accepted bid)
- `created_by` → `auth.users.id`
- `payments` (one-to-many)

**RLS Policies:**
- Organization members can manage invoices

**Indexes:**
- `idx_invoices_org` on `organization_id`
- `idx_invoices_customer` on `customer_id`
- `idx_invoices_status` on `status`
- `idx_invoices_due_date` on `due_date`
- `idx_invoices_stripe` on `stripe_payment_intent_id`

---

### `public.time_entries`

Employee time tracking.

```sql
CREATE TABLE time_entries (
  id bigserial PRIMARY KEY,
  organization_id bigint REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id bigint REFERENCES employees(id) ON DELETE CASCADE,
  clock_in timestamptz NOT NULL,
  clock_out timestamptz,
  break_duration interval DEFAULT '0 minutes',
  total_hours numeric(8,2),
  notes text,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Relationships:**
- `organization_id` → `organizations.id`
- `employee_id` → `employees.id`
- `approved_by` → `auth.users.id`

**RLS Policies:**
- Employees can manage their own time entries
- Organization admins can manage all time entries

**Indexes:**
- `idx_time_entries_employee` on `employee_id`
- `idx_time_entries_clock_in` on `clock_in DESC`

---

## AI & R.O.M.A.N. Tables

### `ops.roman_events`

R.O.M.A.N.'s autonomous action log.

```sql
CREATE TABLE ops.roman_events (
  id bigserial PRIMARY KEY,
  timestamp timestamptz DEFAULT now(),
  event_type text NOT NULL, -- 'approval', 'rejection', 'audit', 'fix', 'deployment'
  severity text CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  message text NOT NULL,
  metadata jsonb,
  user_id uuid REFERENCES auth.users(id),
  organization_id bigint REFERENCES public.organizations(id),
  correlation_id uuid,
  constitutional_validation jsonb, -- Sacred Geometry principles check
  created_at timestamptz DEFAULT now()
);
```

**Usage:**
- Discord bot approvals/rejections
- Autonomous fixes
- System health checks
- Constitutional AI validations

**RLS Policies:**
- Service role (R.O.M.A.N.) can insert
- Admins can read all events
- Users can read events related to their actions

**Indexes:**
- `idx_roman_events_timestamp` on `timestamp DESC`
- `idx_roman_events_type` on `event_type`
- `idx_roman_events_severity` on `severity`

---

### `ops.roman_commands`

Command history for R.O.M.A.N. processor.

```sql
CREATE TABLE ops.roman_commands (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  organization_id bigint REFERENCES public.organizations(id),
  command_intent text NOT NULL,
  command_type text,
  parameters jsonb,
  result jsonb,
  status text CHECK (status IN ('pending', 'executing', 'success', 'failed', 'rejected')),
  execution_time_ms integer,
  principle_validation jsonb,
  error_message text,
  created_at timestamptz DEFAULT now(),
  executed_at timestamptz,
  completed_at timestamptz
);
```

**Relationships:**
- `user_id` → `auth.users.id`
- `organization_id` → `public.organizations.id`

**RLS Policies:**
- Service role can insert/update
- Users can read their own commands
- Admins can read all commands

**Indexes:**
- `idx_roman_commands_user` on `user_id`
- `idx_roman_commands_status` on `status`
- `idx_roman_commands_created` on `created_at DESC`

---

### `public.ai_usage_logs`

Tracks AI API usage for cost monitoring.

```sql
CREATE TABLE ai_usage_logs (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  organization_id bigint REFERENCES organizations(id),
  provider text NOT NULL, -- 'anthropic', 'openai', 'gemini'
  model text NOT NULL,
  operation text, -- 'chat', 'embedding', 'image_generation'
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  cost_usd numeric(10,6),
  latency_ms integer,
  success boolean DEFAULT true,
  error_message text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
```

**Usage:**
- Cost tracking
- Usage analytics
- Performance monitoring
- Budget alerts

**RLS Policies:**
- Organization members can read their org's logs
- Service role can insert

**Indexes:**
- `idx_ai_usage_org` on `organization_id`
- `idx_ai_usage_provider` on `provider`
- `idx_ai_usage_created` on `created_at DESC`

---

### `public.ai_compliance_logs`

AI safety and compliance monitoring.

```sql
CREATE TABLE ai_compliance_logs (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  organization_id bigint REFERENCES organizations(id),
  operation text NOT NULL,
  input_text text,
  output_text text,
  safety_check_results jsonb,
  flagged boolean DEFAULT false,
  flag_reason text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

**Usage:**
- Content moderation
- Safety monitoring
- Compliance audits
- Constitutional AI validation

**RLS Policies:**
- Admins only

**Indexes:**
- `idx_ai_compliance_flagged` on `flagged` WHERE `flagged = true`
- `idx_ai_compliance_created` on `created_at DESC`

---

## Subscription & Billing

### `public.subscription_plans`

Available subscription tiers.

```sql
CREATE TABLE subscription_plans (
  id bigserial PRIMARY KEY,
  tier text UNIQUE NOT NULL, -- 'free', 'professional', 'business', 'enterprise'
  name text NOT NULL,
  price_monthly numeric(10,2) NOT NULL,
  price_yearly numeric(10,2),
  features jsonb NOT NULL,
  limits jsonb NOT NULL,
  stripe_price_id text UNIQUE,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Features JSON Structure:**
```json
{
  "users": 5,
  "organizations": 1,
  "ai_requests": 1000,
  "storage_gb": 10,
  "theme_access": {
    "type": "limited",
    "count": 5
  },
  "knowledge_bases": {
    "type": "full",
    "count": 17
  },
  "support": "email"
}
```

**RLS Policies:**
- Public read (anyone can view plans)
- Admin write

---

### `public.subscriptions`

Organization subscriptions.

```sql
CREATE TABLE subscriptions (
  id bigserial PRIMARY KEY,
  organization_id bigint UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id bigint REFERENCES subscription_plans(id),
  stripe_subscription_id text UNIQUE,
  status text CHECK (status IN ('active', 'trialing', 'past_due', 'cancelled', 'unpaid')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  cancelled_at timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Relationships:**
- `organization_id` → `organizations.id` (one-to-one)
- `plan_id` → `subscription_plans.id`

**RLS Policies:**
- Organization members can read their subscription
- Service role can update (Stripe webhooks)

**Indexes:**
- `idx_subscriptions_org` on `organization_id`
- `idx_subscriptions_stripe` on `stripe_subscription_id`
- `idx_subscriptions_status` on `status`

---

### `public.payments`

Payment history.

```sql
CREATE TABLE payments (
  id bigserial PRIMARY KEY,
  organization_id bigint REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id bigint REFERENCES subscriptions(id),
  invoice_id bigint REFERENCES invoices(id),
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  status text CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  payment_method text,
  stripe_payment_intent_id text UNIQUE,
  stripe_charge_id text,
  failure_reason text,
  metadata jsonb,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

**Relationships:**
- `organization_id` → `organizations.id`
- `subscription_id` → `subscriptions.id` (subscription payments)
- `invoice_id` → `invoices.id` (invoice payments)

**RLS Policies:**
- Organization members can read their payments

**Indexes:**
- `idx_payments_org` on `organization_id`
- `idx_payments_subscription` on `subscription_id`
- `idx_payments_invoice` on `invoice_id`
- `idx_payments_stripe_intent` on `stripe_payment_intent_id`

---

## Educational Platform

### `public.study_groups`

Collaborative study groups for educational features.

```sql
CREATE TABLE study_groups (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  description text,
  subject text,
  max_members integer DEFAULT 10,
  is_public boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Relationships:**
- `created_by` → `auth.users.id`
- `study_group_members` (one-to-many)
- `study_group_messages` (one-to-many)

**RLS Policies:**
- Public groups readable by all authenticated users
- Private groups readable by members only

---

### `public.tutoring_sessions`

Scheduled tutoring sessions.

```sql
CREATE TABLE tutoring_sessions (
  id bigserial PRIMARY KEY,
  tutor_id uuid REFERENCES auth.users(id),
  student_id uuid REFERENCES auth.users(id),
  subject text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  location text,
  notes text,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Relationships:**
- `tutor_id` → `auth.users.id`
- `student_id` → `auth.users.id`

**RLS Policies:**
- Tutors and students can read/write their sessions

**Indexes:**
- `idx_tutoring_tutor` on `tutor_id`
- `idx_tutoring_student` on `student_id`
- `idx_tutoring_start` on `start_time`

---

### `public.academic_search_results`

Cached academic search results.

```sql
CREATE TABLE academic_search_results (
  id bigserial PRIMARY KEY,
  query text NOT NULL,
  source text NOT NULL, -- 'arxiv', 'semantic_scholar', 'pubmed'
  results jsonb NOT NULL,
  result_count integer,
  cache_expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

**Usage:**
- Cache external API results
- Reduce API calls
- Improve performance

**RLS Policies:**
- Authenticated users can read

**Indexes:**
- `idx_academic_search_query` on `query`
- `idx_academic_search_expires` on `cache_expires_at`

---

## Security & RLS

### Row Level Security (RLS)

All tables have RLS enabled with policies enforcing:

1. **User Isolation** - Users only access their own data
2. **Organization Isolation** - Organization members share data
3. **Admin Override** - Admin users have elevated read access
4. **Service Role Bypass** - R.O.M.A.N. (service role) bypasses RLS for autonomous operations

### Common RLS Patterns

#### User's Own Data
```sql
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);
```

#### Organization Data
```sql
CREATE POLICY "Organization members can read"
ON customers FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
);
```

#### Admin Access
```sql
CREATE POLICY "Admins can read all"
ON system_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

---

## Indexes & Performance

### Critical Indexes

**Foreign Key Indexes:**
```sql
-- All foreign keys have indexes for join performance
CREATE INDEX idx_employees_org ON employees(organization_id);
CREATE INDEX idx_customers_org ON customers(organization_id);
CREATE INDEX idx_bids_customer ON bids(customer_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
```

**Query Performance Indexes:**
```sql
-- Timestamp-based queries (logs, events)
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX idx_roman_events_timestamp ON ops.roman_events(timestamp DESC);

-- Status filtering
CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Full-text search
CREATE INDEX idx_customers_search ON customers 
USING GIN (to_tsvector('english', name || ' ' || COALESCE(email, '')));
```

**Partial Indexes:**
```sql
-- Optimize for common queries
CREATE INDEX idx_profiles_admins ON profiles(is_admin) WHERE is_admin = true;
CREATE INDEX idx_ai_compliance_flagged ON ai_compliance_logs(flagged) WHERE flagged = true;
```

---

## Migrations

### Migration Naming Convention

```
YYYYMMDD_HHmmss_description.sql
```

Examples:
- `20250126000000_update_subscription_tiers.sql`
- `20250108000000_add_critical_indexes.sql`
- `20250104_final_security_fixes.sql`

### Key Migrations

1. **Schema Setup** - `20241018143000_company_handbook_schema.sql`
2. **Security Fixes** - `20250104_final_security_fixes.sql`
3. **Performance** - `20250108000000_add_critical_indexes.sql`
4. **R.O.M.A.N. Events** - `20251215_roman_events_compatibility.sql`
5. **Advisor Fixes** - `20251215_advisor_complete_fix.sql`

### Running Migrations

```bash
# Apply all pending migrations
supabase db push

# Create new migration
supabase migration new description_here

# Reset database (dev only)
supabase db reset
```

---

## Database Functions

### RPC Functions

#### `run_payroll_for_period(org_id, start_date, end_date)`
Calculates and creates paystubs for all employees.

#### `get_optimal_bid_margin(service_type, region, complexity)`
Returns recommended bid margin based on historical data.

#### `search_customers(search_query, organization_id)`
Full-text search across customer records.

#### `get_employee_time_summary(employee_id, start_date, end_date)`
Aggregates time entries for payroll.

### Trigger Functions

#### `ops.fn_log_change()`
Logs all changes to audit-tracked tables.

#### `ops.insert_heartbeat_alert()`
Monitors system health and creates alerts.

#### `update_updated_at_column()`
Automatically updates `updated_at` timestamp.

---

## Backup & Recovery

### Automated Backups

Supabase provides:
- **Point-in-time recovery** - 7 days (can be extended)
- **Daily snapshots** - Retained for 30 days
- **Weekly snapshots** - Retained for 90 days

### Manual Backup

```bash
# Export schema
pg_dump -h db.xxx.supabase.co -U postgres -s odyssey > schema.sql

# Export data
pg_dump -h db.xxx.supabase.co -U postgres -a odyssey > data.sql

# Full backup
pg_dump -h db.xxx.supabase.co -U postgres odyssey > full_backup.sql
```

---

## Monitoring

### Health Checks

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### R.O.M.A.N. Monitoring

```sql
-- Recent R.O.M.A.N. events
SELECT * FROM ops.roman_events 
ORDER BY timestamp DESC 
LIMIT 50;

-- Error rate
SELECT 
  DATE_TRUNC('hour', timestamp) AS hour,
  COUNT(*) FILTER (WHERE severity = 'error') AS errors,
  COUNT(*) AS total
FROM ops.roman_events
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

---

## Schema Diagram

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│   profiles  │──────▶│ user_organizations│◀──────│organizations│
└─────────────┘       └──────────────────┘       └─────────────┘
                                                         │
                      ┌──────────────────────────────────┼────────────────────┐
                      │                                  │                    │
                      ▼                                  ▼                    ▼
               ┌──────────┐                       ┌──────────┐        ┌──────────┐
               │employees │                       │customers │        │   bids   │
               └──────────┘                       └──────────┘        └──────────┘
                      │                                  │                    │
                      ▼                                  │                    │
               ┌─────────────┐                           │                    │
               │time_entries │                           ▼                    ▼
               └─────────────┘                    ┌──────────────────────────────┐
                                                  │         invoices             │
                                                  └──────────────────────────────┘
                                                           │
                                                           ▼
                                                    ┌──────────┐
                                                    │ payments │
                                                    └──────────┘
```

---

**© 2025 ODYSSEY-1 AI LLC. All Rights Reserved.**  
**Database Architecture by Rickey A Howard**
