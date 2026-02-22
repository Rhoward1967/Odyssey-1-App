"""
SMALL CLAIMS COMPLAINT GENERATOR — PHASE 3
============================================
R.O.M.A.N. 2.0 — FDCPA Civil Action Protocol

After a collector ignores the §1692g validation demand (Phase 1) AND
ignores the §1692g(b) Non-Response Enforcement Notice (Phase 2),
this script generates a court-ready civil complaint for filing in:

  • Magistrate Court of Clarke County, Georgia
    (Claims ≤ $15,000 — O.C.G.A. § 15-10-2)
  • State Court of Clarke County, Georgia
    (Claims > $15,000 — concurrent FDCPA jurisdiction under 15 U.S.C. § 1692k(d))

Legal Basis:
  15 U.S.C. § 1692k     — Civil liability: $1,000 per violation + actual
                           damages + mandatory attorney fees and costs
  15 U.S.C. § 1692k(d)  — FDCPA claims may be brought in any court of
                           competent jurisdiction (state or federal)
  15 U.S.C. § 1692g(b)  — Failure to cease collection after written
                           dispute is the core violation
  15 U.S.C. § 1681s-2   — FCRA furnisher violations (if applicable)
  O.C.G.A. § 10-1-392   — Georgia Fair Business Practices Act (companion)
  O.C.G.A. § 15-10-2    — Magistrate Court civil jurisdiction up to $15,000

Statute of Limitations:
  FDCPA: 1 year from date of violation (15 U.S.C. § 1692k(d))
  FCRA:  2 years from discovery of violation (15 U.S.C. § 1681p)

Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
"""

import os
import json
from datetime import datetime, timedelta, date

try:
    from supabase import create_client, Client
except ImportError:
    print("Install dependency: pip install supabase")
    exit(1)

# ============================================================================
# CONFIGURATION
# ============================================================================

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE") or os.environ.get("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE environment variables")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

OUTPUT_DIR = "output/small-claims-complaints"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── COURT INFORMATION ────────────────────────────────────────────────────────
# Magistrate Court of Clarke County, Georgia
# Jurisdiction: Civil claims up to $15,000 (O.C.G.A. § 15-10-2)
MAGISTRATE_COURT = {
    "name":    "MAGISTRATE COURT OF CLARKE COUNTY",
    "state":   "STATE OF GEORGIA",
    "address": "325 E. Washington St., Suite 330",
    "city":    "Athens, GA 30601",
    "phone":   "(706) 613-3190",
    "limit":   15_000,
}

# State Court of Clarke County (for claims > $15,000)
STATE_COURT = {
    "name":    "STATE COURT OF CLARKE COUNTY",
    "state":   "STATE OF GEORGIA",
    "address": "325 E. Washington St.",
    "city":    "Athens, GA 30601",
    "phone":   "(706) 613-3165",
    "limit":   None,  # No upper limit
}

# ── DAMAGES SCHEDULE ─────────────────────────────────────────────────────────
FDCPA_STATUTORY_PER_VIOLATION = 1_000   # 15 U.S.C. § 1692k(a)(2)(A)
FCRA_STATUTORY_PER_VIOLATION  = 1_000   # 15 U.S.C. § 1681n
ATTORNEY_FEE_ESTIMATE         = 3_500   # Mandatory under §1692k(a)(3); used in prayer


# ============================================================================
# COMPLAINT GENERATOR
# ============================================================================

def generate_complaint(
    debt: dict,
    identity: dict,
    phase1_tracking: dict,
    phase2_tracking: dict,
    defendant_legal_name: str,
    defendant_address: str,
    defendant_registered_agent: str,
    fdcpa_violations: list[dict],   # [{date, description, statute}]
    actual_damages: float,
    actual_damages_desc: str,
    include_fcra: bool,
    fcra_violation_count: int,
) -> tuple[str, str]:
    """
    Generate a court-ready FDCPA civil complaint.

    Returns (complaint_text, filing_checklist_text).
    Court is chosen automatically based on total damages claim.
    """

    today = datetime.now()

    # ── IDENTITY ─────────────────────────────────────────────────────────────
    trust_name     = identity.get("trust_name") or "Howard Jones Bloodline Ancestral Trust"
    trustee_name   = identity.get("full_name") or "Rickey Allan Howard"
    plaintiff_addr = identity.get("address") or "595 Macon Highway"
    plaintiff_city = identity.get("city") or "Athens"
    plaintiff_state = identity.get("state") or "GA"
    plaintiff_zip  = identity.get("zip") or "30606"
    plaintiff_full_addr = f"{plaintiff_addr}, {plaintiff_city}, {plaintiff_state} {plaintiff_zip}"

    # ── DEBT DETAILS ──────────────────────────────────────────────────────────
    creditor_name = debt.get("creditor_name", "[ORIGINAL CREDITOR]")
    amount        = float(debt.get("amount") or 0)
    acct_masked   = debt.get("account_number_masked", "XXXX")
    cusip_id      = debt.get("cusip_id")
    notes         = debt.get("notes", "")

    # ── CERTIFIED MAIL DATES ─────────────────────────────────────────────────
    def fmt_date(d):
        if not d:
            return "[DATE UNKNOWN]"
        try:
            return datetime.strptime(str(d), "%Y-%m-%d").strftime("%B %d, %Y")
        except Exception:
            return str(d)

    p1_sent     = fmt_date(phase1_tracking.get("date_mailed"))
    p1_tracking = phase1_tracking.get("tracking_number", "[TRACKING NUMBER]")
    p1_delivery = fmt_date(phase1_tracking.get("actual_delivery") or phase1_tracking.get("return_receipt_date"))
    p1_deadline = fmt_date(phase1_tracking.get("response_deadline"))

    p2_sent     = fmt_date(phase2_tracking.get("date_mailed")) if phase2_tracking else "[PHASE 2 DATE]"
    p2_tracking = phase2_tracking.get("tracking_number", "[ENFORCEMENT TRACKING]") if phase2_tracking else "[ENFORCEMENT TRACKING]"
    p2_delivery = fmt_date(phase2_tracking.get("actual_delivery")) if phase2_tracking else "[PHASE 2 DELIVERY]"
    p2_deadline = fmt_date(phase2_tracking.get("response_deadline")) if phase2_tracking else "[PHASE 2 DEADLINE]"

    # ── VIOLATIONS ────────────────────────────────────────────────────────────
    fdcpa_count   = len(fdcpa_violations) if fdcpa_violations else 1
    fdcpa_damages = FDCPA_STATUTORY_PER_VIOLATION * fdcpa_count
    fcra_damages  = FCRA_STATUTORY_PER_VIOLATION * fcra_violation_count if include_fcra else 0
    total_statutory = fdcpa_damages + fcra_damages
    total_claim     = total_statutory + actual_damages + ATTORNEY_FEE_ESTIMATE

    # ── COURT SELECTION ───────────────────────────────────────────────────────
    if total_claim <= MAGISTRATE_COURT["limit"]:
        court = MAGISTRATE_COURT
        court_note = "Small Claims — Magistrate Court (O.C.G.A. § 15-10-2)"
        filing_fee = "$53"
        serve_method = "Sheriff service or Certified Mail (O.C.G.A. § 15-10-43)"
    else:
        court = STATE_COURT
        court_note = "State Court — General Civil Division"
        filing_fee = "$75–$195 (depending on claim amount)"
        serve_method = "Sheriff personal service or acknowledgment of service"

    # ── VIOLATION PARAGRAPHS ──────────────────────────────────────────────────
    if fdcpa_violations:
        violation_paragraphs = ""
        for i, v in enumerate(fdcpa_violations, 1):
            violation_paragraphs += (
                f"   {i + 20}. On {v.get('date', '[DATE]')}, Defendant "
                f"{v.get('description', '[DESCRIBE CONTACT]')}. "
                f"This constitutes a violation of {v.get('statute', '15 U.S.C. § 1692g(b)')}. "
                f"[Exhibit {chr(65 + i)}: Documentation attached]\n\n"
            )
    else:
        violation_paragraphs = (
            "   21. Defendant failed to cease collection activity and/or continued to\n"
            "       maintain and report the unvalidated debt after receipt of the\n"
            "       written dispute, in violation of 15 U.S.C. § 1692g(b).\n\n"
            "   22. Defendant's continued maintenance of the debt as valid constitutes\n"
            "       a false representation of the character and legal status of the\n"
            "       alleged debt in violation of 15 U.S.C. § 1692e(2)(A).\n\n"
        )

    # ── CUSIP / SECURITIZATION COUNT ──────────────────────────────────────────
    securitization_count = ""
    if cusip_id:
        securitization_count = f"""
   COUNT IV — VIOLATION OF 15 U.S.C. § 1692e(2) (SECURITIZATION MISREPRESENTATION)

   29. Plaintiff realleges paragraphs 1–22 as if fully set forth herein.

   30. Defendant collected and/or attempted to collect this alleged debt
       while concealing that it had been securitized and transferred to an
       Asset-Backed Security (ABS) trust (CUSIP: {cusip_id}), making
       Defendant a mere servicer — not the Holder entitled to enforce under
       UCC § 3-301.

   31. By representing itself as the party with standing to collect without
       disclosing the true Holder, Defendant made a false representation of
       the character and legal status of the alleged debt in violation of
       15 U.S.C. § 1692e(2)(A) and § 1692e(10).

   WHEREFORE, Plaintiff demands judgment as set forth in the Prayer for Relief.
"""

    # ── FCRA COUNT ────────────────────────────────────────────────────────────
    fcra_count_text = ""
    if include_fcra:
        fcra_count_text = f"""
   COUNT {"V" if cusip_id else "IV"} — VIOLATION OF 15 U.S.C. § 1681s-2 (FCRA FURNISHER DUTIES)

   32. Plaintiff realleges paragraphs 1–22 as if fully set forth herein.

   33. Defendant is a "furnisher of information" as defined under the Fair
       Credit Reporting Act, 15 U.S.C. § 1681a.

   34. Upon receipt of Plaintiff's written dispute on {p1_sent},
       Defendant was required under 15 U.S.C. § 1681s-2(a)(3) to notify each
       consumer reporting agency (Equifax, Experian, TransUnion) that this
       account was disputed.

   35. Defendant failed to make said notification and/or failed to conduct
       a reasonable reinvestigation under 15 U.S.C. § 1681s-2(b).

   36. As a result, Defendant is liable to Plaintiff under 15 U.S.C. § 1681n
       (willful noncompliance) for statutory damages of ${FCRA_STATUTORY_PER_VIOLATION:,}
       per violation × {fcra_violation_count} violations = ${fcra_damages:,}, plus
       punitive damages and costs.

   WHEREFORE, Plaintiff demands judgment as set forth in the Prayer for Relief.
"""

    # ── ACTUAL DAMAGES BLOCK ──────────────────────────────────────────────────
    actual_damages_block = ""
    if actual_damages > 0 and actual_damages_desc:
        actual_damages_block = f"""
       • Actual damages: ${actual_damages:,.2f}
         ({actual_damages_desc})"""

    # ============================================================
    # BUILD THE COMPLAINT
    # ============================================================

    complaint = f"""{'=' * 72}
                    IN THE {court['name']}
                         {court['state']}
{'=' * 72}

{trust_name},
By and Through Its Trustee,
{trustee_name},
  Plaintiff,                                   Civil Action File No.: ___________

     v.

{defendant_legal_name},
  Defendant.

─────────────────────────────────────────────────────────────────────────────
     COMPLAINT FOR VIOLATIONS OF THE FAIR DEBT COLLECTION PRACTICES ACT
                    AND FAIR CREDIT REPORTING ACT
─────────────────────────────────────────────────────────────────────────────

Court: {court_note}
Filed: {today.strftime('%B %d, %Y')}


                              INTRODUCTION

   1. Plaintiff brings this action against Defendant for willful and/or
      negligent violations of the Fair Debt Collection Practices Act
      ("FDCPA"), 15 U.S.C. § 1692 et seq., and, if applicable, the Fair
      Credit Reporting Act ("FCRA"), 15 U.S.C. § 1681 et seq.

   2. Defendant is a debt collector within the meaning of 15 U.S.C. § 1692a(6)
      who failed to comply with its statutory obligations after receiving
      Plaintiff's written dispute — a violation that is clear on its face
      from certified mail delivery records alone.

   3. Plaintiff seeks statutory damages, actual damages, costs, and
      mandatory attorney fees as provided by federal law.


                           JURISDICTION AND VENUE

   4. This Court has jurisdiction pursuant to 15 U.S.C. § 1692k(d), which
      authorizes actions to be brought in "any appropriate United States
      district court without regard to the amount in controversy, or in any
      other court of competent jurisdiction."

   5. {court["name"].title()} is a court of competent jurisdiction
      under O.C.G.A. § 15-10-2 and the concurrent jurisdiction provisions
      of 15 U.S.C. § 1692k(d).

   6. Venue is proper in Clarke County, Georgia, as Plaintiff resides at
      {plaintiff_full_addr}, and the cause of action arose in this county.


                                  PARTIES

   7. Plaintiff {trust_name} is a lawfully constituted ancestral trust,
      acting through its Trustee, {trustee_name}, whose address is
      {plaintiff_full_addr} ("Plaintiff").

   8. Plaintiff is a "consumer" within the meaning of 15 U.S.C. § 1692a(3).

   9. Defendant {defendant_legal_name}, whose principal address is
      {defendant_address}, is a "debt collector" within the meaning of
      15 U.S.C. § 1692a(6), regularly engaged in the collection of consumer
      debts in interstate commerce.

  10. Defendant's registered agent for service of process is:
      {defendant_registered_agent}


                              STATEMENT OF FACTS

  11. On or about {p1_sent}, Plaintiff sent Defendant a written dispute of
      an alleged debt, pursuant to 15 U.S.C. § 1692g, via USPS Certified
      Mail, Tracking No. {p1_tracking}.

  12. Defendant received Plaintiff's dispute on approximately {p1_delivery},
      as confirmed by USPS delivery records. [Exhibit A: USPS Tracking
      Confirmation attached]

  13. Plaintiff's dispute letter demanded:
        (a) Verification of the alleged debt;
        (b) Name and address of the original creditor;
        (c) Proof of Defendant's legal standing to collect;
        (d) Proof that the statute of limitations has not expired.

  14. Plaintiff identified the following alleged debt:
        • Alleged Account No.: {acct_masked}
        • Alleged Original Creditor: {creditor_name}
        • Alleged Amount: ${amount:,.2f}

  15. Under 15 U.S.C. § 1692g(b), upon receipt of a written dispute,
      Defendant was required to CEASE ALL collection activity until it
      obtained and mailed verification to Plaintiff.

  16. Defendant's 30-day response window expired on approximately {p1_deadline}.

  17. Defendant failed to provide ANY verification, copy of judgment, or
      name and address of the original creditor within the statutory period.

  18. On {p2_sent}, Plaintiff sent Defendant a formal §1692g(b) Non-Response
      Enforcement Notice via USPS Certified Mail, Tracking No. {p2_tracking},
      delivered approximately {p2_delivery}, with a 14-day compliance deadline
      of {p2_deadline}. [Exhibit B: Enforcement Notice attached]

  19. Defendant again failed to respond or comply with any of Plaintiff's
      documented demands.

  20. Defendant's conduct was willful, knowing, and in reckless disregard of
      Plaintiff's statutory rights.

{violation_paragraphs}

                               CAUSES OF ACTION

─────────────────────────────────────────────────────────────────────────────
   COUNT I — VIOLATION OF 15 U.S.C. § 1692g(b)
   (FAILURE TO CEASE COLLECTION UPON WRITTEN DISPUTE)
─────────────────────────────────────────────────────────────────────────────

   23. Plaintiff realleges paragraphs 1–22 as if fully set forth herein.

   24. Defendant received Plaintiff's written dispute on {p1_delivery} and
       thereafter failed to cease collection activity as required by
       15 U.S.C. § 1692g(b).

   25. Each post-dispute collection communication constitutes a separate
       violation. See Jerman v. Carlisle, McNellie, Rini, Kramer & Ulrich
       LPA, 559 U.S. 573 (2010) (FDCPA does not require proof of intent).

   WHEREFORE, Plaintiff demands judgment as set forth in the Prayer for Relief.

─────────────────────────────────────────────────────────────────────────────
   COUNT II — VIOLATION OF 15 U.S.C. § 1692e
   (FALSE AND MISLEADING REPRESENTATIONS)
─────────────────────────────────────────────────────────────────────────────

   26. Plaintiff realleges paragraphs 1–22 as if fully set forth herein.

   27. By continuing to maintain, report, or imply that this alleged debt
       is legally collectible without providing validation, Defendant made
       false representations as to the character, amount, and legal status
       of the alleged debt, in violation of 15 U.S.C. § 1692e(2)(A).

   28. Defendant's failure to disclose its inability to verify the debt
       while continuing collection activity constitutes a deceptive means
       to collect a debt in violation of 15 U.S.C. § 1692e(10).

   WHEREFORE, Plaintiff demands judgment as set forth in the Prayer for Relief.

─────────────────────────────────────────────────────────────────────────────
   COUNT III — VIOLATION OF 15 U.S.C. § 1692k
   (CIVIL LIABILITY)
─────────────────────────────────────────────────────────────────────────────

   Defendant is liable to Plaintiff for:
     • Statutory damages of ${FDCPA_STATUTORY_PER_VIOLATION:,} per violation ×
       {fdcpa_count} documented violation(s) = ${fdcpa_damages:,}
     • Actual damages as proven at trial
     • Attorney fees and costs (mandatory, not discretionary)
{securitization_count}{fcra_count_text}

                            PRAYER FOR RELIEF

   WHEREFORE, Plaintiff respectfully requests that this Court enter
   judgment in favor of Plaintiff and against Defendant as follows:

   A. Statutory damages under 15 U.S.C. § 1692k(a)(2)(A):
      ${FDCPA_STATUTORY_PER_VIOLATION:,} × {fdcpa_count} violation(s) = ${fdcpa_damages:,}
{f"   B. Actual damages: ${actual_damages:,.2f} ({actual_damages_desc})" if actual_damages > 0 else "   B. Actual damages: To be determined at trial"}
   {"C" if actual_damages > 0 else "C"}. Costs of suit
   {"D" if actual_damages > 0 else "D"}. Attorney fees pursuant to 15 U.S.C. § 1692k(a)(3)
      (estimated: ${ATTORNEY_FEE_ESTIMATE:,} — mandatory upon any recovery)
   {"E" if actual_damages > 0 else "E"}. Such other and further relief as the Court deems just and proper
{f"   F. FCRA statutory damages: ${fcra_damages:,}" if include_fcra else ""}

   TOTAL CLAIM (estimated):  ${total_claim:,.2f}

   NOTE: Statutory damages are mandatory upon proof of any FDCPA violation
   regardless of actual harm. See 15 U.S.C. § 1692k(a)(2)(A).


                            JURY TRIAL DEMAND

   Plaintiff demands a trial by jury on all issues so triable.


                               VERIFICATION

   I, {trustee_name}, Trustee of the {trust_name}, being duly sworn,
   state that I have read the foregoing complaint and that the facts
   alleged therein are true and correct to the best of my knowledge,
   information, and belief.


{'_' * 50}
{trustee_name}, Trustee
{trust_name}
{plaintiff_addr}
{plaintiff_city}, {plaintiff_state} {plaintiff_zip}

Date: {today.strftime('%B %d, %Y')}

Pro Se Plaintiff
(No attorney required for Small Claims / Magistrate Court)


{'─' * 72}
STATUTORY REFERENCES:
  15 U.S.C. § 1692g(b)  — Cease-collection obligation upon written dispute
  15 U.S.C. § 1692e     — Prohibition on false/misleading representations
  15 U.S.C. § 1692k     — Civil liability — $1,000 per violation
  15 U.S.C. § 1692k(d)  — Jurisdiction in any court of competent jurisdiction
  15 U.S.C. § 1681s-2   — FCRA furnisher obligations (if applicable)
  15 U.S.C. § 1681n     — FCRA civil liability — willful noncompliance
  O.C.G.A. § 15-10-2    — Magistrate Court jurisdiction up to $15,000
  UCC § 3-301            — Person entitled to enforce instrument
  Jerman v. Carlisle     — 559 U.S. 573 (2010): intent not required for FDCPA
{'=' * 72}
"""

    # ============================================================
    # FILING CHECKLIST
    # ============================================================

    checklist = f"""{'=' * 72}
FILING CHECKLIST — {court['name']}
R.O.M.A.N. 2.0 — Phase 3 Small Claims Protocol
Generated: {today.strftime('%B %d, %Y')}
{'=' * 72}

CASE: {trust_name} v. {defendant_legal_name}
CLAIM: ${total_claim:,.2f} (FDCPA violations)

─────────────────────────────────────────────────────────────────────────────
STEP 1: ASSEMBLE YOUR EVIDENCE FILE
─────────────────────────────────────────────────────────────────────────────

  □ Exhibit A: USPS Tracking — Phase 1 dispute letter ({p1_tracking})
               Print from: https://tools.usps.com/go/TrackConfirmAction
  □ Exhibit B: Signed green card / USPS delivery confirmation (Phase 1)
  □ Exhibit C: Copy of Phase 1 dispute letter (§1692g demand)
  □ Exhibit D: USPS Tracking — Phase 2 enforcement notice ({p2_tracking})
  □ Exhibit E: Copy of Phase 2 non-response enforcement notice
  □ Exhibit F: Any credit report showing unvalidated tradeline (if applicable)
  □ Exhibit G: Any post-dispute collection letters/calls received (each = violation)
  □ Exhibit H: CUSIP / EDGAR documentation (if cusip_id set)

─────────────────────────────────────────────────────────────────────────────
STEP 2: PREPARE COMPLAINT PACKAGE (3 COPIES)
─────────────────────────────────────────────────────────────────────────────

  □ This complaint (signed) — 3 copies
  □ All exhibits labeled and tabbed — 3 copies
  □ Completed Magistrate Court civil claim form (get from clerk)
  □ Government-issued ID (Trustee identification)

─────────────────────────────────────────────────────────────────────────────
STEP 3: FILE AT COURTHOUSE
─────────────────────────────────────────────────────────────────────────────

  Court:    {court['name']}
  Address:  {court['address']}
            {court['city']}
  Phone:    {court['phone']}
  Hours:    8:00 AM – 5:00 PM, Monday–Friday (call to confirm)

  □ File complaint with clerk
  □ Pay filing fee: {filing_fee}
  □ Request case number / docket assignment
  □ Ask clerk to serve Defendant: {serve_method}
  □ Keep file-stamped copy for your records

─────────────────────────────────────────────────────────────────────────────
STEP 4: SERVICE ON DEFENDANT
─────────────────────────────────────────────────────────────────────────────

  Defendant: {defendant_legal_name}
  Address:   {defendant_address}
  Reg Agent: {defendant_registered_agent}

  Service Method: {serve_method}
  (Clerk will arrange in small claims; note Sheriff fee may apply)

  □ Confirm service completed
  □ File proof of service with court clerk
  □ Note: Defendant has 30 days from service to file an Answer in State Court
    (Magistrate Court may have shorter window — confirm with clerk)

─────────────────────────────────────────────────────────────────────────────
STEP 5: HEARING PREPARATION
─────────────────────────────────────────────────────────────────────────────

  □ Bring all exhibits, organized in order
  □ Prepare 1-page timeline: dispute sent → no response → filing date
  □ Key points to state at hearing:
      1. "I sent a written dispute under 15 USC §1692g. Exhibit A."
      2. "Defendant received it on [date]. Exhibit B."
      3. "Defendant never responded. 30 days passed."
      4. "I then sent a 14-day enforcement notice. Exhibit D."
      5. "Still no response. I am owed $1,000 per violation by statute."
      6. "The FDCPA does not require proof of actual harm. Jerman v. Carlisle."
  □ Statutory damages are MANDATORY upon proof of any violation
  □ Do NOT negotiate below statutory minimum unless attorney advises

─────────────────────────────────────────────────────────────────────────────
STEP 6: AFTER JUDGMENT
─────────────────────────────────────────────────────────────────────────────

  □ If you WIN: Request judgment enforcement if not paid within 30 days
      - File for garnishment of bank accounts (O.C.G.A. § 18-4-1)
      - File lien on business property
  □ If Defendant DEFAULTS (no answer): Request default judgment from clerk
  □ Update R.O.M.A.N.: debt_vectors.status → 'Judgment Obtained'
  □ Notify all 3 CRAs of judgment for tradeline correction

─────────────────────────────────────────────────────────────────────────────
IMPORTANT LEGAL NOTES
─────────────────────────────────────────────────────────────────────────────

  • Statute of limitations: 1 year from violation date (FDCPA)
    Your original dispute was sent {p1_sent}. If no response by
    {p1_sent[:3] if len(p1_sent) > 3 else p1_sent} (1 year later), the clock expires.
    FILE BEFORE THE 1-YEAR DEADLINE.

  • You are filing Pro Se (self-represented). Courts are required to
    liberally construe pro se pleadings. Erickson v. Pardus, 551 U.S. 89 (2007).

  • The FDCPA does not require proof of actual harm for statutory damages.
    Proof of the violation = entitlement to $1,000 per violation.

  • Attorney fee awards are MANDATORY for any prevailing plaintiff under
    § 1692k(a)(3). This gives you negotiating leverage even before trial.

  • Consider consulting a consumer protection attorney — many take FDCPA
    cases on contingency (no upfront cost) because fees are mandatory.
    Find one at: www.consumeradvocates.org or naca.net

─────────────────────────────────────────────────────────────────────────────
ESTIMATED CLAIM BREAKDOWN
─────────────────────────────────────────────────────────────────────────────

  FDCPA Statutory Damages:  ${fdcpa_damages:>10,}
    (${FDCPA_STATUTORY_PER_VIOLATION:,}/violation × {fdcpa_count} violations)
{f"  FCRA Statutory Damages:   ${fcra_damages:>10,}" if include_fcra else ""}
  Actual Damages:           ${actual_damages:>10,.2f}
  Attorney Fees (est.):     ${ATTORNEY_FEE_ESTIMATE:>10,}
  ─────────────────────────────────────
  TOTAL CLAIM:              ${total_claim:>10,.2f}

{'=' * 72}
"""

    return complaint.strip(), checklist.strip()


# ============================================================================
# PULL PHASE 3 CANDIDATES
# ============================================================================

def get_phase3_debts(specific_id: str = None) -> list[dict]:
    """
    Pull debt_vectors with status 'Non-Response' — these have gone through
    Phase 1 (dispute) and Phase 2 (enforcement notice) with no response.
    """
    query = (
        supabase.table("debt_vectors")
        .select("*, identities(*)")
        .eq("status", "Non-Response")
    )

    if specific_id:
        query = query.eq("id", specific_id)

    result = query.execute()
    debts  = result.data or []

    # Enrich with certified mail records
    enriched = []
    for debt in debts:
        phase1_tracking = {}
        phase2_tracking = {}

        # Phase 1 tracking — from certified_mail_tracking
        if debt.get("certified_mail_number"):
            tr = (
                supabase.table("certified_mail_tracking")
                .select("*")
                .eq("tracking_number", debt["certified_mail_number"])
                .execute()
            )
            if tr.data:
                phase1_tracking = tr.data[0]

        # Phase 2 tracking — campaign_id = 'NON_RESPONSE_ENFORCEMENT_2026'
        # and entity_name matches creditor
        creditor = debt.get("creditor_name", "")
        if creditor:
            tr2 = (
                supabase.table("certified_mail_tracking")
                .select("*")
                .eq("campaign_id", "NON_RESPONSE_ENFORCEMENT_2026")
                .eq("entity_name", creditor)
                .execute()
            )
            if tr2.data:
                phase2_tracking = tr2.data[0]

        debt["_phase1_tracking"] = phase1_tracking
        debt["_phase2_tracking"] = phase2_tracking
        enriched.append(debt)

    return enriched


# ============================================================================
# MAIN RUNNER
# ============================================================================

def run_phase3(specific_id: str = None):
    """
    Pull all Non-Response debts, gather court info via prompt,
    generate complaint + checklist, update status.
    """

    print(f"\n{'=' * 60}")
    print("ODYSSEY-1 SMALL CLAIMS COMPLAINT GENERATOR")
    print("R.O.M.A.N. 2.0 — FDCPA Phase 3 Civil Action Protocol")
    print(f"Run: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'=' * 60}\n")

    debts = get_phase3_debts(specific_id)

    if not debts:
        print("✅ No Phase 3 candidates found.")
        print("   (Looking for debt_vectors with status = 'Non-Response')")
        print("   Run non-response-enforcement.py first to move debts to Phase 3.")
        return []

    print(f"⚖️  FOUND {len(debts)} DEBT(S) READY FOR CIVIL ACTION\n")
    print("─" * 60)

    generated = []

    for debt in debts:
        identity        = debt.get("identities") or {}
        phase1_tracking = debt.get("_phase1_tracking") or {}
        phase2_tracking = debt.get("_phase2_tracking") or {}
        creditor        = debt.get("creditor_name", "UNKNOWN")
        amount          = float(debt.get("amount") or 0)
        acct_masked     = debt.get("account_number_masked", "XXXX")
        cusip_id        = debt.get("cusip_id")

        print(f"  CREDITOR: {creditor}")
        print(f"  AMOUNT:   ${amount:,.2f}")
        print(f"  ACCOUNT:  {acct_masked}")
        if cusip_id:
            print(f"  CUSIP:    {cusip_id} (securitization violation applicable)")
        print()

        # ── DEFENDANT INFO ────────────────────────────────────────────────────
        print("  ── DEFENDANT INFORMATION ──────────────────────────────")
        print("  (Used for caption and service of process)")
        defendant_legal_name  = input(f"    Defendant legal name (e.g. 'Portfolio Recovery Associates, LLC'): ").strip()
        defendant_address     = input(f"    Defendant address (one line): ").strip()
        defendant_reg_agent   = input(f"    Registered agent (name + address, or 'same as above'): ").strip()

        # ── VIOLATIONS ────────────────────────────────────────────────────────
        print("\n  ── FDCPA VIOLATIONS ────────────────────────────────────")
        print("  List each post-dispute collection contact as a separate count.")
        print("  Each = $1,000 statutory damages. Press Enter when done.")
        violations = []
        v_num = 1
        while True:
            v_date = input(f"    Violation #{v_num} date (MM/DD/YYYY or Enter to skip): ").strip()
            if not v_date:
                break
            v_desc = input(f"    Describe contact (e.g. 'called Plaintiff at (706) 555-xxxx'): ").strip()
            v_stat = input(f"    Statute (default: 15 U.S.C. § 1692g(b)): ").strip() or "15 U.S.C. § 1692g(b)"
            violations.append({
                "date":        v_date,
                "description": v_desc,
                "statute":     v_stat,
            })
            v_num += 1

        # ── ACTUAL DAMAGES ────────────────────────────────────────────────────
        print("\n  ── ACTUAL DAMAGES (beyond $1,000 statutory) ───────────")
        actual_damages_str = input(f"    Actual damages amount (0 if none): ").strip() or "0"
        try:
            actual_damages = float(actual_damages_str.replace(",", "").replace("$", ""))
        except ValueError:
            actual_damages = 0.0
        actual_damages_desc = ""
        if actual_damages > 0:
            actual_damages_desc = input(f"    Describe actual damages: ").strip()

        # ── FCRA ──────────────────────────────────────────────────────────────
        include_fcra_str = input("\n  Include FCRA count? (y/n, default n): ").strip().lower()
        include_fcra = include_fcra_str == "y"
        fcra_violation_count = 0
        if include_fcra:
            fcra_str = input("    Number of FCRA violations (usually 3 — one per CRA): ").strip() or "3"
            try:
                fcra_violation_count = int(fcra_str)
            except ValueError:
                fcra_violation_count = 1

        # ── GENERATE ──────────────────────────────────────────────────────────
        complaint, checklist = generate_complaint(
            debt=debt,
            identity=identity,
            phase1_tracking=phase1_tracking,
            phase2_tracking=phase2_tracking,
            defendant_legal_name=defendant_legal_name,
            defendant_address=defendant_address,
            defendant_registered_agent=defendant_reg_agent,
            fdcpa_violations=violations,
            actual_damages=actual_damages,
            actual_damages_desc=actual_damages_desc,
            include_fcra=include_fcra,
            fcra_violation_count=fcra_violation_count,
        )

        # ── SAVE ──────────────────────────────────────────────────────────────
        safe_name      = creditor.replace(" ", "_").replace("/", "-")[:30]
        safe_defendant = defendant_legal_name.replace(" ", "_").replace("/", "-")[:20]
        base_name      = f"complaint_{debt['id'][:8]}_{safe_name}_v_{safe_defendant}"

        complaint_file  = os.path.join(OUTPUT_DIR, f"{base_name}.txt")
        checklist_file  = os.path.join(OUTPUT_DIR, f"{base_name}_CHECKLIST.txt")

        with open(complaint_file, "w") as f:
            f.write(complaint)
        with open(checklist_file, "w") as f:
            f.write(checklist)

        print(f"\n  ✅ Complaint saved:  {complaint_file}")
        print(f"  ✅ Checklist saved:  {checklist_file}")

        # ── UPDATE STATUS ──────────────────────────────────────────────────────
        supabase.table("debt_vectors").update({
            "status": "Legal Action Pending",
            "notes": (
                (debt.get("notes") or "") +
                f"\n[PHASE 3 — {datetime.now().strftime('%Y-%m-%d')}] "
                f"Small claims complaint generated. "
                f"Defendant: {defendant_legal_name}. "
                f"Total claim: ${sum([FDCPA_STATUTORY_PER_VIOLATION * max(len(violations),1), actual_damages, ATTORNEY_FEE_ESTIMATE]):,.2f}"
            ).strip(),
        }).eq("id", debt["id"]).execute()

        print(f"  ✅ Status updated: Non-Response → Legal Action Pending")

        fdcpa_count   = max(len(violations), 1)
        total_claim   = (
            FDCPA_STATUTORY_PER_VIOLATION * fdcpa_count
            + (FCRA_STATUTORY_PER_VIOLATION * fcra_violation_count if include_fcra else 0)
            + actual_damages
            + ATTORNEY_FEE_ESTIMATE
        )

        generated.append({
            "creditor":        creditor,
            "defendant":       defendant_legal_name,
            "violations":      fdcpa_count,
            "total_claim":     total_claim,
            "complaint_file":  complaint_file,
            "checklist_file":  checklist_file,
        })

        print("\n" + "─" * 60)

    # ── SUMMARY ───────────────────────────────────────────────────────────────
    total_all_claims = sum(g["total_claim"] for g in generated)

    print(f"\n{'=' * 60}")
    print(f"PHASE 3 COMPLETE — {len(generated)} COMPLAINT(S) GENERATED")
    print(f"{'=' * 60}")

    for g in generated:
        print(f"  • {g['creditor']} v. {g['defendant']}")
        print(f"    Violations:   {g['violations']}")
        print(f"    Total Claim:  ${g['total_claim']:,.2f}")
        print(f"    Complaint:    {g['complaint_file']}")
        print(f"    Checklist:    {g['checklist_file']}")
        print()

    print(f"  TOTAL VALUE OF ALL CLAIMS: ${total_all_claims:,.2f}")
    print(f"""
NEXT STEPS:
  1. Review complaint for accuracy before filing
  2. Print complaint + exhibits (3 copies)
  3. File at Magistrate or State Court (see checklist for address)
  4. Serve defendant per clerk instructions
  5. If Defendant settles before hearing: document settlement in writing,
     confirm tradeline deletion, update R.O.M.A.N. status → 'Resolved'
  6. If judgment obtained: update status → 'Judgment Obtained'

STATUTE OF LIMITATIONS REMINDER:
  FDCPA violations expire 1 year from the date of each violation.
  File BEFORE the deadline — R.O.M.A.N. will track it.

Pro se plaintiffs win FDCPA cases regularly.
The statute is strict liability — the violation either happened or it didn't.
""")

    return generated


# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    import sys

    # Usage:
    #   python scripts/small-claims-complaint.py           (all Non-Response debts)
    #   python scripts/small-claims-complaint.py <uuid>    (specific debt)

    arg = sys.argv[1] if len(sys.argv) > 1 else None

    if arg and len(arg) > 10:
        run_phase3(specific_id=arg)
    else:
        run_phase3()
