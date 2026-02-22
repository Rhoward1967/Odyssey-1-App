-- ============================================================================
-- BOOK CROSS-REFERENCES — Autonomous Trigger & Scheduled Analysis
-- ============================================================================
-- Closes the autonomous loop:
--   1. pg_net   — allows PostgreSQL to make outbound HTTP calls
--   2. pg_cron  — schedules a nightly full-analysis at 3:00 AM UTC
--   3. Trigger  — when any book's content is updated, immediately queues
--                 a targeted pair-analysis for the changed book
--
-- After this migration there is ZERO human intervention required.
-- R.O.M.A.N. watches the books table. If a book changes, it re-analyzes.
-- Every night at 3 AM it runs a full pass regardless.
--
-- Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
-- ============================================================================


-- ── EXTENSIONS ────────────────────────────────────────────────────────────────

-- pg_net: outbound HTTP from PostgreSQL (Supabase has this enabled by default)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- pg_cron: scheduled jobs inside PostgreSQL (Supabase has this enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;


-- ── HELPER TABLE: ANALYSIS QUEUE ──────────────────────────────────────────────
-- Tracks which analyses have been triggered and their status.
-- The trigger writes here; we can see history without reading Supabase logs.

CREATE TABLE IF NOT EXISTS book_analysis_queue (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by    TEXT        NOT NULL,   -- 'cron_full' | 'book_update' | 'manual'
  mode            TEXT        NOT NULL DEFAULT 'full',
  book_a          INTEGER,                -- Only set for mode='pair'
  book_b          INTEGER,                -- Only set for mode='pair'
  status          TEXT        NOT NULL DEFAULT 'queued'
                              CHECK (status IN ('queued','sent','success','error')),
  http_request_id BIGINT,                 -- pg_net request ID for inspection
  response_status INTEGER,               -- HTTP response code from edge function
  response_body   TEXT,                  -- Edge function response body
  error_message   TEXT,
  queued_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_baq_status    ON book_analysis_queue(status);
CREATE INDEX IF NOT EXISTS idx_baq_queued_at ON book_analysis_queue(queued_at DESC);


-- ── FUNCTION: CALL CROSS-REFERENCE EDGE FUNCTION ─────────────────────────────
-- Fires an HTTP POST to the cross-reference-books edge function.
-- Uses pg_net so the call is non-blocking — Postgres doesn't wait for Claude.

CREATE OR REPLACE FUNCTION trigger_cross_reference_analysis(
  p_mode   TEXT    DEFAULT 'full',
  p_book_a INTEGER DEFAULT NULL,
  p_book_b INTEGER DEFAULT NULL,
  p_source TEXT    DEFAULT 'manual'
)
RETURNS BIGINT      -- returns the pg_net request ID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_url        TEXT;
  v_anon_key   TEXT;
  v_body       JSONB;
  v_request_id BIGINT;
  v_queue_id   UUID;
BEGIN
  -- Pull config from vault / app.settings (set once via Supabase dashboard)
  v_url      := current_setting('app.supabase_url',      true) || '/functions/v1/cross-reference-books';
  v_anon_key := current_setting('app.supabase_anon_key', true);

  -- Build request body
  IF p_mode = 'pair' AND p_book_a IS NOT NULL AND p_book_b IS NOT NULL THEN
    v_body := jsonb_build_object('mode', 'pair', 'book_a', p_book_a, 'book_b', p_book_b);
  ELSE
    v_body := jsonb_build_object('mode', 'full');
  END IF;

  -- Insert queue record
  INSERT INTO book_analysis_queue (triggered_by, mode, book_a, book_b, status)
  VALUES (p_source, p_mode, p_book_a, p_book_b, 'queued')
  RETURNING id INTO v_queue_id;

  -- Fire the async HTTP request via pg_net
  SELECT net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_anon_key
    ),
    body    := v_body::text
  ) INTO v_request_id;

  -- Record the pg_net request ID so we can inspect later
  UPDATE book_analysis_queue
  SET    status          = 'sent',
         http_request_id = v_request_id
  WHERE  id = v_queue_id;

  RETURN v_request_id;

EXCEPTION WHEN OTHERS THEN
  UPDATE book_analysis_queue
  SET    status        = 'error',
         error_message = SQLERRM
  WHERE  id = v_queue_id;
  RAISE WARNING 'trigger_cross_reference_analysis failed: %', SQLERRM;
  RETURN NULL;
END;
$$;


-- ── TRIGGER FUNCTION: BOOK CONTENT CHANGED ───────────────────────────────────
-- Fires after any UPDATE to the books table when content or title changes.
-- Queues a targeted analysis — does NOT run a full pass, just the affected book
-- vs. every other book.

CREATE OR REPLACE FUNCTION on_book_content_changed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_other_book  RECORD;
BEGIN
  -- Only act when content, title, or subtitle actually changed
  IF (OLD.content  IS DISTINCT FROM NEW.content) OR
     (OLD.title    IS DISTINCT FROM NEW.title)   OR
     (OLD.subtitle IS DISTINCT FROM NEW.subtitle) THEN

    RAISE NOTICE 'Book % changed — queuing cross-reference pairs...', NEW.book_number;

    -- Queue pair analysis against every other book
    FOR v_other_book IN
      SELECT book_number FROM books WHERE book_number <> NEW.book_number
    LOOP
      PERFORM trigger_cross_reference_analysis(
        p_mode   := 'pair',
        p_book_a := LEAST(NEW.book_number, v_other_book.book_number),
        p_book_b := GREATEST(NEW.book_number, v_other_book.book_number),
        p_source := 'book_update'
      );
    END LOOP;

  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to books table
DROP TRIGGER IF EXISTS trg_book_content_changed ON books;
CREATE TRIGGER trg_book_content_changed
  AFTER UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION on_book_content_changed();


-- ── TRIGGER FUNCTION: NEW BOOK INSERTED ──────────────────────────────────────
-- If a new book is ever added, kick off a full analysis immediately.

CREATE OR REPLACE FUNCTION on_book_inserted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE NOTICE 'New book % inserted — triggering full cross-reference analysis...', NEW.book_number;
  PERFORM trigger_cross_reference_analysis(
    p_mode   := 'full',
    p_source := 'new_book'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_book_inserted ON books;
CREATE TRIGGER trg_book_inserted
  AFTER INSERT ON books
  FOR EACH ROW
  EXECUTE FUNCTION on_book_inserted();


-- ── CRON JOB: NIGHTLY FULL ANALYSIS — 3:00 AM UTC ────────────────────────────
-- Every night at 3 AM, R.O.M.A.N. automatically runs a complete cross-reference
-- pass across all 7 books. This catches any drift or new insights from updated
-- AI models without requiring any human action.

SELECT cron.schedule(
  'book-cross-reference-nightly',          -- Job name (unique)
  '0 3 * * *',                             -- Cron expression: 3:00 AM UTC daily
  $$
    SELECT trigger_cross_reference_analysis(
      p_mode   := 'full',
      p_source := 'cron_full'
    );
  $$
);


-- ── CRON JOB: QUEUE CLEANUP — SUNDAYS 4:00 AM UTC ────────────────────────────
-- Keep the queue table clean. Purge records older than 30 days.

SELECT cron.schedule(
  'book-analysis-queue-cleanup',
  '0 4 * * 0',                             -- 4:00 AM UTC every Sunday
  $$
    DELETE FROM book_analysis_queue
    WHERE queued_at < now() - INTERVAL '30 days';
  $$
);


-- ── VIEW: ANALYSIS QUEUE DASHBOARD ───────────────────────────────────────────
-- Quick inspection view — what has R.O.M.A.N. triggered recently?

CREATE OR REPLACE VIEW book_analysis_log AS
SELECT
  id,
  triggered_by,
  mode,
  CASE
    WHEN book_a IS NOT NULL THEN 'Book ' || book_a || ' ↔ Book ' || book_b
    ELSE 'All 7 books'
  END                         AS scope,
  status,
  response_status,
  queued_at,
  completed_at,
  EXTRACT(EPOCH FROM (completed_at - queued_at))::INT AS duration_seconds,
  error_message
FROM book_analysis_queue
ORDER BY queued_at DESC;

COMMENT ON VIEW book_analysis_log IS
  'Audit log of all autonomous cross-reference analyses triggered by R.O.M.A.N. '
  '(cron, book content changes, and new book inserts). Zero human action required.';


-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE book_analysis_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view analysis queue"
  ON book_analysis_queue FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage analysis queue"
  ON book_analysis_queue FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  ));


-- ── INITIAL KICKOFF ───────────────────────────────────────────────────────────
-- Run a full analysis immediately when this migration is first applied,
-- so the system is seeded with data from day one.

DO $$
BEGIN
  -- Only seed if we have books but no cross-references yet
  IF (SELECT COUNT(*) FROM books) > 0
  AND (SELECT COUNT(*) FROM book_cross_references) = 0 THEN
    PERFORM trigger_cross_reference_analysis(
      p_mode   := 'full',
      p_source := 'migration_seed'
    );
    RAISE NOTICE '✅ Initial cross-reference analysis queued.';
  ELSE
    RAISE NOTICE 'ℹ️  Cross-references already exist or no books found — skipping seed.';
  END IF;
END;
$$;


-- ── COMMENTS ──────────────────────────────────────────────────────────────────

COMMENT ON TABLE book_analysis_queue IS
  'Audit log of every autonomous cross-reference trigger. '
  'Written by pg_cron schedules and books table triggers. '
  'Human intervention: ZERO. Howard Jones Bloodline Ancestral Trust.';

COMMENT ON FUNCTION trigger_cross_reference_analysis IS
  'Fires an async pg_net HTTP POST to the cross-reference-books edge function. '
  'Non-blocking — Postgres queues the call and returns immediately. '
  'Claude picks it up, analyzes the books, writes back to the DB, '
  'and the real-time subscription in the frontend updates automatically.';

COMMENT ON FUNCTION on_book_content_changed IS
  'TRIGGER: Fires after any book UPDATE where content/title/subtitle changed. '
  'Queues pair-mode analysis for the changed book vs every other book. '
  'The nightly cron runs full-mode; this trigger handles real-time content edits.';
