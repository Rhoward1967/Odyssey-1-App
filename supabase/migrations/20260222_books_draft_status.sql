-- ============================================================================
-- BOOKS STATUS CORRECTION
-- ============================================================================
-- All 8 books are locked in draft status. They have never been published.
-- The author (Rickey Allan Howard) is the only reader. Publication is
-- a future intentional act — not an accidental DB flag.
--
-- Book 8 was accidentally inserted as 'published' — correcting to 'draft'.
-- All internal systems (cross-reference, intelligence feed) operate on all
-- books regardless of status. Status only gates public-facing queries.
--
-- When ready to publish:
--   UPDATE books SET status = 'published', published_at = now()
--   WHERE book_number IN (1,2,3,4,5,6,7,8);
--
-- Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
-- ============================================================================

UPDATE books
SET    status = 'draft'
WHERE  book_number = 8
AND    status = 'published';

-- Verify all 8 books are in draft
DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM books WHERE status != 'draft';
  IF v_count > 0 THEN
    RAISE WARNING '% book(s) are not in draft status — review before publishing.', v_count;
  ELSE
    RAISE NOTICE '✅ All books confirmed in draft status. Unpublished and protected.';
  END IF;
END;
$$;
