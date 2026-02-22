"""
NOTICE OF SATISFACTION & DEMAND FOR DELETION — FINAL SEAL
===========================================================
R.O.M.A.N. 2.0 — Credit Record Purge Protocol

After a judgment is SATISFIED (garnishment collected or voluntary payment),
the debt's ghost must be erased from all public and private records:

  1. CRA Deletion Letters — Sent to Equifax, Experian, TransUnion, and
     Dun & Bradstreet demanding the tradeline be deleted within 30 days.
     A Satisfaction of Judgment proves the debt is resolved. The furnisher
     has no legal basis to continue reporting it.

  2. Fi.Fa. Cancellation Memo — Used to cancel the judgment entry on the
     General Execution Docket in Clarke County (O.C.G.A. § 9-12-65).

  3. Furnisher Notice — Sent directly to the original collector/furnisher
     demanding they instruct all CRAs to delete the tradeline.

Legal Basis:
  15 U.S.C. § 1681s-2(a)(1)  — Furnisher must not report inaccurate info
  15 U.S.C. § 1681s-2(b)     — Furnisher duty to correct upon dispute
  15 U.S.C. § 1681i           — CRA duty to reinvestigate and delete
  15 U.S.C. § 1681c(a)(4)    — Judgments: 7-year max reporting period;
                                 satisfied judgments have no continuing
                                 permissible purpose
  15 U.S.C. § 1681n           — Civil liability for willful noncompliance
                                 ($100–$1,000 + punitive + fees)
  O.C.G.A. § 9-12-65         — Entry of Satisfaction on Execution Docket
  O.C.G.A. § 9-12-86         — Cancellation of judgment lien

Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
"""

import os
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

OUTPUT_DIR = "output/satisfaction-demands"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── TRUST DEFAULTS ────────────────────────────────────────────────────────────
DEFAULT_TRUST_NAME   = "Howard Jones Bloodline Ancestral Trust"
DEFAULT_TRUSTEE_NAME = "Rickey Allan Howard"
DEFAULT_ADDRESS      = "595 Macon Highway"
DEFAULT_CITY         = "Athens"
DEFAULT_STATE        = "GA"
DEFAULT_ZIP          = "30606"

# ── CRA CERTIFIED MAIL ADDRESSES ──────────────────────────────────────────────
# Always send CRA disputes by USPS Certified Mail + Return Receipt

CREDIT_REPORTING_AGENCIES = [
    {
        "name":    "Equifax Information Services LLC",
        "dept":    "Consumer Disputes",
        "address": "P.O. Box 740256",
        "city":    "Atlanta, GA 30374",
        "phone":   "1-800-685-1111",
        "online":  "www.equifax.com/personal/credit-report-services/",
    },
    {
        "name":    "Experian",
        "dept":    "National Consumer Assistance Center",
        "address": "P.O. Box 4500",
        "city":    "Allen, TX 75013",
        "phone":   "1-888-397-3742",
        "online":  "www.experian.com/disputes/",
    },
    {
        "name":    "TransUnion Consumer Solutions",
        "dept":    "Consumer Disputes",
        "address": "P.O. Box 2000",
        "city":    "Chester, PA 19016",
        "phone":   "1-800-916-8800",
        "online":  "www.transunion.com/credit-disputes/",
    },
    {
        "name":    "Dun & Bradstreet",
        "dept":    "Consumer Affairs",
        "address": "P.O. Box 75434",
        "city":    "Chicago, IL 60675-5434",
        "phone":   "1-800-234-3867",
        "online":  "www.dnb.com/utility-pages/update-your-company-information.html",
        "business_only": True,
    },
]


# ============================================================================
# CRA DELETION LETTER GENERATOR
# ============================================================================

def generate_cra_deletion_letter(
    judgment: dict,
    debt: dict,
    cra: dict,
    satisfaction_date: str,
    case_number: str,
    court_name: str,
    furnisher_name: str,
) -> str:
    """
    Generate a Notice of Satisfaction & Demand for Deletion addressed to
    a single credit reporting agency (CRA).

    The CRA must reinvestigate and delete within 30 days (15 U.S.C. § 1681i).
    Failure = $1,000 statutory damages per violation under § 1681n.
    """
    today    = datetime.now()
    deadline = today + timedelta(days=30)

    trust_name   = DEFAULT_TRUST_NAME
    trustee_name = DEFAULT_TRUSTEE_NAME
    address      = DEFAULT_ADDRESS
    city         = DEFAULT_CITY
    state        = DEFAULT_STATE
    zip_code     = DEFAULT_ZIP

    creditor_name = debt.get("creditor_name", "[ORIGINAL CREDITOR]")
    acct_masked   = debt.get("account_number_masked", "XXXX")
    amount        = float(debt.get("amount") or judgment.get("judgment_amount") or 0)
    j_amount      = float(judgment.get("judgment_amount") or 0)
    collected     = float(judgment.get("garnishment_amount_collected") or judgment.get("settlement_amount") or j_amount)

    # Format dates
    def fmt(d):
        if not d:
            return "[DATE]"
        try:
            return datetime.strptime(str(d), "%Y-%m-%d").strftime("%B %d, %Y")
        except Exception:
            return str(d)

    sat_date_fmt  = fmt(satisfaction_date)
    j_date_fmt    = fmt(judgment.get("judgment_date"))
    filing_fmt    = fmt(judgment.get("filing_date"))

    business_note = ""
    if cra.get("business_only"):
        business_note = (
            "\nNOTE: This letter concerns both consumer and commercial/business\n"
            "credit files. Please update all associated business files accordingly.\n"
        )

    letter = f"""{'=' * 72}
    NOTICE OF SATISFACTION OF JUDGMENT & DEMAND FOR TRADELINE DELETION
{'=' * 72}

Date:           {today.strftime('%B %d, %Y')}
Response Required By: {deadline.strftime('%B %d, %Y')} (30 days)

FROM:
{trust_name}
{trustee_name}, Trustee
{address}
{city}, {state} {zip_code}

TO:
{cra['name']}
{cra['dept']}
{cra['address']}
{cra['city']}

RE:  Account Holder:          {trustee_name}
     Alleged Account No.:     {acct_masked}
     Alleged Original Creditor: {creditor_name}
     Alleged Amount:          ${amount:,.2f}
     Court Case No.:          {case_number}
     Court:                   {court_name}
     Judgment Entered:        {j_date_fmt}
     JUDGMENT SATISFIED:      {sat_date_fmt}
     Amount Collected:        ${collected:,.2f}
     Furnisher / Collector:   {furnisher_name}
{'=' * 72}

To Whom It May Concern:

I am writing to formally notify you that the above-referenced judgment
has been SATISFIED IN FULL and to demand the IMMEDIATE DELETION of any
tradeline, collection entry, derogatory mark, or adverse item associated
with this account from my credit file(s).

{'─' * 72}
SECTION 1: PROOF OF SATISFACTION
{'─' * 72}

On {sat_date_fmt}, the judgment entered by the {court_name}
(Civil Action No. {case_number}) was SATISFIED IN FULL. The amount of
${collected:,.2f} was collected/paid in full resolution of the FDCPA
violations originally established in the underlying dispute.

A true and correct copy of the SATISFACTION OF JUDGMENT is enclosed
as EXHIBIT A.

The furnisher / collector ({furnisher_name}) no longer has any legal
basis to report this account as:
  • A collection account
  • A charged-off account
  • A delinquent account
  • A civil judgment
  • Any other adverse or derogatory entry

{'─' * 72}
SECTION 2: YOUR LEGAL OBLIGATION — DELETION REQUIRED
{'─' * 72}

Under 15 U.S.C. § 1681i(a)(1)(A), upon receipt of a direct dispute,
you must conduct a REINVESTIGATION within 30 days. The reinvestigation
will reveal:

  1. The underlying debt was disputed under 15 U.S.C. § 1692g;
  2. The collector failed to validate — establishing the debt is
     unverified and therefore inaccurately reported;
  3. A civil judgment under the FDCPA was entered against the furnisher;
  4. That judgment is now SATISFIED.

There is NO permissible purpose under 15 U.S.C. § 1681b to continue
reporting an account when:
  (a) The underlying claim was never validated, AND
  (b) A court has adjudicated the collector's violation, AND
  (c) The judgment has been satisfied in full.

Under 15 U.S.C. § 1681c(a)(4), civil judgments may be reported for
a maximum of 7 years. A SATISFIED judgment — particularly one arising
from collector misconduct — has no continuing legitimate purpose.

Pursuant to 15 U.S.C. § 1681s-2(a)(1), the furnisher is PROHIBITED
from reporting information it knows or has reasonable cause to believe
is INACCURATE. A paid / satisfied / adjudicated claim reported as
"delinquent" or "in collections" is per se inaccurate.

{'─' * 72}
SECTION 3: FORMAL DEMANDS
{'─' * 72}

I demand that within 30 days of receipt of this letter:

  □ 1. PERMANENTLY DELETE from my credit file any and all entries,
       tradelines, remarks, or adverse notations associated with:
         • Account No. ending in: {acct_masked[-4:] if len(str(acct_masked)) >= 4 else acct_masked}
         • Furnisher / Collector: {furnisher_name}
         • Original Creditor: {creditor_name}

  □ 2. Confirm deletion in writing, identifying:
         (a) The item(s) deleted
         (b) The date of deletion
         (c) All bureaus / files where deletion occurred

  □ 3. Do NOT re-insert this tradeline. Any re-insertion requires
       advance written notice to me per 15 U.S.C. § 1681i(a)(5)(B).

  □ 4. Provide an updated copy of my credit report reflecting the
       deletion, at no charge, per 15 U.S.C. § 1681j(a).

{'─' * 72}
SECTION 4: CIVIL LIABILITY FOR NON-COMPLIANCE
{'─' * 72}

Failure to comply with the above demands within 30 days will expose
your organization to civil liability under:

  • 15 U.S.C. § 1681n — Willful noncompliance:
    $100–$1,000 statutory damages per violation
    + punitive damages
    + attorney fees (mandatory)

  • 15 U.S.C. § 1681o — Negligent noncompliance:
    Actual damages + attorney fees

I have already demonstrated in court that I will enforce my statutory
rights. I will not hesitate to file a separate FCRA action if you
fail to comply within the 30-day window.
{business_note}
{'─' * 72}
EXHIBITS ENCLOSED:
{'─' * 72}

  □ Exhibit A: Certified copy of Satisfaction of Judgment
               (Case No. {case_number}, {court_name})
  □ Exhibit B: Copy of original FDCPA dispute letter (Phase 1)
  □ Exhibit C: USPS Certified Mail delivery confirmation (Phase 1)
  □ Exhibit D: Phase 2 Enforcement Notice
  □ Exhibit E: Copy of civil complaint
  □ Exhibit F: Court-entered judgment / default judgment order

{'─' * 72}
SEND WRITTEN CONFIRMATION TO:
{'─' * 72}

{trust_name}
{trustee_name}, Trustee
{address}
{city}, {state} {zip_code}

All responses must be IN WRITING. This letter is sent via
USPS Certified Mail with Return Receipt.

Respectfully,

{'_' * 50}
{trustee_name}, Trustee
{trust_name}
{address}
{city}, {state} {zip_code}

Date: {today.strftime('%B %d, %Y')}

{'─' * 72}
STATUTORY REFERENCES:
  15 U.S.C. § 1681i       — CRA reinvestigation duty (30 days)
  15 U.S.C. § 1681c(a)(4) — 7-year maximum reporting for judgments
  15 U.S.C. § 1681s-2     — Furnisher accuracy obligations
  15 U.S.C. § 1681n       — Willful FCRA noncompliance: $1,000/violation
  15 U.S.C. § 1681b       — Permissible purposes for reporting
  O.C.G.A. § 9-12-65     — Entry of satisfaction on execution docket
{'=' * 72}
"""
    return letter.strip()


# ============================================================================
# FURNISHER DELETION NOTICE
# ============================================================================

def generate_furnisher_notice(
    judgment: dict,
    debt: dict,
    satisfaction_date: str,
    case_number: str,
    court_name: str,
    furnisher_name: str,
    furnisher_address: str,
) -> str:
    """
    Sent directly to the collector/furnisher demanding they instruct
    all CRAs to delete the tradeline. They furnished it; they must retract it.
    """
    today    = datetime.now()
    deadline = today + timedelta(days=14)

    creditor_name = debt.get("creditor_name", "[ORIGINAL CREDITOR]")
    acct_masked   = debt.get("account_number_masked", "XXXX")
    j_amount      = float(judgment.get("judgment_amount") or 0)

    def fmt(d):
        if not d:
            return "[DATE]"
        try:
            return datetime.strptime(str(d), "%Y-%m-%d").strftime("%B %d, %Y")
        except Exception:
            return str(d)

    sat_date_fmt = fmt(satisfaction_date)
    j_date_fmt   = fmt(judgment.get("judgment_date"))

    notice = f"""{'=' * 72}
    NOTICE OF JUDGMENT SATISFACTION & DEMAND FOR CRA DELETION
    (Direct Furnisher Notice — 15 U.S.C. § 1681s-2)
{'=' * 72}

Date:       {today.strftime('%B %d, %Y')}
Reply By:   {deadline.strftime('%B %d, %Y')} (14 days)

FROM:
{DEFAULT_TRUST_NAME}
{DEFAULT_TRUSTEE_NAME}, Trustee
{DEFAULT_ADDRESS}
{DEFAULT_CITY}, {DEFAULT_STATE} {DEFAULT_ZIP}

TO (Furnisher):
{furnisher_name}
{furnisher_address}

RE:  Case No.:     {case_number}
     Court:        {court_name}
     Judgment:     ${j_amount:,.2f} — entered {j_date_fmt}
     SATISFIED:    {sat_date_fmt}
     Account:      {acct_masked}
     Creditor:     {creditor_name}
{'=' * 72}

You are hereby notified that the above-referenced civil judgment
entered against your organization under the Fair Debt Collection
Practices Act, 15 U.S.C. § 1692 et seq., has been SATISFIED IN FULL
as of {sat_date_fmt}.

{'─' * 72}
IMMEDIATE ACTION REQUIRED — 14 DAYS
{'─' * 72}

Under 15 U.S.C. § 1681s-2(a)(1)(B), you are PROHIBITED from continuing
to furnish information that you know has become inaccurate. The underlying
debt has been adjudicated, the judgment satisfied, and the account closed.
Any continued reporting constitutes a NEW violation.

I demand that within 14 days you:

  1. INSTRUCT each consumer reporting agency (CRA) to which you have
     furnished information regarding Account No. {acct_masked} to
     PERMANENTLY DELETE the tradeline, including:
       • Equifax
       • Experian
       • TransUnion
       • Any specialty reporting agency (LexisNexis, ChexSystems, PRBC,
         Dun & Bradstreet, or any other CRA)

  2. SEND written confirmation to me that you have done so, including
     the date and method of each deletion request.

  3. DO NOT re-furnish this account to any CRA in the future.

{'─' * 72}
CONSEQUENCES OF NON-COMPLIANCE
{'─' * 72}

I have already obtained a judgment against your organization under
the FDCPA. I have demonstrated I will litigate. Any failure to comply
with this furnisher obligation within 14 days will result in:

  • A separate FCRA action under 15 U.S.C. § 1681s-2
  • Additional damages under 15 U.S.C. § 1681n ($1,000 per violation)
  • Filing complaint with the Consumer Financial Protection Bureau (CFPB)
  • Filing complaint with the Federal Trade Commission (FTC)
  • Filing complaint with the Georgia Attorney General's Office

{'─' * 72}
ENCLOSED:
{'─' * 72}

  □ Copy of Satisfaction of Judgment (Case No. {case_number})
  □ Copy of original civil complaint

Respectfully,

{'_' * 50}
{DEFAULT_TRUSTEE_NAME}, Trustee
{DEFAULT_TRUST_NAME}

Date: {today.strftime('%B %d, %Y')}

SEND VIA: USPS Certified Mail + Return Receipt
{'=' * 72}
"""
    return notice.strip()


# ============================================================================
# FI.FA. CANCELLATION MEMO
# ============================================================================

def generate_fifa_cancellation(
    judgment: dict,
    case_number: str,
    court_name: str,
    defendant_name: str,
    satisfaction_date: str,
) -> str:
    """
    Memo for filing Entry of Satisfaction on the General Execution Docket
    (Fi.Fa.) in Clarke County, Georgia. O.C.G.A. § 9-12-65.

    After a judgment is satisfied, the judgment creditor (you) must file
    an Entry of Satisfaction. Failure to do so within 60 days of written
    demand by the debtor exposes the creditor to $250 penalty (§ 9-12-65(d)).
    This memo is used to prepare that filing proactively.
    """
    today = datetime.now()

    def fmt(d):
        if not d:
            return "[DATE]"
        try:
            return datetime.strptime(str(d), "%Y-%m-%d").strftime("%B %d, %Y")
        except Exception:
            return str(d)

    sat_fmt  = fmt(satisfaction_date)
    j_date   = fmt(judgment.get("judgment_date"))
    j_amount = float(judgment.get("judgment_amount") or 0)

    memo = f"""{'=' * 72}
               ENTRY OF SATISFACTION OF JUDGMENT
               General Execution Docket — Fi.Fa. Cancellation
               O.C.G.A. § 9-12-65
{'=' * 72}

Court:         {court_name}
Case No.:      {case_number}

Judgment Creditor (Plaintiff):
  {DEFAULT_TRUST_NAME}
  {DEFAULT_TRUSTEE_NAME}, Trustee
  {DEFAULT_ADDRESS}
  {DEFAULT_CITY}, {DEFAULT_STATE} {DEFAULT_ZIP}

Judgment Debtor (Defendant):
  {defendant_name}

Judgment Information:
  Date of Judgment:    {j_date}
  Judgment Amount:     ${j_amount:,.2f}
  Date Satisfied:      {sat_fmt}

{'─' * 72}
ENTRY OF SATISFACTION
{'─' * 72}

I, {DEFAULT_TRUSTEE_NAME}, Trustee of the {DEFAULT_TRUST_NAME},
being the Judgment Creditor in the above-styled case, hereby certify
that the above-referenced judgment has been SATISFIED IN FULL as of
{sat_fmt}.

I hereby authorize and request the Clerk of {court_name} to
enter SATISFACTION OF JUDGMENT on the General Execution Docket (Fi.Fa.)
for Civil Action File No. {case_number}, and to mark the judgment as
fully and finally SATISFIED.

{'─' * 72}
LIEN CANCELLATION
{'─' * 72}

Any judgment lien created by this judgment upon the real or personal
property of the Judgment Debtor, {defendant_name}, pursuant to
O.C.G.A. § 9-12-80 (real property) and § 9-12-91 (personal property),
is hereby RELEASED and CANCELLED as of {sat_fmt}.

{'─' * 72}
FILING INSTRUCTIONS
{'─' * 72}

  1. Sign this document before a Notary Public
  2. File with: Clerk of {court_name}
                325 E. Washington St., Athens, GA 30601
  3. Bring: (a) Original signed/notarized Entry of Satisfaction
            (b) Court-stamped copy of the original judgment order
            (c) Government-issued ID
  4. Filing fee: typically $0–$25 (confirm with clerk)
  5. Request: Certified copy of docket showing satisfaction entered
  6. Send certified copy to Judgment Debtor by Certified Mail
     (O.C.G.A. § 9-12-65(b) — debtor entitled to written confirmation)

{'─' * 72}
NOTARIZATION
{'─' * 72}

Signed under penalty of perjury that the foregoing is true and correct.


{'_' * 50}
{DEFAULT_TRUSTEE_NAME}, Trustee
{DEFAULT_TRUST_NAME}

Date: {today.strftime('%B %d, %Y')}

STATE OF GEORGIA
COUNTY OF CLARKE

Sworn to and subscribed before me this ____ day of _________, 20____

{'_' * 50}
Notary Public, State of Georgia
My Commission Expires: _______________

{'─' * 72}
STATUTORY REFERENCES:
  O.C.G.A. § 9-12-65   — Entry of satisfaction of judgment
  O.C.G.A. § 9-12-80   — Judgment lien on real property (7 years)
  O.C.G.A. § 9-12-86   — Cancellation of judgment lien
  O.C.G.A. § 9-12-91   — Judgment lien on personal property
{'=' * 72}
"""
    return memo.strip()


# ============================================================================
# PULL SATISFIED JUDGMENTS
# ============================================================================

def get_satisfied_judgments(specific_id: str = None) -> list[dict]:
    """
    Pull judgments that are satisfied but CRA deletion not yet demanded.
    """
    query = (
        supabase.table("judgments")
        .select("*, debt_vectors(*)")
        .in_("status", ["satisfied", "settled"])
        .eq("cra_deletion_demanded", False)
    )
    if specific_id:
        query = query.eq("id", specific_id)

    result = query.execute()
    return result.data or []


# ============================================================================
# MAIN RUNNER
# ============================================================================

def run_satisfaction_demand(specific_id: str = None):
    """
    Pull satisfied judgments, gather furnisher info, generate CRA deletion
    letters, furnisher notice, and Fi.Fa. cancellation memo.
    """

    print(f"\n{'=' * 60}")
    print("ODYSSEY-1 SATISFACTION & DELETION DEMAND ENGINE")
    print("R.O.M.A.N. 2.0 — Credit Record Purge Protocol")
    print(f"Run: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'=' * 60}\n")

    judgments = get_satisfied_judgments(specific_id)

    if not judgments:
        print("✅ No satisfied judgments pending CRA deletion demand.")
        print("   (Looking for judgments with status='satisfied' and cra_deletion_demanded=false)")
        print("   Run: python scripts/judgment-tracker.py collect")
        return []

    print(f"🧹 FOUND {len(judgments)} SATISFIED JUDGMENT(S) — Generating deletion package\n")
    print("─" * 60)

    generated = []

    for j in judgments:
        debt         = j.get("debt_vectors") or {}
        case_number  = j.get("case_number", "[CASE NUMBER]")
        court_name   = j.get("court_name", "Magistrate Court of Clarke County")
        defendant    = j.get("defendant_name", "[DEFENDANT]")
        defendant_addr = j.get("defendant_address", "[DEFENDANT ADDRESS]")
        j_amount     = float(j.get("judgment_amount") or j.get("settlement_amount") or 0)
        creditor     = debt.get("creditor_name", defendant)
        acct_masked  = debt.get("account_number_masked", "XXXX")

        # Determine satisfaction date
        sat_date = (
            j.get("settlement_date") or
            j.get("judgment_date") or
            str(date.today())
        )
        # If garnishment completed, use today as satisfaction date if not set
        if not sat_date:
            sat_date = str(date.today())

        print(f"  CASE:       {case_number}")
        print(f"  DEFENDANT:  {defendant}")
        print(f"  AMOUNT:     ${j_amount:,.2f}")
        print(f"  SATISFIED:  {sat_date}")
        print(f"  CREDITOR:   {creditor}")
        print()

        # ── FURNISHER INFO ────────────────────────────────────────────────────
        print("  ── FURNISHER INFORMATION ────────────────────────────────")
        print("  (The company that reported the debt to the CRAs)")
        furnisher_name = input(
            f"    Furnisher name [{defendant}]: "
        ).strip() or defendant
        furnisher_addr = input(
            f"    Furnisher address [{defendant_addr}]: "
        ).strip() or defendant_addr

        # ── INCLUDE D&B? ──────────────────────────────────────────────────────
        include_dnb_str = input("\n  Include Dun & Bradstreet (business credit)? (y/n, default n): ").strip().lower()
        include_dnb = include_dnb_str == "y"

        # ── SATISFACTION CONFIRMED? ───────────────────────────────────────────
        sat_confirmed = input(f"\n  Confirm satisfaction date [{sat_date}]: ").strip() or sat_date

        # ── GENERATE CRA DELETION LETTERS ─────────────────────────────────────
        cra_files = []
        cras_to_use = [c for c in CREDIT_REPORTING_AGENCIES if not c.get("business_only") or include_dnb]

        for cra in cras_to_use:
            letter = generate_cra_deletion_letter(
                judgment=j,
                debt=debt,
                cra=cra,
                satisfaction_date=sat_confirmed,
                case_number=case_number,
                court_name=court_name,
                furnisher_name=furnisher_name,
            )
            safe_case    = case_number.replace(" ", "_").replace("/", "-")[:20]
            safe_cra     = cra["name"].split()[0]
            cra_filename = f"deletion_{safe_case}_{safe_cra}.txt"
            cra_filepath = os.path.join(OUTPUT_DIR, cra_filename)

            with open(cra_filepath, "w") as f:
                f.write(letter)

            cra_files.append((cra["name"], cra_filepath, cra["address"], cra["city"]))
            print(f"  ✅ {cra['name']}: {cra_filepath}")

        # ── GENERATE FURNISHER NOTICE ──────────────────────────────────────────
        furnisher_notice = generate_furnisher_notice(
            judgment=j,
            debt=debt,
            satisfaction_date=sat_confirmed,
            case_number=case_number,
            court_name=court_name,
            furnisher_name=furnisher_name,
            furnisher_address=furnisher_addr,
        )
        safe_defendant = defendant.replace(" ", "_").replace("/", "-")[:25]
        furn_filename  = f"furnisher_notice_{safe_case}_{safe_defendant}.txt"
        furn_filepath  = os.path.join(OUTPUT_DIR, furn_filename)
        with open(furn_filepath, "w") as f:
            f.write(furnisher_notice)
        print(f"  ✅ Furnisher notice: {furn_filepath}")

        # ── GENERATE FI.FA. CANCELLATION ─────────────────────────────────────
        fifa_memo = generate_fifa_cancellation(
            judgment=j,
            case_number=case_number,
            court_name=court_name,
            defendant_name=defendant,
            satisfaction_date=sat_confirmed,
        )
        fifa_filename = f"fifa_cancellation_{safe_case}.txt"
        fifa_filepath = os.path.join(OUTPUT_DIR, fifa_filename)
        with open(fifa_filepath, "w") as f:
            f.write(fifa_memo)
        print(f"  ✅ Fi.Fa. cancellation memo: {fifa_filepath}")

        # ── UPDATE JUDGMENT RECORD ────────────────────────────────────────────
        supabase.table("judgments").update({
            "cra_deletion_demanded": True,
            "notes": (
                (j.get("notes") or "") +
                f"\n[CRA DELETION {date.today()}] Letters sent to {len(cras_to_use)} CRAs + furnisher. "
                f"Fi.Fa. cancellation prepared. Furnisher: {furnisher_name}."
            ).strip(),
        }).eq("id", j["id"]).execute()

        # Update debt_vectors if linked
        if j.get("debt_vector_id"):
            supabase.table("debt_vectors").update({
                "status": "Satisfied",
                "notes": (
                    (debt.get("notes") or "") +
                    f"\n[CLEAN SLATE {date.today()}] CRA deletion demanded. "
                    f"Case {case_number} satisfied ${j_amount:,.2f}."
                ).strip(),
            }).eq("id", j["debt_vector_id"]).execute()

        print(f"  ✅ R.O.M.A.N. updated: cra_deletion_demanded = true\n")

        generated.append({
            "case_number":   case_number,
            "defendant":     defendant,
            "amount":        j_amount,
            "sat_date":      sat_confirmed,
            "cra_files":     cra_files,
            "furn_file":     furn_filepath,
            "fifa_file":     fifa_filepath,
        })

        print("─" * 60)

    # ── FINAL SUMMARY & MAILING INSTRUCTIONS ──────────────────────────────────

    print(f"\n{'=' * 60}")
    print(f"CLEAN SLATE PROTOCOL COMPLETE — {len(generated)} CASE(S)")
    print(f"{'=' * 60}\n")

    for g in generated:
        print(f"  CASE: {g['case_number']} — {g['defendant']}")
        print(f"  Amount: ${g['amount']:,.2f} | Satisfied: {g['sat_date']}")
        print()
        print(f"  SEND VIA USPS CERTIFIED MAIL:")

        for (cra_name, cra_file, cra_addr, cra_city) in g["cra_files"]:
            print(f"    → {cra_name}")
            print(f"      {cra_addr}")
            print(f"      {cra_city}")
            print(f"      File: {cra_file}")

        print(f"\n    → Furnisher: {g['defendant']}")
        print(f"      File: {g['furn_file']}")
        print(f"\n    → Fi.Fa. Cancellation (FILE AT COURTHOUSE):")
        print(f"      325 E. Washington St., Athens, GA 30601")
        print(f"      File: {g['fifa_file']}")
        print()

    print(f"""
FINAL STEPS — THE CLEAN SLATE PROTOCOL:

  1. GET NOTARIZED
     Sign the Fi.Fa. Cancellation document before a Notary Public.
     (UPS Store, bank, or library — Athens area)

  2. FILE AT COURTHOUSE
     Take Fi.Fa. Cancellation to Clarke County Clerk's Office:
     325 E. Washington St., Athens, GA 30601
     Request certified copy of satisfied docket entry.

  3. SEND CRA LETTERS — ALL VIA CERTIFIED MAIL
     Each CRA has 30 days to reinvestigate and delete (15 U.S.C. § 1681i).
     Keep green cards as proof of delivery.

  4. SEND FURNISHER NOTICE
     The furnisher has 14 days to instruct CRAs to delete.
     If they fail: FCRA action = separate $1,000 per violation.

  5. PULL YOUR CREDIT REPORTS IN 45 DAYS
     Verify deletion at: www.annualcreditreport.com (official, free)
     If tradeline still appears: file FCRA action immediately.

  6. UPDATE R.O.M.A.N.
     python scripts/judgment-tracker.py dashboard
     (Status: Satisfied ✅ | CRA Deletion Demanded ✅)

THE DEBT IS DEAD. THE RECORD WILL BE CLEAN.
""")

    return generated


# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    import sys

    # Usage:
    #   python scripts/satisfaction-demand.py            (all satisfied judgments)
    #   python scripts/satisfaction-demand.py <uuid>     (specific judgment ID)

    arg = sys.argv[1] if len(sys.argv) > 1 else None

    if arg and len(arg) > 10:
        run_satisfaction_demand(specific_id=arg)
    else:
        run_satisfaction_demand()
