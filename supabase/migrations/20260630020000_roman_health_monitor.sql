-- R.O.M.A.N. Health Monitor (2026-06-30)
-- Real autonomous detection to replace the hollow "succeeded" heartbeat. Scans for
-- active cron jobs whose most-recent run FAILED + stale pipes (v_qb_health), records
-- open alerts, auto-resolves cleared ones. The roman-health-monitor edge function
-- calls this and pushes new problems to Discord. Cron: roman-health-monitor-cycle (6h).

CREATE TABLE IF NOT EXISTS public.roman_health_alerts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  detected_at timestamptz DEFAULT now(),
  severity    text,
  source      text,
  signature   text,
  detail      text,
  resolved    boolean DEFAULT false,
  resolved_at timestamptz
);
ALTER TABLE public.roman_health_alerts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.fn_roman_health_scan()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','cron','extensions' AS $fn$
DECLARE problems jsonb := '[]'::jsonb; rec record; v_qb record;
BEGIN
  -- Active cron jobs whose MOST RECENT run failed (real failure signal, not a heartbeat)
  FOR rec IN
    SELECT j.jobname, d.return_message
    FROM cron.job j
    JOIN LATERAL (SELECT status, return_message FROM cron.job_run_details rd WHERE rd.jobid=j.jobid ORDER BY start_time DESC LIMIT 1) d ON true
    WHERE j.active AND d.status='failed'
  LOOP
    problems := problems || jsonb_build_object('source','cron','signature',rec.jobname,'detail',left(coalesce(rec.return_message,'failed'),300));
  END LOOP;
  -- QuickBooks pipe health
  BEGIN
    SELECT * INTO v_qb FROM public.v_qb_health;
    IF v_qb.status IS DISTINCT FROM 'healthy' THEN
      problems := problems || jsonb_build_object('source','quickbooks','signature','qb_stale','detail',v_qb.status);
    END IF;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  -- Record new open alerts (dedup by signature while unresolved)
  INSERT INTO public.roman_health_alerts(severity, source, signature, detail)
  SELECT 'warning', p->>'source', p->>'signature', p->>'detail'
  FROM jsonb_array_elements(problems) p
  WHERE NOT EXISTS (SELECT 1 FROM public.roman_health_alerts a WHERE a.signature = p->>'signature' AND a.resolved=false);
  -- Auto-resolve alerts whose problem is gone
  UPDATE public.roman_health_alerts a SET resolved=true, resolved_at=now()
  WHERE a.resolved=false AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(problems) p WHERE p->>'signature'=a.signature);
  RETURN jsonb_build_object('checked_at', now(), 'problem_count', jsonb_array_length(problems), 'problems', problems);
END $fn$;
