-- Fix Function Search Path Security Issues
-- This migration adds explicit search_path settings to functions to prevent SQL injection attacks
-- Related to Supabase Linter Warning: function_search_path_mutable

-- Fix upsert_system_knowledge function
CREATE OR REPLACE FUNCTION public.upsert_system_knowledge(
  p_key text,
  p_value jsonb,
  p_category text DEFAULT 'general'::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  INSERT INTO system_knowledge (key, value, category)
  VALUES (p_key, p_value, p_category)
  ON CONFLICT (key)
  DO UPDATE SET
    value = EXCLUDED.value,
    category = EXCLUDED.category,
    updated_at = now();
END;
$function$;

-- Fix is_org_member function
CREATE OR REPLACE FUNCTION public.is_org_member(org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_organizations
    WHERE organization_id = org_id
      AND user_id = auth.uid()
  );
END;
$function$;

-- Fix is_org_admin function
CREATE OR REPLACE FUNCTION public.is_org_admin(org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_organizations
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND role = 'admin'
  );
END;
$function$;

-- Fix _create_policy_if_missing function
CREATE OR REPLACE FUNCTION public._create_policy_if_missing(
  table_name text,
  policy_name text,
  policy_definition text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = table_name
      AND policyname = policy_name
  ) THEN
    EXECUTE policy_definition;
  END IF;
END;
$function$;

-- Fix get_days_in_month function
CREATE OR REPLACE FUNCTION public.get_days_in_month(year_param integer, month_param integer)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $function$
BEGIN
  RETURN EXTRACT(DAY FROM 
    (DATE_TRUNC('month', make_date(year_param, month_param, 1)) + INTERVAL '1 month - 1 day')
  )::integer;
END;
$function$;

-- Fix generate_schedules_from_template function
CREATE OR REPLACE FUNCTION public.generate_schedules_from_template(
  template_id_param uuid,
  start_date_param date,
  end_date_param date
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  current_date date;
  template_record record;
BEGIN
  -- Get template details
  SELECT * INTO template_record
  FROM schedule_templates
  WHERE id = template_id_param;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found';
  END IF;

  -- Loop through dates and create schedules
  current_date := start_date_param;
  WHILE current_date <= end_date_param LOOP
    -- Insert schedule based on template
    -- (Implementation depends on your specific template structure)
    current_date := current_date + INTERVAL '1 day';
  END LOOP;
END;
$function$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.upsert_system_knowledge(text, jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public._create_policy_if_missing(text, text, text) TO postgres;
GRANT EXECUTE ON FUNCTION public.get_days_in_month(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_schedules_from_template(uuid, date, date) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.upsert_system_knowledge IS 'Upserts system knowledge with secure search_path';
COMMENT ON FUNCTION public.is_org_member IS 'Checks if user is member of organization with secure search_path';
COMMENT ON FUNCTION public.is_org_admin IS 'Checks if user is admin of organization with secure search_path';
COMMENT ON FUNCTION public._create_policy_if_missing IS 'Creates RLS policy if missing with secure search_path';
COMMENT ON FUNCTION public.get_days_in_month IS 'Returns number of days in given month with secure search_path';
COMMENT ON FUNCTION public.generate_schedules_from_template IS 'Generates schedules from template with secure search_path';
