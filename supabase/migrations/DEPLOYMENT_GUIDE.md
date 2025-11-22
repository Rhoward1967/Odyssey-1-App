# SCHEDULING SYSTEM DEPLOYMENT GUIDE

Complete deployment sequence for the employee scheduling system

## OVERVIEW

This deployment creates:

- 9 database tables (shift_templates, work_locations, employee_schedules, teams, team_members, schedule_modifications, training_assignments, schedule_templates, schedule_template_details)
- 4 helper functions (is_org_member, is_org_admin, get_days_in_month, generate_schedules_from_template)
- 36+ RLS policies (4 per table: SELECT, INSERT, UPDATE, DELETE)
- 25+ performance indexes

## PREREQUISITES

✅ Supabase project: tvsxloejfsrdganemsmg.supabase.co
✅ Required tables exist: organizations, employees, user_organizations
✅ user_organizations has columns: user_id (uuid), organization_id (uuid), role (text)
✅ Admin roles: 'owner', 'admin', 'manager'

## DEPLOYMENT SEQUENCE

### STEP 0: Pre-Deployment Validation (OPTIONAL)

**File:** `00_PRE_DEPLOYMENT_CHECK.sql`
**Purpose:** Verify prerequisites and current state
**How to run:**

1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/tvsxloejfsrdganemsmg/editor/sql
2. Click "New Query"
3. Copy/paste entire file contents
4. Click "Run" (Ctrl+Enter)

**Expected Output:**

```
✅ Required base tables exist
employees.organization_id type: uuid
user_organizations.organization_id type: uuid
SCHEDULING TABLES STATUS:
❌ shift_templates MISSING
❌ work_locations MISSING
... (all 9 tables missing)
✅ READY FOR STEP 1: Create all base tables
```

---

### STEP 1: Create Base Tables ⭐ REQUIRED

**File:** `20250118000002_create_scheduling_system.sql`
**Purpose:** Create 9 scheduling tables with basic RLS policies and helper functions
**Size:** 654 lines
**Execution time:** ~5-10 seconds

**How to run:**

1. In Supabase SQL Editor, click "New Query"
2. Copy entire contents of `20250118000002_create_scheduling_system.sql`
3. Paste into editor
4. Click "Run" (Ctrl+Enter)
5. Wait for completion

**Expected Output:**

```
Sample scheduling data created for HJS Services LLC
```

**What gets created:**

- ✅ 9 tables with proper foreign keys
- ✅ Basic RLS policies (will be replaced in Step 2)
- ✅ Helper functions: get_days_in_month(), generate_schedules_from_template()
- ✅ Sample data (4 shift templates, 1 location for HJS Services)
- ✅ Basic indexes (will be enhanced in Step 2)

**Validation:**
Run this query to verify:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'shift_templates', 'work_locations', 'employee_schedules',
    'teams', 'team_members', 'schedule_modifications',
    'training_assignments', 'schedule_templates', 'schedule_template_details'
  )
ORDER BY table_name;
```

Should return 9 rows.

---

### STEP 2: Apply Enhanced RLS + Indexes ⭐ REQUIRED

**File:** `20250118000003_apply_rls_and_indexes.sql`
**Purpose:** Replace basic policies with production-grade RLS and add performance indexes
**Size:** 400+ lines
**Execution time:** ~10-15 seconds

**How to run:**

1. **AFTER Step 1 completes successfully**
2. In Supabase SQL Editor, click "New Query"
3. Copy entire contents of `20250118000003_apply_rls_and_indexes.sql`
4. Paste into editor
5. Click "Run" (Ctrl+Enter)
6. Wait for completion

**Expected Output:**

```
✅ SCHEDULING SYSTEM RLS + INDEXES APPLIED
Total RLS Policies: 36
Total Performance Indexes: 25
Helper Functions: 2 (is_org_member, is_org_admin)
```

**What gets created:**

- ✅ Helper functions: is_org_member(uuid), is_org_admin(uuid)
- ✅ 36+ RLS policies using helper functions
- ✅ 25+ performance indexes for org filtering, date ranges, employee lookups
- ✅ Special policies: employees can request their own schedule modifications
- ✅ Optimized indexes: composite, partial, covering

**Validation:**
Run the post-deployment check (next step).

---

### STEP 3: Post-Deployment Validation ⭐ RECOMMENDED

**File:** `99_POST_DEPLOYMENT_CHECK.sql`
**Purpose:** Verify all tables, policies, indexes, and functions are correctly deployed

**How to run:**

1. After Step 2 completes
2. Click "New Query"
3. Copy/paste `99_POST_DEPLOYMENT_CHECK.sql`
4. Run

**Expected Output:**

```
✅ is_org_member() exists
✅ is_org_admin() exists
✅ get_days_in_month() exists
✅ generate_schedules_from_template() exists

✅ shift_templates | RLS: ON | Policies: 4
✅ work_locations | RLS: ON | Policies: 4
✅ employee_schedules | RLS: ON | Policies: 4
... (all 9 tables)

Total RLS Policies: 36 (expected: 36+)
Total Performance Indexes: 25 (expected: 25+)

✅ employee_schedules(org, date) indexed
✅ employee_schedules(employee, date) indexed

✅ DEPLOYMENT SUCCESSFUL!
```

**If you see warnings:**

- Missing policies → Re-run Step 2
- Missing indexes → Check error messages from Step 2
- RLS: OFF → Re-run Step 2

---

### STEP 4: RLS Security Testing 🔒 REQUIRED

**File:** `20250118000004_test_rls_validation.sql`
**Purpose:** Test that RLS policies correctly prevent unauthorized access

**Test Scenarios:**

#### TEST 1: Anonymous Access (Should FAIL)

```sql
-- Without authentication
SELECT * FROM public.employee_schedules LIMIT 1;
-- Expected: Permission denied or empty result
```

#### TEST 2: Non-Member Access (Should Return Empty)

```sql
-- As authenticated user NOT in any organization
SELECT * FROM public.employee_schedules;
-- Expected: []
```

#### TEST 3: Member Read Access (Should SUCCEED)

```sql
-- As authenticated user IN an organization
SELECT * FROM public.shift_templates
WHERE organization_id = '<YOUR_ORG_ID>';
-- Expected: Returns data from YOUR org only
```

#### TEST 4: Cross-Org Prevention (Should Return Empty)

```sql
-- Try to access ANOTHER organization's data
SELECT * FROM public.shift_templates
WHERE organization_id = '<OTHER_ORG_ID>';
-- Expected: []
```

#### TEST 5: Admin Write Access (Should SUCCEED)

```sql
-- As admin/manager in org
INSERT INTO public.shift_templates (...) VALUES (...);
-- Expected: Success
```

**Full test suite:** See `20250118000004_test_rls_validation.sql`

---

## ROLLBACK PROCEDURE

If something goes wrong:

### Rollback Step 2 Only (Keep Tables)

```sql
-- Drop new helper functions
DROP FUNCTION IF EXISTS public.is_org_member(uuid);
DROP FUNCTION IF EXISTS public.is_org_admin(uuid);

-- Drop new policies
DROP POLICY IF EXISTS "member_read_shift_templates" ON public.shift_templates;
DROP POLICY IF EXISTS "admin_insert_shift_templates" ON public.shift_templates;
-- ... (drop all new policies)

-- Drop new indexes
DROP INDEX IF EXISTS idx_schedules_org_date;
DROP INDEX IF EXISTS idx_schedules_employee_date;
-- ... (drop all new indexes)
```

### Full Rollback (Remove Everything)

```sql
-- Drop all 9 tables
DROP TABLE IF EXISTS public.schedule_template_details CASCADE;
DROP TABLE IF EXISTS public.schedule_templates CASCADE;
DROP TABLE IF EXISTS public.training_assignments CASCADE;
DROP TABLE IF EXISTS public.schedule_modifications CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.employee_schedules CASCADE;
DROP TABLE IF EXISTS public.work_locations CASCADE;
DROP TABLE IF EXISTS public.shift_templates CASCADE;

-- Drop helper functions
DROP FUNCTION IF EXISTS public.is_org_member(uuid);
DROP FUNCTION IF EXISTS public.is_org_admin(uuid);
DROP FUNCTION IF EXISTS public.get_days_in_month(date);
DROP FUNCTION IF EXISTS public.generate_schedules_from_template(uuid, uuid[], date, integer);
```

---

## COMMON ISSUES & FIXES

### Issue: "relation already exists"

**Cause:** Tables already created from previous attempt
**Fix:**

```sql
-- Check which tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%schedule%' OR table_name LIKE '%shift%' OR table_name LIKE '%team%';

-- Drop existing tables if needed (see Full Rollback)
```

### Issue: "foreign key constraint fails"

**Cause:** Missing prerequisite tables (organizations, employees, user_organizations)
**Fix:**

- Run pre-deployment check to verify prerequisites
- Ensure organizations and employees tables exist

### Issue: "function is_org_member(bigint) does not exist"

**Cause:** organization_id column type mismatch (bigint vs uuid)
**Fix:**

```sql
-- Check column types
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'organization_id';

-- If bigint, migrate to uuid or create overloaded function
```

### Issue: "RLS policy check violation"

**Cause:** User not in user_organizations table
**Fix:**

```sql
-- Add user to organization
INSERT INTO public.user_organizations (user_id, organization_id, role)
VALUES (auth.uid(), '<ORG_ID>', 'admin');
```

---

## PERFORMANCE BENCHMARKS

After deployment, run these queries to verify performance:

### Calendar Month Query (Should use idx_schedules_org_date)

```sql
EXPLAIN ANALYZE
SELECT * FROM public.employee_schedules
WHERE organization_id = '<ORG_ID>'
  AND schedule_date >= '2025-01-01'
  AND schedule_date <= '2025-01-31';
-- Expected: Index Scan, < 50ms
```

### Employee Schedule Lookup (Should use idx_schedules_employee_date)

```sql
EXPLAIN ANALYZE
SELECT * FROM public.employee_schedules
WHERE employee_id = '<EMPLOYEE_ID>'
  AND schedule_date >= '2025-01-01'
  AND schedule_date <= '2025-01-31';
-- Expected: Index Scan, < 20ms
```

### Bulk Insert Performance

```sql
-- Insert 100 schedules
-- Expected: < 2 seconds
```

---

## SUCCESS CRITERIA

✅ All 9 tables created
✅ All 4 helper functions exist
✅ RLS enabled on all 9 tables
✅ 36+ RLS policies created (4 per table minimum)
✅ 25+ performance indexes created
✅ Anonymous access blocked
✅ Non-member access returns empty results
✅ Member can read own org data
✅ Member cannot read cross-org data
✅ Admin can write to org tables
✅ Calendar queries use indexes (< 100ms)
✅ Bulk inserts complete quickly (< 5s for 100+ records)

---

## NEXT STEPS AFTER DEPLOYMENT

1. **Test in frontend:**
   - Open calendar component: `/app/scheduling`
   - Create test schedules using bulk modal
   - Verify month view renders correctly (28/29/30/31 days)

2. **Integrate with existing systems:**
   - Payroll: Link schedules to time tracking
   - Time clock: Validate clock-ins against schedules
   - Onboarding: Assign training during employee onboarding

3. **Monitor performance:**
   - Check Supabase logs for slow queries
   - Monitor RLS policy execution time
   - Verify index usage with EXPLAIN ANALYZE

---

## CONTACT & SUPPORT

- **Migration Files:** `c:\Users\gener\Odyssey-1-App\supabase\migrations\`
- **Supabase Dashboard:** https://supabase.com/dashboard/project/tvsxloejfsrdganemsmg
- **SQL Editor:** https://supabase.com/dashboard/project/tvsxloejfsrdganemsmg/editor/sql

---

**Ready to Deploy?** Start with Step 0 (optional validation) or jump to Step 1 (create tables).
