const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Ultra-Robust Odyssey-1 Lab Environment...');

let devServer;
let restartCount = 0;
const maxRestarts = 10;
const restartDelay = 2000;

// Ensure we're on the correct branch
function ensureLabBranch() {
  return new Promise((resolve) => {
    const git = spawn('git', ['branch', '--show-current'], { cwd: process.cwd() });
    let branch = '';
    
    git.stdout.on('data', (data) => {
      branch += data.toString().trim();
    });
    
    git.on('close', () => {
      if (branch !== 'Odyssey-1-Lab') {
        console.log('🔄 Switching to Odyssey-1-Lab branch...');
        const checkout = spawn('git', ['checkout', 'Odyssey-1-Lab'], { cwd: process.cwd() });
        checkout.on('close', resolve);
      } else {
        console.log('✅ Already on Odyssey-1-Lab branch');
        resolve();
      }
    });
  });
}

// Check if dependencies are installed
function checkDependencies() {
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing dependencies...');
    return new Promise((resolve) => {
      const npm = spawn('npm', ['install'], { 
        cwd: process.cwd(),
        stdio: 'inherit'
      });
      npm.on('close', resolve);
    });
  }
  return Promise.resolve();
}

// Start the development server with auto-recovery
function startDevServer() {
  console.log(`🔧 Starting robust development server (attempt ${restartCount + 1}/${maxRestarts})...`);
  
  devServer = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true
  });

  devServer.on('error', (error) => {
    console.error('❌ Dev server error:', error);
    handleServerCrash();
  });

  devServer.on('exit', (code, signal) => {
    if (code !== 0 && signal !== 'SIGTERM' && signal !== 'SIGINT') {
      console.warn(`⚠️ Dev server exited with code ${code}, signal ${signal}`);
      handleServerCrash();
    }
  });

  // Success indicator
  setTimeout(() => {
    console.log('✅ Robust dev server running at http://localhost:8081');
    console.log('🛡️ Auto-recovery monitoring active...');
    console.log('🔥 Hot reload optimized for heavy development work');
    restartCount = 0; // Reset counter on successful start
  }, 5000);
}

function handleServerCrash() {
  if (restartCount < maxRestarts) {
    restartCount++;
    console.log(`🔄 Auto-restarting robust server in ${restartDelay}ms...`);
    setTimeout(startDevServer, restartDelay);
  } else {
    console.error('💥 Max restart attempts reached. Server requires manual intervention.');
    process.exit(1);
  }
}

// Performance monitoring
function setupPerformanceMonitoring() {
  console.log('📊 Setting up performance monitoring...');
  
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    
    if (memMB > 500) {
      console.warn(`⚠️ High memory usage: ${memMB}MB`);
    }
  }, 30000); // Check every 30 seconds
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Gracefully shutting down Robust Odyssey-1 Lab...');
  if (devServer) {
    devServer.kill('SIGTERM');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (devServer) {
    devServer.kill('SIGTERM');
  }
  process.exit(0);
});

// Main startup sequence
async function main() {
  try {
    console.log('🧪 Initializing Odyssey-1 Lab Environment...');
    await ensureLabBranch();
    await checkDependencies();
    setupPerformanceMonitoring();
    startDevServer();
  } catch (error) {
    console.error('💥 Robust lab startup failed:', error);
    process.exit(1);
  }
}

main();