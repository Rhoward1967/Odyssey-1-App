"""
NON-RESPONSE ENFORCEMENT ENGINE
================================
R.O.M.A.N. 2.0 — §1692g(b) Violation Notice & Enforcement Phase

When a debt collector fails to respond to a §1692g validation demand
within 30 days, they are in active violation of federal law. Each
collection communication made after the dispute letter is a separate
$1,000 violation. This engine documents those violations and generates
the enforcement letter that precedes civil action.

Legal Basis:
  15 USC §1692g(b) — Collector MUST cease ALL collection activity
                     upon written dispute until validation is mailed
  15 USC §1692k     — Civil liability: $1,000/violation + actual
                     damages + attorney fees + class action exposure
  15 USC §1681s-2(a)(3) — Furnisher MUST notify CRAs account is disputed
  15 USC §1681n/1681o    — FCRA civil liability for willful/negligent
                           noncompliance ($100-$1,000/violation)
  UCC § 3-301       — Holder in Due Course — unresolved by non-response

What happens when they don't respond:
  1. They cannot legally continue collection (§1692g(b))
  2. They cannot obtain a judgment (no valid basis)
  3. Any tradeline they maintain without dispute notation violates FCRA
  4. Each contact post-dispute = separate FDCPA violation
  5. Statute of limitations on FDCPA: 1 year from violation date

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

OUTPUT_DIR = "output/non-response-notices"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Statutory damages per violation under 15 USC §1692k(a)(2)(A)
FDCPA_STATUTORY_DAMAGES   = 1_000
# Per violation under FCRA §1681n (willful)
FCRA_STATUTORY_DAMAGES    = 1_000
# Attorney fee estimate (conservative) — strengthens demand
ATTORNEY_FEE_ESTIMATE     = 3_500


# ============================================================================
# ENFORCEMENT LETTER GENERATOR
# ============================================================================

def generate_enforcement_letter(
    debt: dict,
    identity: dict,
    collector_name: str,
    collector_address: str,
    original_letter_date: str,
    certified_mail_number: str,
    delivery_date: str,
    days_overdue: int,
    post_deadline_contacts: list[str],  # list of contact descriptions after deadline
) -> str:
    """
    Generate a §1692g(b) Non-Response Enforcement Notice.

    This is Phase 2 — sent when the collector failed to respond within 30 days.
    It documents active violations and demands account closure before civil filing.

    Key legal effect:
    - Documents the exact moment violations began (day 31)
    - Each post-deadline contact = separate $1,000 FDCPA violation
    - Creates the evidentiary record for small claims or federal court filing
    - Forces a binary choice: close the account in writing OR face litigation
    """

    today      = datetime.now()
    reply_by   = today + timedelta(days=14)  # 14-day reply window (tighter than initial)

    # Pull identity fields
    trust_name     = identity.get("trust_name") or "Howard Jones Bloodline Ancestral Trust"
    trustee_name   = identity.get("full_name") or identity.get("name") or "Rickey Allan Howard"
    debtor_address = identity.get("address") or "595 Macon Highway"
    debtor_city    = identity.get("city") or "Athens"
    debtor_state   = identity.get("state") or "GA"
    debtor_zip     = identity.get("zip") or "30606"

    creditor_name = debt.get("creditor_name", "[ORIGINAL CREDITOR]")
    amount        = float(debt.get("amount") or 0)
    acct_masked   = debt.get("account_number_masked", "XXXX")
    cusip_id      = debt.get("cusip_id")

    # Calculate violation exposure
    known_violation_count = len(post_deadline_contacts) if post_deadline_contacts else 1
    min_fdcpa_damages     = FDCPA_STATUTORY_DAMAGES * known_violation_count
    total_exposure        = min_fdcpa_damages + FCRA_STATUTORY_DAMAGES + ATTORNEY_FEE_ESTIMATE

    # Build post-deadline contact log
    if post_deadline_contacts:
        contact_log = "\n".join(
            f"  Violation #{i+1}: {contact}"
            for i, contact in enumerate(post_deadline_contacts)
        )
        violation_block = f"""
DOCUMENTED VIOLATIONS (POST-DISPUTE CONTACTS):

The following collection communications were received AFTER the date of
my dispute letter and therefore constitute separate violations of
15 U.S.C. § 1692g(b) and/or § 1692c:

{contact_log}

Each item above constitutes an independent violation. Minimum statutory
damages: ${FDCPA_STATUTORY_DAMAGES:,} per violation under 15 U.S.C. § 1692k(a)(2)(A).
"""
    else:
        violation_block = f"""
VIOLATION STATUS:

Your failure to cease collection activity and/or credit bureau reporting
upon receipt of my written dispute constitutes a violation of
15 U.S.C. § 1692g(b). Even without additional contact, your continued
maintenance of an unvalidated debt constitutes ongoing harm.

If any collection communications (calls, letters, texts, emails) were
made to me or third parties after {original_letter_date}, each
constitutes a separate $1,000 violation.
"""

    # CUSIP securitization note
    securitization_note = ""
    if cusip_id:
        securitization_note = f"""
ADDITIONAL VIOLATION — SECURITIZATION NON-DISCLOSURE:

A CUSIP number ({cusip_id}) was identified in connection with this
account, indicating this debt may have been securitized. Your failure
to disclose the identity of the actual Holder (Trust/SPV), Trustee,
and Pooling & Servicing Agreement, as demanded in Section 3 of my
original letter, constitutes a separate violation of:
  • 15 U.S.C. § 1692e(2) — False representation of the character,
    amount, or legal status of a debt
  • 15 U.S.C. § 1692e(10) — False representation to collect a debt
  • UCC § 3-301 — You have not established status as Person Entitled
    to Enforce
"""

    letter = f"""{'=' * 72}
     NOTICE OF §1692g(b) VIOLATION AND DEMAND FOR ACCOUNT CLOSURE
     PHASE 2 ENFORCEMENT — PRE-LITIGATION NOTICE
{'=' * 72}

Date: {today.strftime('%B %d, %Y')}
Reply Required By: {reply_by.strftime('%B %d, %Y')} (14 days)

FROM:
{trust_name}
{trustee_name}, Trustee
{debtor_address}
{debtor_city}, {debtor_state} {debtor_zip}

TO (Collection Agency / Furnisher):
{collector_name}
{collector_address}

RE:  Alleged Account No.:      {acct_masked}
     Alleged Original Creditor: {creditor_name}
     Alleged Amount:            ${amount:,.2f}
     Original Dispute Sent:     {original_letter_date}
     Certified Mail No.:        {certified_mail_number}
     Delivery Confirmed:        {delivery_date}
     Response Deadline (30-day): EXPIRED {days_overdue} DAY(S) AGO
     Current Violation Status:  ACTIVE
{'=' * 72}

To Whom It May Concern:

This letter constitutes formal notice that you are in ACTIVE VIOLATION
of the Fair Debt Collection Practices Act, 15 U.S.C. § 1692 et seq.,
and the Fair Credit Reporting Act, 15 U.S.C. § 1681 et seq.

{'─' * 72}
SECTION 1: TIMELINE OF VIOLATION
{'─' * 72}

On {original_letter_date}, I sent you a written dispute of the
above-referenced alleged debt, via USPS Certified Mail
(Tracking No.: {certified_mail_number}), delivered {delivery_date}.

Under 15 U.S.C. § 1692g(b), upon receipt of a written dispute:

  "The debt collector shall CEASE COLLECTION of the debt, or any
   disputed portion thereof, until the debt collector obtains
   verification of the debt or a copy of a judgment, or the name
   and address of the original creditor, and a copy of such
   verification or judgment, or name and address of the original
   creditor, is mailed to the consumer by the debt collector."

Your 30-day response window EXPIRED on approximately:
{(datetime.strptime(delivery_date, '%B %d, %Y') + timedelta(days=30)).strftime('%B %d, %Y') if delivery_date and delivery_date != 'UNCONFIRMED' else '[DATE OF DELIVERY + 30 DAYS]'}

As of {today.strftime('%B %d, %Y')}, you have provided NO validation.
You are {days_overdue} day(s) past your legal deadline.
{violation_block}
{securitization_note}
{'─' * 72}
SECTION 2: ACTIVE VIOLATION OF §1692g(b)
{'─' * 72}

By failing to provide validation while continuing to maintain, report,
or pursue this alleged debt, you have violated:

  ☒ 15 U.S.C. § 1692g(b)   — Failure to cease collection upon dispute
  ☒ 15 U.S.C. § 1692e       — False/misleading representations
    (Representing an unvalidated debt as legally collectible)
  ☒ 15 U.S.C. § 1681s-2(a)(3) — Failure to notify consumer reporting
    agencies that this account is disputed
  ☒ 15 U.S.C. § 1681s-2(b)  — Failure to conduct reasonable
    reinvestigation upon dispute notification

{'─' * 72}
SECTION 3: DEMANDS — REQUIRED WITHIN 14 DAYS
{'─' * 72}

I demand ALL of the following in writing within 14 days:

  □ A. Written confirmation that this alleged debt is CLOSED and
       will not be collected, pursued in court, or sold to any
       subsequent collector.

  □ B. Written confirmation that any tradeline, collection entry,
       or derogatory mark associated with this account has been
       DELETED from the files of:
         - Equifax (Consumer and Business)
         - Experian (Consumer and Business)
         - TransUnion
         - Dun & Bradstreet (if applicable)
         - Any other consumer or business reporting agency

  □ C. Written confirmation that no lawsuit, arbitration, or other
       legal proceeding will be initiated regarding this alleged debt.

  □ D. Written confirmation that this account will not be sold,
       transferred, or assigned to any third-party collector.

  □ E. If you claim you DID send validation: provide it now, along
       with proof of mailing date and method. Oral claims of prior
       validation are not acceptable under §1692g(b).

{'─' * 72}
SECTION 4: CIVIL LIABILITY EXPOSURE
{'─' * 72}

Your failure to respond exposes your organization to the following
minimum civil liability under federal law:

  FDCPA violations (15 U.S.C. § 1692k):
  • Actual damages (financial harm, emotional distress)
  • Statutory damages: ${FDCPA_STATUTORY_DAMAGES:,} per violation × {known_violation_count} documented
    violation(s) = ${min_fdcpa_damages:,} minimum
  • Attorney fees and costs (mandatory, not discretionary)

  FCRA violations (15 U.S.C. § 1681n — Willful Noncompliance):
  • Statutory damages: $100–${FCRA_STATUTORY_DAMAGES:,} per violation
  • Punitive damages (willful violations)
  • Attorney fees and costs

  CONSERVATIVE TOTAL EXPOSURE (minimum):
  ${total_exposure:,} (FDCPA statutory + FCRA + estimated attorney fees)

  This estimate does not include: actual damages, punitive damages,
  class action exposure under § 1692k(a)(2)(B) (up to $500,000 or
  1% of net worth), or state law remedies.

  STATUTE OF LIMITATIONS: 1 year from date of violation (FDCPA).
  The clock is running. Every day of non-compliance is a new accrual.

{'─' * 72}
SECTION 5: CREDIT REPORTING — IMMEDIATE ACTION REQUIRED
{'─' * 72}

If you have reported or are currently reporting this alleged debt to
any consumer reporting agency, you are required under
15 U.S.C. § 1681s-2(a)(3) to IMMEDIATELY:

  1. Notify each CRA that this account is DISPUTED
  2. Conduct a reasonable reinvestigation (§1681s-2(b))
  3. Correct or delete any inaccurate information

Failure to do so constitutes a separate FCRA violation. I reserve
all rights under §1681n and §1681o.

{'─' * 72}
SECTION 6: NOTICE OF PRESERVED LEGAL RIGHTS
{'─' * 72}

I am preserving all rights to file a civil action in:
  • United States District Court (federal question jurisdiction)
  • State court (concurrent jurisdiction for FDCPA claims)
  • Small claims court (if amount within jurisdictional limits)

This letter is NOT a waiver of any right. It is a FINAL OPPORTUNITY
to resolve this matter without litigation.

If I do not receive written compliance with ALL demands in Section 3
within 14 days of delivery of this letter, I will evaluate filing a
civil complaint without further notice.

REPLY DEADLINE: {reply_by.strftime('%B %d, %Y')}

{'─' * 72}
SEND YOUR RESPONSE TO:
{'─' * 72}

{trust_name}
{trustee_name}, Trustee
{debtor_address}
{debtor_city}, {debtor_state} {debtor_zip}

All responses must be IN WRITING. No telephone responses accepted.
Oral representations are not binding and will not be acknowledged.

Respectfully,

{'_' * 40}
{trustee_name}, Trustee
{trust_name}
{debtor_address}
{debtor_city}, {debtor_state} {debtor_zip}
Date: {today.strftime('%B %d, %Y')}

{'─' * 72}
SEND VIA: USPS Certified Mail with Return Receipt (PS Form 3811)
RETAIN:   Green card + copy of this letter + copy of original dispute
EVIDENCE: Compile full file: original letter, tracking, this notice
{'─' * 72}

STATUTORY REFERENCES:
  15 U.S.C. § 1692g(b) — Cease collection obligation upon written dispute
  15 U.S.C. § 1692e    — Prohibition on false/misleading representations
  15 U.S.C. § 1692k    — Civil liability ($1,000/violation)
  15 U.S.C. § 1681s-2  — FCRA furnisher obligations
  15 U.S.C. § 1681n    — FCRA civil liability for willful noncompliance
  15 U.S.C. § 1681o    — FCRA civil liability for negligent noncompliance
  UCC § 3-301          — Person entitled to enforce instrument
{'=' * 72}
"""
    return letter.strip()


# ============================================================================
# PULL NON-RESPONDERS
# ============================================================================

def get_non_responders(specific_id: str = None) -> list[dict]:
    """
    Pull all debt_vectors past the 30-day deadline with no response.
    Joins with identities and certified_mail_tracking tables.
    """
    today_str = date.today().isoformat()

    query = (
        supabase.table("debt_vectors")
        .select("*, identities(*)")
        .eq("status", "Validation Sent")
        .lt("response_deadline", today_str)
    )

    if specific_id:
        query = query.eq("id", specific_id)

    result = query.execute()
    debts  = result.data or []

    # For each debt, also pull the certified_mail_tracking record
    enriched = []
    for debt in debts:
        tracking = {}
        if debt.get("certified_mail_number"):
            tr = (
                supabase.table("certified_mail_tracking")
                .select("*")
                .eq("tracking_number", debt["certified_mail_number"])
                .execute()
            )
            tracking = tr.data[0] if tr.data else {}
        debt["_tracking"] = tracking
        enriched.append(debt)

    return enriched


def get_certified_mail_non_responders() -> list[dict]:
    """
    Also pull from certified_mail_tracking directly
    for the Feb 2026 campaign (pre-debt_vectors era).
    """
    today_str = date.today().isoformat()

    result = (
        supabase.table("certified_mail_tracking")
        .select("*")
        .eq("response_received", False)
        .lt("response_deadline", today_str)
        .execute()
    )
    return result.data or []


# ============================================================================
# MAIN ENFORCEMENT RUNNER
# ============================================================================

def run_enforcement(specific_id: str = None, mode: str = "debt_vectors"):
    """
    Pull non-responders, prompt for any post-deadline contacts,
    generate enforcement letters, and update status.

    Modes:
      debt_vectors      — Process new audit engine debts
      certified_mail    — Process Feb 2026 certified mail campaign
    """

    print(f"\n{'=' * 60}")
    print("ODYSSEY-1 NON-RESPONSE ENFORCEMENT ENGINE")
    print("R.O.M.A.N. 2.0 — §1692g(b) Phase 2 Protocol")
    print(f"Run: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'=' * 60}\n")

    # ── PULL NON-RESPONDERS ──────────────────────────────────────

    if mode == "certified_mail":
        raw_items = get_certified_mail_non_responders()
        items = []
        for row in raw_items:
            # Adapt certified_mail_tracking schema to debt_vectors shape
            items.append({
                "id":                   f"cmt_{row['id']}",
                "creditor_name":        row["entity_name"],
                "amount":               0,
                "account_number_masked": ", ".join(row.get("account_numbers") or []),
                "cusip_id":             None,
                "certified_mail_number": row["tracking_number"],
                "response_deadline":    row["response_deadline"],
                "identities":           {},
                "_tracking":            row,
                "_source":              "certified_mail_tracking",
            })
    else:
        items = get_non_responders(specific_id)

    if not items:
        print("✅ No non-responders found. All collectors are within their window or already actioned.")
        return []

    print(f"⚠️  FOUND {len(items)} NON-RESPONDER(S) — §1692g(b) violations in progress\n")
    print("─" * 60)

    generated = []

    for item in items:
        identity     = item.get("identities") or {}
        tracking     = item.get("_tracking") or {}
        creditor     = item.get("creditor_name", "UNKNOWN")
        amount       = float(item.get("amount") or 0)
        acct_masked  = item.get("account_number_masked", "XXXX")
        deadline_str = item.get("response_deadline", "")

        # Calculate how overdue
        try:
            deadline_dt  = datetime.strptime(deadline_str, "%Y-%m-%d")
            days_overdue = (datetime.now() - deadline_dt).days
        except Exception:
            days_overdue = 0

        # Get original letter info from tracking record
        original_letter_date = "UNKNOWN"
        delivery_date        = "UNCONFIRMED"
        cert_mail_number     = item.get("certified_mail_number") or "[TRACKING NUMBER]"

        if tracking:
            date_mailed = tracking.get("date_mailed")
            actual_del  = tracking.get("actual_delivery")
            rr_date     = tracking.get("return_receipt_date")

            if date_mailed:
                try:
                    original_letter_date = datetime.strptime(
                        str(date_mailed), "%Y-%m-%d"
                    ).strftime("%B %d, %Y")
                except Exception:
                    original_letter_date = str(date_mailed)

            if actual_del or rr_date:
                try:
                    d = actual_del or rr_date
                    delivery_date = datetime.strptime(str(d), "%Y-%m-%d").strftime("%B %d, %Y")
                except Exception:
                    delivery_date = str(actual_del or rr_date)

        print(f"  CREDITOR:     {creditor}")
        print(f"  AMOUNT:       ${amount:,.2f}")
        print(f"  ACCOUNT:      {acct_masked}")
        print(f"  DEADLINE:     {deadline_str}")
        print(f"  DAYS OVERDUE: {days_overdue}")
        print(f"  CERT MAIL:    {cert_mail_number}")
        print()

        # Collector info
        collector_name    = input(f"    Collector/Agency name for {creditor}: ").strip()
        collector_address = input(f"    Collector address (one line): ").strip()

        # Post-deadline contacts
        print(f"    List any collection contacts AFTER {original_letter_date}")
        print("    (phone calls, letters, texts, emails). Press Enter to skip each.")
        contacts = []
        contact_num = 1
        while True:
            c = input(f"    Contact #{contact_num} (or press Enter to finish): ").strip()
            if not c:
                break
            contacts.append(c)
            contact_num += 1

        # Generate enforcement letter
        letter = generate_enforcement_letter(
            debt=item,
            identity=identity,
            collector_name=collector_name,
            collector_address=collector_address,
            original_letter_date=original_letter_date,
            certified_mail_number=cert_mail_number,
            delivery_date=delivery_date,
            days_overdue=days_overdue,
            post_deadline_contacts=contacts,
        )

        # Save letter
        safe_name = creditor.replace(" ", "_").replace("/", "-")[:30]
        filename  = f"enforcement_{item['id'][:8]}_{safe_name}.txt"
        filepath  = os.path.join(OUTPUT_DIR, filename)

        with open(filepath, "w") as f:
            f.write(letter)

        print(f"\n  ✅ Enforcement letter saved: {filepath}")

        # Prompt for new certified mail tracking number
        new_tracking = input(
            f"    New USPS Certified Mail tracking number for enforcement letter\n"
            f"    (leave blank to fill in later): "
        ).strip()

        new_deadline = (datetime.now() + timedelta(days=14)).date()

        # Insert new certified_mail_tracking record for enforcement letter
        if new_tracking:
            supabase.table("certified_mail_tracking").insert({
                "entity_name":      creditor,
                "entity_type":      "financial_institution",
                "tracking_number":  new_tracking,
                "account_numbers":  [acct_masked] if acct_masked else ["UNKNOWN"],
                "date_mailed":      str(date.today()),
                "response_deadline": str(new_deadline),
                "mailing_address":  {
                    "name":    collector_name,
                    "address": collector_address,
                },
                "campaign_id": "NON_RESPONSE_ENFORCEMENT_2026",
                "notes": (
                    f"§1692g(b) ENFORCEMENT NOTICE — {days_overdue} days overdue. "
                    f"Original cert mail: {cert_mail_number}. "
                    f"File: {filename}"
                ),
            }).execute()
            print(f"  ✅ Enforcement tracking logged → R.O.M.A.N. 14-day monitor active")

        # Update debt_vectors status
        if not item.get("_source") == "certified_mail_tracking":
            update_payload = {"status": "Non-Response"}
            if new_tracking:
                update_payload["certified_mail_number"] = new_tracking
                update_payload["response_deadline"]     = str(new_deadline)

            supabase.table("debt_vectors").update(update_payload).eq(
                "id", item["id"]
            ).execute()
            print(f"  ✅ Status updated: Validation Sent → Non-Response\n")

        # Calculate violation summary for report
        known_violations = len(contacts) if contacts else 1
        est_damages = (
            FDCPA_STATUTORY_DAMAGES * known_violations
            + FCRA_STATUTORY_DAMAGES
            + ATTORNEY_FEE_ESTIMATE
        )

        generated.append({
            "creditor":         creditor,
            "amount":           amount,
            "days_overdue":     days_overdue,
            "violations":       known_violations,
            "est_exposure":     est_damages,
            "file":             filepath,
            "tracking":         new_tracking or "(to be entered)",
            "reply_deadline":   new_deadline.strftime("%B %d, %Y"),
        })

        print("─" * 60)

    # ── SUMMARY ──────────────────────────────────────────────────

    total_exposure = sum(g["est_exposure"] for g in generated)

    print(f"\n{'=' * 60}")
    print(f"ENFORCEMENT COMPLETE — {len(generated)} notice(s) generated")
    print(f"{'=' * 60}")

    for g in generated:
        print(f"  • {g['creditor']}: ${g['amount']:,.2f}")
        print(f"    Overdue:      {g['days_overdue']} days")
        print(f"    Violations:   {g['violations']} documented")
        print(f"    Min Exposure: ${g['est_exposure']:,}")
        print(f"    File:         {g['file']}")
        print(f"    Tracking:     {g['tracking']}")
        print(f"    Reply By:     {g['reply_deadline']}")
        print()

    print(f"  TOTAL MINIMUM EXPOSURE DOCUMENTED: ${total_exposure:,}")
    print(f"""
NEXT STEPS (for each non-responder):
  1. Print enforcement letter
  2. Send via USPS Certified Mail + Return Receipt (PS Form 3811)
  3. Wait 14 days for written compliance with all demands
  4. If no compliant response by deadline:
       - Status → 'Legal Action Pending'
       - Consult with consumer protection attorney
       - File in Small Claims or U.S. District Court
       - Each violation = $1,000 statutory + actual damages + attorney fees
  5. FDCPA statute of limitations: 1 year from violation date
     DO NOT WAIT — the clock is running

REMEMBER: A judgment is money. Non-response is evidence.
""")

    return generated


# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    import sys

    # Usage:
    #   python scripts/non-response-enforcement.py               (debt_vectors mode)
    #   python scripts/non-response-enforcement.py certified     (certified mail mode)
    #   python scripts/non-response-enforcement.py <uuid>        (specific debt)

    arg = sys.argv[1] if len(sys.argv) > 1 else None

    if arg == "certified":
        run_enforcement(mode="certified_mail")
    elif arg and len(arg) > 10:
        run_enforcement(specific_id=arg, mode="debt_vectors")
    else:
        run_enforcement(mode="debt_vectors")
