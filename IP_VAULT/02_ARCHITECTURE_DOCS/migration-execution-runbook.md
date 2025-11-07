# SUPABASE DATABASE OPTIMIZATION - EXECUTION RUNBOOK

## 🎯 PRE-EXECUTION CHECKLIST
- [ ] Confirm RLS enabled on all handbook tables
- [ ] Save current policies (pg_dump -s for rollback)
- [ ] Identify 2-3 key handbook queries for baseline EXPLAIN ANALYZE
- [ ] Schedule during low-traffic hours (early morning)

## 📋 PHASE 1: RLS OPTIMIZATION (24 policies)
**Target:** handbook_* tables
**Impact:** 50-80% performance improvement

### Execution:
- Apply handbook policy drops/creates from scripts
- Wrap auth.uid() → (SELECT auth.uid())
- Wrap auth.role() → (SELECT auth.role())
- Scope from public → authenticated

### Validation:
- [ ] Authenticated user can read expected handbook data
- [ ] Unauthenticated user CANNOT access handbook tables
- [ ] EXPLAIN ANALYZE shows stable plans, no per-row overhead

## 📋 PHASE 2: POLICY CONSOLIDATION (12 policies)
**Target:** agents, bids, roman_commands tables
**Impact:** Reduced policy evaluation overhead

### Execution:
- Merge multiple permissive policies using OR logic
- agents: 3 policies → 1 per action
- bids: 2 policies → 1 per action  
- roman_commands: 2 policies → 1 per action

### Validation:
- [ ] Owner/member vs non-member access works
- [ ] Admin/owner roles in user_organizations validated
- [ ] Behavior matches previous semantics (authenticated only)

## 📋 PHASE 3: INDEX CLEANUP (2 indexes)
**Target:** Duplicate indexes
**Impact:** Reduced storage, faster writes

### Execution:
```sql
BEGIN; DROP INDEX CONCURRENTLY IF EXISTS public.idx_agents_organization; COMMIT;
BEGIN; DROP INDEX CONCURRENTLY IF EXISTS public.idx_roman_commands_user; COMMIT;
```

### Validation:
- [ ] No unexpected plan regressions on affected queries

## 🔍 POST-MIGRATION VALIDATION
- [ ] Re-run Supabase Advisors (all 38 warnings should clear)
- [ ] Performance benchmarks show improvement
- [ ] Security testing confirms proper access control
- [ ] Keep saved policies for 24-48h rollback window

## 🚨 ROLLBACK PLAN
- **Policies:** Recreate from saved pg_dump definitions
- **Indexes:** Recreate with CONCURRENTLY (scripts provided)
- **Timeline:** Can rollback within minutes if needed

## 🎯 SUCCESS METRICS
- [ ] 50-80% handbook query performance improvement
- [ ] Zero Supabase Advisor warnings
- [ ] Maintained security with authenticated-only access
- [ ] Reduced database overhead from policy consolidation
