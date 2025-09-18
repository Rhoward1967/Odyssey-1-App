import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase configuration to avoid environment variable issues
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tvsxloejfsrdganemsmg.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2c3hsb2VqZnNyZGdhbmVtc21nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwNjQ5ODksImV4cCI6MjA0OTY0MDk4OX0.E5uK2rsbGX3q3T5B4UPImg_pzsQsfpS-vYqN8zHYKXs';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export { supabase };