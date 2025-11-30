# Multi-Account Patent Status Aggregator

This script (`aggregate_patent_accounts.js`) checks for multiple patent accounts in `IP_VAULT/07_LEGAL_PROTECTION/accounts/`, aggregates their statuses, and updates the `PATENT_STATUS_DASHBOARD.md`.

## Setup Instructions

1. **Directory Structure:**
   - Place each account in its own folder under `IP_VAULT/07_LEGAL_PROTECTION/accounts/`.
   - Each account folder should have a `status.md` file with the current status.

2. **Run the script:**
   - `node scripts/aggregate_patent_accounts.js`

3. **Automate aggregation:**
   - Add to your daily or weekly automation (e.g., as a cron job or npm script).
   - Example (add to `package.json`):
     ```json
     "scripts": {
       ...existing scripts...
       "aggregate-patent-accounts": "node scripts/aggregate_patent_accounts.js"
     }
     ```

## What it does
- Aggregates all account statuses into the main dashboard.
- Ensures all patent accounts are tracked and visible.

---

**Note:**
- Run this before syncing the dashboard to R.O.M.A.N. for complete data.
- For full automation, chain this script with your dashboard sync automation.
