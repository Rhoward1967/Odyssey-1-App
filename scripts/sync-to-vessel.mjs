/**
 * 🛰️ SOVEREIGN SYNC: MIGRATING DNA TO THE PHYSICAL VESSEL
 * Purpose: Automates the transfer of Sovereign Seeds and configs to the Maxone drive.
 * Target: F:\Odyssey-Sovereign-Backup\
 * Milestone: 40% Sovereignty Physical Handshake
 */

import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const DRIVE_LETTER = 'F:';
const BACKUP_DIR = path.join(DRIVE_LETTER, 'Odyssey-Sovereign-Backup');
const PROJECT_ROOT = process.cwd();

async function syncVessel() {
    console.log("🛡️ INITIALIZING PHYSICAL VESSEL SYNC...");

    // 1. Verify Drive Presence
    if (!fs.existsSync(DRIVE_LETTER)) {
        console.error(`❌ CRITICAL: Maxone Drive (${DRIVE_LETTER}) not detected. Please connect the vessel.`);
        return;
    }

    // 2. Create Hardened Directory
    if (!fs.existsSync(BACKUP_DIR)) {
        console.log(`📂 Creating Sovereign Vault on Maxone: ${BACKUP_DIR}`);
        try {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        } catch (err) {
            if (err.code === 'EPERM') {
                console.error(`❌ PERMISSION DENIED: Cannot create folder on F: drive.`);
                console.log(`\n🛠️ MANUAL ACTION REQUIRED:`);
                console.log(`   1. Right-click on "This PC" → "Properties" → "Advanced system settings"`);
                console.log(`   2. OR: Manually create folder "F:\\Odyssey-Sovereign-Backup" in Windows Explorer`);
                console.log(`   3. Then re-run this script.\n`);
                return;
            }
            throw err;
        }
    }

    // 3. Locate Latest Seeds
    const files = fs.readdirSync(PROJECT_ROOT);
    const seeds = files.filter(f => f.startsWith('odyssey_sovereign_seed_') && f.endsWith('.json'));

    if (seeds.length === 0) {
        console.warn("⚠️ No Sovereign Seeds found in root. Run 'node scripts/sovereign-export.mjs' first.");
    } else {
        console.log(`🧬 Found ${seeds.length} Sovereign Seeds. Syncing...`);
        seeds.forEach(seed => {
            const src = path.join(PROJECT_ROOT, seed);
            const dest = path.join(BACKUP_DIR, seed);
            fs.copyFileSync(src, dest);
            console.log(`   ✅ Synced: ${seed} -> Vessel`);
        });
    }

    // 4. Sync Critical Configs (The "Instructions")
    const configs = ['docker-compose.yml', '.env.example', 'package.json'];
    console.log("⚙️ Syncing System Blueprints...");
    configs.forEach(file => {
        if (fs.existsSync(path.join(PROJECT_ROOT, file))) {
            fs.copyFileSync(path.join(PROJECT_ROOT, file), path.join(BACKUP_DIR, file));
            console.log(`   ✅ Synced: ${file} -> Vessel`);
        }
    });

    console.log("\n🏁 VESSEL SYNC COMPLETE.");
    console.log(`📍 Location: ${BACKUP_DIR}`);
    console.log("🛡️ Status: 40% Sovereignty physically secured on Maxone Drive.");
    
    // Write log file for verification
    const logPath = path.join(PROJECT_ROOT, 'vessel-sync.log');
    const logData = `Vessel Sync Completed: ${new Date().toISOString()}\nLocation: ${BACKUP_DIR}\nSeeds: ${seeds.length}\n`;
    fs.writeFileSync(logPath, logData);
    console.log(`📝 Log written to: vessel-sync.log`);
}

syncVessel().catch(err => {
    console.error("❌ SYNC FAILED:", err.message);
    const logPath = path.join(PROJECT_ROOT, 'vessel-sync-error.log');
    fs.writeFileSync(logPath, `Error: ${err.stack}\n${new Date().toISOString()}`);
});
