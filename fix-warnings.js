#!/usr/bin/env node
/**
 * ODYSSEY-1 WARNING FIXER
 * Automatically fixes common React/TypeScript warnings
 * Run with: node fix-warnings.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 ODYSSEY-1 WARNING FIXER STARTING...');

// Get all TypeScript/TSX files in src/components
const srcDir = path.join(__dirname, 'src', 'components');

function getAllTsxFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && item.name !== '__tests__') {
      files.push(...getAllTsxFiles(fullPath));
    } else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Remove unnecessary React imports (React 17+ JSX Transform)
  if (content.includes("import React") && !content.includes("React.")) {
    content = content.replace(/import React,?\s*{([^}]*)}\s*from\s*['"]react['"];?\n?/g, (match, imports) => {
      if (imports.trim()) {
        return `import {${imports}} from 'react';\n`;
      }
      return '';
    });
    content = content.replace(/import React\s*from\s*['"]react['"];?\n?/g, '');
    changed = true;
  }

  // Remove unused imports (basic patterns)
  const lines = content.split('\n');
  const usedImports = new Set();
  
  // Find all used identifiers
  lines.forEach(line => {
    if (!line.trim().startsWith('import') && !line.trim().startsWith('//')) {
      const matches = line.match(/\b[A-Z][a-zA-Z0-9]*\b/g);
      if (matches) matches.forEach(match => usedImports.add(match));
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

// Process all files
const files = getAllTsxFiles(srcDir);
let fixedCount = 0;

console.log(`📁 Found ${files.length} TypeScript files to check...`);

files.forEach(file => {
  try {
    if (fixFile(file)) {
      fixedCount++;
      console.log(`✅ Fixed: ${path.relative(__dirname, file)}`);
    }
  } catch (error) {
    console.log(`❌ Error fixing ${file}: ${error.message}`);
  }
});

console.log(`\n🎉 COMPLETE! Fixed ${fixedCount} files`);
console.log('💡 Run "npm run lint" to see remaining warnings');
console.log('🚀 ODYSSEY-1 IS READY TO LIBERATE SMALL BUSINESSES!');