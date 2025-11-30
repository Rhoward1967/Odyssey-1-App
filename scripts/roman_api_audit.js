// R.O.M.A.N. API Key & Service Audit (Scaffold)
// This module audits the presence and validity of all API keys and critical services, alerting only if something is missing or misconfigured.

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const REQUIRED_KEYS = [
  'OPENAI_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DISCORD_BOT_TOKEN',
  'STRIPE_SECRET_KEY',
  // ...add all 17 keys here
];

function auditApiKeys() {
  const timestamp = new Date().toISOString();
  const results = [];
  for (const key of REQUIRED_KEYS) {
    const value = process.env[key];
    results.push({
      key,
      status: value && value.length > 10 ? 'present' : 'missing or invalid',
      length: value ? value.length : 0
    });
  }
  logAuditResults(results, timestamp);
  return results;
}

function logAuditResults(results, timestamp) {
  const logPath = path.join(__dirname, '../logs/roman_api_audit.log');
  fs.appendFileSync(logPath, JSON.stringify({ timestamp, results }) + '\n');
}

module.exports = { auditApiKeys };
