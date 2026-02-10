/**
 * SCHUMANN RESONANCE CPU MONITOR
 * Watches Resource Governor @ 70% limit while Rickey is at work
 * Sends Discord alert if violated
 * 
 * Runs every 127.7ms (7.83 Hz Schumann resonance cycle)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import os from 'os';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MEMORY_LIMIT = 0.70; // 70% constitutional limit
const SCHUMANN_CYCLE_MS = 127.7; // 7.83 Hz resonance
const GRACE_PERIOD_MS = 5000; // 5 seconds before alert
const DISCORD_WEBHOOK = process.env.DISCORD_ALERT_WEBHOOK; // Optional

let violations = [];
let lastAlertTime = null;
let monitoringStarted = new Date();

console.log('═══════════════════════════════════════════════════════════════════');
console.log('🛡️ SCHUMANN RESONANCE CPU MONITOR ACTIVATED');
console.log('═══════════════════════════════════════════════════════════════════');
console.log('');
console.log('⏰ Monitoring Frequency: 7.83 Hz (127.7ms cycles)');
console.log('🛡️ Memory Limit: 70% (Constitutional Guard)');
console.log('⏱️  Grace Period: 5 seconds (brief spikes allowed)');
console.log('📊 Started:', monitoringStarted.toLocaleString());
console.log('');
console.log('Watching while Rickey is at work...');
console.log('Press Ctrl+C to stop monitoring');
console.log('');

/**
 * Get current system resource usage
 */
function getResourceUsage() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memoryPercent = usedMem / totalMem;
  
  const cpus = os.cpus();
  const avgLoad = os.loadavg()[0]; // 1-minute average
  const cpuCount = cpus.length;
  const cpuPercent = avgLoad / cpuCount;
  
  return {
    memory: {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      percent: memoryPercent
    },
    cpu: {
      count: cpuCount,
      load: avgLoad,
      percent: cpuPercent
    },
    timestamp: new Date()
  };
}

/**
 * Check if we're in violation of the 70% limit
 */
function checkViolation(usage) {
  if (usage.memory.percent > MEMORY_LIMIT) {
    violations.push({
      timestamp: usage.timestamp,
      memoryPercent: usage.memory.percent,
      cpuPercent: usage.cpu.percent,
      duration: 0
    });
    
    // Calculate sustained violation duration
    if (violations.length > 0) {
      const firstViolation = violations[0];
      const durationMs = usage.timestamp - firstViolation.timestamp;
      
      // If violation sustained beyond grace period, trigger alert
      if (durationMs > GRACE_PERIOD_MS) {
        return {
          violation: true,
          sustained: true,
          durationMs,
          memoryPercent: usage.memory.percent,
          cpuPercent: usage.cpu.percent
        };
      }
      
      return {
        violation: true,
        sustained: false,
        durationMs,
        memoryPercent: usage.memory.percent
      };
    }
  } else {
    // Clear violations if we're back under limit
    if (violations.length > 0) {
      console.log(`   ✅ Memory back under 70% (${(usage.memory.percent * 100).toFixed(1)}%) - violations cleared`);
      violations = [];
    }
  }
  
  return { violation: false };
}

/**
 * Send alert to Discord and log to database
 */
async function triggerAlert(violation) {
  // Throttle alerts to once every 5 minutes
  if (lastAlertTime && (Date.now() - lastAlertTime < 300000)) {
    return;
  }
  
  lastAlertTime = Date.now();
  
  const alertMessage = `
🚨 CONSTITUTIONAL VIOLATION DETECTED 🚨

⚠️ Resource Governor 70% Limit EXCEEDED
Memory Usage: ${(violation.memoryPercent * 100).toFixed(1)}%
CPU Load: ${(violation.cpuPercent * 100).toFixed(1)}%
Duration: ${(violation.durationMs / 1000).toFixed(1)} seconds

This violates the Constitutional Core (Principle 7: Schumann Resonance Limit).
R.O.M.A.N. should auto-throttle within grace period.

Time: ${new Date().toLocaleString()}
Monitoring Since: ${monitoringStarted.toLocaleString()}
  `.trim();
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(alertMessage);
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  
  // Log to database
  try {
    await supabase.from('system_logs').insert({
      source: 'schumann_monitor',
      level: 'error',
      message: `Resource Governor violation: ${(violation.memoryPercent * 100).toFixed(1)}% memory`,
      metadata: {
        memory_percent: violation.memoryPercent,
        cpu_percent: violation.cpuPercent,
        duration_ms: violation.durationMs,
        limit: MEMORY_LIMIT
      }
    });
  } catch (err) {
    console.error('Failed to log violation to database:', err.message);
  }
  
  // Send Discord webhook if configured
  if (DISCORD_WEBHOOK) {
    try {
      await fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `@rickey ${alertMessage}`,
          username: 'Resource Governor',
          avatar_url: 'https://cdn.discordapp.com/icons/shield.png'
        })
      });
    } catch (err) {
      console.error('Failed to send Discord alert:', err.message);
    }
  }
}

/**
 * Main monitoring loop
 */
let cycleCount = 0;
let lastSummaryTime = Date.now();

async function monitorCycle() {
  cycleCount++;
  
  const usage = getResourceUsage();
  const violation = checkViolation(usage);
  
  // Print summary every 10 seconds (78 cycles @ 7.83 Hz)
  if (cycleCount % 78 === 0) {
    const uptime = (Date.now() - lastSummaryTime) / 1000;
    console.log(`[${new Date().toLocaleTimeString()}] Memory: ${(usage.memory.percent * 100).toFixed(1)}% | CPU: ${(usage.cpu.percent * 100).toFixed(1)}% | Cycles: ${cycleCount} | Uptime: ${uptime.toFixed(0)}s`);
    lastSummaryTime = Date.now();
  }
  
  // Handle violations
  if (violation.violation && violation.sustained) {
    await triggerAlert(violation);
  } else if (violation.violation) {
    // Brief spike detected but within grace period
    if (cycleCount % 10 === 0) { // Only log every 10th cycle during spike
      console.log(`   ⚠️  Brief spike detected: ${(violation.memoryPercent * 100).toFixed(1)}% (within ${GRACE_PERIOD_MS}ms grace period)`);
    }
  }
}

// Start monitoring at Schumann resonance frequency
const monitorInterval = setInterval(monitorCycle, SCHUMANN_CYCLE_MS);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🛡️ SCHUMANN MONITOR SHUTTING DOWN');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('Monitoring Duration:', Math.floor((Date.now() - monitoringStarted) / 1000), 'seconds');
  console.log('Total Cycles:', cycleCount);
  console.log('Violations Detected:', violations.length > 0 ? 'YES' : 'NO');
  console.log('');
  clearInterval(monitorInterval);
  process.exit(0);
});

// Keep process alive
process.stdin.resume();
