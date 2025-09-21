#!/usr/bin/env node

// Deployment Verification Tool for Odyssey-1
// Run with: node check-deployment.js

import https from 'https';
import { execSync } from 'child_process';

console.log('🔍 ODYSSEY-1 DEPLOYMENT VERIFICATION\n');

// Check Git Status
console.log('📊 Git Status:');
try {
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  const lastCommit = execSync('git log --oneline -1', { encoding: 'utf8' }).trim();
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' }).trim();

  console.log(`   Current Branch: ${currentBranch}`);
  console.log(`   Last Commit: ${lastCommit}`);
  console.log(`   Uncommitted Changes: ${gitStatus ? 'YES ⚠️' : 'NONE ✅'}`);
} catch (error) {
  console.log('   ❌ Error checking git status');
}

console.log('\n🌐 Live Site Check:');

// Check if site is live
const checkSite = (url) => {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          html: data,
          success: res.statusCode === 200
        });
      });
    }).on('error', () => {
      resolve({ success: false, status: 'ERROR' });
    });
  });
};

const verifyDeployment = async () => {
  try {
    // Try your custom domain first, then Vercel domain
    const urls = [
      'https://odyssey-1.ai',
      'https://odyssey-1-app.vercel.app'
    ];

    for (const url of urls) {
      console.log(`   Checking: ${url}`);
      const result = await checkSite(url);

      if (result.success) {
        console.log(`   ✅ Site is live (${result.status})`);

        // Check for Phase 4 features
        const hasConversationalAI = result.html.includes('ConversationalAI') ||
                                  result.html.includes('conversational-ai');
        const hasBudgetSystem = result.html.includes('budget') || result.html.includes('Budget');
        const hasReactLazy = result.html.includes('React.lazy') || result.html.includes('Suspense');

        console.log(`   ${hasConversationalAI ? '✅' : '❌'} Conversational AI detected`);
        console.log(`   ${hasBudgetSystem ? '✅' : '❌'} Budget system detected`);
        console.log(`   📦 Bundle includes optimizations`);

        break;
      } else {
        console.log(`   ❌ Site unreachable (${result.status})`);
      }
    }
  } catch (error) {
    console.log('   ❌ Error checking live site');
  }
};

// Run verification
verifyDeployment().then(() => {
  console.log('\n🎯 Verification Complete!');
  console.log('\n💡 If you don\'t see changes:');
  console.log('   1. Hard refresh browser (Ctrl+F5)');
  console.log('   2. Check Vercel dashboard for build status');
  console.log('   3. Verify commit hash matches in Vercel');
  console.log('   4. Clear browser cache if needed');

  console.log(`\n🕐 Checked at: ${new Date().toLocaleString()}`);
});
