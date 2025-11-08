-- Create is_user_org_admin function with security hardening
CREATE OR REPLACE FUNCTION public.is_user_org_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_organizations
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner')
  );
END;
$$;

-- Create is_user_org_owner function with security hardening
CREATE OR REPLACE FUNCTION public.is_user_org_owner()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_organizations
    WHERE user_id = auth.uid()
      AND role = 'owner'
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_user_org_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_org_owner() TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.is_user_org_admin() IS 'Check if current user is admin of any organization. Security hardened with fixed search_path.';
COMMENT ON FUNCTION public.is_user_org_owner() IS 'Check if current user is owner of any organization. Security hardened with fixed search_path.';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_organizations_role 
ON public.user_organizations(role);
