// R.O.M.A.N. Dual-Hemisphere Integration & Reporting (Scaffold)
// This module combines proactive repair and learning/optimization, and generates daily/weekly reports for the human overseer.

const fs = require('fs');
const path = require('path');

function generateReport() {
  const now = new Date();
  const logsDir = path.join(__dirname, '../logs');
  const report = {
    timestamp: now.toISOString(),
    observer: readLogSafe('roman_observer.log', logsDir),
    repair: readLogSafe('roman_repair.log', logsDir),
    apiAudit: readLogSafe('roman_api_audit.log', logsDir),
    changeDetection: readLogSafe('roman_change_detection.log', logsDir),
    summary: ''
  };
  report.summary = summarizeReport(report);
  const reportPath = path.join(logsDir, `roman_report_${now.toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  return report;
}

function readLogSafe(filename, dir) {
  const file = path.join(dir, filename);
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf-8').split('\n').filter(Boolean).map(line => {
    try { return JSON.parse(line); } catch { return line; }
  });
}

function summarizeReport(report) {
  let summary = 'R.O.M.A.N. System Report\n';
  summary += `Observer events: ${report.observer.length}\n`;
  summary += `Repairs attempted: ${report.repair.length}\n`;
  summary += `API key issues: ${report.apiAudit.filter(e => e.results && e.results.some(r => r.status !== 'present')).length}\n`;
  summary += `Config/file changes: ${report.changeDetection.length}\n`;
  summary += 'See full report for details.';
  return summary;
}

module.exports = { generateReport };
