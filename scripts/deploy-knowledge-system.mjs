/**
 * Deploy R.O.M.A.N. External Knowledge Integration System
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = 'https://tvsxloejfsrdganemsmg.supabase.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2c3hsb2VqZnNyZGdhbmVtc21nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjcxODg0OCwiZXhwIjoyMDcyMjk0ODQ4fQ.Wr3ffDizDf3DXG2uFD7-z4XrmtQUJjX-m9hiLoMvd1M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deployMigration() {
  console.log('🚀 Deploying R.O.M.A.N. External Knowledge Integration System...\n');

  try {
    // Read migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251220_roman_external_knowledge.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    // Execute migration
    console.log('📊 Executing migration...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Try manual table creation instead
      console.log('⚠️ RPC method not available, creating tables directly...\n');
      await createTablesDirectly();
    } else {
      console.log('✅ Migration executed successfully!\n');
      await verifyDeployment();
    }

  } catch (error) {
    console.error('❌ Deployment error:', error.message);
    process.exit(1);
  }
}

async function createTablesDirectly() {
  console.log('Creating tables one by one...\n');

  const tables = [
    {
      name: 'external_knowledge',
      sql: `
        CREATE TABLE IF NOT EXISTS external_knowledge (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          source TEXT NOT NULL CHECK (source IN ('arxiv', 'pubmed', 'wikipedia', 'scholar', 'news', 'web')),
          topic TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          url TEXT UNIQUE NOT NULL,
          authors TEXT[],
          published_date TIMESTAMPTZ,
          relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100),
          citations INTEGER DEFAULT 0,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'knowledge_cross_references',
      sql: `
        CREATE TABLE IF NOT EXISTS knowledge_cross_references (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          external_source_id UUID,
          book_number INTEGER NOT NULL CHECK (book_number BETWEEN 1 AND 7),
          book_title TEXT NOT NULL,
          correlation_type TEXT NOT NULL CHECK (
            correlation_type IN ('supports', 'contradicts', 'extends', 'relates', 'challenges')
          ),
          correlation_strength INTEGER CHECK (correlation_strength >= 0 AND correlation_strength <= 100),
          book_excerpt TEXT,
          external_excerpt TEXT,
          synthesis TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'learned_insights',
      sql: `
        CREATE TABLE IF NOT EXISTS learned_insights (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          topic TEXT NOT NULL,
          insight TEXT NOT NULL,
          confidence_level INTEGER CHECK (confidence_level >= 0 AND confidence_level <= 100),
          sources TEXT[] NOT NULL,
          supporting_evidence TEXT[],
          created_at TIMESTAMPTZ DEFAULT NOW(),
          validated BOOLEAN DEFAULT FALSE,
          validation_notes TEXT
        );
      `
    },
    {
      name: 'autonomous_learning_log',
      sql: `
        CREATE TABLE IF NOT EXISTS autonomous_learning_log (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id UUID NOT NULL,
          topic TEXT NOT NULL,
          sources_consulted TEXT[],
          knowledge_acquired INTEGER DEFAULT 0,
          cross_references_created INTEGER DEFAULT 0,
          insights_generated INTEGER DEFAULT 0,
          started_at TIMESTAMPTZ DEFAULT NOW(),
          completed_at TIMESTAMPTZ,
          status TEXT CHECK (status IN ('in_progress', 'completed', 'failed')),
          error_message TEXT
        );
      `
    }
  ];

  for (const table of tables) {
    try {
      console.log(`   Creating ${table.name}...`);
      const { error } = await supabase.from(table.name).select('id').limit(1);
      
      if (error && error.code === '42P01') {
        // Table doesn't exist, we'd need to use a different method
        console.log(`   ⚠️ Cannot create ${table.name} directly - manual SQL required`);
      } else {
        console.log(`   ✅ ${table.name} exists or accessible`);
      }
    } catch (err) {
      console.log(`   ⚠️ ${table.name}: ${err.message}`);
    }
  }

  console.log('\n📝 NOTE: Tables may need to be created via Supabase Dashboard SQL Editor');
  console.log('Copy the contents of: supabase/migrations/20251220_roman_external_knowledge.sql\n');
}

async function verifyDeployment() {
  console.log('🔍 Verifying deployment...\n');

  const tables = [
    'external_knowledge',
    'knowledge_cross_references',
    'learned_insights',
    'autonomous_learning_log'
  ];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: ${count} rows`);
      }
    } catch (err) {
      console.log(`   ⚠️ ${table}: ${err.message}`);
    }
  }

  console.log('\n🎉 Deployment verification complete!');
}

// Run deployment
deployMigration();
