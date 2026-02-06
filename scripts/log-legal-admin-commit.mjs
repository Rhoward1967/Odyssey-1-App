import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

const summary = {
  date: '2026-02-04',
  title: 'Administrative Commit - Legal Defense Expansion',
  actions: [
    'Filed UCC-1 personal protection (senior lien) with GSCCCA',
    'Issued 17 certified letters (FCRA disputes + commercial notices + banking notice)',
    'Completed digital archive and identity verification attachments',
    'Activated CourtListener webhook monitoring (search.Alert v2)'
  ],
  impact: 'Corporate shield active; 30-day verification window running; legal intelligence online',
  next_steps: [
    'Finalize HJS Atlanta Hwy Bid proposal',
    'Monitor certified mail return receipts',
    'Review responses at 30-day mark'
  ]
};

const payload = {
  level: 'info',
  source: 'romansystem',
  message: 'Administrative Commit: Legal defense expansion recorded (Feb 4, 2026)',
  metadata: {
    category: 'legal-defense',
    summary
  }
};

const { data, error } = await supabase
  .from('system_logs')
  .insert(payload)
  .select()
  .single();

if (error) {
  console.error('Failed to log to system_logs:', error.message);
  process.exit(1);
}

console.log('Logged to system_logs:', data.id);
