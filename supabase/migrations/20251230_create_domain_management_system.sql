-- Domain Management System for Multi-Tenant Operations
-- Odyssey-1 AI LLC manages multiple business entities via custom domains
-- Date: December 30, 2025

-- Create domains table
CREATE TABLE IF NOT EXISTS public.integrated_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_name TEXT NOT NULL UNIQUE,
  entity_name TEXT NOT NULL, -- e.g., "HJS SERVICES LLC"
  dba_name TEXT, -- "Howard Janitorial Services"
  business_type TEXT, -- "janitorial", "consulting", etc.
  theme_config JSONB DEFAULT '{}', -- Custom theme settings
  
  -- SSL/TLS Configuration
  ssl_status TEXT DEFAULT 'pending', -- pending, active, failed
  ssl_certificate_id TEXT,
  ssl_issued_at TIMESTAMPTZ,
  ssl_expires_at TIMESTAMPTZ,
  
  -- DNS Configuration
  dns_status TEXT DEFAULT 'pending', -- pending, propagating, active, failed
  dns_verified_at TIMESTAMPTZ,
  dns_records JSONB DEFAULT '[]', -- Required DNS records
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, active, inactive, suspended
  activated_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Business data reference
  organization_id UUID REFERENCES public.organizations(id),
  
  -- Contact info
  primary_color TEXT DEFAULT '#3B82F6',
  logo_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  CONSTRAINT valid_ssl_status CHECK (ssl_status IN ('pending', 'active', 'failed', 'expired')),
  CONSTRAINT valid_dns_status CHECK (dns_status IN ('pending', 'propagating', 'active', 'failed')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'inactive', 'suspended'))
);

-- Create index on domain lookups (performance critical)
CREATE INDEX idx_integrated_domains_domain ON public.integrated_domains(domain_name);
CREATE INDEX idx_integrated_domains_status ON public.integrated_domains(status) WHERE status = 'active';
CREATE INDEX idx_integrated_domains_org ON public.integrated_domains(organization_id);

-- Create domain activity log
CREATE TABLE IF NOT EXISTS public.domain_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES public.integrated_domains(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- dns_check, ssl_renewal, status_change, etc.
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_domain_activity_domain ON public.domain_activity_log(domain_id, created_at DESC);

-- Function to update domain timestamp
CREATE OR REPLACE FUNCTION update_domain_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_domain_timestamp
  BEFORE UPDATE ON public.integrated_domains
  FOR EACH ROW
  EXECUTE FUNCTION update_domain_timestamp();

-- Insert HJS Services LLC domain
INSERT INTO public.integrated_domains (
  domain_name,
  entity_name,
  dba_name,
  business_type,
  status,
  dns_status,
  ssl_status,
  primary_color,
  contact_email,
  contact_phone,
  theme_config,
  dns_records
) VALUES (
  'howardjanitorial.net',
  'HJS SERVICES LLC',
  'Howard Janitorial Services',
  'janitorial',
  'pending', -- Waiting for DNS activation
  'pending', -- DNS needs verification
  'pending', -- SSL will be issued after DNS
  '#059669', -- Green for janitorial
  'hr@howardjanitorial.com',
  '800-403-8492',
  jsonb_build_object(
    'hero_title', 'Professional Janitorial Services',
    'hero_subtitle', 'Athens, GA & Surrounding Areas',
    'services', jsonb_build_array(
      'Commercial Cleaning',
      'Office Maintenance',
      'Floor Care',
      'Window Cleaning',
      'Post-Construction Cleanup'
    ),
    'business_hours', jsonb_build_object(
      'monday', '8:00 AM - 6:00 PM',
      'tuesday', '8:00 AM - 6:00 PM',
      'wednesday', '8:00 AM - 6:00 PM',
      'thursday', '8:00 AM - 6:00 PM',
      'friday', '8:00 AM - 6:00 PM',
      'saturday', '9:00 AM - 2:00 PM',
      'sunday', 'Closed'
    )
  ),
  jsonb_build_array(
    jsonb_build_object(
      'type', 'A',
      'name', '@',
      'value', '76.76.21.21', -- Vercel IP (example - replace with actual)
      'ttl', 300
    ),
    jsonb_build_object(
      'type', 'CNAME',
      'name', 'www',
      'value', 'cname.vercel-dns.com', -- Replace with actual Vercel CNAME
      'ttl', 300
    )
  )
)
ON CONFLICT (domain_name) DO UPDATE SET
  updated_at = NOW(),
  theme_config = EXCLUDED.theme_config,
  dns_records = EXCLUDED.dns_records;

-- RLS Policies
ALTER TABLE public.integrated_domains ENABLE ROW LEVEL SECURITY;

-- Admins can manage all domains
CREATE POLICY "integrated_domains_admin_all"
  ON public.integrated_domains
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Users can view active domains
CREATE POLICY "integrated_domains_view_active"
  ON public.integrated_domains
  FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Activity log RLS
ALTER TABLE public.domain_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "domain_activity_admin_all"
  ON public.domain_activity_log
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Function to log domain activity
CREATE OR REPLACE FUNCTION log_domain_activity(
  p_domain_id UUID,
  p_activity_type TEXT,
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.domain_activity_log (domain_id, activity_type, details)
  VALUES (p_domain_id, p_activity_type, p_details)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION log_domain_activity TO authenticated, service_role;

-- Function to check DNS status (called by edge function)
CREATE OR REPLACE FUNCTION check_domain_dns_status(p_domain_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_domain RECORD;
  v_result JSONB;
BEGIN
  SELECT * INTO v_domain
  FROM public.integrated_domains
  WHERE domain_name = p_domain_name;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Domain not found'
    );
  END IF;
  
  -- Return current status (actual DNS check happens in edge function)
  v_result := jsonb_build_object(
    'success', true,
    'domain', v_domain.domain_name,
    'dns_status', v_domain.dns_status,
    'ssl_status', v_domain.ssl_status,
    'status', v_domain.status,
    'dns_records', v_domain.dns_records
  );
  
  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION check_domain_dns_status TO authenticated, service_role;

-- Comments
COMMENT ON TABLE public.integrated_domains IS 'Multi-tenant domain management for Odyssey-1 AI LLC business entities';
COMMENT ON TABLE public.domain_activity_log IS 'Activity tracking for domain configuration changes';
COMMENT ON FUNCTION log_domain_activity IS 'Log domain-related activities (DNS checks, SSL renewals, etc.)';
COMMENT ON FUNCTION check_domain_dns_status IS 'Check DNS propagation and SSL status for a domain';
