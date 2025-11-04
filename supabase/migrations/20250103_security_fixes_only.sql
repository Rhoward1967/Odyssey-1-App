-- Fix function search path security warnings only
-- Set search_path to prevent SQL injection vulnerabilities

-- Fix all functions with mutable search paths
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_handbook_access() TO authenticated;
