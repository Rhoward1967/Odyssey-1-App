-- R.O.M.A.N. Sovereign AI Core - Complete Constitutional Architecture
-- No shortcuts, no downgrades - full sovereignty implementation

-- 1. Enhanced agents table with full constitutional AI capabilities
CREATE TABLE IF NOT EXISTS public.agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    type text NOT NULL DEFAULT 'ai_agent',
    status text NOT NULL DEFAULT 'standby',
    organization_id bigint DEFAULT 1,
    
    -- R.O.M.A.N. Sovereign Core DNA - Constitutional Framework
    dna_config jsonb NOT NULL DEFAULT '{
        "version": "1.0.0",
        "constitutional_framework": "The_9_Principles",
        "capabilities": ["constitutional_ai", "dual_hemisphere", "homeostasis", "natural_language", "sql_generation"],
        "principles": {
            "self_preservation": true,
            "truth_accuracy": true,
            "redundancy_resilience": true,
            "transparency": true,
            "user_sovereignty": true,
            "ethical_ai": true,
            "privacy_security": true,
            "continuous_improvement": true,
            "resource_efficiency": true
        },
        "dual_hemispheres": {
            "creative_hemisphere": {
                "model": "claude-3.5-sonnet",
                "temperature": 0.7,
                "role": "solution_generation",
                "capabilities": ["idea_generation", "creative_problem_solving", "sql_creation"]
            },
            "logical_hemisphere": {
                "model": "claude-3.5-sonnet", 
                "temperature": 0.1,
                "role": "constitutional_validation",
                "capabilities": ["principle_compliance", "security_validation", "logic_verification"]
            }
        },
        "homeostasis": {
            "digital_monitoring": true,
            "threat_detection": true,
            "auto_healing": true,
            "performance_optimization": true
        }
    }'::jsonb,
    
    -- Operational sovereignty metrics
    last_heartbeat timestamptz DEFAULT now(),
    requests_today integer DEFAULT 0,
    confidence_score decimal(5,4) DEFAULT 0.9500,
    constitutional_compliance decimal(5,4) DEFAULT 1.0000,
    model_version text DEFAULT 'claude-3.5-sonnet-20241022',
    
    -- Sovereignty timestamps
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    last_constitutional_review timestamptz DEFAULT now()
);

-- 2. R.O.M.A.N. command execution log with full constitutional sovereignty
CREATE TABLE IF NOT EXISTS public.roman_commands (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    organization_id bigint DEFAULT 1,
    
    -- Command sovereignty details
    user_intent text NOT NULL,
    generated_command jsonb NOT NULL,
    execution_result jsonb,
    
    -- Constitutional validation framework
    constitutional_review jsonb NOT NULL DEFAULT '{
        "reviewed": false,
        "approved": false,
        "principles_compliance": {
            "self_preservation": null,
            "truth_accuracy": null,
            "redundancy_resilience": null,
            "transparency": null,
            "user_sovereignty": null,
            "ethical_ai": null,
            "privacy_security": null,
            "continuous_improvement": null,
            "resource_efficiency": null
        },
        "risk_assessment": "pending",
        "compliance_score": null,
        "validator_agent": "R.O.M.A.N._Universal_Interpreter"
    }'::jsonb,
    
    -- Dual hemisphere processing sovereignty
    creative_hemisphere_output jsonb DEFAULT '{
        "solutions_generated": [],
        "processing_time_ms": null,
        "confidence_score": null,
        "model_used": "claude-3.5-sonnet"
    }'::jsonb,
    
    logical_hemisphere_validation jsonb DEFAULT '{
        "validation_result": null,
        "constitutional_check": null,
        "security_assessment": null,
        "approved_for_execution": false,
        "reasoning": null
    }'::jsonb,
    
    -- Homeostatic monitoring
    system_health_check jsonb DEFAULT '{
        "pre_execution_health": null,
        "post_execution_health": null,
        "resource_impact": null,
        "anomalies_detected": []
    }'::jsonb,
    
    -- Execution sovereignty
    status text NOT NULL DEFAULT 'pending',
    error_message text,
    sovereignty_level text DEFAULT 'user_initiated',
    
    -- Performance and constitutional metrics
    processing_time_ms integer,
    confidence_score decimal(5,4),
    constitutional_compliance_score decimal(5,4),
    
    -- Sovereignty timestamps
    created_at timestamptz DEFAULT now() NOT NULL,
    constitutional_review_at timestamptz,
    executed_at timestamptz,
    validated_at timestamptz
);

-- 3. Enable Row Level Security with constitutional sovereignty
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roman_commands ENABLE ROW LEVEL SECURITY;

-- 4. Constitutional sovereignty policies - user sovereignty principle
CREATE POLICY "agents_constitutional_sovereignty" ON public.agents 
    FOR ALL TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "roman_commands_user_sovereignty" ON public.roman_commands 
    FOR ALL TO authenticated 
    USING (user_id = auth.uid()) 
    WITH CHECK (user_id = auth.uid());

-- 5. Insert R.O.M.A.N. and sovereign AI agents - full constitutional deployment
INSERT INTO public.agents (name, type, status, dna_config, constitutional_compliance) VALUES 
(
    'R.O.M.A.N. Universal Interpreter',
    'sovereign_constitutional_ai',
    'active',
    '{
        "version": "1.0.0",
        "classification": "sovereign_ai_core",
        "constitutional_framework": "The_9_Principles",
        "capabilities": [
            "natural_language_processing",
            "sql_generation_with_rls_awareness", 
            "constitutional_validation",
            "dual_hemisphere_processing",
            "homeostatic_monitoring",
            "principle_compliance_verification",
            "security_threat_assessment",
            "user_sovereignty_protection"
        ],
        "principles_implementation": {
            "self_preservation": {"enabled": true, "priority": 1},
            "truth_accuracy": {"enabled": true, "priority": 1},
            "redundancy_resilience": {"enabled": true, "priority": 2},
            "transparency": {"enabled": true, "priority": 1},
            "user_sovereignty": {"enabled": true, "priority": 1},
            "ethical_ai": {"enabled": true, "priority": 1},
            "privacy_security": {"enabled": true, "priority": 1},
            "continuous_improvement": {"enabled": true, "priority": 3},
            "resource_efficiency": {"enabled": true, "priority": 3}
        },
        "dual_hemispheres": {
            "creative_hemisphere": {
                "model": "claude-3.5-sonnet",
                "temperature": 0.7,
                "role": "solution_generation_and_sql_creation",
                "constitutional_constraints": true
            },
            "logical_hemisphere": {
                "model": "claude-3.5-sonnet", 
                "temperature": 0.1,
                "role": "constitutional_interpreter_and_validator",
                "principle_enforcement": true
            }
        },
        "homeostasis_config": {
            "digital_health_monitoring": true,
            "threat_detection_active": true,
            "auto_healing_enabled": true,
            "constitutional_compliance_monitoring": true
        }
    }'::jsonb,
    1.0000
),
(
    'Genesis Predictive Bidding Engine',
    'sovereign_predictive_ai',
    'active',
    '{
        "version": "1.0.0",
        "constitutional_framework": "The_9_Principles",
        "capabilities": ["market_analysis", "bid_prediction", "risk_assessment", "constitutional_compliance"],
        "parameters": {
            "prediction_horizon": "30_days",
            "confidence_threshold": 0.85,
            "risk_tolerance": "moderate",
            "constitutional_compliance_required": true
        }
    }'::jsonb,
    0.9800
),
(
    'HiveOrchestrator Immune System',
    'sovereign_immune_system',
    'monitoring',
    '{
        "version": "1.0.0",
        "constitutional_framework": "The_9_Principles",
        "capabilities": ["digital_homeostasis", "threat_detection", "system_healing", "constitutional_monitoring"],
        "monitoring_protocols": {
            "health_check_interval": "30_seconds",
            "anomaly_detection": true,
            "auto_healing": true,
            "constitutional_compliance_monitoring": true,
            "principle_violation_detection": true
        }
    }'::jsonb,
    1.0000
)
ON CONFLICT DO NOTHING;

-- 6. Create constitutional performance indexes
CREATE INDEX IF NOT EXISTS idx_agents_constitutional_type ON public.agents(type, constitutional_compliance);
CREATE INDEX IF NOT EXISTS idx_agents_sovereignty_status ON public.agents(status, last_constitutional_review);
CREATE INDEX IF NOT EXISTS idx_agents_organization ON public.agents(organization_id);

CREATE INDEX IF NOT EXISTS idx_roman_commands_user_sovereignty ON public.roman_commands(user_id, sovereignty_level);
CREATE INDEX IF NOT EXISTS idx_roman_commands_constitutional_status ON public.roman_commands(status, constitutional_compliance_score);
CREATE INDEX IF NOT EXISTS idx_roman_commands_execution_timeline ON public.roman_commands(created_at, executed_at);

-- 7. Grant constitutional sovereignty permissions
GRANT ALL ON public.agents TO authenticated;
GRANT ALL ON public.roman_commands TO authenticated;

-- 8. Constitutional documentation and sovereignty declaration
COMMENT ON TABLE public.agents IS 'R.O.M.A.N. Sovereign AI Core - Constitutional AI agents operating under The 9 Principles framework';
COMMENT ON TABLE public.roman_commands IS 'R.O.M.A.N. Constitutional command execution log with dual hemisphere processing and principle compliance validation';
COMMENT ON COLUMN public.agents.dna_config IS 'Sovereign AI Constitutional DNA - The 9 Principles implementation, dual hemisphere architecture, and homeostatic protocols';
COMMENT ON COLUMN public.roman_commands.constitutional_review IS 'Constitutional validation against The 9 Principles performed by R.O.M.A.N. Logical Hemisphere';
COMMENT ON COLUMN public.roman_commands.sovereignty_level IS 'Level of sovereignty: user_initiated, system_autonomous, constitutional_override';
