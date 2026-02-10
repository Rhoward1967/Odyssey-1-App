import { createClient } from '@supabase/supabase-js';

// Support both Vite (import.meta.env) and Node.js (process.env) environments
const getEnvVar = (viteKey: string, nodeKey?: string) => {
  // Try import.meta.env first (Vite/browser)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
    return import.meta.env[viteKey];
  }
  // Fallback to process.env (Node.js)
  return process.env[viteKey] || (nodeKey ? process.env[nodeKey] : undefined);
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING');
  console.error('Available process.env keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'sb-tvsxloejfsrdganemsmg-auth-token'
    }
  }
);

console.log('✅ Supabase client initialized');
