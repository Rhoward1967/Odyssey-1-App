"""
ODYSSEY-1 SECURITIZATION AUDIT ENGINE
======================================
R.O.M.A.N. 2.0 — Debt Validation & Chain of Title Automation

Legal Basis:
  15 USC §1692g  — FDCPA: Right to Debt Validation (30-day dispute window)
  15 USC §1692e  — FDCPA: Prohibition on False/Misleading Representations
  15 USC §1692g(b) — Collector must CEASE collection upon written dispute
  UCC § 3-301    — Person Entitled to Enforce (must be Holder)
  UCC § 3-302    — Holder in Due Course (value + good faith + no notice)
  UCC § 9-406    — Discharge of Account Debtor upon proper notification

Schema (Supabase):
  debt_vectors:  id, creditor_name, amount, account_number_masked,
                 cusip_id, status, identity_id, created_at
  identities:    id, [name, address fields — extend as needed]

Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
"""

import os
import json
from datetime import datetime, timedelta

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

OUTPUT_DIR = "output/dispute-letters"
os.makedirs(OUTPUT_DIR, exist_ok=True)


# ============================================================================
# LETTER GENERATOR
# ============================================================================

def generate_validation_letter(
    debt: dict,
    identity: dict,
    collector_name: str,
    collector_address: str,
) -> str:
    """
    Generate a §1692g Debt Validation Letter with full securitization audit.

    Courts that have dismissed collection suits due to chain of title failure:
    - Deutsche Bank v. Pietranico (2010) — NY: No standing without original note
    - U.S. Bank v. Ibanez (2011) — MA SJC: Foreclosure void without proper assignment
    - In re Walker (2010) — OH Bankr: Dismissed for failure to produce chain of title
    """

    today    = datetime.now()
    deadline = today + timedelta(days=30)

    # Pull identity fields — trust_name is primary sender line,
    # full_name/trustee_name is the signatory below it.
    # Defaults to Trust address if identity record is incomplete.
    trust_name     = identity.get("trust_name") or "Howard Jones Bloodline Ancestral Trust"
    trustee_name   = identity.get("full_name") or identity.get("name") or "Rickey Allan Howard"
    debtor_address = identity.get("address") or "595 Macon Highway"
    debtor_city    = identity.get("city") or "Athens"
    debtor_state   = identity.get("state") or "GA"
    debtor_zip     = identity.get("zip") or "30606"

    creditor_name  = debt.get("creditor_name", "[ORIGINAL CREDITOR]")
    amount         = float(debt.get("amount") or 0)
    acct_masked    = debt.get("account_number_masked", "XXXX")
    cusip_id       = debt.get("cusip_id")

    # Build CUSIP section conditionally
    cusip_section = ""
    if cusip_id:
        cusip_section = f"""
NOTE: A CUSIP number ({cusip_id}) has been identified in connection with
this account, indicating this debt may have been SECURITIZED. If so, the
collector is likely a servicer — NOT the actual holder — and lacks
standing to collect. See demands in Section 3 below.
"""

    letter = f"""{'=' * 72}
         NOTICE OF DEBT DISPUTE AND REQUEST FOR VALIDATION
         Pursuant to 15 U.S.C. § 1692g(b) — FDCPA
{'=' * 72}

Date: {today.strftime('%B %d, %Y')}

FROM:
{trust_name}
{trustee_name}, Trustee
{debtor_address}
{debtor_city}, {debtor_state} {debtor_zip}

TO (Collection Agency):
{collector_name}
{collector_address}

RE:  Alleged Account No.: {acct_masked}
     Alleged Original Creditor: {creditor_name}
     Alleged Amount: ${amount:,.2f}
{cusip_section}
{'=' * 72}

To Whom It May Concern:

This letter constitutes my formal written DISPUTE of the above-referenced
alleged debt in its entirety, pursuant to my rights under the Fair Debt
Collection Practices Act, 15 U.S.C. § 1692g(b).

MANDATORY LEGAL EFFECT: Upon receipt of this written dispute, you are
REQUIRED BY LAW to CEASE ALL COLLECTION ACTIVITY until you mail me
complete verification of this debt. Any collection attempt before
providing validation violates 15 U.S.C. § 1692g(b).

{'─' * 72}
SECTION 1: PROOF OF STANDING — HOLDER IN DUE COURSE
(UCC § 3-301 & § 3-302)
{'─' * 72}

Before you may lawfully collect this alleged debt, you must establish
your standing as a "Person Entitled to Enforce" under UCC § 3-301.
Courts have consistently dismissed collection suits where this cannot
be established (see: Deutsche Bank v. Pietranico; U.S. Bank v. Ibanez).

I demand proof of ALL of the following:

  □ 1. You are the current HOLDER of the original instrument, OR you
       are a nonholder with equivalent rights (UCC § 3-301)

  □ 2. You took this instrument FOR VALUE, in GOOD FAITH, and WITHOUT
       NOTICE of any claim or defense (UCC § 3-302 — Holder in Due Course)

  □ 3. The ORIGINAL SIGNED AGREEMENT or promissory note bearing the
       debtor's wet-ink or legally authenticated signature

  □ 4. If the original note is lost or destroyed — a sworn affidavit
       with indemnification bond as required by UCC § 3-309

{'─' * 72}
SECTION 2: COMPLETE CHAIN OF TITLE
(UCC § 9-102 & § 9-406 — Assignment of Accounts)
{'─' * 72}

Consumer debts are routinely sold and re-sold in bulk portfolio
transactions, often multiple times. I demand documentation showing
EVERY transfer of this account from original creditor to present:

  □ 5. Name and address of the ORIGINAL CREDITOR (the entity with
       whom the consumer originally contracted)

  □ 6. Complete CHAIN OF ASSIGNMENTS — every entity that owned,
       claimed, or serviced this account, in chronological order:
         - Assignor name and address
         - Assignee name and address
         - Date of assignment
         - Whether consideration was paid and amount

  □ 7. A copy of EVERY PURCHASE AGREEMENT, BILL OF SALE, or
       ASSIGNMENT AGREEMENT evidencing each transfer in the chain

  □ 8. Proof that each assignment was properly executed, delivered,
       and perfected under applicable law

{'─' * 72}
SECTION 3: SECURITIZATION AUDIT
(Securities Exchange Act; UCC Article 3 & 9)
{'─' * 72}

If this account was bundled and sold as part of an asset-backed
security or commercial paper instrument, I demand:

  □ 9.  The CUSIP NUMBER of any security or pool containing this account

  □ 10. The name of the TRUST or SPECIAL PURPOSE VEHICLE (SPV) in
        which this account is held, if applicable

  □ 11. The name of the TRUSTEE of any such trust, and their authority
        to act on behalf of certificate holders

  □ 12. The name of the SERVICER and proof of their legal authority to
        collect on behalf of the actual holder

  □ 13. Proof that the POOLING AND SERVICING AGREEMENT (PSA) authorizes
        this specific collection action

  LEGAL NOTE: A servicer is NOT the holder. Only the Trust (acting
  through its Trustee) or an authorized agent with proper Power of
  Attorney may bring a collection action on a securitized debt.

{'─' * 72}
SECTION 4: STANDARD FDCPA VALIDATION
(15 U.S.C. § 1692g(a))
{'─' * 72}

I additionally demand:

  □ 14. Itemized accounting of the alleged amount, showing:
          - Original principal balance
          - Interest rate and total interest charged
          - All fees and their contractual or statutory basis
          - All payments made and credited, with dates
          - How the current claimed balance of ${amount:,.2f} was calculated

  □ 15. Date the alleged debt was incurred

  □ 16. Date of LAST PAYMENT or LAST ACTIVITY (for SOL purposes)

  □ 17. Applicable STATUTE OF LIMITATIONS under the state where the
        contract was formed AND the state of the debtor's residence

  □ 18. Your state license to collect debts and your registered
        agent in this state (if required by state law)

  □ 19. Any court JUDGMENT number if you claim a judgment exists

{'─' * 72}
SECTION 5: CREDIT REPORTING — FURNISHER OBLIGATIONS
(15 U.S.C. § 1681s-2 — FCRA)
{'─' * 72}

If you have reported or intend to report this disputed debt to any
consumer reporting agency (Equifax, Experian, TransUnion):

  - You MUST notify each CRA that this account is disputed
    (15 U.S.C. § 1681s-2(a)(3))

  - Reporting a disputed, unverified debt without proper notation
    constitutes a violation of both the FCRA and the FDCPA

  - I reserve all rights under 15 U.S.C. § 1681n and § 1681o for
    any negligent or willful noncompliance

{'─' * 72}
SECTION 6: RESPONSE DEADLINE AND LEGAL CONSEQUENCES
{'─' * 72}

You have 30 DAYS from the date of delivery of this letter to provide
complete validation as demanded above.

RESPONSE DEADLINE: {deadline.strftime('%B %d, %Y')}

DURING THIS 30-DAY PERIOD you must:
  ✗ CEASE all collection communications (calls, letters, texts)
  ✗ CEASE any credit bureau reporting of new delinquency
  ✗ NOT file or pursue any lawsuit regarding this alleged debt

IF YOU CANNOT VALIDATE:
  I expect written confirmation that the account is:
  (a) CLOSED and considered discharged/resolved, AND
  (b) Any credit bureau tradeline deleted or corrected

CONSEQUENCES OF NON-COMPLIANCE:
  Continued collection activity without validation, or false
  representations about this debt, may subject your organization to:
  • Actual damages (15 U.S.C. § 1692k(a)(1))
  • Statutory damages up to $1,000 per violation (§ 1692k(a)(2)(A))
  • Class action damages up to $500,000 or 1% of net worth (§ 1692k(a)(2)(B))
  • Attorney's fees and costs (§ 1692k(a)(3))
  • State law remedies (which may exceed federal remedies)

I reserve ALL legal rights and remedies under federal and state law.
This letter does not constitute a refusal to pay a legitimately owed,
properly documented, and enforceable debt. It is a lawful demand for
proof that you have the legal right to collect.

All future communications must be IN WRITING. Do not call.

Respectfully,

{'_' * 40}
{trustee_name}, Trustee
{trust_name}
{debtor_address}
{debtor_city}, {debtor_state} {debtor_zip}
Date: {today.strftime('%B %d, %Y')}

{'─' * 72}
SEND VIA: USPS Certified Mail with Return Receipt (PS Form 3811)
KEEP:     Green card (proof of delivery) + copy of this letter
TRACK:    Log certified mail number in your records
{'─' * 72}

STATUTORY REFERENCES:
  15 U.S.C. § 1692g   — Validation of debts
  15 U.S.C. § 1692e   — False or misleading representations
  15 U.S.C. § 1692f   — Unfair practices
  15 U.S.C. § 1692k   — Civil liability ($1,000/violation)
  15 U.S.C. § 1681s-2 — FCRA furnisher obligations
  UCC § 3-301         — Person entitled to enforce instrument
  UCC § 3-302         — Holder in due course
  UCC § 3-309         — Enforcement of lost, destroyed instrument
  UCC § 9-102         — Definitions (account, account debtor)
  UCC § 9-406         — Discharge of account debtor

{'=' * 72}
"""
    return letter.strip()


# ============================================================================
# MAIN AUDIT RUNNER
# ============================================================================

def run_audit(specific_id: str = None):
    """
    Pull debts from debt_vectors, join with identities, generate letters.
    Updates status to 'Validation Sent' after each letter is generated.
    """

    print(f"\n{'=' * 60}")
    print("ODYSSEY-1 SECURITIZATION AUDIT ENGINE")
    print(f"Run: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'=' * 60}\n")

    # Pull debts
    query = supabase.table("debt_vectors").select("*, identities(*)").eq("status", "Pending Audit")
    if specific_id:
        query = query.eq("id", specific_id)

    result = query.execute()
    debts = result.data

    if not debts:
        print("No debts with status 'Pending Audit' found.")
        return []

    print(f"Found {len(debts)} debt(s) to process.\n")
    generated = []

    for debt in debts:
        identity = debt.get("identities") or {}
        creditor = debt.get("creditor_name", "UNKNOWN")
        amount   = float(debt.get("amount") or 0)

        print(f"  Processing: {creditor} — ${amount:,.2f}")

        # Prompt for collector info (not in schema — collector may vary)
        collector_name    = input(f"    Collector/Agency name for {creditor}: ").strip()
        collector_address = input(f"    Collector address (one line): ").strip()

        # Generate letter
        letter = generate_validation_letter(
            debt=debt,
            identity=identity,
            collector_name=collector_name,
            collector_address=collector_address,
        )

        # Save to file
        safe_name = creditor.replace(" ", "_").replace("/", "-")[:30]
        filename  = f"dispute_{debt['id'][:8]}_{safe_name}.txt"
        filepath  = os.path.join(OUTPUT_DIR, filename)

        with open(filepath, "w") as f:
            f.write(letter)

        print(f"  ✅ Letter saved: {filepath}")

        # Prompt for certified mail tracking number (entered at post office)
        tracking_num = input(
            f"    USPS Certified Mail tracking number for {creditor}\n"
            f"    (leave blank to fill in later): "
        ).strip()

        mail_date     = datetime.now().date()
        deadline_date = (datetime.now() + timedelta(days=30)).date()

        if tracking_num:
            # Insert into certified_mail_tracking so R.O.M.A.N. monitors the deadline
            supabase.table("certified_mail_tracking").insert({
                "entity_name":      creditor,
                "entity_type":      "financial_institution",
                "tracking_number":  tracking_num,
                "account_numbers":  [acct_masked] if acct_masked else ["UNKNOWN"],
                "date_mailed":      str(mail_date),
                "response_deadline": str(deadline_date),
                "mailing_address":  {
                    "name":    collector_name,
                    "address": collector_address,
                },
                "campaign_id": "SECURITIZATION_AUDIT_2026",
                "notes": f"§1692g validation letter — file: {filename}",
            }).execute()
            print(f"  ✅ Tracking number logged → R.O.M.A.N. deadline monitor active")

        # Update status + tracking number in Supabase
        update_payload = {
            "status":              "Validation Sent",
            "validation_sent_at":  datetime.now().isoformat(),
            "response_deadline":   str(deadline_date),
        }
        if tracking_num:
            update_payload["certified_mail_number"] = tracking_num

        supabase.table("debt_vectors").update(update_payload).eq("id", debt["id"]).execute()

        print(f"  ✅ Status updated: Pending Audit → Validation Sent\n")

        generated.append({
            "id":       debt["id"],
            "creditor": creditor,
            "amount":   amount,
            "file":     filepath,
            "tracking": tracking_num or "(to be entered)",
            "deadline": deadline_date.strftime('%B %d, %Y'),
        })

    # Summary
    print(f"\n{'=' * 60}")
    print(f"COMPLETE — {len(generated)} letter(s) generated")
    print(f"{'=' * 60}")
    for item in generated:
        print(f"  • {item['creditor']}: ${item['amount']:,.2f}")
        print(f"    File:     {item['file']}")
        print(f"    Tracking: {item['tracking']}")
        print(f"    Deadline: {item['deadline']}")

    print(f"""
NEXT STEPS:
  1. Print each letter
  2. Send via USPS Certified Mail + Return Receipt (PS Form 3811)
  3. Update debt_vectors with certified_mail_number when sent
  4. If no valid response by deadline → status = 'Non-Response'
     (collector has failed to establish standing to collect)
""")

    return generated


# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    import sys
    specific = sys.argv[1] if len(sys.argv) > 1 else None
    run_audit(specific_id=specific)
