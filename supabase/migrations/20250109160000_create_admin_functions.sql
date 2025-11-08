-- Create is_user_org_admin function
CREATE OR REPLACE FUNCTION public.is_user_org_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_user_org_admin() TO authenticated;

COMMENT ON FUNCTION public.is_user_org_admin() IS 'Check if current user is admin of any organization';
