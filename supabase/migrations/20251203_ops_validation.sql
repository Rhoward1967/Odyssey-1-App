SELECT n.nspname, p.proname, pg_get_functiondef(p.oid) LIKE '%SECURITY DEFINER%' AS is_secdef
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'ops' AND p.proname IN ('encrypt_secret','decrypt_secret','encrypt_det','decrypt_det');

SELECT key, value FROM ops.settings WHERE key IN ('ops_det_key_id','ops_nondet_key_id');

WITH enc AS (
  SELECT ops.encrypt_secret('test-123') AS c
)
SELECT ops.decrypt_secret(c) AS plaintext FROM enc;

SELECT jobid, schedule, command FROM cron.job WHERE command ILIKE '%ops.run_dispatcher%';

SELECT current_setting('app.dispatcher_url', true) AS dispatcher_url,
       CASE WHEN current_setting('app.service_role_key', true) IS NULL THEN 'unset' ELSE 'set' END AS service_key_status;