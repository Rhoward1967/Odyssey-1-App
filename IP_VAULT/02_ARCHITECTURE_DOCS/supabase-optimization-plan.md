# SUPABASE PERFORMANCE OPTIMIZATION PLAN
## Database Linter Issues Resolution

### 🎯 PRIORITY 1: RLS Performance Issues (24 instances)
**Problem:** Auth functions re-evaluating for each row instead of once per query

**Tables Affected:**
- handbook_categories (4 policies)
- handbook_sections (4 policies) 
- handbook_section_history (1 policy)
- handbook_acknowledgments (2 policies)
- handbook_quiz_questions (4 policies)
- handbook_quiz_options (4 policies)
- handbook_quiz_results (2 policies)
- handbook_access_log (2 policies)

**Solution:** Replace `auth.<function>()` with `(select auth.<function>())`
**Impact:** Massive performance improvement at scale

### 🎯 PRIORITY 2: Multiple Permissive Policies (12 instances)
**Problem:** Multiple policies executing for same role/action causing performance degradation

**Tables Affected:**
- agents table (4 actions: SELECT, INSERT, UPDATE, DELETE)
- bids table (4 actions: SELECT, INSERT, UPDATE, DELETE)  
- roman_commands table (4 actions: SELECT, INSERT, UPDATE, DELETE)

**Solution:** Consolidate policies into single, efficient policy per action
**Impact:** Reduce policy evaluation overhead

### 🎯 PRIORITY 3: Duplicate Indexes (2 instances)
**Problem:** Identical indexes wasting storage and slowing writes

**Tables Affected:**
- agents: {idx_agents_organization, idx_agents_organization_id}
- roman_commands: {idx_roman_commands_user, idx_roman_commands_user_id}

**Solution:** Drop duplicate indexes, keep one per table
**Impact:** Reduced storage, faster writes

## 📋 IMPLEMENTATION STRATEGY

### Phase 1: RLS Optimization (High Impact)
1. Audit all handbook table policies
2. Rewrite auth function calls with subquery pattern
3. Test performance before/after

### Phase 2: Policy Consolidation (Medium Impact)  
1. Review overlapping policies on agents/bids/roman_commands
2. Merge into single efficient policies
3. Validate security still intact

### Phase 3: Index Cleanup (Low Impact)
1. Identify which duplicate indexes to drop
2. Ensure no dependencies exist
3. Drop redundant indexes

## 🤝 SUPABASE ADVISOR CONSULTATION
- Review optimization plan
- Get expert recommendations
- Implement with their guidance
- Performance validation post-changes

**Expected Results:** 50-80% performance improvement on affected queries
