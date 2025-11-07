-- Drop existing policies
DROP POLICY IF EXISTS "uo_select_same_org" ON public.user_organizations;
DROP POLICY IF EXISTS "uo_insert_admins" ON public.user_organizations;
DROP POLICY IF EXISTS "uo_update_admins" ON public.user_organizations;
DROP POLICY IF EXISTS "uo_delete_admins" ON public.user_organizations;

-- SELECT: Users can read members of orgs they belong to
CREATE POLICY "uo_select_same_org"
ON public.user_organizations
FOR SELECT TO authenticated
USING (
  -- Can see yourself
  user_id = (SELECT auth.uid()) 
  OR
  -- Can see other members in your orgs
  organization_id IN (
    SELECT organization_id
    FROM public.user_organizations
    WHERE user_id = (SELECT auth.uid())
  )
);

-- INSERT: Admins and owners can add members to their org
CREATE POLICY "uo_insert_admins"
ON public.user_organizations
FOR INSERT TO authenticated
WITH CHECK (
  -- Must be admin or owner of the org you're adding to
  EXISTS (
    SELECT 1
    FROM public.user_organizations AS me
    WHERE me.user_id = (SELECT auth.uid())
      AND me.organization_id = user_organizations.organization_id
      AND me.role IN ('owner','admin')
  )
);

-- UPDATE: Admins can update members, only owners can promote to owner
CREATE POLICY "uo_update_admins"
ON public.user_organizations
FOR UPDATE TO authenticated
USING (
  -- Must be admin or owner of this org
  organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = (SELECT auth.uid()) AND role IN ('owner','admin')
  )
)
WITH CHECK (
  -- Keep updates within same org
  organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = (SELECT auth.uid()) AND role IN ('owner','admin')
  )
  AND (
    -- Only owners can set role='owner'
    user_organizations.role <> 'owner' OR
    EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_id = (SELECT auth.uid())
        AND organization_id = user_organizations.organization_id
        AND role = 'owner'
    )
  )
);

-- DELETE: Admins can remove members, but can't delete last owner
CREATE POLICY "uo_delete_admins"
ON public.user_organizations
FOR DELETE TO authenticated
USING (
  -- Must be admin or owner of this org
  organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = (SELECT auth.uid()) AND role IN ('owner','admin')
  )
  AND NOT (
    -- Block deleting last owner
    role = 'owner' AND
    (SELECT COUNT(*) FROM public.user_organizations
      WHERE organization_id = user_organizations.organization_id
        AND role = 'owner') = 1
  )
);
