-- Update Alpha Node Deployment Milestone
-- Decision: December 30, 2025 Board Meeting (Minutes v2.5)
-- Original Date: January 18, 2026
-- New Date: April 1, 2026
-- Reason: Driver stability and firmware development requirements

-- Insert or update Alpha Node deployment milestone
INSERT INTO public.system_config (key, value, description, updated_at)
VALUES (
  'alpha_node_deployment_date',
  '2026-04-01'::jsonb,
  'Alpha Node (RTX 5090 PC) deployment target date - Updated Dec 30, 2025 from Jan 18, 2026 due to driver stability concerns'::text,
  NOW()
)
ON CONFLICT (key) 
DO UPDATE SET 
  value = '2026-04-01'::jsonb,
  description = 'Alpha Node (RTX 5090 PC) deployment target date - Updated Dec 30, 2025 from Jan 18, 2026 due to driver stability concerns'::text,
  updated_at = NOW();

-- Insert deployment history record
INSERT INTO public.system_config (key, value, description, updated_at)
VALUES (
  'alpha_node_deployment_history',
  jsonb_build_object(
    'original_date', '2026-01-18',
    'current_date', '2026-04-01',
    'decision_date', '2025-12-30',
    'reason', 'Driver stability and firmware development requirements',
    'budget_increase', jsonb_build_object(
      'firmware', 2500,
      'testing', 1000,
      'total', 3500
    ),
    'total_budget', 9700,
    'status', 'DELAYED',
    'infrastructure_ready', true,
    'board_meeting', 'M-20251230',
    'minutes_version', 'v2.5'
  ),
  'Alpha Node deployment timeline history and decision rationale'::text,
  NOW()
)
ON CONFLICT (key)
DO UPDATE SET
  value = jsonb_build_object(
    'original_date', '2026-01-18',
    'current_date', '2026-04-01',
    'decision_date', '2025-12-30',
    'reason', 'Driver stability and firmware development requirements',
    'budget_increase', jsonb_build_object(
      'firmware', 2500,
      'testing', 1000,
      'total', 3500
    ),
    'total_budget', 9700,
    'status', 'DELAYED',
    'infrastructure_ready', true,
    'board_meeting', 'M-20251230',
    'minutes_version', 'v2.5'
  ),
  updated_at = NOW();

-- Insert Alpha Node readiness checklist
INSERT INTO public.system_config (key, value, description, updated_at)
VALUES (
  'alpha_node_readiness_checklist',
  jsonb_build_object(
    'infrastructure_code', jsonb_build_object(
      'docker_compose', true,
      'local_inference_service', true,
      'sovereign_export_script', true,
      'env_variables', true,
      'status', 'COMPLETE'
    ),
    'system_prerequisites', jsonb_build_object(
      'telemetry_infrastructure', true,
      'rls_policies', true,
      'roman_autonomy', true,
      'financial_tracking', true,
      'status', 'COMPLETE'
    ),
    'pending_development', jsonb_build_object(
      'thermal_monitoring', false,
      'gpu_telemetry', false,
      'failover_logic', false,
      'performance_baselines', false,
      'driver_validation', false,
      'status', 'Q1_2026'
    ),
    'go_live_date', '2026-04-01',
    'last_updated', '2025-12-30'
  ),
  'Alpha Node deployment readiness status and checklist'::text,
  NOW()
)
ON CONFLICT (key)
DO UPDATE SET
  value = jsonb_build_object(
    'infrastructure_code', jsonb_build_object(
      'docker_compose', true,
      'local_inference_service', true,
      'sovereign_export_script', true,
      'env_variables', true,
      'status', 'COMPLETE'
    ),
    'system_prerequisites', jsonb_build_object(
      'telemetry_infrastructure', true,
      'rls_policies', true,
      'roman_autonomy', true,
      'financial_tracking', true,
      'status', 'COMPLETE'
    ),
    'pending_development', jsonb_build_object(
      'thermal_monitoring', false,
      'gpu_telemetry', false,
      'failover_logic', false,
      'performance_baselines', false,
      'driver_validation', false,
      'status', 'Q1_2026'
    ),
    'go_live_date', '2026-04-01',
    'last_updated', '2025-12-30'
  ),
  updated_at = NOW();

-- Verify the updates
SELECT 
  key,
  value,
  description,
  updated_at
FROM public.system_config
WHERE key LIKE 'alpha_node%'
ORDER BY key;
