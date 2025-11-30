// R.O.M.A.N. Change Detection & Knowledge Update (Scaffold)
// This module monitors for file/config/dependency changes and updates R.O.M.A.N.'s knowledge base.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const WATCHED_FILES = [
  '.env',
  'package.json',
  'tsconfig.json',
  // Add more files or directories as needed
];

const HASH_LOG = path.join(__dirname, '../logs/roman_file_hashes.json');

function getFileHash(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

function loadPreviousHashes() {
  if (!fs.existsSync(HASH_LOG)) return {};
  return JSON.parse(fs.readFileSync(HASH_LOG, 'utf-8'));
}

function saveHashes(hashes) {
  fs.writeFileSync(HASH_LOG, JSON.stringify(hashes, null, 2));
}

function detectChanges() {
  const prev = loadPreviousHashes();
  const current = {};
  const changes = [];
  for (const file of WATCHED_FILES) {
    const hash = getFileHash(file);
    current[file] = hash;
    if (prev[file] && prev[file] !== hash) {
      changes.push({ file, old: prev[file], new: hash });
    }
    if (!prev[file] && hash) {
      changes.push({ file, old: null, new: hash });
    }
  }
  saveHashes(current);
  logDetectedChanges(changes);
  return changes;
}

function logDetectedChanges(changes) {
  if (changes.length === 0) return;
  const logPath = path.join(__dirname, '../logs/roman_change_detection.log');
  const entry = { timestamp: new Date().toISOString(), changes };
  fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
}

module.exports = { detectChanges };
