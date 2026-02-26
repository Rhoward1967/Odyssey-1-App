-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION: Certified Mail Delivery Confirmations
-- ═══════════════════════════════════════════════════════════════════
-- Date: February 23, 2026
-- Purpose: Record actual delivery dates from return receipts and
--          update FCRA 30-day response deadlines from confirmed receipt dates
--
-- SOURCE: Physical return receipts scanned and logged Feb 23, 2026
-- LEGAL NOTE: FCRA 30-day clock runs from DATE OF RECEIPT, not mail date
--             Updated deadlines supersede the original March 11 estimates
-- ═══════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────
-- 1. EQUIFAX (CONSUMER) — Fix tracking number + delivery confirmation
--    Receipt confirmed: Feb 17, 2026 | Received by: James Mcs
--    New FCRA deadline: March 19, 2026 (30 days from Feb 17)
-- ───────────────────────────────────────────────────────────────────
UPDATE certified_mail_tracking
SET
  tracking_number        = '9589 0710 5270 2244 1697 55',
  actual_delivery        = '2026-02-17',
  return_receipt_received = TRUE,
  return_receipt_date    = '2026-02-17',
  response_deadline      = '2026-03-19',
  notes                  = 'Consumer credit report dispute - Sovereign Creditor standing | Delivered Feb 17 2026, received by James Mcs | FCRA 30-day clock: Mar 19 2026',
  updated_at             = NOW()
WHERE entity_name = 'Equifax (Consumer)'
  AND campaign_id = 'TRUST_CREDITOR_STANDING_FEB_2026';

-- ───────────────────────────────────────────────────────────────────
-- 2. EQUIFAX BUSINESS — Delivery confirmation
--    Receipt confirmed: Feb 17, 2026 | Received by: James Mckers
--    New FCRA deadline: March 19, 2026
-- ───────────────────────────────────────────────────────────────────
UPDATE certified_mail_tracking
SET
  actual_delivery        = '2026-02-17',
  return_receipt_received = TRUE,
  return_receipt_date    = '2026-02-17',
  response_deadline      = '2026-03-19',
  notes                  = 'Business credit report dispute - Sovereign Creditor standing | Delivered Feb 17 2026, received by James Mckers | FCRA 30-day clock: Mar 19 2026',
  updated_at             = NOW()
WHERE tracking_number = '9589 0710 5270 2244 1697 48'
  AND campaign_id = 'TRUST_CREDITOR_STANDING_FEB_2026';

-- ───────────────────────────────────────────────────────────────────
-- 3. CAPITAL ONE (CONSUMER) — Delivery confirmation
--    Receipt confirmed: Feb 17, 2026 | Received by: signature on file
--    New FCRA deadline: March 19, 2026
-- ───────────────────────────────────────────────────────────────────
UPDATE certified_mail_tracking
SET
  actual_delivery        = '2026-02-17',
  return_receipt_received = TRUE,
  return_receipt_date    = '2026-02-17',
  response_deadline      = '2026-03-19',
  notes                  = 'Consumer credit card - FCRA debt validation request | Delivered Feb 17 2026, signature on file | FCRA 30-day clock: Mar 19 2026',
  updated_at             = NOW()
WHERE tracking_number = '9589 0710 5270 2244 1850 38'
  AND campaign_id = 'TRUST_CREDITOR_STANDING_FEB_2026';

-- ───────────────────────────────────────────────────────────────────
-- 4. PEACH STATE FEDERAL CREDIT UNION — Delivery confirmation
--    Receipt confirmed: Feb 12, 2026 | Received by: C. Brown
--    New FCRA deadline: March 14, 2026 (30 days from Feb 12)
-- ───────────────────────────────────────────────────────────────────
UPDATE certified_mail_tracking
SET
  actual_delivery        = '2026-02-12',
  return_receipt_received = TRUE,
  return_receipt_date    = '2026-02-12',
  response_deadline      = '2026-03-14',
  notes                  = 'Three business accounts - FCRA debt validation request | Delivered Feb 12 2026, received by C. Brown | FCRA 30-day clock: Mar 14 2026',
  updated_at             = NOW()
WHERE tracking_number = '9589 0710 5270 2244 1697 93'
  AND campaign_id = 'TRUST_CREDITOR_STANDING_FEB_2026';

-- ───────────────────────────────────────────────────────────────────
-- 5. JPMORGAN CHASE — Delivery confirmation (date unclear on receipt)
--    Received by: Brahima Trecro | Date: estimated ~Feb 12-14
--    Keeping original deadline pending date clarification
-- ───────────────────────────────────────────────────────────────────
UPDATE certified_mail_tracking
SET
  return_receipt_received = TRUE,
  notes                  = 'Credit card account - FCRA debt validation request | Delivery confirmed, received by Brahima Trecro (JPMorgan Chase) | Date on receipt unclear - deadline under review',
  updated_at             = NOW()
WHERE tracking_number = '9589 0710 5270 2244 1698 78'
  AND campaign_id = 'TRUST_CREDITOR_STANDING_FEB_2026';

-- ───────────────────────────────────────────────────────────────────
-- 6. CITIBANK — Delivery confirmation (date unclear on receipt)
--    Received by: signature on file | Date: unclear
--    Keeping original deadline pending date clarification
-- ───────────────────────────────────────────────────────────────────
UPDATE certified_mail_tracking
SET
  return_receipt_received = TRUE,
  notes                  = 'Credit card account - FCRA debt validation request | Delivery confirmed, signature on file | Date on receipt unclear - deadline under review',
  updated_at             = NOW()
WHERE tracking_number = '9589 0710 5270 2244 1698 23'
  AND campaign_id = 'TRUST_CREDITOR_STANDING_FEB_2026';

-- ───────────────────────────────────────────────────────────────────
-- 7. INTUIT FINANCING — Delivery confirmation (date unclear on receipt)
--    Received by: Sergio | Date: unclear
--    Keeping original deadline pending date clarification
-- ───────────────────────────────────────────────────────────────────
UPDATE certified_mail_tracking
SET
  return_receipt_received = TRUE,
  notes                  = 'QB Capital loan - FCRA debt validation + MOSA restructuring notice | Delivery confirmed, received by Sergio | Date on receipt unclear - deadline under review',
  updated_at             = NOW()
WHERE tracking_number = '9589 0710 5270 2244 1850 21'
  AND campaign_id = 'TRUST_CREDITOR_STANDING_FEB_2026';

-- ═══════════════════════════════════════════════════════════════════
-- UPDATED DEADLINE SUMMARY (for R.O.M.A.N. monitoring)
-- ═══════════════════════════════════════════════════════════════════
-- March 14, 2026 — Peach State FCU (delivered Feb 12)
-- March 19, 2026 — Equifax Consumer (delivered Feb 17)
-- March 19, 2026 — Equifax Business (delivered Feb 17)
-- March 19, 2026 — Capital One Consumer (delivered Feb 17)
-- March 11, 2026 — Chase, Citibank, Intuit (delivery confirmed,
--                  date unclear — original deadline holds until confirmed)
-- ═══════════════════════════════════════════════════════════════════

COMMENT ON TABLE certified_mail_tracking IS
  'FCRA dispute campaign - Howard Jones Bloodline Ancestral Trust | Updated Feb 23 2026 with physical return receipt confirmations';
