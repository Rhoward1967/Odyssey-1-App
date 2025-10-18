-- Create feature_flags table and sample data for testing
-- Run this in your Supabase SQL Editor

-- 1. Create the feature_flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT false,
    category VARCHAR(100) DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policy (allow read for authenticated users, admin-only writes)
DROP POLICY IF EXISTS "feature_flags_read_policy" ON public.feature_flags;
CREATE POLICY "feature_flags_read_policy" ON public.feature_flags
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "feature_flags_admin_policy" ON public.feature_flags;
CREATE POLICY "feature_flags_admin_policy" ON public.feature_flags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_super_admin = true
        )
    );

-- 4. Grant permissions
GRANT SELECT ON public.feature_flags TO authenticated;
GRANT ALL ON public.feature_flags TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.feature_flags_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.feature_flags_id_seq TO service_role;

-- 5. Insert sample feature flags for testing
INSERT INTO public.feature_flags (key, description, is_enabled, category) VALUES
    ('admin_control_panel', 'Enable advanced admin control panel features', true, 'System'),
    ('time_clock_management', 'Enable employee time clock management system', true, 'System'),
    ('advanced_ai_features', 'Enable R.O.M.A.N. AI integration and advanced processing', false, 'AI'),
    ('realtime_collaboration', 'Enable real-time collaborative editing and updates', false, 'UI'),
    ('enhanced_security_mode', 'Enable enhanced security protocols and authentication', true, 'Security'),
    ('quantum_processing', 'Enable experimental quantum processing capabilities', false, 'Experimental'),
    ('automated_reporting', 'Enable automated report generation and scheduling', true, 'System'),
    ('dark_mode_ui', 'Enable dark mode interface theming', true, 'UI'),
    ('biometric_auth', 'Enable biometric authentication methods', false, 'Security'),
    ('predictive_analytics', 'Enable AI-powered predictive analytics', false, 'AI')
ON CONFLICT (key) DO NOTHING;

-- 6. Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_feature_flag_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS feature_flags_update_timestamp ON public.feature_flags;
CREATE TRIGGER feature_flags_update_timestamp
    BEFORE UPDATE ON public.feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION public.update_feature_flag_timestamp();

-- 8. Verify the data was inserted correctly
SELECT 
    id, 
    key, 
    description, 
    is_enabled, 
    category, 
    created_at
FROM public.feature_flags 
ORDER BY category, key;