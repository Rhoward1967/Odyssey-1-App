import { createClient } from '@supabase/supabase-js';

// Secure Supabase configuration - environment variables REQUIRED
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Build-time validation: Fail if environment variables are missing
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'SECURITY ERROR: Missing required Supabase environment variables. ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
  );
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export { supabase };