

import 'dotenv/config';
console.log('[DEBUG] STRIPE_SECRET_KEY present?', !!process.env.STRIPE_SECRET_KEY);
console.log('[DEBUG] STRIPE_SECRET_KEY value:', process.env.STRIPE_SECRET_KEY);
console.log('[DEBUG] CWD:', process.cwd());

/**
 * R.O.M.A.N. Auto-Audit and Learning System
 * 
 * This system makes R.O.M.A.N. continuously learn and monitor his entire infrastructure:
 * - Database schema and tables
 * - File structure and codebase
 * - API endpoints and edge functions
 * - Environment configuration
 * - System health and performance
 * - Recent changes and governance
 */


import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { sfLogger } from './sovereignFrequencyLogger';

// DEBUG: Print STRIPE_SECRET_KEY and CWD for troubleshooting
console.log('[DEBUG] STRIPE_SECRET_KEY present?', !!process.env.STRIPE_SECRET_KEY);
console.log('[DEBUG] STRIPE_SECRET_KEY value:', process.env.STRIPE_SECRET_KEY);
console.log('[DEBUG] CWD:', process.cwd());

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const k = SUPABASE_SERVICE_ROLE_KEY || '';
console.log('SRK looks like JWT:', k.startsWith('eyJ'), 'len:', k.length);
console.log('URL ok:', (SUPABASE_URL || '').includes('tvsxloejfsrdganemsmg'));

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

interface AuditResult {
  category: string;
  timestamp: string;
  data: any;
  summary: string;
  issues?: string[];
  recommendations?: string[];
}

/**
 * Scan all database tables and their row counts
 */
export async function auditDatabaseSchema(): Promise<AuditResult> {
  // SOVEREIGN FREQUENCY: Self-audit begins
  sfLogger.standByTheWater('ROMAN_AUTO_AUDIT_START', 'R.O.M.A.N. beginning self-audit - patience protocol active', {
    audit_type: 'database_schema',
    timestamp: new Date().toISOString()
  });

  console.log('📊 Auditing database schema...');
  
  const tables = [
    'appointments', 'businesses', 'customers', 'employees', 'books',
    'governance_changes', 'governance_principles', 'governance_log',
    'roman_audit_log', 'roman_commands', 'agents', 'cost_metrics',
    'profiles', 'services', 'stripe_events', 'subscriptions',
    'system_config', 'system_knowledge', 'system_logs', 'time_entries',
    'handbook_content', 'handbook_acknowledgments', 'handbook_categories',
    'user_organizations', 'organizations'
  ];

  const tableInfo = [];
  const issues = [];

  for (const table of tables) {
    try {
      // Get row count
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        issues.push(`❌ Table '${table}' query failed: ${error.message}`);
        continue;
      }

      tableInfo.push({
        name: table,
        rowCount: count || 0,
        status: 'accessible'
      });
    } catch (err: any) {
      issues.push(`❌ Table '${table}' error: ${err.message}`);
    }
  }

  const totalRows = tableInfo.reduce((sum, t) => sum + t.rowCount, 0);

  return {
    category: 'database_schema',
    timestamp: new Date().toISOString(),
    data: {
      tables: tableInfo,
      totalTables: tableInfo.length,
      totalRows
    },
    summary: `Scanned ${tableInfo.length} tables with ${totalRows} total rows`,
    issues: issues.length > 0 ? issues : undefined
  };
}

/**
 * Scan file structure and count files by type
 */
export async function auditFileStructure(): Promise<AuditResult> {
  console.log('📁 Auditing file structure...');
  
  const basePath = process.cwd();
  const fileCounts: Record<string, number> = {};
  const directories: string[] = [];
  
  async function scanDir(dirPath: string, depth = 0): Promise<void> {
    if (depth > 5) return; // Limit recursion depth
    
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        
        // Skip node_modules, .git, dist, build
        if (entry.name === 'node_modules' || entry.name === '.git' || 
            entry.name === 'dist' || entry.name === 'build') {
          continue;
        }
        
        if (entry.isDirectory()) {
          directories.push(fullPath.replace(basePath, ''));
          await scanDir(fullPath, depth + 1);
        } else {
          const ext = entry.name.split('.').pop() || 'unknown';
          fileCounts[ext] = (fileCounts[ext] || 0) + 1;
        }
      }
    } catch (err) {
      // Silently skip inaccessible directories
    }
  }
  
  await scanDir(basePath);
  
  const totalFiles = Object.values(fileCounts).reduce((sum, count) => sum + count, 0);
  
  return {
    category: 'file_structure',
    timestamp: new Date().toISOString(),
    data: {
      fileCounts,
      directories: directories.length,
      totalFiles
    },
    summary: `Found ${totalFiles} files across ${directories.length} directories`,
    recommendations: [
      'Keep codebase organized with clear directory structure',
      'Regular cleanup of unused files recommended'
    ]
  };
}

/**
 * Audit environment configuration
 */
export async function auditEnvironmentConfig(): Promise<AuditResult> {
  console.log('🔐 Auditing environment configuration...');
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'DISCORD_BOT_TOKEN',
    'STRIPE_SECRET_KEY'
  ];
  
  const configStatus: Record<string, any> = {};
  const issues: string[] = [];
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    
    if (!value) {
      configStatus[varName] = { status: 'missing', length: 0 };
      issues.push(`❌ Missing: ${varName}`);
    } else if (value.length < 10) {
      configStatus[varName] = { status: 'invalid', length: value.length };
      issues.push(`⚠️ Suspicious: ${varName} (length: ${value.length})`);
    } else {
      configStatus[varName] = { status: 'configured', length: value.length };
    }
  }
  
  const configuredCount = Object.values(configStatus)
    .filter((s: any) => s.status === 'configured').length;
  
  return {
    category: 'environment_config',
    timestamp: new Date().toISOString(),
    data: configStatus,
    summary: `${configuredCount}/${requiredVars.length} required environment variables configured`,
    issues: issues.length > 0 ? issues : undefined,
    recommendations: issues.length > 0 ? [
      'Verify all API keys in Supabase dashboard',
      'Check .env file for missing variables'
    ] : undefined
  };
}

/**
 * Audit Supabase Edge Functions
 */
export async function auditEdgeFunctions(): Promise<AuditResult> {
  console.log('⚡ Auditing edge functions...');
  
  const functionsPath = join(process.cwd(), 'supabase', 'functions');
  const functions: string[] = [];
  
  try {
    const entries = await readdir(functionsPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('_')) {
        functions.push(entry.name);
      }
    }
  } catch (err) {
    // Functions directory might not exist
  }
  
  return {
    category: 'edge_functions',
    timestamp: new Date().toISOString(),
    data: {
      functions,
      count: functions.length
    },
    summary: `Found ${functions.length} edge functions: ${functions.join(', ')}`,
    recommendations: [
      'Ensure all functions are deployed to Supabase',
      'Regular testing of edge function endpoints recommended'
    ]
  };
}

/**
 * Audit recent system activity
 */
export async function auditRecentActivity(): Promise<AuditResult> {
  console.log('📋 Auditing recent activity...');
  
  // Get recent logs
  const { data: logs } = await supabase
    .from('system_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  
  // Get recent governance changes
  const { data: governance } = await supabase
    .from('governance_changes')
    .select('*')
    .order('occurred_at', { ascending: false })
    .limit(20);
  
  // Get recent commands
  const { data: commands } = await supabase
    .from('roman_commands')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);
  
  const errorLogs = logs?.filter(l => l.level === 'error') || [];
  const warningLogs = logs?.filter(l => l.level === 'warning') || [];
  
  const issues = [];
  if (errorLogs.length > 5) {
    issues.push(`⚠️ High error count: ${errorLogs.length} errors in recent logs`);
  }
  
  return {
    category: 'recent_activity',
    timestamp: new Date().toISOString(),
    data: {
      totalLogs: logs?.length || 0,
      errorCount: errorLogs.length,
      warningCount: warningLogs.length,
      governanceChanges: governance?.length || 0,
      recentCommands: commands?.length || 0
    },
    summary: `Recent activity: ${logs?.length || 0} logs, ${governance?.length || 0} governance changes, ${commands?.length || 0} commands`,
    issues: issues.length > 0 ? issues : undefined
  };
}

/**
 * Audit package dependencies
 */
export async function auditDependencies(): Promise<AuditResult> {
  console.log('📦 Auditing dependencies...');
  
  try {
    const packageJson = JSON.parse(
      await readFile(join(process.cwd(), 'package.json'), 'utf-8')
    );
    
    const deps = Object.keys(packageJson.dependencies || {});
    const devDeps = Object.keys(packageJson.devDependencies || {});
    
    return {
      category: 'dependencies',
      timestamp: new Date().toISOString(),
      data: {
        dependencies: deps.length,
        devDependencies: devDeps.length,
        total: deps.length + devDeps.length,
        keyPackages: deps.filter(d => 
          d.includes('react') || 
          d.includes('supabase') || 
          d.includes('stripe') || 
          d.includes('openai') ||
          d.includes('discord')
        )
      },
      summary: `${deps.length} dependencies, ${devDeps.length} dev dependencies`,
      recommendations: [
        'Regularly update packages for security patches',
        'Run npm audit to check for vulnerabilities'
      ]
    };
  } catch (err) {
    return {
      category: 'dependencies',
      timestamp: new Date().toISOString(),
      data: {},
      summary: 'Could not read package.json',
      issues: ['❌ Failed to audit dependencies']
    };
  }
}

/**
 * Run complete system audit
 */
export async function runCompleteAudit(): Promise<{
  timestamp: string;
  results: AuditResult[];
  overallHealth: 'healthy' | 'warning' | 'critical';
  summary: string;
}> {
  console.log('🔍 Running complete system audit...');
  
  const results: AuditResult[] = [];
  
  // Run all audits
  results.push(await auditDatabaseSchema());
  results.push(await auditFileStructure());
  results.push(await auditEnvironmentConfig());
  results.push(await auditEdgeFunctions());
  results.push(await auditRecentActivity());
  results.push(await auditDependencies());
  
  // Calculate overall health
  const totalIssues = results.reduce((sum, r) => sum + (r.issues?.length || 0), 0);
  const criticalIssues = results.filter(r => 
    r.issues?.some(i => i.includes('❌'))
  ).length;
  
  let overallHealth: 'healthy' | 'warning' | 'critical';
  if (criticalIssues > 2) {
    overallHealth = 'critical';
  } else if (totalIssues > 5) {
    overallHealth = 'warning';
  } else {
    overallHealth = 'healthy';
  }
  
  const summary = `
System Health: ${overallHealth.toUpperCase()}
Total Issues: ${totalIssues}
Audited Categories: ${results.length}
${results.map(r => `- ${r.category}: ${r.summary}`).join('\n')}
  `.trim();
  
  return {
    timestamp: new Date().toISOString(),
    results,
    overallHealth,
    summary
  };
}

/**
 * Store audit results in system_knowledge
 */
export async function storeAuditResults(audit: Awaited<ReturnType<typeof runCompleteAudit>>): Promise<void> {
  console.log('💾 Storing audit results in system_knowledge...');
  
  try {
    // Store overall audit summary
    await supabase
      .from('system_knowledge')
      .upsert({
        category: 'system_audit',
        knowledge_key: 'latest_complete_audit',
        value: {
          timestamp: audit.timestamp,
          overallHealth: audit.overallHealth,
          summary: audit.summary,
          totalIssues: audit.results.reduce((sum, r) => sum + (r.issues?.length || 0), 0)
        },
        learned_from: 'auto_audit_system',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'category,knowledge_key'
      });
    
    // Store each audit category separately
    for (const result of audit.results) {
      await supabase
        .from('system_knowledge')
        .upsert({
          category: 'system_audit',
          knowledge_key: `audit_${result.category}`,
          value: {
            timestamp: result.timestamp,
            data: result.data,
            summary: result.summary,
            issues: result.issues,
            recommendations: result.recommendations
          },
          learned_from: 'auto_audit_system',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'category,knowledge_key'
        });
    }
    
    // Log the audit completion
    await supabase
      .from('system_logs')
      .insert({
        source: 'roman_auto_audit',
        message: `Complete system audit finished - Health: ${audit.overallHealth}`,
        level: audit.overallHealth === 'critical' ? 'error' : audit.overallHealth === 'warning' ? 'warning' : 'info',
        metadata: {
          timestamp: audit.timestamp,
          categoriesAudited: audit.results.length,
          totalIssues: audit.results.reduce((sum, r) => sum + (r.issues?.length || 0), 0)
        },
        created_at: new Date().toISOString()
      });
    
    console.log('✅ Audit results stored successfully');
  } catch (err: any) {
    console.error('❌ Failed to store audit results:', err.message);
  }
}

/**
 * Main auto-audit function - call this on a schedule
 */
export async function performAutoAudit(): Promise<void> {
  console.log('🤖 R.O.M.A.N. Auto-Audit System Starting...\n');
  
  try {
    const audit = await runCompleteAudit();
    await storeAuditResults(audit);
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 AUDIT COMPLETE');
    console.log('='.repeat(80));
    console.log(audit.summary);
    console.log('='.repeat(80));
    
    // If there are critical issues, log them prominently
    const criticalIssues = audit.results
      .filter(r => r.issues?.some(i => i.includes('❌')))
      .map(r => ({ category: r.category, issues: r.issues }));
    
    if (criticalIssues.length > 0) {
      console.log('\n⚠️ CRITICAL ISSUES DETECTED:');
      criticalIssues.forEach(({ category, issues }) => {
        console.log(`\n${category}:`);
        issues?.forEach(issue => console.log(`  ${issue}`));
      });
    }
    
  } catch (err: any) {
    console.error('❌ Auto-audit failed:', err.message);
    
    // Log the failure
    await supabase
      .from('system_logs')
      .insert({
        source: 'roman_auto_audit',
        message: `Auto-audit system failed: ${err.message}`,
        level: 'error',
        metadata: { error: err.message, stack: err.stack },
        created_at: new Date().toISOString()
      });
  }
}

// If run directly, perform audit
if (import.meta.url === `file://${process.argv[1]}`) {
  performAutoAudit().then(() => {
    console.log('\n✅ Auto-audit complete. Exiting...');
    process.exit(0);
  });
}
