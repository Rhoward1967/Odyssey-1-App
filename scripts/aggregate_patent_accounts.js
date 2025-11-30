// Multi-account Patent Status Aggregator
// This script checks for multiple patent accounts and aggregates their statuses for the dashboard and alerts.

const fs = require('fs');
const path = require('path');

const accountsDir = path.join(__dirname, '../IP_VAULT/07_LEGAL_PROTECTION/accounts');
const dashboardPath = path.join(__dirname, '../PATENT_STATUS_DASHBOARD.md');

function aggregatePatentAccounts() {
  if (!fs.existsSync(accountsDir)) {
    console.log('No multiple patent accounts directory found.');
    return;
  }
  const accounts = fs.readdirSync(accountsDir).filter(f => fs.statSync(path.join(accountsDir, f)).isDirectory());
  let summary = '\n## Multi-Account Patent Status\n';
  accounts.forEach(account => {
    const statusFile = path.join(accountsDir, account, 'status.md');
    if (fs.existsSync(statusFile)) {
      const status = fs.readFileSync(statusFile, 'utf-8');
      summary += `\n### Account: ${account}\n${status}\n`;
    }
  });
  // Append or update the dashboard
  let dashboard = fs.readFileSync(dashboardPath, 'utf-8');
  dashboard = dashboard.replace(/## Multi-Account Patent Status[\s\S]*?(?=^## |\Z)/m, '');
  dashboard += summary;
  fs.writeFileSync(dashboardPath, dashboard);
  console.log('✅ Multi-account patent status aggregated.');
}

aggregatePatentAccounts();
