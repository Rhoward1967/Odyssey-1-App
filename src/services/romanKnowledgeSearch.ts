/**
 * R.O.M.A.N. KNOWLEDGE SEARCH - Query the Full Knowledge Base
 * 
 * © 2025 Rickey A Howard. All Rights Reserved.
 * 
 * R.O.M.A.N. must SEARCH the knowledge base, not speculate.
 * 64 files synced - query them ALL when asked questions.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface KnowledgeSearchResult {
  file_path: string;
  content: string;
  created_at: string;
  relevance_score?: number;
}

/**
 * Search the knowledge base for specific keywords
 * Returns ALL matching entries, not just 20
 */
export async function searchKnowledgeBase(keyword: string): Promise<KnowledgeSearchResult[]> {
  const { data, error } = await supabase
    .from('roman_knowledge_base')
    .select('file_path, content, created_at')
    .or(`file_path.ilike.%${keyword}%,content.ilike.%${keyword}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Knowledge search error:', error);
    return [];
  }

  return data || [];
}

/**
 * Get specific file from knowledge base
 */
export async function getKnowledgeFile(filePath: string): Promise<KnowledgeSearchResult | null> {
  const { data, error } = await supabase
    .from('roman_knowledge_base')
    .select('file_path, content, created_at')
    .eq('file_path', filePath)
    .single();

  if (error) {
    console.error(`❌ File not found: ${filePath}`, error);
    return null;
  }

  return data;
}

/**
 * Get ALL knowledge base files (no limit)
 */
export async function getAllKnowledge(): Promise<KnowledgeSearchResult[]> {
  const { data, error } = await supabase
    .from('roman_knowledge_base')
    .select('file_path, content, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Failed to fetch all knowledge:', error);
    return [];
  }

  return data || [];
}

/**
 * Search knowledge base by category (from file path patterns)
 */
export async function searchByCategory(category: 'ip' | 'governance' | 'codebase' | 'services'): Promise<KnowledgeSearchResult[]> {
  const patterns: Record<string, string> = {
    ip: '%IP_VAULT%',
    governance: '%Meeting_Minutes%',
    codebase: '%src/%',
    services: '%services/%'
  };

  const pattern = patterns[category];
  
  const { data, error } = await supabase
    .from('roman_knowledge_base')
    .select('file_path, content, created_at')
    .ilike('file_path', pattern)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`❌ Category search error (${category}):`, error);
    return [];
  }

  return data || [];
}

/**
 * Multi-keyword search (AND logic)
 */
export async function searchMultipleKeywords(keywords: string[]): Promise<KnowledgeSearchResult[]> {
  let query = supabase
    .from('roman_knowledge_base')
    .select('file_path, content, created_at');

  // Apply each keyword as a filter
  keywords.forEach(keyword => {
    query = query.or(`file_path.ilike.%${keyword}%,content.ilike.%${keyword}%`);
  });

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Multi-keyword search error:', error);
    return [];
  }

  return data || [];
}

/**
 * Get knowledge base statistics
 */
export async function getKnowledgeStats(): Promise<{
  total_files: number;
  ip_files: number;
  governance_files: number;
  codebase_files: number;
  last_sync: string | null;
}> {
  const { data, error } = await supabase
    .from('roman_knowledge_base')
    .select('file_path, created_at');

  if (error || !data) {
    return {
      total_files: 0,
      ip_files: 0,
      governance_files: 0,
      codebase_files: 0,
      last_sync: null
    };
  }

  return {
    total_files: data.length,
    ip_files: data.filter(f => f.file_path.includes('IP_VAULT')).length,
    governance_files: data.filter(f => f.file_path.includes('Meeting_Minutes') || f.file_path.includes('HANDSHAKE')).length,
    codebase_files: data.filter(f => f.file_path.includes('src/')).length,
    last_sync: data.length > 0 ? data[0].created_at : null
  };
}
