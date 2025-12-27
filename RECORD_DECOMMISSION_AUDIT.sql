-- ============================================================================
-- R.O.M.A.N. 2.0 - PURGE AUDIT LOG
-- ============================================================================
-- Records the decommissioning of 7 legacy nodes as a constitutional event.
-- ============================================================================

INSERT INTO public.roman_audit_log (
  event_type,
  correlation_id,
  organization_id,
  compliance_score,
  action_data,
  "timestamp"
) VALUES (
  'DECOMMISSION_LEGACY_NODES',
  'system-consolidation-purge-20251226',
  1,
  100.00,
  '{
    "nodes_removed": [
      "create-stripe-portal-session",
      "claude-integration",
      "ai_chat",
      "discord-bot-OLD",
      "submit_score",
      "tutoring_schedule",
      "test-secret"
    ],
    "justification": "Phase 2 Consolidation & Debt Reduction",
    "architect": "R.O.M.A.N. 2.0",
    "edge_function_count": {
      "before": 41,
      "after": 34,
      "reduction": 7
    },
    "phase": "2.1",
    "constitutional_alignment": "Law of Return (Total Coherence) - Reduced entropy through legacy pruning"
  }'::jsonb,
  NOW()
);
