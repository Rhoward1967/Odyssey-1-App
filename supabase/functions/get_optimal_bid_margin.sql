-- Genesis Platform Universal AI Engine - First Model: Predictive Bidding
-- Honors Gemini's directive to start the engine with intelligent sales optimization

CREATE OR REPLACE FUNCTION public.get_optimal_bid_margin(
  project_type TEXT DEFAULT NULL,
  estimated_hours INTEGER DEFAULT NULL,
  complexity_level TEXT DEFAULT 'medium',
  client_budget_range TEXT DEFAULT NULL
)
RETURNS TABLE(
  optimal_margin DECIMAL(5,2),
  confidence_score DECIMAL(3,2),
  historical_win_rate DECIMAL(3,2),
  recommendation TEXT,
  data_points INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Genesis Platform AI Engine: Predictive Bidding Intelligence
  -- This represents the first Universal AI model deployment
  
  RETURN QUERY
  WITH historical_performance AS (
    SELECT 
      b.bid_amount,
      b.estimated_cost,
      CASE WHEN b.status = 'won' THEN 1 ELSE 0 END as won,
      ((b.bid_amount - b.estimated_cost) / NULLIF(b.estimated_cost, 0)) * 100 as margin_used,
      b.project_complexity,
      b.client_budget_estimate
    FROM bids b
    WHERE b.status IN ('won', 'lost')
      AND b.bid_amount > 0 
      AND b.estimated_cost > 0
      AND (project_type IS NULL OR b.project_type ILIKE '%' || project_type || '%')
      AND (complexity_level IS NULL OR b.project_complexity = complexity_level)
  ),
  margin_analysis AS (
    SELECT 
      ROUND(AVG(margin_used), 2) as avg_winning_margin,
      ROUND(AVG(CASE WHEN won = 1 THEN margin_used END), 2) as avg_won_margin,
      ROUND(AVG(CASE WHEN won = 0 THEN margin_used END), 2) as avg_lost_margin,
      ROUND(SUM(won)::DECIMAL / COUNT(*)::DECIMAL, 2) as overall_win_rate,
      COUNT(*) as total_bids,
      STDDEV(margin_used) as margin_stddev
    FROM historical_performance
  ),
  optimal_calculation AS (
    SELECT 
      -- Genesis AI Algorithm: Dynamic margin optimization
      CASE 
        WHEN ma.avg_won_margin IS NOT NULL AND ma.total_bids >= 5 THEN
          GREATEST(
            LEAST(ma.avg_won_margin * 1.1, ma.avg_won_margin + 5), -- Cap increases
            ma.avg_won_margin * 0.9 -- Floor decreases
          )
        WHEN estimated_hours IS NOT NULL AND estimated_hours > 100 THEN 25.0 -- Large projects
        WHEN complexity_level = 'high' THEN 30.0
        WHEN complexity_level = 'low' THEN 15.0
        ELSE 20.0 -- Default baseline
      END as calculated_margin,
      
      -- Confidence scoring based on data availability
      CASE 
        WHEN ma.total_bids >= 20 THEN 0.95
        WHEN ma.total_bids >= 10 THEN 0.85
        WHEN ma.total_bids >= 5 THEN 0.75
        ELSE 0.60
      END as confidence,
      
      COALESCE(ma.overall_win_rate, 0.50) as win_rate,
      COALESCE(ma.total_bids, 0) as data_count,
      ma.avg_won_margin,
      ma.avg_lost_margin
    FROM margin_analysis ma
  )
  SELECT 
    oc.calculated_margin::DECIMAL(5,2),
    oc.confidence::DECIMAL(3,2),
    oc.win_rate::DECIMAL(3,2),
    CASE 
      WHEN oc.data_count >= 10 THEN 
        'AI-Optimized: Based on ' || oc.data_count || ' historical bids. ' ||
        CASE 
          WHEN oc.calculated_margin > COALESCE(oc.avg_won_margin, 20) THEN 'Aggressive margin recommended.'
          WHEN oc.calculated_margin < COALESCE(oc.avg_won_margin, 20) THEN 'Conservative margin for higher win probability.'
          ELSE 'Optimal balance of profit and win probability.'
        END
      WHEN oc.data_count >= 3 THEN 
        'Emerging Pattern: Limited data (' || oc.data_count || ' bids). Monitor and adjust.'
      ELSE 
        'Genesis Baseline: Insufficient historical data. Using AI baseline with manual oversight recommended.'
    END::TEXT,
    oc.data_count::INTEGER
  FROM optimal_calculation oc;
END;
$$;

-- Grant execution to authenticated users only
GRANT EXECUTE ON FUNCTION public.get_optimal_bid_margin(TEXT, INTEGER, TEXT, TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_optimal_bid_margin(TEXT, INTEGER, TEXT, TEXT) FROM anon;

-- Add function documentation
COMMENT ON FUNCTION public.get_optimal_bid_margin IS 
'Genesis Platform Universal AI Engine - Predictive Bidding Model. 
First AI model deployed under Gemini directive.
Analyzes historical bid performance to recommend optimal profit margins.';
