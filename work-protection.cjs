#!/usr/bin/env node

/**
 * 🛡️ Odyssey-1 Work Protection System
 * Automatic file backup and change tracking
 * Prevents work loss during development cycles
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Try to use chokidar if available, fallback to fs.watch
let chokidar;
try {
    chokidar = require('chokidar');
} catch (error) {
    console.log('📦 chokidar not found, using fallback file watching');
}

class WorkProtectionSystem {
    constructor() {
        this.backupDir = '.lab-backups';
        this.maxBackupsPerFile = 10;
        this.excludePatterns = [
            'node_modules/**',
            'dist/**',
            '.git/**',
            '.lab-backups/**',
            '**/*.log',
            '**/package-lock.json',
            '**/.DS_Store',
            '**/Thumbs.db'
        ];
        this.monitorPatterns = [
            'src/**/*.{ts,tsx,js,jsx}',
            '*.{json,md,yml,yaml}',
            '.vscode/**',
            'supabase/**/*.{ts,js,sql}'
        ];
        this.isActive = false;
        this.fileHashes = new Map();
        this.watchers = [];
        
        this.ensureBackupDirectory();
        this.loadFileHashes();
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        const emoji = {
            'INFO': '🛡️',
            'BACKUP': '💾',
            'RESTORE': '🔄',
            'ERROR': '❌',
            'SUCCESS': '✅',
            'WATCH': '👀'
        }[type] || '🛡️';
        
        console.log(`${emoji} [${timestamp}] ${message}`);
    }

    ensureBackupDirectory() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
            this.log(`Created backup directory: ${this.backupDir}`, 'SUCCESS');
        }
    }

    getFileHash(filePath) {
        try {
            const content = fs.readFileSync(filePath);
            return crypto.createHash('sha256').update(content).digest('hex');
        } catch (error) {
            return null;
        }
    }

    loadFileHashes() {
        const hashFile = path.join(this.backupDir, 'file-hashes.json');
        try {
            if (fs.existsSync(hashFile)) {
                const data = JSON.parse(fs.readFileSync(hashFile, 'utf8'));
                this.fileHashes = new Map(Object.entries(data));
                this.log(`Loaded ${this.fileHashes.size} file hashes from cache`, 'INFO');
            }
        } catch (error) {
            this.log(`Failed to load file hashes: ${error.message}`, 'ERROR');
            this.fileHashes = new Map();
        }
    }

    saveFileHashes() {
        const hashFile = path.join(this.backupDir, 'file-hashes.json');
        try {
            const data = Object.fromEntries(this.fileHashes);
            fs.writeFileSync(hashFile, JSON.stringify(data, null, 2));
        } catch (error) {
            this.log(`Failed to save file hashes: ${error.message}`, 'ERROR');
        }
    }

    createBackup(filePath) {
        try {
            if (!fs.existsSync(filePath)) return;

            const content = fs.readFileSync(filePath, 'utf8');
            const currentHash = this.getFileHash(filePath);
            const previousHash = this.fileHashes.get(filePath);

            // Skip backup if file hasn't changed
            if (currentHash === previousHash) return;

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const relativePath = path.relative(process.cwd(), filePath);
            const backupFileName = `${relativePath.replace(/[/\\]/g, '_')}_${timestamp}.backup`;
            const backupPath = path.join(this.backupDir, backupFileName);

            // Ensure backup subdirectory exists
            const backupSubDir = path.dirname(backupPath);
            if (!fs.existsSync(backupSubDir)) {
                fs.mkdirSync(backupSubDir, { recursive: true });
            }

            // Create backup with metadata
            const backupData = {
                originalPath: filePath,
                timestamp: new Date().toISOString(),
                hash: currentHash,
                size: content.length,
                content: content
            };

            fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
            
            // Update hash cache
            this.fileHashes.set(filePath, currentHash);
            this.saveFileHashes();

            // Clean old backups
            this.cleanOldBackups(relativePath);

            this.log(`Backed up: ${relativePath}`, 'BACKUP');
        } catch (error) {
            this.log(`Failed to backup ${filePath}: ${error.message}`, 'ERROR');
        }
    }

    cleanOldBackups(relativePath) {
        try {
            const backupPrefix = relativePath.replace(/[/\\]/g, '_');
            const backupFiles = fs.readdirSync(this.backupDir)
                .filter(file => file.startsWith(backupPrefix) && file.endsWith('.backup'))
                .map(file => ({
                    name: file,
                    path: path.join(this.backupDir, file),
                    stats: fs.statSync(path.join(this.backupDir, file))
                }))
                .sort((a, b) => b.stats.mtime - a.stats.mtime);

            // Keep only the most recent backups
            const filesToDelete = backupFiles.slice(this.maxBackupsPerFile);
            filesToDelete.forEach(file => {
                fs.unlinkSync(file.path);
            });

            if (filesToDelete.length > 0) {
                this.log(`Cleaned ${filesToDelete.length} old backups for ${relativePath}`, 'INFO');
            }
        } catch (error) {
            this.log(`Failed to clean old backups: ${error.message}`, 'ERROR');
        }
    }

    restoreFile(filePath, backupTimestamp = null) {
        try {
            const relativePath = path.relative(process.cwd(), filePath);
            const backupPrefix = relativePath.replace(/[/\\]/g, '_');
            
            const backupFiles = fs.readdirSync(this.backupDir)
                .filter(file => file.startsWith(backupPrefix) && file.endsWith('.backup'))
                .sort((a, b) => {
                    const aTime = a.match(/(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/)?.[1] || '';
                    const bTime = b.match(/(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/)?.[1] || '';
                    return bTime.localeCompare(aTime);
                });

            let targetBackup;
            if (backupTimestamp) {
                targetBackup = backupFiles.find(file => file.includes(backupTimestamp));
            } else {
                targetBackup = backupFiles[0]; // Most recent
            }

            if (!targetBackup) {
                this.log(`No backup found for ${relativePath}`, 'ERROR');
                return false;
            }

            const backupPath = path.join(this.backupDir, targetBackup);
            const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
            
            // Create restore point of current file
            if (fs.existsSync(filePath)) {
                this.createBackup(filePath);
            }

            // Restore content
            fs.writeFileSync(filePath, backupData.content);
            
            this.log(`Restored: ${relativePath} from ${backupData.timestamp}`, 'RESTORE');
            return true;
        } catch (error) {
            this.log(`Failed to restore ${filePath}: ${error.message}`, 'ERROR');
            return false;
        }
    }

    listBackups(filePath = null) {
        try {
            const backups = fs.readdirSync(this.backupDir)
                .filter(file => file.endsWith('.backup'))
                .map(file => {
                    const backupPath = path.join(this.backupDir, file);
                    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
                    return {
                        file: file,
                        originalPath: backupData.originalPath,
                        timestamp: backupData.timestamp,
                        size: backupData.size,
                        hash: backupData.hash.substring(0, 8)
                    };
                })
                .filter(backup => !filePath || backup.originalPath === filePath)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            console.log('\n📋 Available Backups:');
            console.log('─'.repeat(80));
            backups.forEach(backup => {
                console.log(`${backup.timestamp} | ${backup.originalPath} | ${backup.size} bytes | ${backup.hash}`);
            });
            console.log('─'.repeat(80));
            console.log(`Total: ${backups.length} backups\n`);

            return backups;
        } catch (error) {
            this.log(`Failed to list backups: ${error.message}`, 'ERROR');
            return [];
        }
    }

    startWatching() {
        if (this.isActive) return;

        this.log('🚀 Starting Odyssey-1 Work Protection System...', 'INFO');
        
        // Initial backup of existing files
        this.log('Creating initial backups...', 'INFO');
        this.createInitialBackups();

        if (chokidar) {
            this.startChokidarWatcher();
        } else {
            this.startFallbackWatcher();
        }

        // Graceful shutdown
        process.on('SIGTERM', () => this.stop());
        process.on('SIGINT', () => this.stop());
    }

    createInitialBackups() {
        const filesToBackup = [
            'src/App.tsx',
            'src/main.tsx',
            'package.json',
            'vite.config.ts',
            'tsconfig.json'
        ];

        filesToBackup.forEach(file => {
            if (fs.existsSync(file)) {
                this.createBackup(file);
            }
        });

        // Backup all TypeScript/JavaScript files in src
        if (fs.existsSync('src')) {
            this.backupDirectoryFiles('src', ['.ts', '.tsx', '.js', '.jsx']);
        }
    }

    backupDirectoryFiles(dir, extensions) {
        try {
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory() && !file.startsWith('.')) {
                    this.backupDirectoryFiles(filePath, extensions);
                } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
                    this.createBackup(filePath);
                }
            });
        } catch (error) {
            this.log(`Failed to backup directory ${dir}: ${error.message}`, 'ERROR');
        }
    }

    startChokidarWatcher() {
        this.watcher = chokidar.watch(['src/**/*', '*.{json,md,ts}'], {
            ignored: ['node_modules/**', 'dist/**', '.git/**', '.lab-backups/**'],
            persistent: true,
            ignoreInitial: true
        });

        this.watcher
            .on('change', (filePath) => {
                this.createBackup(filePath);
            })
            .on('add', (filePath) => {
                this.createBackup(filePath);
            })
            .on('ready', () => {
                this.isActive = true;
                this.log('Work Protection System is now active (using chokidar)', 'SUCCESS');
            })
            .on('error', (error) => {
                this.log(`Watcher error: ${error.message}`, 'ERROR');
            });
    }

    startFallbackWatcher() {
        // Simple fallback watcher for critical files
        const filesToWatch = ['src/App.tsx', 'src/main.tsx', 'package.json'];
        
        filesToWatch.forEach(file => {
            if (fs.existsSync(file)) {
                const watcher = fs.watch(file, (eventType) => {
                    if (eventType === 'change') {
                        this.createBackup(file);
                    }
                });
                this.watchers.push(watcher);
            }
        });

        this.isActive = true;
        this.log('Work Protection System is now active (using fallback watcher)', 'SUCCESS');
    }

    stop() {
        if (!this.isActive) return;

        this.log('🛑 Stopping Work Protection System...', 'INFO');
        
        if (this.watcher) {
            this.watcher.close();
        }

        this.watchers.forEach(watcher => watcher.close());
        this.watchers = [];
        
        this.saveFileHashes();
        this.isActive = false;
        
        this.log('Work Protection System stopped', 'SUCCESS');
        process.exit(0);
    }

    // CLI Interface
    handleCommand(command, args) {
        switch (command) {
            case 'start':
                this.startWatching();
                break;
            case 'list':
                this.listBackups(args[0]);
                break;
            case 'restore':
                if (args[0]) {
                    this.restoreFile(args[0], args[1]);
                } else {
                    this.log('Usage: restore <file-path> [timestamp]', 'ERROR');
                }
                break;
            case 'backup':
                if (args[0]) {
                    this.createBackup(args[0]);
                } else {
                    this.log('Usage: backup <file-path>', 'ERROR');
                }
                break;
            default:
                this.showHelp();
        }
    }

    showHelp() {
        console.log(`
🛡️ Odyssey-1 Work Protection System

Usage: node work-protection.js <command> [args]

Commands:
  start                    Start file watching and protection
  list [file-path]         List all backups or backups for specific file
  restore <file> [time]    Restore file from backup
  backup <file-path>       Create immediate backup of file
  help                     Show this help message

Examples:
  node work-protection.js start
  node work-protection.js list src/App.tsx
  node work-protection.js restore src/App.tsx
  node work-protection.js backup package.json
        `);
    }
}

// Handle CLI usage
if (require.main === module) {
    const workProtection = new WorkProtectionSystem();
    const command = process.argv[2] || 'start';
    const args = process.argv.slice(3);
    
    workProtection.handleCommand(command, args);
}

module.exports = WorkProtectionSystem;