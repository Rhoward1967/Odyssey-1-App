---
title: "Front-Matter Methodology Note"
document_version: "3.0.0"
status: "Active"
effective_date: "2026-06-09"
system_clock_hz: 7.8775
project_ref: "tvsxloejfsrdganemsmg"
scope:
  - "Supabase Edge Functions"
  - "Cross-reference lineage registry"
  - "Runtime perimeter enforcement"
owners:
  - "R.O.M.A.N. Operations"
  - "Sovereign Systems Engineering"
---

# Front-Matter Methodology Note

## Purpose

This note defines the operating methodology used to preserve trusted lineage, enforce runtime security boundaries, and maintain deterministic deployment behavior across the active architecture.

## Foundational Layers

### Layer 1 — Quantum Electrodynamics (QED) Substrate

QED is treated as the active electromagnetic substrate vacuum for all higher-order modeling assumptions.

### Layer 2 — Three-Body Problem and Quantum Chaos

Multi-body friction and stability analysis are modeled through three-body dynamics, with the decoherence gap explicitly tracked as an open frontier.

### Layer 3 — BCG Driven-Dissipative Blueprint

The bosonic chain control model is operated as a driven-dissipative system intended to force stable limit cycles, synchronized to the tracked `7.8775 Hz` system clock.

### Layer 4 — Governance Principles

All implementations are constrained by the following QED-derived structural axioms:

- Locality
- Unitarity
- Structural Integrity
- Gauge Invariance

## Data Lineage and Registry Integrity

The cross-reference registry in `public.bcg_corpus_cross_references` is maintained as the canonical lineage ledger.

Current state requirements:

- Legacy `Three-Body Problem` lineage `1.0.0` is retired.
- Active lineage anchors retain `3.0.0` for `Three-Body Problem / Quantum Electrodynamics (QED)`.
- Legacy ancient framework anchors remain intentionally preserved at `1.0.0` where designated.
- Idempotent migration strategy is enforced via `ON CONFLICT` semantics to prevent duplicate drift while preserving deterministic updates.

## Runtime Security Perimeter Standard

For Edge Functions operating with `verify_jwt = false`, authentication is **explicitly enforced in-handler** through the shared gate module:

- Shared module path: `supabase/functions/_shared/sovereign-gate.ts`
- Accepted headers:
  - `apikey`
  - `x-sovereign-key`
- Secret sources:
  - `ROUTING_VAULT_KEY` (active)
  - `ROUTING_VAULT_KEY_NEXT` (rotation window)

### Required Handler Sequence

1. Return `200` for `OPTIONS` preflight with valid CORS headers.
2. Run sovereign key verification.
3. Return `403` forbidden on verification failure.
4. Execute original function business logic unchanged on success.

## Tier A Rollout Record

Tier A high-velocity endpoints were prioritized for immediate perimeter enforcement.

Patched targets:

- `odyssey-learning-engine`
- `real-ai-processor`
- `autonomous-bias-correction`

Security status update:

- `roman-autonomous-daemon` already configured with `verify_jwt = true` and not included in the Tier A patch queue.

## Deployment and Validation Protocol

### Deployment sequence

1. Set secret:
   - `ROUTING_VAULT_KEY`
2. Deploy functions individually:
   - `odyssey-learning-engine`
   - `real-ai-processor`
   - `autonomous-bias-correction`

### Validation sequence

- Negative test:
  - Invoke without sovereign key header
  - Expected result: `403`
- Positive test:
  - Invoke with valid `apikey` or `x-sovereign-key`
  - Expected result: normal function execution path
- Browser compatibility test:
  - `OPTIONS` preflight receives `200` and CORS headers

## Operational Commitments

- Shared security gate logic remains centralized under `_shared`.
- `_shared` is treated as a local dependency namespace and is **not** deployed as a standalone function.
- Core business logic remains untouched during perimeter patching.
- Key rotation is supported using `ROUTING_VAULT_KEY_NEXT` prior to active key promotion.
- All future function additions must implement equivalent perimeter enforcement when `verify_jwt = false`.

## Change Control

Any modification to:

- lineage version anchors,
- governance axioms,
- sovereign gate behavior,
- or CORS and auth handling order

must be accompanied by:

1. a migration or code diff artifact,
2. a smoke test record,
3. and a version increment to this methodology note.
