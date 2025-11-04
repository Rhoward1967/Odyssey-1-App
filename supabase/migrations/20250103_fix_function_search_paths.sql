-- Fix function search path security warnings
-- Set search_path to prevent SQL injection vulnerabilities

-- 1. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 2. Fix track_handbook_section_changes function
CREATE OR REPLACE FUNCTION public.track_handbook_section_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.handbook_section_history (
        section_id,
        title,
        content,
        version_number,
        changed_by,
        change_type,
        created_at
    )
    VALUES (
        NEW.id,
        NEW.title,
        NEW.content,
        COALESCE((
            SELECT MAX(version_number) + 1 
            FROM public.handbook_section_history 
            WHERE section_id = NEW.id
        ), 1),
        auth.uid(),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'created'
            ELSE 'updated'
        END,
        now()
    );
    RETURN NEW;
END;
$$;

-- 3. Fix get_user_organization_id function
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS BIGINT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (
        SELECT organization_id 
        FROM public.user_organizations 
        WHERE user_id = auth.uid() 
        LIMIT 1
    );
END;
$$;

-- 4. Fix meets_role_requirement function
CREATE OR REPLACE FUNCTION public.meets_role_requirement(required_role TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_access RECORD;
    role_hierarchy INTEGER;
    required_hierarchy INTEGER;
BEGIN
    -- Get user's role and org
    SELECT * INTO user_access FROM public.get_user_handbook_access() LIMIT 1;
    
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
$$;

-- 5. Fix get_user_handbook_access function
CREATE OR REPLACE FUNCTION public.get_user_handbook_access()
RETURNS TABLE(user_role TEXT, organization_id BIGINT) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        uo.role::TEXT as user_role,
        uo.organization_id::BIGINT
    FROM public.user_organizations uo
    WHERE uo.user_id = auth.uid()
    LIMIT 1;
END;
$$;

-- 6. Fix set_trial_start function
CREATE OR REPLACE FUNCTION public.set_trial_start()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Set trial start date when user is first created
    IF NEW.trial_start IS NULL THEN
        NEW.trial_start = now();
        NEW.trial_end = now() + interval '7 days';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Add security comments
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger function to update updated_at timestamp - secure search path';
COMMENT ON FUNCTION public.track_handbook_section_changes() IS 'Tracks handbook section changes for audit trail - secure search path';
COMMENT ON FUNCTION public.get_user_organization_id() IS 'Gets current user organization ID - secure search path';
COMMENT ON FUNCTION public.meets_role_requirement(TEXT) IS 'Checks if user meets role requirement - secure search path';
COMMENT ON FUNCTION public.get_user_handbook_access() IS 'Gets user handbook access info - secure search path';
COMMENT ON FUNCTION public.set_trial_start() IS 'Sets trial period for new users - secure search path';

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_handbook_section_changes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.meets_role_requirement(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_handbook_access() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_trial_start() TO authenticated;
