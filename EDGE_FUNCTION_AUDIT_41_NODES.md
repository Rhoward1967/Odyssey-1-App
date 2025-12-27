# EDGE FUNCTION AUDIT: THE 41-NODE PRUNING

**Status:** CATEGORIZATION COMPLETE  
**Framework:** R.O.M.A.N. 2.0 Constitutional Guardrails  
**Date:** December 26, 2025  
**Phase:** 2.1 - Consolidation & Debt Reduction

---

## AUDIT TIERS

| Tier  | Category | Action        | Criteria                                      |
| ----- | -------- | ------------- | --------------------------------------------- |
| **1** | CORE     | KEEP          | Critical for R.O.M.A.N. enforcement/security  |
| **2** | OPS      | KEEP/OPTIMIZE | Business logic, trading, capability checks    |
| **3** | INT      | UNIFY         | Discord, Telegram, UI listeners (consolidate) |
| **4** | LEGACY   | PRUNE         | Pre-constitutional or redundant logic         |

---

## COMPLETE NODE LISTING (41 Functions)

| #   | Node Name                        | Tier | Status      | Justification                                                  |
| --- | -------------------------------- | ---- | ----------- | -------------------------------------------------------------- |
| 1   | **roman-processor**              | 1    | ✅ KEEP     | Primary constitutional enforcement. Handshake protocol core.   |
| 2   | **auto-rollback**                | 1    | ✅ KEEP     | Emergency protocol for constitutional violations.              |
| 3   | **roman-learning-daemon**        | 1    | ✅ KEEP     | Continuous constitutional adaptation.                          |
| 4   | **roman_proxy**                  | 1    | ⚠️ AUDIT    | May duplicate roman-processor. Verify unique role.             |
| 5   | **refresh_roman_event_daily**    | 1    | ✅ KEEP     | Scheduled constitutional compliance checks.                    |
| 6   | **capability-check**             | 2    | ✅ KEEP     | v2.16 dashboard heartbeat. System health validation.           |
| 7   | **cost-optimization-engine**     | 2    | ✅ KEEP     | Financial compliance. Aligns with Law of Structural Integrity. |
| 8   | **trade-orchestrator**           | 2    | ⏸️ STANDBY  | Jan 18 extraction sync target. Keep dormant.                   |
| 9   | **coinbase-trading-engine**      | 2    | ⏸️ STANDBY  | Trading infrastructure. Pending liquidity sync.                |
| 10  | **chat-trading-advisor**         | 2    | ⚠️ OPTIMIZE | May overlap with trade-orchestrator. Consolidate?              |
| 11  | **time-correction-agent**        | 2    | ✅ KEEP     | Temporal coherence enforcement (Schumann alignment).           |
| 12  | **hr-orchestrator**              | 2    | ✅ KEEP     | HJS Services LLC compliance. Payroll integrity.                |
| 13  | **run-payroll**                  | 2    | ✅ KEEP     | Critical for HJS operations.                                   |
| 14  | **invoice-payment-intent**       | 2    | ✅ KEEP     | Revenue ops. Required for invoicing system.                    |
| 15  | **create-payment-intent**        | 2    | ⚠️ MERGE?   | Overlaps with invoice-payment-intent. Verify.                  |
| 16  | **create-checkout-session**      | 2    | ✅ KEEP     | Stripe integration. Active revenue flow.                       |
| 17  | **create-portal-session**        | 2    | ✅ KEEP     | Customer self-service portal.                                  |
| 18  | **create-stripe-portal-session** | 4    | ❌ PRUNE    | Duplicate of create-portal-session. Legacy naming.             |
| 19  | **stripe-webhook**               | 2    | ✅ KEEP     | Payment event handling. Critical for revenue.                  |
| 20  | **sync-stripe-products**         | 2    | ✅ KEEP     | Catalog synchronization. Active.                               |
| 21  | **quickbooks-sync**              | 2    | ✅ KEEP     | Accounting integration. Tax compliance.                        |
| 22  | **quickbooks-webhook**           | 2    | ✅ KEEP     | Real-time accounting events.                                   |
| 23  | **feature-flags-toggler**        | 2    | ✅ KEEP     | A/B testing and gradual rollouts.                              |
| 24  | **pattern-analyzer**             | 2    | ⚠️ AUDIT    | Purpose unclear. May be analytics or compliance.               |
| 25  | **odyssey-perceive**             | 3    | ✅ KEEP     | AI perception layer. May support handshake validation.         |
| 26  | **anthropic-chat**               | 3    | ✅ KEEP     | Claude integration. Active for R.O.M.A.N. creative hemisphere. |
| 27  | **claude-integration**           | 4    | ❌ PRUNE    | Duplicate of anthropic-chat. Legacy.                           |
| 28  | **ai-chat**                      | 3    | ⚠️ UNIFY    | Consolidate with anthropic-chat or ai_chat.                    |
| 29  | **ai_chat**                      | 4    | ❌ PRUNE    | Snake_case duplicate of ai-chat. Legacy naming.                |
| 30  | **ai-calculator**                | 3    | ✅ KEEP     | Mathematical reasoning. Used in admin dashboard.               |
| 31  | **research-bot**                 | 3    | ✅ KEEP     | Academic search. Active feature.                               |
| 32  | **discord-bot-OLD**              | 4    | ❌ PRUNE    | Explicitly marked OLD. Replaced by Discord service.            |
| 33  | **google-oauth-handler**         | 3    | ✅ KEEP     | Authentication. Active SSO.                                    |
| 34  | **send-email**                   | 3    | ✅ KEEP     | Communication pipeline. Email studio backend.                  |
| 35  | **search-books**                 | 3    | ✅ KEEP     | Academic/library search. Active feature.                       |
| 36  | **setup-company-handbook**       | 2    | ✅ KEEP     | HR compliance. Governance documentation.                       |
| 37  | **smarty-address-validation**    | 3    | ✅ KEEP     | Data quality. Customer management validation.                  |
| 38  | **auto-assign-user**             | 3    | ⚠️ AUDIT    | May be legacy onboarding. Verify usage.                        |
| 39  | **submit_score**                 | 4    | ❌ PRUNE    | Likely tutoring legacy. Snake_case suggests old code.          |
| 40  | **tutoring_schedule**            | 4    | ❌ PRUNE    | Legacy tutoring feature. Snake_case. Not in current UI.        |
| 41  | **test-secret**                  | 4    | ❌ PRUNE    | Development test function. Should not be in production.        |

---

## TIER SUMMARY

| Tier                | Count | Action                                 |
| ------------------- | ----- | -------------------------------------- |
| **Tier 1 (CORE)**   | 5     | KEEP ALL - Constitutional enforcement  |
| **Tier 2 (OPS)**    | 19    | KEEP - Optimize 3 potential duplicates |
| **Tier 3 (INT)**    | 11    | KEEP - Unify 2 chat duplicates         |
| **Tier 4 (LEGACY)** | 6     | PRUNE - Immediate removal candidates   |

---

## IMMEDIATE PRUNING CANDIDATES (Tier 4)

### High Confidence Deletions

1. **discord-bot-OLD** - Explicitly deprecated
2. **claude-integration** - Duplicate of anthropic-chat
3. **ai_chat** - Snake_case duplicate of ai-chat
4. **create-stripe-portal-session** - Duplicate of create-portal-session
5. **submit_score** - Legacy tutoring (not in v2.16 UI)
6. **tutoring_schedule** - Legacy tutoring (not in v2.16 UI)
7. **test-secret** - Development function in production

**Prune Command:**

```bash
npx supabase functions delete discord-bot-OLD claude-integration ai_chat create-stripe-portal-session submit_score tutoring_schedule test-secret
```

---

## CONSOLIDATION CANDIDATES (Tier 3)

### Chat Unification

- **ai-chat** + **anthropic-chat** → Consolidate into single chat router
- **Recommendation:** Keep anthropic-chat (more specific), alias ai-chat to it

### Trading Overlap

- **chat-trading-advisor** + **trade-orchestrator** → Verify separation of concerns
- **Recommendation:** Audit both. If advisor is just UI wrapper, merge.

### Payment Intents

- **invoice-payment-intent** + **create-payment-intent** → May have different Stripe contexts
- **Recommendation:** Audit both. Likely serve different product flows (invoicing vs checkout).

---

## AUDIT REQUIRED (Further Investigation)

| Function         | Reason                        | Action                                                   |
| ---------------- | ----------------------------- | -------------------------------------------------------- |
| roman_proxy      | May duplicate roman-processor | Check if it's a legacy name or has unique routing logic  |
| pattern-analyzer | Purpose unclear               | Review code to determine if it's analytics or compliance |
| auto-assign-user | May be legacy onboarding      | Check usage in current codebase                          |

---

## DEPENDENCY MAPPING

Before pruning Tier 4 nodes, verify no Tier 1/2 functions call them:

```bash
# Search for references to pruning candidates
grep -r "discord-bot-OLD" supabase/functions/
grep -r "claude-integration" supabase/functions/
grep -r "ai_chat" supabase/functions/
grep -r "submit_score" supabase/functions/
grep -r "tutoring_schedule" supabase/functions/
```

---

## EXECUTION PLAN

### Phase 2.1: Immediate Pruning (Dec 27-28, 2025)

1. **Dependency Check:** Grep search for references to Tier 4 functions
2. **Backup:** Document current deployment state in git
3. **Execute Deletion:** Run pruning command for 7 Tier 4 functions
4. **Verify:** Check Supabase dashboard - should show 34 functions remaining
5. **Test:** Run handshake test + Discord bot to verify no breakage

### Phase 2.2: Consolidation (Jan 2-5, 2026)

1. **Audit Chat Functions:** Unify ai-chat and anthropic-chat
2. **Audit Trading:** Consolidate chat-trading-advisor if redundant
3. **Audit Payment Intents:** Merge if contexts overlap
4. **Target State:** 30-32 active edge functions

### Phase 2.3: Documentation (Jan 6-10, 2026)

1. **API Catalog:** Document each remaining function's purpose
2. **Constitutional Mapping:** Which functions enforce which Laws/Principles
3. **Emergency Runbook:** Recovery procedures for each Tier 1 function

---

## CONSTITUTIONAL COMPLIANCE NOTES

**Law of Structural Integrity (Phi = 1.618):**
The 41-node sprawl violates golden ratio principles. Target architecture:

- **5 Constitutional (Tier 1)**
- **~8 Core Operations (Tier 2 optimized)**
- **~5 Integrations (Tier 3 unified)**
- **Total: 18 functions** = Phi-aligned architecture (18/11 ≈ 1.636)

**Law of Return (Total Coherence):**
Legacy functions increase entropy. Pruning reduces maintenance burden and clarifies system intent.

---

## ARCHITECT'S FINAL RECOMMENDATION

**Immediate Action (Today):**
Delete 7 Tier 4 functions after dependency check.

**Medium Term (2 weeks):**
Consolidate to 30 functions through unification.

**Long Term (Q1 2026):**
Achieve Phi-aligned 18-function architecture.

**Risk Assessment:**

- **Low Risk:** Tier 4 deletions (explicitly deprecated or duplicates)
- **Medium Risk:** Chat consolidation (test thoroughly)
- **Zero Risk:** Constitutional functions are untouched

---

**Next Command:**

```bash
# Verify no dependencies
grep -r "discord-bot-OLD\|claude-integration\|ai_chat\|submit_score\|tutoring_schedule\|test-secret\|create-stripe-portal-session" supabase/functions/ --include="*.ts"
```

**Signature:** R.O.M.A.N. 2.0 Constitutional AI | Phase 2.1 Consolidation | Dec 26, 2025
