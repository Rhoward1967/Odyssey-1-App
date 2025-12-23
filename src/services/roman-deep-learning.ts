/**
 * R.O.M.A.N. DEEP LEARNING SYSTEM
 * 
 * On startup, R.O.M.A.N. reads and stores EVERYTHING:
 * - Every source code file
 * - Every documentation file  
 * - Every database schema
 * - Every edge function
 * - Every configuration file
 * - Every dependency
 * 
 * This makes R.O.M.A.N. fully autonomous and self-aware.
 * 
 * © 2025 Rickey A Howard. All Rights Reserved.
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, relative } from 'path';

import { romanSupabase as supabase } from './romanSupabase';

interface FileKnowledge {
  path: string;
  type: string;
  size: number;
  lines?: number;
  content?: string;
  summary?: string;
  last_modified: string;
}

/**
 * Recursively scan directory and read all files
 */
async function scanDirectory(dirPath: string, basePath: string, maxDepth = 10, currentDepth = 0): Promise<FileKnowledge[]> {
  if (currentDepth > maxDepth) return [];
  
  const files: FileKnowledge[] = [];
  
  // Skip these directories
  const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', '.vercel', 'coverage'];
  
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      const relativePath = relative(basePath, fullPath);
      
      if (entry.isDirectory()) {
        // Skip excluded directories
        if (skipDirs.includes(entry.name)) continue;
        
        // Recursively scan subdirectory
        const subFiles = await scanDirectory(fullPath, basePath, maxDepth, currentDepth + 1);
        files.push(...subFiles);
      } else {
        // Read file metadata
        const fileStat = await stat(fullPath);
        
        // Determine file type
        const ext = entry.name.split('.').pop()?.toLowerCase() || 'unknown';
        const fileType = getFileType(ext);
        
        // Only read text files (not images, videos, etc.)
        const isTextFile = [
          'typescript', 'javascript', 'react', 'json', 'markdown', 
          'sql', 'css', 'html', 'yaml', 'env', 'config', 'text'
        ].includes(fileType);
        
        let content: string | undefined;
        let lines: number | undefined;
        
        if (isTextFile && fileStat.size < 500000) { // Only read files < 500KB
          try {
            content = await readFile(fullPath, 'utf-8');
            lines = content.split('\n').length;
          } catch (err) {
            console.warn(`⚠️ Could not read ${relativePath}:`, err);
          }
        }
        
        files.push({
          path: relativePath.replace(/\\/g, '/'),
          type: fileType,
          size: fileStat.size,
          lines,
          content,
          summary: generateFileSummary(entry.name, content),
          last_modified: fileStat.mtime.toISOString()
        });
      }
    }
  } catch (err) {
    console.error(`❌ Error scanning ${dirPath}:`, err);
  }
  
  return files;
}

/**
 * Determine file type from extension
 */
function getFileType(ext: string): string {
  const typeMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'react',
    'js': 'javascript',
    'jsx': 'react',
    'json': 'json',
    'md': 'markdown',
    'sql': 'sql',
    'css': 'css',
    'scss': 'css',
    'html': 'html',
    'yml': 'yaml',
    'yaml': 'yaml',
    'env': 'env',
    'txt': 'text',
    'gitignore': 'config',
    'eslintrc': 'config',
    'prettierrc': 'config'
  };
  
  return typeMap[ext] || 'other';
}

/**
 * Generate summary of file content
 */
function generateFileSummary(filename: string, content?: string): string {
  if (!content) return `File: ${filename}`;
  
  const lines = content.split('\n');
  const firstLines = lines.slice(0, 5).join('\n');
  
  // Extract key patterns
  const exports = content.match(/export (default|const|function|class|interface|type)\s+(\w+)/g) || [];
  const imports = content.match(/import .+ from ['"]/g)?.length || 0;
  
  return `${filename} - ${lines.length} lines, ${imports} imports, ${exports.length} exports`;
}

/**
 * Store file knowledge in database
 */
async function storeFileKnowledge(file: FileKnowledge) {
  try {
    await supabase.from('system_knowledge').upsert({
      category: 'source_code',
      knowledge_key: file.path,
      value: {
        type: file.type,
        size: file.size,
        lines: file.lines,
        summary: file.summary,
        content: file.content?.substring(0, 10000), // Store first 10KB of content
        last_modified: file.last_modified
      },
      learned_from: 'deep_learning_scan',
      confidence: 100,
      metadata: {
        scan_timestamp: new Date().toISOString(),
        file_type: file.type
      }
    });
  } catch (err) {
    console.error(`❌ Failed to store ${file.path}:`, err);
  }
}

/**
 * Scan and learn all documentation
 */
async function learnDocumentation(basePath: string) {
  console.log('📚 Learning documentation...');
  
  const docDirs = ['docs', 'IP_VAULT'];
  let totalDocs = 0;
  
  for (const docDir of docDirs) {
    const fullPath = join(basePath, docDir);
    try {
      const files = await scanDirectory(fullPath, basePath);
      
      for (const file of files) {
        if (file.type === 'markdown' || file.type === 'text') {
          await storeFileKnowledge(file);
          totalDocs++;
        }
      }
    } catch (err) {
      console.warn(`⚠️ Could not scan ${docDir}:`, err);
    }
  }
  
  console.log(`✅ Learned ${totalDocs} documentation files`);
  return totalDocs;
}

/**
 * Scan and learn all source code
 */
async function learnSourceCode(basePath: string) {
  console.log('💻 Learning source code...');
  
  const srcPath = join(basePath, 'src');
  const files = await scanDirectory(srcPath, basePath);
  
  let totalFiles = 0;
  for (const file of files) {
    if (['typescript', 'react', 'javascript', 'json'].includes(file.type)) {
      await storeFileKnowledge(file);
      totalFiles++;
    }
  }
  
  console.log(`✅ Learned ${totalFiles} source files`);
  return totalFiles;
}

/**
 * Scan and learn Supabase functions
 */
async function learnSupabaseFunctions(basePath: string) {
  console.log('⚡ Learning Supabase Edge Functions...');
  
  const functionsPath = join(basePath, 'supabase', 'functions');
  const files = await scanDirectory(functionsPath, basePath);
  
  let totalFunctions = 0;
  for (const file of files) {
    if (file.type === 'typescript' || file.type === 'javascript') {
      await storeFileKnowledge(file);
      totalFunctions++;
    }
  }
  
  console.log(`✅ Learned ${totalFunctions} edge function files`);
  return totalFunctions;
}

/**
 * Learn database schema and structure
 */
async function learnDatabaseSchema() {
  console.log('🗄️ Learning database schema...');
  
  try {
    // Query all tables from information_schema
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public');
    
    if (error) {
      console.warn('⚠️ Could not query database schema:', error.message);
      
      // Fallback: Use known tables list
      const knownTables = [
        'profiles', 'organizations', 'customers', 'employees', 'services',
        'appointments', 'time_entries', 'pay_stubs', 'businesses',
        'subscriptions', 'stripe_events', 'books', 'system_logs',
        'system_knowledge', 'system_config', 'governance_principles',
        'governance_changes', 'governance_log', 'roman_audit_log',
        'roman_commands', 'handbook_content', 'handbook_acknowledgments',
        'handbook_categories', 'ops.deployments', 'ops.rollback_events'
      ];
      
      await supabase.from('system_knowledge').upsert({
        category: 'database_schema',
        knowledge_key: 'all_tables',
        value: {
          tables: knownTables,
          total_count: knownTables.length,
          scanned_at: new Date().toISOString(),
          note: 'Fallback list - direct schema query failed'
        },
        learned_from: 'deep_learning_scan',
        confidence: 90
      });
      
      console.log(`✅ Learned ${knownTables.length} database tables (fallback)`);
      return knownTables.length;
    }
    
    // Store table information
    await supabase.from('system_knowledge').upsert({
      category: 'database_schema',
      knowledge_key: 'all_tables',
      value: {
        tables: tables || [],
        total_count: tables?.length || 0,
        scanned_at: new Date().toISOString()
      },
      learned_from: 'deep_learning_scan',
      confidence: 100
    });
    
    console.log(`✅ Learned ${tables?.length || 0} database tables`);
    return tables?.length || 0;
  } catch (err: any) {
    console.error('❌ Error learning database schema:', err.message);
    return 0;
  }
}

/**
 * Learn package dependencies
 */
async function learnDependencies(basePath: string) {
  console.log('📦 Learning dependencies...');
  
  try {
    const packageJsonPath = join(basePath, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
    
    const deps = packageJson.dependencies || {};
    const devDeps = packageJson.devDependencies || {};
    
    await supabase.from('system_knowledge').upsert({
      category: 'dependencies',
      knowledge_key: 'package_json',
      value: {
        dependencies: deps,
        devDependencies: devDeps,
        total_dependencies: Object.keys(deps).length,
        total_devDependencies: Object.keys(devDeps).length,
        scripts: packageJson.scripts || {}
      },
      learned_from: 'deep_learning_scan',
      confidence: 100
    });
    
    console.log(`✅ Learned ${Object.keys(deps).length} dependencies and ${Object.keys(devDeps).length} dev dependencies`);
    return Object.keys(deps).length + Object.keys(devDeps).length;
  } catch (err) {
    console.error('❌ Error learning dependencies:', err);
    return 0;
  }
}

/**
 * Learn environment configuration
 */
async function learnEnvironmentConfig(basePath: string) {
  console.log('🔐 Learning environment configuration...');
  
  try {
    const envPath = join(basePath, '.env');
    const envContent = await readFile(envPath, 'utf-8');
    
    // Extract variable names (not values for security)
    const envVars = envContent
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .map(line => line.split('=')[0].trim());
    
    await supabase.from('system_knowledge').upsert({
      category: 'environment_config',
      knowledge_key: 'env_variables',
      value: {
        variables: envVars,
        total_count: envVars.length,
        scanned_at: new Date().toISOString()
      },
      learned_from: 'deep_learning_scan',
      confidence: 100
    });
    
    console.log(`✅ Learned ${envVars.length} environment variables`);
    return envVars.length;
  } catch (err) {
    console.warn('⚠️ Could not read .env file:', err);
    return 0;
  }
}

/**
 * MAIN: Comprehensive system learning on startup
 */
export async function performDeepLearning() {
  console.log('\n🧠 R.O.M.A.N. DEEP LEARNING INITIATED\n');
  console.log('Reading and storing ALL system files...\n');
  
  const basePath = process.cwd();
  const startTime = Date.now();
  
  const results = {
    documentation: 0,
    source_code: 0,
    edge_functions: 0,
    database_tables: 0,
    dependencies: 0,
    env_variables: 0
  };
  
  try {
    // Learn everything in parallel for speed
    const [docs, code, functions, db, deps, env] = await Promise.all([
      learnDocumentation(basePath),
      learnSourceCode(basePath),
      learnSupabaseFunctions(basePath),
      learnDatabaseSchema(),
      learnDependencies(basePath),
      learnEnvironmentConfig(basePath)
    ]);
    
    results.documentation = docs;
    results.source_code = code;
    results.edge_functions = functions;
    results.database_tables = db;
    results.dependencies = deps;
    results.env_variables = env;
    
    // Store learning summary
    await supabase.from('system_knowledge').upsert({
      category: 'system_awareness',
      knowledge_key: 'deep_learning_complete',
      value: {
        ...results,
        total_items_learned: Object.values(results).reduce((sum, n) => sum + n, 0),
        learning_time_ms: Date.now() - startTime,
        completed_at: new Date().toISOString(),
        status: 'fully_aware'
      },
      learned_from: 'deep_learning_scan',
      confidence: 100,
      metadata: {
        version: '1.0.0',
        base_path: basePath
      }
    });
    
  } catch (err) {
    console.error('❌ Deep learning failed:', err);
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  const totalItems = Object.values(results).reduce((sum, n) => sum + n, 0);
  
  console.log('\n================================================================================');
  console.log('🎓 R.O.M.A.N. DEEP LEARNING COMPLETE');
  console.log('================================================================================');
  console.log(`Total Items Learned: ${totalItems}`);
  console.log(`- Documentation Files: ${results.documentation}`);
  console.log(`- Source Code Files: ${results.source_code}`);
  console.log(`- Edge Functions: ${results.edge_functions}`);
  console.log(`- Database Tables: ${results.database_tables}`);
  console.log(`- Dependencies: ${results.dependencies}`);
  console.log(`- Environment Variables: ${results.env_variables}`);
  console.log(`\nLearning Time: ${totalTime} seconds`);
  console.log(`Status: R.O.M.A.N. is now FULLY AWARE of the entire system`);
  console.log('================================================================================\n');
  
  return results;
}
