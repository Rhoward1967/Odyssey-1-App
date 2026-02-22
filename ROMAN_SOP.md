# R.O.M.A.N. 2.0 — Standard Operating Procedure
## Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
### The 5-Phase Debt Nullification & Capital Reclamation Matrix

---

> **Every phase is automated. Every document is court-ready. Every statute is cited.**
> This is not theory — this is executable code backed by federal law.

---

## Phase 0 / 1 — Audit & Dispute *(The First Strike)*

**Goal:** Identify the fiction, verify the chain of title, start the statutory clock.

**Legal trigger:** 15 U.S.C. § 1692g — Written dispute starts the 30-day validation window.

| Step | Action |
|------|--------|
| 1 | Open Odyssey-1 Dashboard → **Securitization Lookup** tab |
| 2 | Search creditor name against SEC EDGAR ABS trust registry |
| 3 | If HIGH likelihood: CUSIP logged → Section 3 demands auto-added to letter |
| 4 | Run audit script to generate §1692g Validation Demand |
| 5 | Mail via **USPS Certified Mail + Return Receipt (PS Form 3811)** |
| 6 | Enter tracking number when prompted → R.O.M.A.N. starts 30-day clock |

```bash
python scripts/securitization-audit.py
```

**What it creates:**
- `output/validation-letters/` — signed dispute letter
- `certified_mail_tracking` record → monitoring active
- `debt_vectors.status` = `Validation Sent`

**Key law:**
- `15 U.S.C. § 1692g` — Right to demand verification
- `15 U.S.C. § 1692g(b)` — Collector MUST cease upon written dispute
- `UCC § 3-301` — Only the Holder may enforce; servicer ≠ holder

---

## Phase 2 — Enforcement *(The Administrative Default)*

**Goal:** Document the violation. The silence is the weapon.

**Trigger:** `debt_vectors.status = 'Validation Sent'` AND `response_deadline < today`

| Step | Action |
|------|--------|
| 1 | Dashboard shows **NON-RESPONSE** status |
| 2 | Run enforcement engine |
| 3 | Log any post-deadline contacts (each = separate $1,000 violation) |
| 4 | Mail §1692g(b) Violation Notice — 14-day cure window |
| 5 | Enter new tracking number → R.O.M.A.N. starts 14-day clock |

```bash
python scripts/non-response-enforcement.py

# For the Feb 2026 certified mail campaign:
python scripts/non-response-enforcement.py certified

# For a specific debt by UUID:
python scripts/non-response-enforcement.py <uuid>
```

**What it creates:**
- `output/non-response-notices/` — §1692g(b) enforcement letter
- New `certified_mail_tracking` record with `campaign_id = 'NON_RESPONSE_ENFORCEMENT_2026'`
- `debt_vectors.status` = `Non-Response`

**Key law:**
- `15 U.S.C. § 1692g(b)` — Each post-dispute contact = separate $1,000 violation
- `15 U.S.C. § 1692k` — Civil liability: $1,000/violation + fees
- `15 U.S.C. § 1681s-2(a)(3)` — Must notify CRAs account is disputed

---

## Phase 3 — Litigation *(The Kinetic Strike)*

**Goal:** Move from administrative record to courthouse. Shift from defender to plaintiff.

**Trigger:** 14-day cure period expires. `debt_vectors.status = 'Non-Response'`

| Step | Action |
|------|--------|
| 1 | Generate civil complaint — auto-selects Magistrate vs. State Court |
| 2 | Print 3 copies of Complaint + Filing Checklist |
| 3 | File at **325 E. Washington St., Athens, GA 30601** |
| 4 | Pay filing fee: $53 (Magistrate) or $75–$195 (State Court) |
| 5 | Log case number in R.O.M.A.N. |

```bash
python scripts/small-claims-complaint.py

# Specific debt:
python scripts/small-claims-complaint.py <uuid>
```

```bash
# After filing — log the case number:
python scripts/judgment-tracker.py file
```

**What it creates:**
- `output/small-claims-complaints/` — court-ready complaint + checklist
- `judgments` table record
- `debt_vectors.status` = `Legal Action Pending`

**Courts:**
| Claim Amount | Court | Address | Filing Fee |
|---|---|---|---|
| ≤ $15,000 | Magistrate Court of Clarke County | 325 E. Washington St., Suite 330 | $53 |
| > $15,000 | State Court of Clarke County | 325 E. Washington St. | $75–$195 |

**Key hearing script:**
> "I sent a written dispute under 15 USC §1692g. They received it. They never responded.
> I am owed $1,000 per violation by statute. *Jerman v. Carlisle*, 559 U.S. 573 (2010)."

**Key law:**
- `15 U.S.C. § 1692k(d)` — FDCPA claims in any court of competent jurisdiction
- `O.C.G.A. § 15-10-2` — Magistrate Court jurisdiction up to $15,000
- `Jerman v. Carlisle` — Intent NOT required for FDCPA liability

---

## Phase 4 — Collection *(Reclaiming the Energy)*

**Goal:** Enforce the court order. The judgment is an ORDER, not a request.

**Trigger:** `judgments.status = 'judgment_obtained'` or `'default_judgment'`

### 4A — Record the Outcome

```bash
python scripts/judgment-tracker.py outcome
```

> **Interest clock starts the day judgment is entered.**
> 7% per annum under O.C.G.A. § 7-4-12 — accrues daily until paid.

### 4B — Generate Summons of Garnishment (if not paid in 30 days)

```bash
python scripts/judgment-tracker.py garnish
```

**Target:** The collector's bank (most common). Wells Fargo, Chase, etc.

**Effect:**
- Sheriff serves the bank (Garnishee) with the Summons
- Bank must **freeze** defendant's funds immediately to protect itself from liability
- Bank must **answer** within 45 days (O.C.G.A. § 18-4-6)
- If bank ignores it: **default judgment against the bank** (they become personally liable)

### 4C — Log Collections

```bash
python scripts/judgment-tracker.py collect
```

**What it creates:**
- `output/garnishments/` — Summons of Garnishment
- `judgments.garnishment_filed` = `true`
- `debt_vectors.status` = `Collecting`
- Auto-marks `Satisfied` when full amount collected

**Key law:**
- `O.C.G.A. § 18-4-1` — Georgia post-judgment garnishment
- `O.C.G.A. § 18-4-4` — Summons of Garnishment
- `O.C.G.A. § 18-4-6` — Garnishee answer: 45 days
- `O.C.G.A. § 7-4-12` — 7% post-judgment interest
- `15 U.S.C. § 1673` — Federal wage garnishment limit: 25% of disposable earnings

---

## Phase 5 — Clean Slate *(The Final Seal)*

**Goal:** Erase the ghost. Purge every record. Cancel every lien.

**Trigger:** `judgments.status = 'satisfied'` or `'settled'`

```bash
python scripts/satisfaction-demand.py

# Specific judgment:
python scripts/satisfaction-demand.py <judgment-uuid>
```

**What it generates:**

| Document | Recipient | Deadline |
|----------|-----------|---------|
| CRA Deletion Letter | Equifax | 30 days to delete |
| CRA Deletion Letter | Experian | 30 days to delete |
| CRA Deletion Letter | TransUnion | 30 days to delete |
| CRA Deletion Letter | Dun & Bradstreet (optional) | 30 days to delete |
| Furnisher Deletion Notice | Original Collector | 14 days to instruct CRAs |
| Fi.Fa. Cancellation Memo | Clarke County Clerk (notarized) | File at courthouse |

**All documents sent via USPS Certified Mail + Return Receipt.**

**After 45 days:** Pull credit reports at `annualcreditreport.com`
If tradeline still appears → file FCRA action → $1,000 per violation.

**Key law:**
- `15 U.S.C. § 1681i` — CRA reinvestigation duty (30 days)
- `15 U.S.C. § 1681s-2(a)(1)` — Furnisher must retract inaccurate reporting
- `15 U.S.C. § 1681n` — Willful FCRA violation: $1,000 + punitive + fees
- `O.C.G.A. § 9-12-65` — Entry of Satisfaction on Execution Docket

---

## Weekly Operations — Every Monday 9:00 AM

```bash
python scripts/judgment-tracker.py dashboard
```

**R.O.M.A.N. will display:**
- All debts by pipeline phase
- Active judgments with live 7% interest totals
- Any non-responders past their deadlines
- Next action required for each vector

---

## Pipeline Status Reference

| `debt_vectors.status` | Phase | Next Action |
|---|---|---|
| `Pending` | 0 | Run securitization-audit.py |
| `Validation Sent` | 1 | Await 30-day response |
| `Non-Response` | 2 | Run small-claims-complaint.py |
| `Legal Action Pending` | 3 | File at courthouse, log case |
| `Judgment Obtained` | 4A | Run judgment-tracker.py garnish |
| `Collecting` | 4B | Run judgment-tracker.py collect |
| `Satisfied` | 5 | Run satisfaction-demand.py |
| `Resolved` | Final | No further action |

---

## Script Reference

| Script | Phase | Command |
|--------|-------|---------|
| `securitization-audit.py` | 0/1 | `python scripts/securitization-audit.py` |
| `non-response-enforcement.py` | 2 | `python scripts/non-response-enforcement.py` |
| `small-claims-complaint.py` | 3 | `python scripts/small-claims-complaint.py` |
| `judgment-tracker.py` | 4 | `python scripts/judgment-tracker.py [file\|outcome\|garnish\|collect\|dashboard]` |
| `satisfaction-demand.py` | 5 | `python scripts/satisfaction-demand.py` |

---

## Migrations to Deploy

```bash
npx supabase db push
```

| Migration | Creates |
|-----------|---------|
| `20260221_debt_vectors_identities.sql` | `identities`, `debt_vectors`, `debt_validation_dashboard` view |
| `20260221_judgments.sql` | `judgments`, `judgment_interest_view`, `roman_enforcement_summary` view |

---

## Output Directory Structure

```
output/
├── validation-letters/       Phase 1: §1692g dispute letters
├── non-response-notices/     Phase 2: §1692g(b) enforcement notices
├── small-claims-complaints/  Phase 3: civil complaints + checklists
├── judgments/                Phase 4: judgment documentation
├── garnishments/             Phase 4: Summons of Garnishment
└── satisfaction-demands/     Phase 5: CRA deletion letters + Fi.Fa. cancellation
```

---

*Howard Jones Bloodline Ancestral Trust | Odyssey-1 AI LLC | Athens, Georgia*
*"A judgment is an ORDER. Non-response is evidence. The statute is strict liability."*
