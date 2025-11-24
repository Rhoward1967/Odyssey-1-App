-- R.O.M.A.N. Learning Log Table
-- © 2025 Rickey A Howard. All Rights Reserved.
-- 
-- This table stores every command R.O.M.A.N. processes to enable learning.
-- "The most advanced AI system in the world" learns from experience.

CREATE TABLE IF NOT EXISTS public.roman_learning_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User Intent (what the user asked for)
    user_intent TEXT NOT NULL,
    
    -- Generated Command (what R.O.M.A.N. created)
    generated_command JSONB NOT NULL,
    
    -- Validation Result (was it approved by Logical Hemisphere?)
    validation_result JSONB NOT NULL,
    
    -- Execution Result (did it work?)
    execution_result JSONB,
    
    -- User Feedback (optional - did user confirm success?)
    user_feedback TEXT CHECK (user_feedback IN ('success', 'failure', 'correction')),
    
    -- Confidence Score (how confident was R.O.M.A.N.?)
    confidence_score DECIMAL(3,2) DEFAULT 0.50 CHECK (confidence_score BETWEEN 0 AND 1),
    
    -- Improvement Notes (what can be learned?)
    improvement_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL
);

-- Indexes for fast learning queries
CREATE INDEX IF NOT EXISTS idx_roman_learning_intent ON public.roman_learning_log USING gin(to_tsvector('english', user_intent));
CREATE INDEX IF NOT EXISTS idx_roman_learning_created ON public.roman_learning_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roman_learning_confidence ON public.roman_learning_log(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_roman_learning_command_target ON public.roman_learning_log((generated_command->>'target'));
CREATE INDEX IF NOT EXISTS idx_roman_learning_command_action ON public.roman_learning_log((generated_command->>'action'));

-- Enable Row Level Security
ALTER TABLE public.roman_learning_log ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can see all learning data
CREATE POLICY "Admins can view all learning data" ON public.roman_learning_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_organizations
            WHERE user_organizations.user_id = auth.uid()
            AND user_organizations.role IN ('owner', 'admin')
        )
    );

-- Policy: Users can see their own learning data
CREATE POLICY "Users can view own learning data" ON public.roman_learning_log
    FOR SELECT
    USING (user_id = auth.uid());

-- Policy: System can insert learning data (service role)
CREATE POLICY "System can insert learning data" ON public.roman_learning_log
    FOR INSERT
    WITH CHECK (true);

-- Function to calculate R.O.M.A.N.'s learning progress
CREATE OR REPLACE FUNCTION get_roman_learning_stats()
RETURNS TABLE (
    total_commands BIGINT,
    successful_commands BIGINT,
    success_rate NUMERIC,
    avg_confidence NUMERIC,
    most_used_target TEXT,
    most_used_action TEXT,
    learning_level TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (
                WHERE (validation_result->>'approved')::boolean = true
                AND (execution_result->>'success')::boolean = true
            ) as successful,
            AVG(confidence_score) as avg_conf,
            MODE() WITHIN GROUP (ORDER BY generated_command->>'target') as top_target,
            MODE() WITHIN GROUP (ORDER BY generated_command->>'action') as top_action
        FROM roman_learning_log
        WHERE created_at > NOW() - INTERVAL '30 days'
    )
    SELECT
        stats.total,
        stats.successful,
        CASE 
            WHEN stats.total > 0 THEN ROUND((stats.successful::numeric / stats.total::numeric) * 100, 2)
            ELSE 0
        END as success_rate,
        ROUND(stats.avg_conf, 2),
        stats.top_target,
        stats.top_action,
        CASE
            WHEN stats.total > 1000 THEN 'EXPERT'
            WHEN stats.total > 500 THEN 'ADVANCED'
            WHEN stats.total > 100 THEN 'EXPERIENCED'
            WHEN stats.total > 20 THEN 'LEARNING'
            ELSE 'NOVICE'
        END as learning_level
    FROM stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_roman_learning_stats() TO authenticated;

-- Comment on table
COMMENT ON TABLE public.roman_learning_log IS 'Stores R.O.M.A.N. command history for adaptive learning. Every command processed is recorded to enable intelligence improvement over time.';

-- Comment on columns
COMMENT ON COLUMN public.roman_learning_log.user_intent IS 'Original natural language request from user';
COMMENT ON COLUMN public.roman_learning_log.generated_command IS 'R.O.M.A.N.-generated structured command';
COMMENT ON COLUMN public.roman_learning_log.validation_result IS 'Result from Logical Hemisphere validation';
COMMENT ON COLUMN public.roman_learning_log.execution_result IS 'Result from Execution Engine';
COMMENT ON COLUMN public.roman_learning_log.confidence_score IS 'R.O.M.A.N. confidence in command generation (0-1)';
COMMENT ON COLUMN public.roman_learning_log.improvement_notes IS 'Notes on how to improve similar commands in future';
