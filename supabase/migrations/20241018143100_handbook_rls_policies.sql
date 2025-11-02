-- Row Level Security Policies for Company Handbook System
-- Ensures proper access control based on employee roles and organization membership

-- Enable RLS on all handbook tables
ALTER TABLE handbook_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE handbook_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE handbook_section_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE handbook_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE handbook_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE handbook_quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE handbook_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE handbook_access_log ENABLE ROW LEVEL SECURITY;

-- First create the helper function that returns user info
CREATE OR REPLACE FUNCTION get_user_handbook_access()
RETURNS TABLE(user_role TEXT, organization_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        uo.role::TEXT as user_role,
        uo.organization_id::UUID
    FROM public.user_organizations uo
    WHERE uo.user_id = auth.uid()
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a simpler function to get user's organization ID (FIXED TYPE)
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS BIGINT AS $$
BEGIN
    RETURN (
        SELECT organization_id 
        FROM public.user_organizations 
        WHERE user_id = auth.uid() 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user meets minimum role requirement
CREATE OR REPLACE FUNCTION meets_role_requirement(required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_access RECORD;
    role_hierarchy INTEGER;
    required_hierarchy INTEGER;
BEGIN
    -- Get user's role and org
    SELECT * INTO user_access FROM get_user_handbook_access() LIMIT 1;
    
    IF user_access.user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Define role hierarchy
    CASE user_access.user_role
        WHEN 'owner' THEN role_hierarchy := 3;
        WHEN 'admin' THEN role_hierarchy := 2;
        WHEN 'member' THEN role_hierarchy := 1;
        ELSE role_hierarchy := 0;
    END CASE;
    
    -- Define required hierarchy
    CASE required_role
        WHEN 'owner' THEN required_hierarchy := 3;
        WHEN 'admin' THEN required_hierarchy := 2;
        WHEN 'member' THEN required_hierarchy := 1;
        ELSE required_hierarchy := 0;
    END CASE;
    
    RETURN role_hierarchy >= required_hierarchy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- HANDBOOK CATEGORIES POLICIES
-- Anyone authenticated can view active categories they have role access to
CREATE POLICY "handbook_categories_select" ON handbook_categories
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND is_active = true 
        AND meets_role_requirement(required_role)
    );

-- Only admins and owners can manage categories
CREATE POLICY "handbook_categories_insert" ON handbook_categories
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' 
        AND meets_role_requirement('admin')
    );

CREATE POLICY "handbook_categories_update" ON handbook_categories
    FOR UPDATE USING (
        auth.role() = 'authenticated' 
        AND meets_role_requirement('admin')
    );

CREATE POLICY "handbook_categories_delete" ON handbook_categories
    FOR DELETE USING (
        auth.role() = 'authenticated' 
        AND meets_role_requirement('admin')
    );

-- HANDBOOK SECTIONS POLICIES  
-- Users can view published sections in categories they have access to
CREATE POLICY "handbook_sections_select" ON handbook_sections
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND is_published = true
        AND meets_role_requirement(required_role)
        AND category_id IN (
            SELECT id FROM handbook_categories 
            WHERE is_active = true 
            AND meets_role_requirement(handbook_categories.required_role)
        )
    );

-- Managers and above can create sections
CREATE POLICY "handbook_sections_insert" ON handbook_sections
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' 
        AND meets_role_requirement('manager')
    );

-- Managers and above can update sections (with proper approval workflow)
CREATE POLICY "handbook_sections_update" ON handbook_sections
    FOR UPDATE USING (
        auth.role() = 'authenticated' 
        AND meets_role_requirement('manager')
    );

-- Only admins can delete sections
CREATE POLICY "handbook_sections_delete" ON handbook_sections
    FOR DELETE USING (
        auth.role() = 'authenticated' 
        AND meets_role_requirement('admin')
    );

-- HANDBOOK SECTION HISTORY POLICIES
-- Managers and above can view version history
CREATE POLICY "handbook_section_history_select" ON handbook_section_history
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND meets_role_requirement('manager')
    );

-- HANDBOOK ACKNOWLEDGMENTS POLICIES
-- Users can view their own acknowledgments
CREATE POLICY "handbook_acknowledgments_select" ON handbook_acknowledgments
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND (
            employee_id = auth.uid()
            OR meets_role_requirement('manager')
        )
    );

-- Users can create their own acknowledgments
CREATE POLICY "handbook_acknowledgments_insert" ON handbook_acknowledgments
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' 
        AND employee_id = auth.uid()
    );

-- Managers can view all acknowledgments in their organization (DISABLED FOR NOW)
-- CREATE POLICY "handbook_acknowledgments_manager_view" ON handbook_acknowledgments
--     FOR SELECT USING (
--         auth.role() = 'authenticated' 
--         AND meets_role_requirement('manager')
--         AND employee_id IN (
--             SELECT e.id FROM employees e
--             INNER JOIN user_organizations uo ON e.user_id = uo.user_id
--             WHERE uo.organization_id = get_user_organization_id()
--         )
--     );

-- HANDBOOK QUIZ QUESTIONS POLICIES
-- Users can view questions for sections they have access to
CREATE POLICY "handbook_quiz_questions_select" ON handbook_quiz_questions
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND is_active = true
        AND section_id IN (
            SELECT id FROM handbook_sections 
            WHERE is_published = true 
            AND meets_role_requirement(required_role)
        )
    );

-- Managers and above can manage quiz questions
CREATE POLICY "handbook_quiz_questions_insert" ON handbook_quiz_questions
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' 
        AND meets_role_requirement('manager')
    );

CREATE POLICY "handbook_quiz_questions_update" ON handbook_quiz_questions
    FOR UPDATE USING (
        auth.role() = 'authenticated' 
        AND meets_role_requirement('manager')
    );

CREATE POLICY "handbook_quiz_questions_delete" ON handbook_quiz_questions
    FOR DELETE USING (
        auth.role() = 'authenticated' 
        AND meets_role_requirement('admin')
    );

-- HANDBOOK QUIZ OPTIONS POLICIES  
-- Users can view options for questions they have access to
CREATE POLICY "handbook_quiz_options_select" ON handbook_quiz_options
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND question_id IN (
            SELECT hqq.id FROM handbook_quiz_questions hqq
            INNER JOIN handbook_sections hs ON hqq.section_id = hs.id
            WHERE hqq.is_active = true 
            AND hs.is_published = true
            AND meets_role_requirement(hs.required_role)
        )
    );

-- Managers and above can manage quiz options
CREATE POLICY "handbook_quiz_options_insert" ON handbook_quiz_options
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' 
        AND meets_role_requirement('manager')
    );

CREATE POLICY "handbook_quiz_options_update" ON handbook_quiz_options
    FOR UPDATE USING (
        auth.role() = 'authenticated' 
        AND meets_role_requirement('manager')
    );

CREATE POLICY "handbook_quiz_options_delete" ON handbook_quiz_options
    FOR DELETE USING (
        auth.role() = 'authenticated' 
        AND meets_role_requirement('manager')
    );

-- HANDBOOK QUIZ RESULTS POLICIES
-- Users can view their own quiz results
CREATE POLICY "handbook_quiz_results_select" ON handbook_quiz_results
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND (
            employee_id = auth.uid()
            OR meets_role_requirement('manager')
        )
    );

-- Users can create their own quiz results
CREATE POLICY "handbook_quiz_results_insert" ON handbook_quiz_results
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' 
        AND employee_id = auth.uid()
    );

-- HANDBOOK ACCESS LOG POLICIES
-- Users can view their own access history
CREATE POLICY "handbook_access_log_select" ON handbook_access_log
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND (
            employee_id = auth.uid()
            OR meets_role_requirement('manager')
        )
    );

-- System can log access (this will be handled by the application)
CREATE POLICY "handbook_access_log_insert" ON handbook_access_log
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated'
    );

-- Grant necessary permissions to authenticated users
GRANT SELECT ON handbook_categories TO authenticated;
GRANT SELECT ON handbook_sections TO authenticated;
GRANT SELECT ON handbook_section_history TO authenticated;
GRANT SELECT, INSERT ON handbook_acknowledgments TO authenticated;
GRANT SELECT ON handbook_quiz_questions TO authenticated;
GRANT SELECT ON handbook_quiz_options TO authenticated;
GRANT SELECT, INSERT ON handbook_quiz_results TO authenticated;
GRANT SELECT, INSERT ON handbook_access_log TO authenticated;

-- Grant additional permissions for managers and above
GRANT INSERT, UPDATE ON handbook_categories TO authenticated;
GRANT INSERT, UPDATE ON handbook_sections TO authenticated;
GRANT INSERT, UPDATE ON handbook_quiz_questions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON handbook_quiz_options TO authenticated;

-- Grant delete permissions for admins (handled by RLS policies)
GRANT DELETE ON handbook_categories TO authenticated;
GRANT DELETE ON handbook_sections TO authenticated;
GRANT DELETE ON handbook_quiz_questions TO authenticated;

COMMENT ON POLICY "handbook_categories_select" ON handbook_categories IS 'Allow users to view active categories based on their role level';
COMMENT ON POLICY "handbook_sections_select" ON handbook_sections IS 'Allow users to view published sections they have role access to';
COMMENT ON POLICY "handbook_acknowledgments_select" ON handbook_acknowledgments IS 'Allow users to view their own acknowledgments, managers can view all in org';
COMMENT ON FUNCTION get_user_handbook_access() IS 'Helper function to get current user organization and role for handbook access';
COMMENT ON FUNCTION meets_role_requirement(TEXT) IS 'Helper function to check if user meets minimum role requirement for handbook content';