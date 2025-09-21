const fs = require('fs');
const path = require('path');

class DevUtilities {
  constructor() {
    this.logFile = path.join(process.cwd(), '.lab-logs', 'dev-session.log');
    this.metricsFile = path.join(process.cwd(), '.lab-logs', 'metrics.json');
    this.ensureLogDir();
  }

  ensureLogDir() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      session: this.getSessionId()
    };
    
    // Console output with emoji
    const emoji = {
      'info': 'ℹ️',
      'warn': '⚠️',
      'error': '❌',
      'success': '✅',
      'debug': '🐛'
    };
    
    console.log(`${emoji[level] || '📝'} [${timestamp}] ${message}`);
    
    // File logging
    fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');
  }

  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = `lab-${Date.now()}`;
    }
    return this.sessionId;
  }

  trackMetric(name, value, unit = 'count') {
    const metrics = this.loadMetrics();
    const timestamp = new Date().toISOString();
    
    if (!metrics[name]) {
      metrics[name] = [];
    }
    
    metrics[name].push({
      value,
      unit,
      timestamp,
      session: this.getSessionId()
    });
    
    // Keep only last 100 entries per metric
    if (metrics[name].length > 100) {
      metrics[name] = metrics[name].slice(-100);
    }
    
    fs.writeFileSync(this.metricsFile, JSON.stringify(metrics, null, 2));
  }

  loadMetrics() {
    try {
      if (fs.existsSync(this.metricsFile)) {
        return JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
      }
    } catch (error) {
      this.log('warn', 'Failed to load metrics file', error.message);
    }
    return {};
  }

  generateReport() {
    const metrics = this.loadMetrics();
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {},
      metrics: {}
    };
    
    // Calculate summaries
    Object.keys(metrics).forEach(metricName => {
      const values = metrics[metricName];
      if (values.length > 0) {
        const numericValues = values.map(v => v.value).filter(v => typeof v === 'number');
        
        report.metrics[metricName] = {
          count: values.length,
          latest: values[values.length - 1],
          average: numericValues.length > 0 ? 
            numericValues.reduce((a, b) => a + b, 0) / numericValues.length : null
        };
      }
    });
    
    const reportPath = path.join(process.cwd(), '.lab-logs', `report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log('success', `Development report generated: ${reportPath}`);
    return report;
  }

  cleanup() {
    // Clean old log files (keep last 10)
    try {
      const logDir = path.dirname(this.logFile);
      const files = fs.readdirSync(logDir)
        .filter(f => f.startsWith('dev-session') || f.startsWith('report-'))
        .map(f => ({
          name: f,
          path: path.join(logDir, f),
          stat: fs.statSync(path.join(logDir, f))
        }))
        .sort((a, b) => b.stat.mtime - a.stat.mtime);
      
      if (files.length > 10) {
        const toDelete = files.slice(10);
        toDelete.forEach(file => {
          fs.unlinkSync(file.path);
        });
        this.log('info', `Cleaned up ${toDelete.length} old log files`);
      }
    } catch (error) {
      this.log('warn', 'Log cleanup failed', error.message);
    }
  }

  // Development shortcuts
  quickCommit(message) {
    const { spawn } = require('child_process');
    
    this.log('info', 'Quick committing changes...', message);
    
    const git = spawn('git', ['add', '.'], { cwd: process.cwd() });
    git.on('close', () => {
      const commit = spawn('git', ['commit', '-m', message || 'Quick lab commit'], { 
        cwd: process.cwd() 
      });
      commit.on('close', (code) => {
        if (code === 0) {
          this.log('success', 'Quick commit completed');
        } else {
          this.log('warn', 'Quick commit failed or no changes to commit');
        }
      });
    });
  }

  componentStats() {
    const srcDir = path.join(process.cwd(), 'src');
    const stats = {
      totalFiles: 0,
      components: 0,
      pages: 0,
      hooks: 0,
      utilities: 0,
      lines: 0
    };
    
    const countFiles = (dir, subpath = '') => {
      try {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const relativePath = path.join(subpath, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            countFiles(filePath, relativePath);
          } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            stats.totalFiles++;
            
            // Count lines
            const content = fs.readFileSync(filePath, 'utf8');
            stats.lines += content.split('\n').length;
            
            // Categorize
            if (relativePath.includes('components')) {
              stats.components++;
            } else if (relativePath.includes('pages')) {
              stats.pages++;
            } else if (relativePath.includes('hooks')) {
              stats.hooks++;
            } else {
              stats.utilities++;
            }
          }
        });
      } catch (error) {
        this.log('warn', 'Failed to read directory', error.message);
      }
    };
    
    if (fs.existsSync(srcDir)) {
      countFiles(srcDir);
    }
    
    this.log('info', 'Component statistics', stats);
    this.trackMetric('totalFiles', stats.totalFiles);
    this.trackMetric('totalLines', stats.lines);
    
    return stats;
  }
}

// CLI interface
if (require.main === module) {
  const utils = new DevUtilities();
  const command = process.argv[2];
  
  switch (command) {
    case 'log':
      const level = process.argv[3] || 'info';
      const message = process.argv.slice(4).join(' ') || 'Manual log entry';
      utils.log(level, message);
      break;
    case 'report':
      utils.generateReport();
      break;
    case 'stats':
      utils.componentStats();
      break;
    case 'commit':
      const commitMsg = process.argv.slice(3).join(' ');
      utils.quickCommit(commitMsg);
      break;
    case 'cleanup':
      utils.cleanup();
      break;
    default:
      console.log('🛠️ Dev Utilities Commands:');
      console.log('  node dev-utils.cjs log [level] [message]');
      console.log('  node dev-utils.cjs report');
      console.log('  node dev-utils.cjs stats');
      console.log('  node dev-utils.cjs commit [message]');
      console.log('  node dev-utils.cjs cleanup');
  }
}

module.exports = DevUtilities;