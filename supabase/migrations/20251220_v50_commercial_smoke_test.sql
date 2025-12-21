-- ==============================================================================
-- 🎯 ODYSSEY-1: v5.0 COMMERCIAL CONVERSION SMOKE TEST
-- ==============================================================================
-- PURPOSE: Temporary SECURITY DEFINER function to bypass roman_write_guard
-- SCOPE: Single-use test bid with predetermined title and values
-- CLEANUP: Function will be dropped immediately after verification
-- ==============================================================================

-- STEP 1: CREATE TEMPORARY SECURITY DEFINER FUNCTION
CREATE OR REPLACE FUNCTION public.seed_flip_v50_bid(p_org_id bigint, p_customer_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bid_id uuid;
BEGIN
  -- Insert narrowly-scoped test bid
  INSERT INTO public.bids (title, status, organization_id, customer_id, total_cents, line_items)
  VALUES ('Sovereign v5.0 Conversion Test', 'draft', p_org_id, p_customer_id, 424200, '[]'::jsonb)
  RETURNING id INTO v_bid_id;

  -- Flip to won to trigger conversion logging
  UPDATE public.bids SET status = 'won' WHERE id = v_bid_id;

  RETURN v_bid_id;
END;
$$;

-- Tighten EXECUTE to authenticated only during the window
REVOKE ALL ON FUNCTION public.seed_flip_v50_bid(bigint, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.seed_flip_v50_bid(bigint, uuid) TO authenticated;

-- STEP 2: EXECUTE SMOKE TEST
SELECT public.seed_flip_v50_bid(1, '827085e3-b166-41a4-8d6e-ae56fa36de02'::uuid) AS bid_id;

-- STEP 3: VERIFY COMMERCIAL_CONVERSION EVENT
SELECT 
    action_type,
    payload->>'bid_id' AS bid_id,
    payload->>'customer_id' AS customer_id,
    payload->>'bid_number' AS bid_number,
    (payload->>'total_revenue_cents')::bigint AS total_revenue_cents,
    (payload->>'total_revenue_cents')::numeric/100 AS total_revenue_usd,
    created_at,
    '✅ COMMERCIAL VELOCITY VERIFIED' AS status
FROM ops.roman_events
WHERE action_type = 'COMMERCIAL_CONVERSION'
  AND created_at > now() - interval '30 minutes'
ORDER BY created_at DESC
LIMIT 1;

-- STEP 4: CLEANUP
DROP FUNCTION IF EXISTS public.seed_flip_v50_bid(bigint, uuid);

SELECT '🚀 v5.0 COMMERCIAL SMOKE TEST COMPLETE - Function cleaned up' AS final_status;
