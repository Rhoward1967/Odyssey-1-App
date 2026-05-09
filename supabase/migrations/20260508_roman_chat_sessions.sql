-- ============================================================
-- R.O.M.A.N. Chat Session Persistence
-- Created: May 8, 2026
-- Howard Jones Bloodline Ancestral Trust
-- ============================================================

-- Sessions: one row per conversation
CREATE TABLE IF NOT EXISTS public.roman_chat_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL DEFAULT auth.uid(),
  title         text NOT NULL DEFAULT 'New Conversation',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  message_count int NOT NULL DEFAULT 0
);

-- Messages: one row per message, with tsvector for full-text search
CREATE TABLE IF NOT EXISTS public.roman_chat_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid NOT NULL REFERENCES public.roman_chat_sessions(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL DEFAULT auth.uid(),
  role        text NOT NULL CHECK (role IN ('user', 'roman')),
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  search_vec  tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rchat_sessions_user_updated
  ON public.roman_chat_sessions(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_rchat_messages_session_time
  ON public.roman_chat_messages(session_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_rchat_messages_search
  ON public.roman_chat_messages USING GIN(search_vec);

-- Trigger: update session updated_at + message_count on insert
CREATE OR REPLACE FUNCTION public.fn_rchat_update_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $func$
BEGIN
  UPDATE public.roman_chat_sessions
  SET updated_at    = now(),
      message_count = message_count + 1
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$func$;

REVOKE EXECUTE ON FUNCTION public.fn_rchat_update_session() FROM PUBLIC;

DROP TRIGGER IF EXISTS tr_rchat_update_session ON public.roman_chat_messages;
CREATE TRIGGER tr_rchat_update_session
  AFTER INSERT ON public.roman_chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.fn_rchat_update_session();

-- Trigger: auto-title session from first user message (first 60 chars)
CREATE OR REPLACE FUNCTION public.fn_rchat_set_title()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $func$
BEGIN
  IF NEW.role = 'user' THEN
    UPDATE public.roman_chat_sessions
    SET title = LEFT(NEW.content, 60)
    WHERE id = NEW.session_id
      AND title = 'New Conversation';
  END IF;
  RETURN NEW;
END;
$func$;

REVOKE EXECUTE ON FUNCTION public.fn_rchat_set_title() FROM PUBLIC;

DROP TRIGGER IF EXISTS tr_rchat_set_title ON public.roman_chat_messages;
CREATE TRIGGER tr_rchat_set_title
  AFTER INSERT ON public.roman_chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.fn_rchat_set_title();

-- Full-text search across user's messages — returns session_ids
CREATE OR REPLACE FUNCTION public.fn_roman_chat_search(query text)
RETURNS TABLE (session_id uuid)
LANGUAGE sql
STABLE
SET search_path = public
AS $func$
  SELECT DISTINCT m.session_id
  FROM public.roman_chat_messages m
  WHERE m.search_vec @@ websearch_to_tsquery('english', query)
$func$;

-- RLS
ALTER TABLE public.roman_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roman_chat_messages  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rchat_sessions_user_owns" ON public.roman_chat_sessions;
CREATE POLICY "rchat_sessions_user_owns"
  ON public.roman_chat_sessions
  FOR ALL
  USING     (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "rchat_messages_user_owns" ON public.roman_chat_messages;
CREATE POLICY "rchat_messages_user_owns"
  ON public.roman_chat_messages
  FOR ALL
  USING     (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

COMMENT ON TABLE public.roman_chat_sessions IS 'R.O.M.A.N. persistent chat sessions — Howard Jones Bloodline Ancestral Trust';
COMMENT ON TABLE public.roman_chat_messages IS 'R.O.M.A.N. chat message history with full-text search';
