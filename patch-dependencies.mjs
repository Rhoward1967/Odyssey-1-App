import { execSync } from 'child_process';

/**
 * ODYSSEY-1 SECURITY REMEDIATION SCRIPT
 * Resolution 2026-05: Dependency Hardening (SAFE VERSION)
 * 
 * CHANGES FROM GEMINI'S VERSION:
 * - Keeps xlsx (moderate risk acceptable - only used for admin uploads in controlled environment)
 * - Uses specific version ranges instead of @latest (prevents breaking changes)
 * - Runs npm audit fix WITHOUT --force first (safer)
 * - Creates git checkpoint before changes
 * - Tests build after patches
 */

console.log('🛡️ Starting SAFE Security Remediation for Odyssey-1...\n');

try {
  // 0. Create git checkpoint
  console.log('📸 Creating git checkpoint...');
  try {
    execSync('git add -A', { stdio: 'inherit' });
    execSync('git commit -m "Pre-dependency-patch checkpoint (Resolution 2026-05)"', { stdio: 'inherit' });
    console.log('✅ Git checkpoint created\n');
  } catch (e) {
    console.log('⚠️ No changes to commit (checkpoint skipped)\n');
  }

  // 1. Update critical vulnerabilities with SPECIFIC versions
  console.log('🔧 Updating vulnerable packages to patched versions...\n');
  
  const patches = [
    { pkg: 'axios', version: '^1.7.9', reason: 'Fixes SSRF vulnerability' },
    { pkg: 'glob', version: '^11.0.0', reason: 'Fixes command injection' },
    { pkg: 'js-yaml', version: '^4.1.0', reason: 'Fixes prototype pollution' },
    { pkg: 'tar', version: '^7.4.3', reason: 'Fixes race condition' }
  ];

  patches.forEach(({ pkg, version, reason }) => {
    console.log(`📦 ${pkg}@${version} - ${reason}`);
    execSync(`npm install ${pkg}@${version}`, { stdio: 'inherit' });
  });

  console.log('\n✅ Direct dependencies patched\n');

  // 2. Try safe audit fix (without --force)
  console.log('🔍 Running safe audit fix for transitive dependencies...');
  try {
    execSync('npm audit fix', { stdio: 'inherit' });
    console.log('✅ Transitive dependencies patched safely\n');
  } catch (e) {
    console.log('⚠️ Some transitive dependencies could not be auto-fixed (requires manual intervention)\n');
  }

  // 3. Verify build still works
  console.log('🏗️ Testing production build...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful\n');

  // 4. Final security audit
  console.log('🔍 Running final security audit...');
  let auditResult;
  try {
    auditResult = execSync('npm audit --json', { encoding: 'utf-8' });
  } catch (e) {
    // npm audit returns non-zero exit code when vulnerabilities exist
    auditResult = e.stdout;
  }
  const auditData = JSON.parse(auditResult);

  const { info, low, moderate, high, critical, total } = auditData.metadata.vulnerabilities;

  console.log('\n================================================================================');
  console.log('                    SECURITY REMEDIATION RESULTS');
  console.log('================================================================================\n');
  console.log(`Total Vulnerabilities: ${total}`);
  console.log(`  Critical: ${critical}`);
  console.log(`  High: ${high}`);
  console.log(`  Moderate: ${moderate}`);
  console.log(`  Low: ${low}`);
  console.log(`  Info: ${info}\n`);

  if (total === 0) {
    console.log('🎉 SUCCESS: System Health restored to A+ Security Status.');
    console.log('✅ All vulnerabilities remediated.\n');
  } else if (high === 0 && critical === 0) {
    console.log('✅ SUCCESS: Critical and High vulnerabilities eliminated.');
    console.log(`⚠️ ${moderate + low} moderate/low vulnerabilities remain (acceptable risk).\n`);
    console.log('NOTE: Remaining vulnerabilities are likely:');
    console.log('  - xlsx (moderate risk, kept for Excel upload functionality)');
    console.log('  - Transitive dev dependencies (no runtime impact)\n');
  } else {
    console.log(`⚠️ WARNING: ${high} high + ${critical} critical vulnerabilities remain.`);
    console.log('Manual intervention required.\n');
  }

  console.log('📋 NEXT STEPS:');
  console.log('  1. Review npm audit output above');
  console.log('  2. Update meeting minutes with results');
  console.log('  3. Git commit: "Resolution 2026-05: Dependency hardening complete"');
  console.log('  4. Deploy to production: vercel --prod\n');

} catch (error) {
  console.error('\n❌ ERROR: Remediation failed.');
  console.error(error.message);
  console.error('\n🔄 ROLLBACK: Run `git reset --hard HEAD~1` to restore previous state.');
  process.exit(1);
}
