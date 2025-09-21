#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Robust Odyssey-1 Lab Environment...');

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
  console.log(`🔧 Starting development server (attempt ${restartCount + 1}/${maxRestarts})...`);
  
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
    console.log('✅ Dev server should be running at http://localhost:8081');
    console.log('🔍 Monitoring for crashes and auto-recovery...');
    restartCount = 0; // Reset counter on successful start
  }, 5000);
}

function handleServerCrash() {
  if (restartCount < maxRestarts) {
    restartCount++;
    console.log(`🔄 Auto-restarting server in ${restartDelay}ms...`);
    setTimeout(startDevServer, restartDelay);
  } else {
    console.error('💥 Max restart attempts reached. Please check for issues.');
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Odyssey-1 Lab...');
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
    await ensureLabBranch();
    await checkDependencies();
    startDevServer();
  } catch (error) {
    console.error('💥 Startup failed:', error);
    process.exit(1);
  }
}

main();