"""
JUDGMENT TRACKER & GARNISHMENT ENGINE — PHASE 4
================================================
R.O.M.A.N. 2.0 — Post-Judgment Enforcement Protocol

After winning a civil judgment under the FDCPA, debt collectors who refuse
to pay voluntarily can be compelled through Georgia's post-judgment
garnishment process. A judgment is an ORDER — not a request.

This script:
  1. Logs new civil complaint filings (case numbers, court, hearing dates)
  2. Records judgment outcomes (amount awarded, date, type)
  3. Generates Georgia Summons of Garnishment (O.C.G.A. § 18-4-4)
  4. Tracks garnishment collections and interest accrual
  5. Updates R.O.M.A.N. pipeline status at each stage

Legal Basis:
  O.C.G.A. § 18-4-1   — Georgia post-judgment garnishment authority
  O.C.G.A. § 18-4-4   — Summons of Garnishment form and service
  O.C.G.A. § 18-4-20  — Continuing garnishment (wages)
  O.C.G.A. § 18-4-6   — Garnishee's answer deadline (45 days)
  O.C.G.A. § 7-4-12   — Post-judgment interest: 7% per annum
  O.C.G.A. § 9-12-80  — Judgment lien on real property (7-year duration)
  O.C.G.A. § 9-12-91  — Judgment lien on personal property
  15 U.S.C. § 1673     — Federal wage garnishment limits (max 25%)
  15 U.S.C. § 1692k   — FDCPA civil liability (original source of judgment)

Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
"""

import os
import json
from datetime import datetime, timedelta, date
from decimal import Decimal

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

OUTPUT_DIR = "output/judgments"
os.makedirs(OUTPUT_DIR, exist_ok=True)

GARNISHMENT_DIR = "output/garnishments"
os.makedirs(GARNISHMENT_DIR, exist_ok=True)

# Georgia post-judgment interest rate (O.C.G.A. § 7-4-12)
GEORGIA_INTEREST_RATE = 0.07  # 7% per annum

# Plaintiff defaults
DEFAULT_TRUST_NAME   = "Howard Jones Bloodline Ancestral Trust"
DEFAULT_TRUSTEE_NAME = "Rickey Allan Howard"
DEFAULT_ADDRESS      = "595 Macon Highway"
DEFAULT_CITY         = "Athens"
DEFAULT_STATE        = "GA"
DEFAULT_ZIP          = "30606"

# Clarke County courts
COURTS = {
    "magistrate": {
        "name": "Magistrate Court of Clarke County",
        "address": "325 E. Washington St., Suite 330, Athens, GA 30601",
        "phone": "(706) 613-3190",
    },
    "state": {
        "name": "State Court of Clarke County",
        "address": "325 E. Washington St., Athens, GA 30601",
        "phone": "(706) 613-3165",
    },
    "superior": {
        "name": "Superior Court of Clarke County",
        "address": "325 E. Washington St., Athens, GA 30601",
        "phone": "(706) 613-3140",
    },
}


# ============================================================================
# INTEREST CALCULATOR
# ============================================================================

def calculate_interest(principal: float, judgment_date_str: str) -> dict:
    """
    Calculate accrued post-judgment interest at 7% per annum.
    O.C.G.A. § 7-4-12: interest runs from the date of judgment.
    """
    try:
        j_date    = datetime.strptime(judgment_date_str, "%Y-%m-%d").date()
        today     = date.today()
        days      = (today - j_date).days
        interest  = principal * GEORGIA_INTEREST_RATE * (days / 365)
        total     = principal + interest
    except Exception:
        days     = 0
        interest = 0.0
        total    = principal

    return {
        "principal":       principal,
        "days":            days,
        "daily_rate":      round(principal * GEORGIA_INTEREST_RATE / 365, 4),
        "accrued_interest": round(interest, 2),
        "total_now_owed":  round(total, 2),
    }


# ============================================================================
# GARNISHMENT SUMMONS GENERATOR
# ============================================================================

def generate_garnishment_summons(
    judgment: dict,
    garnishee_name: str,
    garnishee_address: str,
    garnishment_type: str,  # 'bank' | 'wages' | 'accounts_receivable'
    interest_data: dict,
) -> str:
    """
    Generate a Georgia Summons of Garnishment.
    Filed in the same court where the judgment was obtained.
    The Garnishee (bank/employer) must answer within 45 days (O.C.G.A. § 18-4-6).
    """

    today      = datetime.now()
    answer_due = today + timedelta(days=45)

    case_number    = judgment.get("case_number", "[CASE NUMBER]")
    court_name     = judgment.get("court_name", COURTS["magistrate"]["name"])
    defendant_name = judgment.get("defendant_name", "[DEFENDANT]")
    defendant_addr = judgment.get("defendant_address", "[DEFENDANT ADDRESS]")
    j_date         = judgment.get("judgment_date", "[DATE]")
    total_owed     = interest_data["total_now_owed"]
    accrued        = interest_data["accrued_interest"]
    principal      = interest_data["principal"]
    days_elapsed   = interest_data["days"]

    if isinstance(j_date, str) and j_date not in ("[DATE]", ""):
        try:
            j_date_fmt = datetime.strptime(j_date, "%Y-%m-%d").strftime("%B %d, %Y")
        except Exception:
            j_date_fmt = j_date
    else:
        j_date_fmt = j_date

    # Type-specific language
    if garnishment_type == "wages":
        garnishment_subject = "wages, salary, and other compensation"
        federal_limit_note = (
            "\nNOTE: Federal law (15 U.S.C. § 1673) limits wage garnishment to the\n"
            "lesser of: (a) 25% of disposable earnings, or (b) the amount by which\n"
            "disposable earnings exceed 30 × federal minimum wage per week.\n"
        )
    elif garnishment_type == "accounts_receivable":
        garnishment_subject = "accounts receivable and monies owed to Defendant"
        federal_limit_note = ""
    else:  # bank
        garnishment_subject = "bank accounts, deposits, and funds on deposit"
        federal_limit_note = ""

    summons = f"""{'=' * 72}
              IN THE {court_name.upper()}
                   STATE OF GEORGIA
{'=' * 72}

CIVIL ACTION FILE NO.: {case_number}

{DEFAULT_TRUST_NAME},
By and Through Its Trustee,
{DEFAULT_TRUSTEE_NAME},
  Plaintiff / Judgment Creditor,

     v.

{defendant_name},
  Defendant / Judgment Debtor.

─────────────────────────────────────────────────────────────────────────────
              SUMMONS OF GARNISHMENT
              Pursuant to O.C.G.A. § 18-4-4
─────────────────────────────────────────────────────────────────────────────

Issued: {today.strftime('%B %d, %Y')}
Answer Due: {answer_due.strftime('%B %d, %Y')} (45 days — O.C.G.A. § 18-4-6)


TO THE GARNISHEE:

{garnishee_name}
{garnishee_address}

YOU ARE HEREBY SUMMONED and required to appear before the {court_name}
and answer the following questions under oath:

   1. At the time of service of this summons upon you, were you indebted
      to or did you have in your possession or control any property,
      real or personal, belonging to the Defendant,
      {defendant_name}, {defendant_addr}?

   2. Specifically: Did you hold any {garnishment_subject}
      belonging to or owed to the Defendant as of the date of service?

   3. If so, state the exact amount and nature of such property or
      indebtedness.
{federal_limit_note}
─────────────────────────────────────────────────────────────────────────────
JUDGMENT DETAILS
─────────────────────────────────────────────────────────────────────────────

  Judgment entered:      {j_date_fmt}
  Judgment principal:    ${principal:,.2f}
  Post-judgment interest: ${accrued:,.2f}
    ({days_elapsed} days × {GEORGIA_INTEREST_RATE*100:.0f}% p.a. — O.C.G.A. § 7-4-12)
  ─────────────────────────
  TOTAL NOW OWED:        ${total_owed:,.2f}

  Daily interest accrual: ${interest_data['daily_rate']:.4f}/day
  Interest increases daily until paid in full.

─────────────────────────────────────────────────────────────────────────────
GARNISHEE INSTRUCTIONS (O.C.G.A. § 18-4-6)
─────────────────────────────────────────────────────────────────────────────

  1. You must ANSWER this summons within 45 days of service.

  2. If you hold funds or property of the Defendant, you must:
       a. WITHHOLD those funds / property up to the judgment amount
       b. NOT disburse them to the Defendant during this garnishment
       c. File your written ANSWER with the court within 45 days

  3. If you have ALREADY disbursed funds to Defendant after receiving this
     summons, you may be held personally liable for the judgment amount.

  4. If you do NOT hold any of Defendant's funds or property, you must
     still file a written "No Funds" answer with the court within 45 days.

  5. FAILURE TO ANSWER within 45 days will result in a DEFAULT JUDGMENT
     being entered against YOU (the Garnishee) personally.

─────────────────────────────────────────────────────────────────────────────
FILING INSTRUCTIONS FOR CLERK
─────────────────────────────────────────────────────────────────────────────

  1. Clerk files Summons of Garnishment in Civil Action File No. {case_number}
  2. Clerk issues writ to Sheriff for service on Garnishee
  3. Sheriff serves Garnishee at: {garnishee_address}
  4. Serve Defendant / Judgment Debtor by Certified Mail simultaneously
  5. Return of service filed within 5 days of service (O.C.G.A. § 18-4-8)

─────────────────────────────────────────────────────────────────────────────
PLAINTIFF / JUDGMENT CREDITOR
─────────────────────────────────────────────────────────────────────────────

{'_' * 50}
{DEFAULT_TRUSTEE_NAME}, Trustee
{DEFAULT_TRUST_NAME}
{DEFAULT_ADDRESS}
{DEFAULT_CITY}, {DEFAULT_STATE} {DEFAULT_ZIP}

Date: {today.strftime('%B %d, %Y')}

─────────────────────────────────────────────────────────────────────────────
STATUTORY AUTHORITY:
  O.C.G.A. § 18-4-1   — Post-judgment garnishment authority
  O.C.G.A. § 18-4-4   — Summons of Garnishment
  O.C.G.A. § 18-4-6   — Garnishee answer deadline (45 days)
  O.C.G.A. § 7-4-12   — 7% post-judgment interest
  15 U.S.C. § 1673     — Federal wage garnishment limits
{'=' * 72}
"""
    return summons.strip()


# ============================================================================
# LOG NEW CASE FILING (after filing in court)
# ============================================================================

def log_case_filing():
    """
    After a complaint is filed in court, log the case details in R.O.M.A.N.
    Links back to the debt_vectors record via the UUID.
    """
    print("\n── LOG NEW CASE FILING ─────────────────────────────────────────")
    print("Enter the details from your court filing receipt.\n")

    debt_vector_id = input("  Debt Vector ID (UUID from debt_vectors table, or Enter to skip): ").strip() or None
    case_number    = input("  Case Number (from clerk's file stamp): ").strip()

    print("  Court: (1) Magistrate  (2) State  (3) Superior  (4) Other")
    court_choice = input("  Choose [1]: ").strip() or "1"
    court_map = {"1": "magistrate", "2": "state", "3": "superior"}
    court_key = court_map.get(court_choice, "magistrate")
    court_name = COURTS.get(court_key, {}).get("name") or input("  Court name: ").strip()

    filing_date  = input(f"  Filing date (YYYY-MM-DD, default today {date.today()}): ").strip() or str(date.today())
    hearing_date = input("  Hearing date (YYYY-MM-DD, or Enter if not yet set): ").strip() or None
    defendant    = input("  Defendant legal name: ").strip()
    def_addr     = input("  Defendant address: ").strip()
    def_agent    = input("  Registered agent: ").strip()

    payload = {
        "case_number":             case_number,
        "court_name":              court_name,
        "court_division":          court_key,
        "filing_date":             filing_date,
        "defendant_name":          defendant,
        "defendant_address":       def_addr,
        "defendant_registered_agent": def_agent,
        "status":                  "filed",
        "interest_rate":           GEORGIA_INTEREST_RATE,
    }
    if debt_vector_id:
        payload["debt_vector_id"] = debt_vector_id
    if hearing_date:
        payload["hearing_date"] = hearing_date

    result = supabase.table("judgments").insert(payload).execute()
    record = result.data[0] if result.data else {}
    jid    = record.get("id", "UNKNOWN")

    # Update debt_vectors status if linked
    if debt_vector_id:
        supabase.table("debt_vectors").update({
            "status": "Legal Action Pending",
        }).eq("id", debt_vector_id).execute()

    print(f"\n  ✅ Case filed in R.O.M.A.N. — Judgment ID: {jid}")
    print(f"  ✅ Case: {case_number} | Court: {court_name}")
    if hearing_date:
        print(f"  ✅ Hearing: {hearing_date}")
    return jid


# ============================================================================
# LOG JUDGMENT OUTCOME
# ============================================================================

def log_judgment_outcome():
    """
    After the hearing, record the judgment outcome.
    If defendant defaulted, that's the most common scenario.
    """
    print("\n── LOG JUDGMENT OUTCOME ────────────────────────────────────────")

    # Pull open cases
    result = (
        supabase.table("judgments")
        .select("*")
        .in_("status", ["filed", "served", "pending_hearing", "contested"])
        .execute()
    )
    open_cases = result.data or []

    if not open_cases:
        print("  No open cases found. Log a filing first.")
        return

    print(f"\n  Open cases ({len(open_cases)}):")
    for i, c in enumerate(open_cases):
        print(f"  [{i+1}] {c['case_number']} — {c['defendant_name']} — {c['status']}")

    choice = input("\n  Select case number [1]: ").strip()
    try:
        idx = int(choice) - 1
        case = open_cases[idx]
    except Exception:
        case = open_cases[0]

    jid = case["id"]
    print(f"\n  Case: {case['case_number']} — {case['defendant_name']}")

    print("\n  Outcome:")
    print("    (1) Default judgment — defendant never answered")
    print("    (2) Judgment in our favor — after hearing")
    print("    (3) Settled — defendant agreed to pay")
    print("    (4) Dismissed — without prejudice (can refile)")
    print("    (5) Dismissed — with prejudice (final)")
    print("    (6) Contested — defendant answered, trial pending")

    outcome_choice = input("  Outcome [1]: ").strip() or "1"
    outcome_map = {
        "1": "default_judgment",
        "2": "judgment_obtained",
        "3": "settled",
        "4": "dismissed",
        "5": "dismissed",
        "6": "contested",
    }
    new_status = outcome_map.get(outcome_choice, "default_judgment")

    update_payload = {"status": new_status}

    judgment_date = input(f"  Judgment / outcome date (YYYY-MM-DD, default today): ").strip() or str(date.today())
    update_payload["judgment_date"]            = judgment_date
    update_payload["interest_accrual_start"]   = judgment_date
    update_payload["hearing_result"]           = new_status

    if new_status in ("default_judgment", "judgment_obtained"):
        amount_str = input("  Total judgment amount awarded (as entered on the order): $").strip()
        try:
            jamt = float(amount_str.replace(",", "").replace("$", ""))
        except Exception:
            jamt = 0.0

        fdcpa_str = input(f"  FDCPA damages portion [${jamt:.2f}]: $").strip()
        try:
            fdcpa = float(fdcpa_str.replace(",", "").replace("$", "")) if fdcpa_str else jamt
        except Exception:
            fdcpa = jamt

        fees_str = input("  Attorney fees awarded: $").strip() or "0"
        try:
            fees = float(fees_str.replace(",", "").replace("$", ""))
        except Exception:
            fees = 0.0

        update_payload["judgment_amount"]        = jamt
        update_payload["fdcpa_damages_awarded"]  = fdcpa
        update_payload["attorney_fees_awarded"]  = fees

        notes_in = input("  Notes (optional): ").strip()
        if notes_in:
            update_payload["notes"] = notes_in

        # Update debt_vectors
        if case.get("debt_vector_id"):
            supabase.table("debt_vectors").update({
                "status": "Judgment Obtained",
            }).eq("id", case["debt_vector_id"]).execute()

    elif new_status == "settled":
        settlement_str = input("  Settlement amount: $").strip() or "0"
        try:
            smt = float(settlement_str.replace(",", "").replace("$", ""))
        except Exception:
            smt = 0.0

        includes_del = input("  Does settlement include tradeline deletion? (y/n): ").strip().lower() == "y"
        update_payload["settlement_amount"]             = smt
        update_payload["settlement_date"]               = judgment_date
        update_payload["settlement_includes_deletion"]  = includes_del

        if case.get("debt_vector_id"):
            supabase.table("debt_vectors").update({
                "status": "Resolved",
            }).eq("id", case["debt_vector_id"]).execute()

    supabase.table("judgments").update(update_payload).eq("id", jid).execute()
    print(f"\n  ✅ Outcome logged: {new_status}")

    if new_status in ("default_judgment", "judgment_obtained"):
        interest = calculate_interest(update_payload.get("judgment_amount", 0), judgment_date)
        print(f"\n  JUDGMENT SUMMARY:")
        print(f"    Principal:   ${interest['principal']:,.2f}")
        print(f"    Daily accrual at 7%: ${interest['daily_rate']:.4f}/day")
        print(f"    Interest clock started: {judgment_date}")
        print(f"\n  NEXT STEP: File Summons of Garnishment if not paid within 30 days.")
        print(f"  Run: python scripts/judgment-tracker.py garnish")


# ============================================================================
# GARNISHMENT WORKFLOW
# ============================================================================

def run_garnishment():
    """
    Pull judgments ready for garnishment, generate summons, log in R.O.M.A.N.
    """
    print("\n── GARNISHMENT ENGINE ──────────────────────────────────────────")

    # Pull garnishment candidates from DB view
    result = (
        supabase.table("judgments")
        .select("*")
        .in_("status", ["judgment_obtained", "default_judgment"])
        .eq("garnishment_filed", False)
        .execute()
    )
    candidates = result.data or []

    if not candidates:
        print("\n  No judgments ready for garnishment.")
        print("  (Looking for status = judgment_obtained / default_judgment, garnishment_filed = false)")
        return

    print(f"\n  ⚖️  {len(candidates)} JUDGMENT(S) READY FOR GARNISHMENT\n")

    for j in candidates:
        j_amount = float(j.get("judgment_amount") or 0)
        j_date   = j.get("judgment_date") or str(date.today())
        interest = calculate_interest(j_amount, j_date)

        print(f"  CASE:       {j['case_number']}")
        print(f"  DEFENDANT:  {j['defendant_name']}")
        print(f"  COURT:      {j['court_name']}")
        print(f"  JUDGMENT:   ${j_amount:,.2f} (entered {j_date})")
        print(f"  + INTEREST: ${interest['accrued_interest']:,.2f} ({interest['days']} days @ 7%)")
        print(f"  TOTAL OWED: ${interest['total_now_owed']:,.2f}")
        print()

        # Garnishment target
        print("  ── GARNISHMENT TARGET ──────────────────────────────────")
        print("  What are you garnishing?")
        print("    (1) Bank account (most common for debt collectors)")
        print("    (2) Wages / salary (if individual defendant)")
        print("    (3) Accounts receivable / business debts owed to them")
        g_type_choice = input("  Type [1]: ").strip() or "1"
        g_type_map = {"1": "bank", "2": "wages", "3": "accounts_receivable"}
        g_type = g_type_map.get(g_type_choice, "bank")

        print(f"\n  GARNISHEE (the bank/employer holding defendant's funds):")
        garnishee_name = input("    Garnishee name (e.g. 'Wells Fargo Bank, N.A.'): ").strip()
        garnishee_addr = input("    Garnishee address (registered agent): ").strip()

        # Generate summons
        summons = generate_garnishment_summons(
            judgment=j,
            garnishee_name=garnishee_name,
            garnishee_address=garnishee_addr,
            garnishment_type=g_type,
            interest_data=interest,
        )

        # Save summons
        safe_defendant = j["defendant_name"].replace(" ", "_").replace("/", "-")[:25]
        safe_garnishee = garnishee_name.replace(" ", "_").replace("/", "-")[:20]
        filename = f"garnishment_{j['case_number'].replace(' ', '_')}_{safe_defendant}_at_{safe_garnishee}.txt"
        filepath = os.path.join(GARNISHMENT_DIR, filename)

        with open(filepath, "w") as f:
            f.write(summons)

        print(f"\n  ✅ Summons of Garnishment saved: {filepath}")

        # Update judgment record
        supabase.table("judgments").update({
            "garnishment_filed":       True,
            "garnishment_filing_date": str(date.today()),
            "garnishment_target":      garnishee_name,
            "garnishment_target_addr": garnishee_addr,
            "status":                  "collecting",
        }).eq("id", j["id"]).execute()

        # Update debt_vectors
        if j.get("debt_vector_id"):
            supabase.table("debt_vectors").update({
                "status": "Collecting",
            }).eq("id", j["debt_vector_id"]).execute()

        print(f"  ✅ R.O.M.A.N. status: Judgment Obtained → Collecting")
        print(f"\n  FILING INSTRUCTIONS:")
        print(f"    1. Take the summons to: {j['court_name']}")
        print(f"    2. File under Case No.: {j['case_number']}")
        print(f"    3. Pay Sheriff service fee (~$25–50)")
        print(f"    4. Sheriff serves garnishee within 5–10 business days")
        print(f"    5. Garnishee must answer within 45 days (O.C.G.A. § 18-4-6)")
        print(f"    6. If garnishee defaults: file motion for default judgment vs. garnishee")
        print()
        print("─" * 60)


# ============================================================================
# LOG COLLECTION RECEIVED
# ============================================================================

def log_collection():
    """
    Record a partial or full payment received through garnishment or voluntary payment.
    """
    print("\n── LOG COLLECTION RECEIVED ─────────────────────────────────────")

    result = (
        supabase.table("judgments")
        .select("*")
        .eq("status", "collecting")
        .execute()
    )
    active = result.data or []

    if not active:
        print("  No active garnishments found.")
        return

    print(f"\n  Active garnishments ({len(active)}):")
    for i, c in enumerate(active):
        collected_so_far = float(c.get("garnishment_amount_collected") or 0)
        j_amount = float(c.get("judgment_amount") or 0)
        remaining = calculate_interest(j_amount, c.get("judgment_date", str(date.today())))
        print(f"  [{i+1}] {c['case_number']} — {c['defendant_name']}")
        print(f"       Judgment: ${j_amount:,.2f} | Collected: ${collected_so_far:,.2f} | Total owed: ${remaining['total_now_owed']:,.2f}")

    choice = input("\n  Select case [1]: ").strip()
    try:
        idx = int(choice) - 1
        case = active[idx]
    except Exception:
        case = active[0]

    amount_str = input(f"  Amount received today: $").strip()
    try:
        received = float(amount_str.replace(",", "").replace("$", ""))
    except Exception:
        received = 0.0

    prev_collected = float(case.get("garnishment_amount_collected") or 0)
    new_total      = prev_collected + received
    j_amount       = float(case.get("judgment_amount") or 0)
    interest_data  = calculate_interest(j_amount, case.get("judgment_date", str(date.today())))
    total_owed     = interest_data["total_now_owed"]

    is_satisfied = new_total >= total_owed
    new_status   = "satisfied" if is_satisfied else "collecting"

    update = {
        "garnishment_amount_collected": new_total,
        "garnishment_satisfied":        is_satisfied,
        "status":                       new_status,
    }

    if is_satisfied:
        update["notes"] = (
            (case.get("notes") or "") +
            f"\n[SATISFIED {date.today()}] Total collected: ${new_total:,.2f} "
            f"against judgment of ${j_amount:,.2f} + interest."
        ).strip()
        if case.get("debt_vector_id"):
            supabase.table("debt_vectors").update({
                "status": "Satisfied",
            }).eq("id", case["debt_vector_id"]).execute()

    supabase.table("judgments").update(update).eq("id", case["id"]).execute()

    print(f"\n  ✅ Payment logged: ${received:,.2f}")
    print(f"  Total collected: ${new_total:,.2f} / ${total_owed:,.2f}")

    if is_satisfied:
        print(f"\n  🎉 JUDGMENT SATISFIED — Case {case['case_number']} CLOSED")
        print(f"  Next: Demand tradeline deletion from all CRAs.")
        print(f"  File satisfaction of judgment with court clerk.")
        print(f"  R.O.M.A.N. status updated → Satisfied")
    else:
        remaining = total_owed - new_total
        print(f"  Remaining balance: ${remaining:,.2f} (interest still accruing)")


# ============================================================================
# PIPELINE DASHBOARD
# ============================================================================

def show_dashboard():
    """
    Print the full R.O.M.A.N. enforcement pipeline status.
    """
    print(f"\n{'=' * 70}")
    print("R.O.M.A.N. 2.0 — ENFORCEMENT PIPELINE DASHBOARD")
    print(f"As of: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'=' * 70}\n")

    # Pull pipeline view
    try:
        result = supabase.table("roman_enforcement_summary").select("*").execute()
        rows   = result.data or []
    except Exception:
        # Fallback if view not yet deployed
        result = supabase.table("debt_vectors").select("*").execute()
        rows   = [{"creditor_name": r["creditor_name"],
                   "debt_status":   r["status"],
                   "alleged_amount": r["amount"],
                   "pipeline_phase": r["status"]}
                  for r in (result.data or [])]

    if not rows:
        print("  No records found. Start by running securitization-audit.py.")
        return

    # Phase summary counts
    from collections import Counter
    phases = Counter(r.get("pipeline_phase", "Unknown") for r in rows)

    print("  PIPELINE SUMMARY:")
    for phase, count in sorted(phases.items()):
        print(f"    {phase}: {count} debt(s)")
    print()

    # Active judgment interest
    j_result = (
        supabase.table("judgments")
        .select("*")
        .in_("status", ["judgment_obtained", "default_judgment", "collecting"])
        .execute()
    )
    judgments = j_result.data or []

    if judgments:
        print(f"  ACTIVE JUDGMENTS ({len(judgments)}):")
        total_outstanding = 0.0
        for j in judgments:
            j_amt = float(j.get("judgment_amount") or 0)
            j_date = j.get("judgment_date") or str(date.today())
            collected = float(j.get("garnishment_amount_collected") or 0)
            interest  = calculate_interest(j_amt, j_date)
            remaining = interest["total_now_owed"] - collected
            total_outstanding += max(remaining, 0)

            print(f"    ▸ Case {j['case_number']} — {j['defendant_name']}")
            print(f"      Judgment: ${j_amt:,.2f} | Interest: ${interest['accrued_interest']:,.2f}")
            print(f"      Collected: ${collected:,.2f} | Remaining: ${remaining:,.2f}")
            print(f"      Status: {j['status']} | Garnishment: {'Yes' if j['garnishment_filed'] else 'No'}")
            print()

        print(f"  TOTAL OUTSTANDING (principal + interest - collected): ${total_outstanding:,.2f}")

    print()
    print("  COMMANDS:")
    print("    python scripts/judgment-tracker.py file       — Log new case filing")
    print("    python scripts/judgment-tracker.py outcome    — Record hearing outcome")
    print("    python scripts/judgment-tracker.py garnish    — Generate garnishment summons")
    print("    python scripts/judgment-tracker.py collect    — Log payment received")
    print("    python scripts/judgment-tracker.py dashboard  — This view")
    print(f"\n{'=' * 70}")


# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    import sys

    # Usage:
    #   python scripts/judgment-tracker.py                   → dashboard
    #   python scripts/judgment-tracker.py dashboard         → dashboard
    #   python scripts/judgment-tracker.py file              → log case filing
    #   python scripts/judgment-tracker.py outcome           → log judgment outcome
    #   python scripts/judgment-tracker.py garnish           → garnishment summons
    #   python scripts/judgment-tracker.py collect           → log collection received

    cmd = sys.argv[1].lower() if len(sys.argv) > 1 else "dashboard"

    if cmd == "file":
        log_case_filing()
    elif cmd == "outcome":
        log_judgment_outcome()
    elif cmd in ("garnish", "garnishment"):
        run_garnishment()
    elif cmd in ("collect", "collection", "payment"):
        log_collection()
    else:
        show_dashboard()
