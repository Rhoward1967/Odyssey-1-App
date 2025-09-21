const fs = require('fs');
const path = require('path');

// Package.json enhancements for robust development
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add robust development scripts
packageJson.scripts = {
  ...packageJson.scripts,
  "dev:robust": "node robust-lab.cjs",
  "dev:protected": "npm run backup && npm run dev",
  "backup": "node work-protection.cjs backup manual",
  "emergency-backup": "node work-protection.cjs emergency",
  "clean": "rimraf dist build node_modules/.vite",
  "clean:all": "rimraf dist build node_modules",
  "reinstall": "npm run clean:all && npm install",
  "health-check": "npm run build && echo 'Health check completed'",
  "dev:debug": "vite --debug --force",
  "analyze": "vite build --mode analyze",
  "predev": "echo 'Starting development environment...'",
  "postdev": "echo 'Development session ended'"
};

// Write the enhanced package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('📦 Enhanced package.json for robust development');

// Create additional performance optimization files
const performanceConfig = {
  vite: {
    server: {
      warmup: {
        clientFiles: ['./src/**/*.tsx', './src/**/*.ts']
      }
    },
    optimizeDeps: {
      force: true
    }
  },
  development: {
    autoBackup: true,
    crashRecovery: true,
    performanceMonitoring: true
  }
};

fs.writeFileSync(
  path.join(process.cwd(), 'lab-config.json'),
  JSON.stringify(performanceConfig, null, 2)
);

console.log('⚡ Performance configuration created');
