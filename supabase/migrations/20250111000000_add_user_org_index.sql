-- Add composite index on user_organizations for performance
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_org 
ON user_organizations(user_id, organization_id);

-- Add index for organization lookups
CREATE INDEX IF NOT EXISTS idx_user_organizations_org 
ON user_organizations(organization_id);

-- Verify indexes created
DO $$
BEGIN
  RAISE NOTICE 'User organizations indexes created for optimal performance';
END $$;
