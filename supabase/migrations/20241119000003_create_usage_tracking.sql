-- Usage Tracking & Cost Management System
-- Enterprise-grade usage tracking with dynamic pricing

-- Subscription Tiers Table
CREATE TABLE IF NOT EXISTS subscription_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_name TEXT NOT NULL UNIQUE,
    tier_level INTEGER NOT NULL UNIQUE CHECK (tier_level >= 0),
    monthly_price_usd DECIMAL(10, 2) NOT NULL,
    
    -- Feature Limits
    document_reviews_per_month INTEGER NOT NULL,
    storage_gb DECIMAL(10, 2) NOT NULL,
    academic_searches_per_month INTEGER NOT NULL,
    max_study_groups INTEGER NOT NULL,
    video_minutes_per_month INTEGER NOT NULL,
    
    -- Overage Costs (per unit beyond limit)
    overage_document_review_usd DECIMAL(10, 4) DEFAULT 0.10,
    overage_storage_gb_usd DECIMAL(10, 4) DEFAULT 2.00,
    overage_search_usd DECIMAL(10, 4) DEFAULT 0.01,
    overage_video_minute_usd DECIMAL(10, 4) DEFAULT 0.05,
    
    -- Features
    priority_support BOOLEAN DEFAULT FALSE,
    api_access BOOLEAN DEFAULT FALSE,
    custom_branding BOOLEAN DEFAULT FALSE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default tiers
INSERT INTO subscription_tiers (tier_name, tier_level, monthly_price_usd, document_reviews_per_month, storage_gb, academic_searches_per_month, max_study_groups, video_minutes_per_month, priority_support, api_access) VALUES
('free', 0, 0.00, 5, 0.1, 20, 2, 30, FALSE, FALSE),
('student', 1, 9.99, 50, 1.0, 100, 10, 600, FALSE, FALSE),
('professional', 2, 29.99, 500, 10.0, 1000, 50, 3000, TRUE, TRUE),
('enterprise', 3, 99.99, 5000, 100.0, 10000, 999, 18000, TRUE, TRUE)
ON CONFLICT (tier_name) DO NOTHING;

-- Cost Tracking Table (tracks actual costs from providers)
CREATE TABLE IF NOT EXISTS provider_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name TEXT NOT NULL, -- 'openai', 'supabase_storage', 'serp_api', etc.
    cost_category TEXT NOT NULL, -- 'ai_api', 'storage', 'search', 'bandwidth'
    
    -- Cost per unit
    cost_per_unit_usd DECIMAL(10, 6) NOT NULL,
    unit_type TEXT NOT NULL, -- 'token', 'gb', 'request', 'minute'
    
    -- Regional adjustments
    region TEXT DEFAULT 'us', -- 'us', 'eu', 'asia'
    
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expires_date DATE,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert current provider costs (Nov 2024 rates)
INSERT INTO provider_costs (provider_name, cost_category, cost_per_unit_usd, unit_type, notes) VALUES
('openai_gpt4', 'ai_api', 0.00003, 'token', 'GPT-4 Turbo input tokens'),
('openai_gpt4_output', 'ai_api', 0.00006, 'token', 'GPT-4 Turbo output tokens'),
('openai_gpt35', 'ai_api', 0.0000015, 'token', 'GPT-3.5 Turbo input tokens'),
('supabase_storage', 'storage', 0.021, 'gb_month', 'Storage per GB per month'),
('supabase_bandwidth', 'bandwidth', 0.09, 'gb', 'Bandwidth per GB'),
('serp_api', 'search', 0.001, 'request', 'Google Scholar search via SerpAPI'),
('twilio_video', 'video', 0.004, 'minute', 'Video relay per participant minute')
ON CONFLICT DO NOTHING;

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES subscription_tiers(id),
    
    -- Billing
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
    
    -- Dates
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '1 month',
    trial_end TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    -- Tax
    tax_rate DECIMAL(5, 4) DEFAULT 0.0, -- e.g., 0.0875 for 8.75%
    tax_region TEXT, -- 'US-CA', 'US-NY', 'EU-DE', etc.
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Usage Tracking Table
CREATE TABLE IF NOT EXISTS user_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Billing Period
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Usage Counters
    document_reviews_count INTEGER DEFAULT 0,
    storage_used_bytes BIGINT DEFAULT 0,
    academic_searches_count INTEGER DEFAULT 0,
    study_groups_count INTEGER DEFAULT 0,
    video_minutes_used INTEGER DEFAULT 0,
    
    -- Detailed Cost Tracking
    ai_tokens_used BIGINT DEFAULT 0,
    ai_cost_usd DECIMAL(10, 4) DEFAULT 0.00,
    storage_cost_usd DECIMAL(10, 4) DEFAULT 0.00,
    search_cost_usd DECIMAL(10, 4) DEFAULT 0.00,
    video_cost_usd DECIMAL(10, 4) DEFAULT 0.00,
    
    -- Total Cost
    total_cost_usd DECIMAL(10, 4) DEFAULT 0.00,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, period_start)
);

CREATE INDEX idx_user_usage_user_period ON user_usage(user_id, period_start);
CREATE INDEX idx_user_subscriptions_user ON user_subscriptions(user_id);

-- Usage Events Table (detailed audit log)
CREATE TABLE IF NOT EXISTS usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    event_type TEXT NOT NULL, -- 'document_review', 'file_upload', 'academic_search', 'video_call'
    resource_id TEXT, -- ID of the document, file, etc.
    
    -- Cost Details
    units_consumed DECIMAL(10, 4), -- tokens, bytes, minutes, etc.
    unit_type TEXT,
    cost_usd DECIMAL(10, 6),
    
    metadata JSONB, -- Additional event details
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_events_user_type ON usage_events(user_id, event_type, created_at);

-- Tax Rates Table (dynamically updateable)
CREATE TABLE IF NOT EXISTS tax_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    region_code TEXT NOT NULL UNIQUE, -- 'US-CA', 'US-NY', 'EU-DE', etc.
    region_name TEXT NOT NULL,
    country_code TEXT NOT NULL, -- 'US', 'CA', 'GB', etc.
    
    -- Tax Details
    tax_rate DECIMAL(5, 4) NOT NULL, -- 0.0875 for 8.75%
    tax_type TEXT NOT NULL, -- 'sales_tax', 'vat', 'gst'
    
    -- Thresholds
    applies_to_digital_services BOOLEAN DEFAULT TRUE,
    minimum_transaction_usd DECIMAL(10, 2) DEFAULT 0.00,
    
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expires_date DATE,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert common US tax rates (2024)
INSERT INTO tax_rates (region_code, region_name, country_code, tax_rate, tax_type, notes) VALUES
('US-CA', 'California', 'US', 0.0775, 'sales_tax', 'Base rate, varies by county'),
('US-NY', 'New York', 'US', 0.0875, 'sales_tax', 'NYC rate'),
('US-TX', 'Texas', 'US', 0.0825, 'sales_tax', 'State rate'),
('US-FL', 'Florida', 'US', 0.0700, 'sales_tax', 'State rate'),
('US-WA', 'Washington', 'US', 0.0920, 'sales_tax', 'Seattle area'),
('EU-DE', 'Germany', 'EU', 0.1900, 'vat', 'Standard VAT rate'),
('EU-GB', 'United Kingdom', 'EU', 0.2000, 'vat', 'Standard VAT rate'),
('CA-ON', 'Ontario', 'CA', 0.1300, 'gst', 'HST combined rate')
ON CONFLICT (region_code) DO NOTHING;

-- RLS Policies
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;

-- Everyone can view subscription tiers
CREATE POLICY "Anyone can view subscription tiers"
    ON subscription_tiers FOR SELECT
    TO authenticated
    USING (is_active = TRUE);

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
    ON user_subscriptions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can view their own usage
CREATE POLICY "Users can view own usage"
    ON user_usage FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can view their own usage events
CREATE POLICY "Users can view own usage events"
    ON usage_events FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Everyone can view provider costs (transparency!)
CREATE POLICY "Anyone can view provider costs"
    ON provider_costs FOR SELECT
    TO authenticated
    USING (expires_date IS NULL OR expires_date > CURRENT_DATE);

-- Everyone can view tax rates
CREATE POLICY "Anyone can view tax rates"
    ON tax_rates FOR SELECT
    TO authenticated
    USING (expires_date IS NULL OR expires_date > CURRENT_DATE);

-- Functions

-- Get current user tier with limits
CREATE OR REPLACE FUNCTION get_user_tier_limits(user_uuid UUID)
RETURNS TABLE (
    tier_name TEXT,
    document_reviews_limit INTEGER,
    storage_gb_limit DECIMAL,
    searches_limit INTEGER,
    study_groups_limit INTEGER,
    video_minutes_limit INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        st.tier_name,
        st.document_reviews_per_month,
        st.storage_gb,
        st.academic_searches_per_month,
        st.max_study_groups,
        st.video_minutes_per_month
    FROM user_subscriptions us
    JOIN subscription_tiers st ON us.tier_id = st.id
    WHERE us.user_id = user_uuid
    AND us.status = 'active';
END;
$$;

-- Get current period usage
CREATE OR REPLACE FUNCTION get_current_usage(user_uuid UUID)
RETURNS TABLE (
    document_reviews INTEGER,
    storage_bytes BIGINT,
    searches INTEGER,
    study_groups INTEGER,
    video_minutes INTEGER,
    total_cost DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        uu.document_reviews_count,
        uu.storage_used_bytes,
        uu.academic_searches_count,
        uu.study_groups_count,
        uu.video_minutes_used,
        uu.total_cost_usd
    FROM user_usage uu
    WHERE uu.user_id = user_uuid
    AND NOW() BETWEEN uu.period_start AND uu.period_end;
END;
$$;

-- Check if user can perform action (quota check)
CREATE OR REPLACE FUNCTION can_perform_action(
    user_uuid UUID,
    action_type TEXT -- 'document_review', 'file_upload', 'search', 'video'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_count INTEGER;
    limit_count INTEGER;
BEGIN
    -- Get current usage
    CASE action_type
        WHEN 'document_review' THEN
            SELECT document_reviews_count INTO current_count FROM user_usage
            WHERE user_id = user_uuid AND NOW() BETWEEN period_start AND period_end;
            
            SELECT document_reviews_per_month INTO limit_count FROM subscription_tiers st
            JOIN user_subscriptions us ON us.tier_id = st.id
            WHERE us.user_id = user_uuid AND us.status = 'active';
            
        WHEN 'search' THEN
            SELECT academic_searches_count INTO current_count FROM user_usage
            WHERE user_id = user_uuid AND NOW() BETWEEN period_start AND period_end;
            
            SELECT academic_searches_per_month INTO limit_count FROM subscription_tiers st
            JOIN user_subscriptions us ON us.tier_id = st.id
            WHERE us.user_id = user_uuid AND us.status = 'active';
    END CASE;
    
    -- If unlimited (-1) or under limit
    RETURN (limit_count = -1 OR current_count < limit_count);
END;
$$;

-- Calculate overage charges
CREATE OR REPLACE FUNCTION calculate_overage_charges(user_uuid UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    overage_cost DECIMAL := 0.00;
    usage_record RECORD;
    tier_record RECORD;
BEGIN
    -- Get current usage
    SELECT * INTO usage_record FROM user_usage
    WHERE user_id = user_uuid
    AND NOW() BETWEEN period_start AND period_end;
    
    -- Get tier limits
    SELECT st.* INTO tier_record 
    FROM subscription_tiers st
    JOIN user_subscriptions us ON us.tier_id = st.id
    WHERE us.user_id = user_uuid AND us.status = 'active';
    
    -- Calculate overages
    IF usage_record.document_reviews_count > tier_record.document_reviews_per_month THEN
        overage_cost := overage_cost + 
            (usage_record.document_reviews_count - tier_record.document_reviews_per_month) * 
            tier_record.overage_document_review_usd;
    END IF;
    
    IF (usage_record.storage_used_bytes::DECIMAL / 1073741824) > tier_record.storage_gb THEN
        overage_cost := overage_cost + 
            ((usage_record.storage_used_bytes::DECIMAL / 1073741824) - tier_record.storage_gb) * 
            tier_record.overage_storage_gb_usd;
    END IF;
    
    RETURN overage_cost;
END;
$$;

COMMENT ON TABLE subscription_tiers IS 'Subscription tier definitions with feature limits';
COMMENT ON TABLE user_subscriptions IS 'User subscription records with billing details';
COMMENT ON TABLE user_usage IS 'Monthly usage tracking per user';
COMMENT ON TABLE usage_events IS 'Detailed audit log of all billable events';
COMMENT ON TABLE provider_costs IS 'Actual costs from third-party providers';
COMMENT ON TABLE tax_rates IS 'Regional tax rates for billing';
