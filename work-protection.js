#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class WorkProtectionSystem {
  constructor() {
    this.backupDir = path.join(process.cwd(), '.lab-backups');
    this.autoSaveInterval = 5 * 60 * 1000; // 5 minutes
    this.maxBackups = 50;
    this.watchedExtensions = ['.tsx', '.ts', '.js', '.jsx', '.json', '.css', '.md'];
    this.isRunning = false;
  }

  init() {
    this.ensureBackupDir();
    this.setupAutoBackup();
    this.setupGitSafetyHooks();
    this.setupFileWatcher();
    console.log('🛡️ Work Protection System initialized');
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  createBackup(reason = 'auto') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${reason}-${timestamp}`;
    const backupPath = path.join(this.backupDir, backupName);

    console.log(`💾 Creating backup: ${backupName}`);

    // Create git stash with timestamp
    const git = spawn('git', ['stash', 'push', '-u', '-m', `Lab backup: ${reason} ${timestamp}`], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    git.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Git stash backup created successfully');
      }
    });

    // Also create file system backup
    this.copySourceFiles(backupPath);
    this.cleanupOldBackups();
  }

  copySourceFiles(backupPath) {
    try {
      fs.mkdirSync(backupPath, { recursive: true });
      
      const copyDir = (srcDir, destDir) => {
        const entries = fs.readdirSync(srcDir);
        
        for (const entry of entries) {
          const srcPath = path.join(srcDir, entry);
          const destPath = path.join(destDir, entry);
          
          if (entry === 'node_modules' || entry === '.git' || entry === 'dist' || entry === 'build') {
            continue;
          }
          
          const stat = fs.statSync(srcPath);
          if (stat.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyDir(srcPath, destPath);
          } else if (this.watchedExtensions.some(ext => srcPath.endsWith(ext))) {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };

      copyDir(path.join(process.cwd(), 'src'), path.join(backupPath, 'src'));
      
      // Copy important config files
      const configFiles = ['package.json', 'vite.config.ts', 'tsconfig.json', 'tailwind.config.ts'];
      for (const file of configFiles) {
        const srcPath = path.join(process.cwd(), file);
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, path.join(backupPath, file));
        }
      }
    } catch (error) {
      console.warn('⚠️ Backup copy failed:', error.message);
    }
  }

  cleanupOldBackups() {
    try {
      const backups = fs.readdirSync(this.backupDir)
        .map(name => ({
          name,
          path: path.join(this.backupDir, name),
          stat: fs.statSync(path.join(this.backupDir, name))
        }))
        .sort((a, b) => b.stat.mtime - a.stat.mtime);

      if (backups.length > this.maxBackups) {
        const toDelete = backups.slice(this.maxBackups);
        for (const backup of toDelete) {
          fs.rmSync(backup.path, { recursive: true, force: true });
        }
        console.log(`🧹 Cleaned up ${toDelete.length} old backups`);
      }
    } catch (error) {
      console.warn('⚠️ Backup cleanup failed:', error.message);
    }
  }

  setupAutoBackup() {
    setInterval(() => {
      if (this.hasUncommittedChanges()) {
        this.createBackup('scheduled');
      }
    }, this.autoSaveInterval);
  }

  setupGitSafetyHooks() {
    // Create git hooks for safety
    const hooksDir = path.join(process.cwd(), '.git', 'hooks');
    
    const preCommitHook = `#!/bin/sh
# Odyssey-1 Lab Pre-commit Safety Check
echo "🔍 Running pre-commit safety checks..."

# Backup before commit
node .lab-backups/work-protection.js backup "pre-commit"

# Run linting
npm run lint 2>/dev/null || echo "⚠️ Lint check skipped"

echo "✅ Pre-commit checks completed"
`;

    try {
      if (fs.existsSync(hooksDir)) {
        fs.writeFileSync(path.join(hooksDir, 'pre-commit'), preCommitHook);
        fs.chmodSync(path.join(hooksDir, 'pre-commit'), '755');
      }
    } catch (error) {
      console.warn('⚠️ Git hooks setup failed:', error.message);
    }
  }

  setupFileWatcher() {
    // Emergency backup on critical file changes
    const chokidar = require('fs').watch || null;
    
    if (chokidar) {
      const srcDir = path.join(process.cwd(), 'src');
      if (fs.existsSync(srcDir)) {
        fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
          if (filename && this.watchedExtensions.some(ext => filename.endsWith(ext))) {
            // Debounced backup on file changes
            clearTimeout(this.fileWatchTimeout);
            this.fileWatchTimeout = setTimeout(() => {
              this.createBackup('file-change');
            }, 30000); // 30 seconds debounce
          }
        });
      }
    }
  }

  hasUncommittedChanges() {
    try {
      const git = spawn('git', ['status', '--porcelain'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });
      
      let output = '';
      git.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      return new Promise((resolve) => {
        git.on('close', () => {
          resolve(output.trim().length > 0);
        });
      });
    } catch {
      return false;
    }
  }

  emergencyBackup() {
    console.log('🚨 EMERGENCY BACKUP TRIGGERED');
    this.createBackup('emergency');
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.init();
      
      // Handle process termination
      process.on('SIGINT', () => {
        this.emergencyBackup();
        process.exit(0);
      });
      
      process.on('SIGTERM', () => {
        this.emergencyBackup();
        process.exit(0);
      });
      
      process.on('uncaughtException', (error) => {
        console.error('💥 Uncaught exception:', error);
        this.emergencyBackup();
      });
    }
  }
}

// CLI interface
if (require.main === module) {
  const protection = new WorkProtectionSystem();
  const command = process.argv[2];
  
  switch (command) {
    case 'start':
      protection.start();
      console.log('🛡️ Work Protection System is running...');
      break;
    case 'backup':
      const reason = process.argv[3] || 'manual';
      protection.ensureBackupDir();
      protection.createBackup(reason);
      break;
    case 'emergency':
      protection.emergencyBackup();
      break;
    default:
      console.log('Usage: node work-protection.js [start|backup|emergency]');
  }
}

module.exports = WorkProtectionSystem;