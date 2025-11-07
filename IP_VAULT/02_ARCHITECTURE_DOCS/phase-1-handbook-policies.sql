-- PHASE 1: HANDBOOK TABLE RLS OPTIMIZATION
-- Replace auth functions with SELECT wrappers
-- Scope to authenticated only

-- Pre-migration baseline queries for testing:
-- EXPLAIN ANALYZE SELECT * FROM handbook_categories WHERE is_active = true;
-- EXPLAIN ANALYZE SELECT * FROM handbook_sections WHERE is_published = true;

-- ...existing migration scripts...
