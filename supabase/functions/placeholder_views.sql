-- Placeholder view for company_bank_accounts
CREATE OR REPLACE VIEW public.company_bank_accounts AS
SELECT NULL::uuid AS id, NULL::bigint AS organization_id, NULL::boolean AS is_active, now() AS created_at WHERE false;

-- Placeholder view for stripe_events
CREATE OR REPLACE VIEW public.stripe_events AS
SELECT NULL::uuid AS id, NULL::text AS event_type, now() AS created_at WHERE false;

-- Placeholder view for cost_metrics
CREATE OR REPLACE VIEW public.cost_metrics AS
SELECT NULL::uuid AS id, NULL::bigint AS organization_id, NULL::numeric AS cost, now() AS created_at WHERE false;

-- Placeholder view for governance_log
CREATE OR REPLACE VIEW public.governance_log AS
SELECT NULL::uuid AS id, NULL::text AS action, now() AS created_at WHERE false;

-- Placeholder view for handbook_content
CREATE OR REPLACE VIEW public.handbook_content AS
SELECT NULL::uuid AS id, NULL::text AS content, now() AS created_at WHERE false;
