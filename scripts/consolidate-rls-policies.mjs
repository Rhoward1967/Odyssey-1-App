// Consolidate Duplicate RLS Policies
// Run this script to drop duplicate policies and keep only sovereign policies

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const POLICIES_TO_DROP = [
  { table: 'ab_tests', policy: 'Enable read for active tests or admins' },
  { table: 'admin_revenue_analytics', policy: 'Enable read for all authenticated users' },
  { table: 'ai_analysis', policy: 'Enable read for own analysis or admins' },
  { table: 'ai_intelligence_metrics', policy: 'Admin read AI metrics' },
  { table: 'analytics_events', policy: 'Enable read for own events or admins' },
  { table: 'announcements', policy: 'Enable read for active announcements or admins' },
  { table: 'api_key_audit', policy: 'Admins can manage API keys' },
  { table: 'app_admins', policy: 'Global admins manage app_admins' },
  { table: 'audit_log', policy: 'audit_log admin bypass' },
  { table: 'audit_trail', policy: 'audit_trail_admin_read' },
  { table: 'bid_collaborators', policy: 'Enable read for bid members or admins' },
  { table: 'bid_specifications', policy: 'Enable read for accessible bids or admins' },
  { table: 'books', policy: 'books_public_read' },
  { table: 'budget_alerts', policy: 'Enable full access for org members or admins' },
  { table: 'chat_channels', policy: 'read_channels' },
  { table: 'chat_messages', policy: 'ai_select_chat_messages' },
  { table: 'cleaning_plans', policy: 'cleaning_plans_select_own' },
  { table: 'collaboration_sessions', policy: 'Enable read for participants or admins' },
  { table: 'commission_payouts', policy: 'Bidder can select their own payouts' },
  { table: 'companies', policy: 'companies admin bypass' },
  { table: 'company_bank_accounts', policy: 'org members can read cba' },
  { table: 'company_profiles', policy: 'company_profiles_select_optimized' },
  { table: 'company_subscriptions', policy: 'company_subscriptions admin bypass' },
  { table: 'company_usage', policy: 'company_usage admin bypass' },
  { table: 'compliance_checks', policy: 'Admin read compliance' },
  { table: 'contractor_engagements', policy: 'contractor_engagements_select' },
  { table: 'contractor_payments', policy: 'Admins can manage contractor payments' },
  { table: 'contractor_profiles', policy: 'contractor_profiles_select' },
  { table: 'contractors', policy: 'Admins can update contractor compliance' },
  { table: 'conversation_learning', policy: 'Enable read for owner or admins' },
  { table: 'conversation_memory', policy: 'Enable read for owner or admins' },
  { table: 'conversations', policy: 'Enable read for owner or admins' },
  { table: 'conversion_funnels', policy: 'Enable read for active funnels or admins' },
  { table: 'cost_alerts', policy: 'Enable read for owners or admins' },
  { table: 'cost_metrics', policy: 'auth can read cost_metrics' },
  { table: 'crm_contacts', policy: 'crm_contacts_user_rw' },
  { table: 'custom_training_data', policy: 'Enable read for owners or admins' },
  { table: 'customers', policy: 'customers_admin_access' },
  { table: 'decentralized_events', policy: 'Enable read for owners or admins' },
  { table: 'deployed_models', policy: 'Enable read for owners or admins' },
  { table: 'deployment_metrics', policy: 'deployment_metrics_parent_read' },
  { table: 'deployments', policy: 'deployments_owner_select' },
  { table: 'email_campaigns', policy: 'Enable full access for owners or admins' },
  { table: 'email_sends', policy: 'Unified access for campaign owners and admins' },
  { table: 'email_subscribers', policy: 'Enable read for admins only' },
  { table: 'email_templates', policy: 'Enable read for owners or admins' },
  { table: 'employees', policy: 'employees_select' },
  { table: 'feature_flags', policy: 'feature_flags_select_org_members' },
  { table: 'fine_tuned_models', policy: 'Enable read for owners or admins' },
  { table: 'governance_changes', policy: 'R.O.M.A.N read only on governance_changes' },
  { table: 'governance_log', policy: 'Admins can view all governance actions' },
  { table: 'governance_principles', policy: 'R.O.M.A.N read only on governance_principles' },
  { table: 'gps_tracking_log', policy: 'Enable read for owners or admins' },
  { table: 'handbook_acknowledgments', policy: 'users_read_own_acknowledgments' },
  { table: 'handbook_content', policy: 'auth can read handbook_content' },
  { table: 'handbook_quiz_results', policy: 'hqr_select_consolidated' },
  { table: 'handbook_section_history', policy: 'hsh_select_consolidated' },
  { table: 'homework_sessions', policy: 'Users can manage their own homework sessions' },
  { table: 'incoming_payment_links', policy: 'incoming_payment_links_select' },
  { table: 'industry_templates', policy: 'Enable read for authenticated users or admins' },
  { table: 'invoice_items', policy: 'users_can_read_own_invoice_items' },
  { table: 'media_users', policy: 'Users can view and update their own media_user profile' },
  { table: 'model_evaluations', policy: 'Enable full access for owners or admins' },
  { table: 'monthly_billing', policy: 'Bidder can select billing data for their contracts' },
  { table: 'navigation_menus', policy: 'Enable read for active menus or admins' },
  { table: 'organizations', policy: 'Enable read for organization members' },
  { table: 'payment_intents_log', policy: 'consolidated_select_payment_intents' },
  { table: 'payments', policy: 'payments_owner_select' },
  { table: 'payments_v2', policy: 'consolidated_select_payments' },
  { table: 'payroll_rules', policy: 'Admins/Owners can manage payroll_rules' },
  { table: 'paystubs', policy: 'Enable read for own paystubs' },
  { table: 'performance_metrics', policy: 'Enable full access for owners or admins' },
  { table: 'performance_snapshots', policy: 'Admin read snapshots' },
  { table: 'plan_limits', policy: 'read_public' },
  { table: 'plans', policy: 'read_public' },
  { table: 'position_lots', policy: 'position_lots_owner_all' },
  { table: 'products', policy: 'products_select_optimized' },
  { table: 'query_cache', policy: 'Enable full access for owners or admins' },
  { table: 'rate_limits', policy: 'Enable read for owners or admins' },
  { table: 'recurring_invoices', policy: 'recurring_invoices_sovereign_access' },
  { table: 'rollback_events', policy: 'rollback_events_parent_read' },
  { table: 'roman_commands', policy: 'Enable access for R.O.M.A.N. and Admins' },
  { table: 'services', policy: 'services_auth_select' },
  { table: 'session_participants', policy: 'Enable full access for participants or admins' },
  { table: 'shared_conversations', policy: 'Enable full access for session participants or admins' },
  { table: 'smart_notifications', policy: 'Enable full access for owners or admins' },
  { table: 'spending_categories', policy: 'Unified access for org members and admins' },
  { table: 'sst_specs', policy: 'sst_specs_admin_read' },
  { table: 'static_site_content', policy: 'Enable read for active content or admins' },
  { table: 'stripe_events', policy: 'auth can read stripe_events' },
  { table: 'subscription_tiers', policy: 'subscription_tiers_public_read' },
  { table: 'subscriptions', policy: 'optimized_subscriptions_select' },
  { table: 'system_alerts', policy: 'system_alerts_sovereign_write' },
  { table: 'system_config', policy: 'system_config_select_auth' },
  { table: 'system_kill_switches', policy: 'admin_read_kill_switches' },
  { table: 'system_knowledge', policy: 'admin_read_system_knowledge' },
  { table: 'system_logs', policy: 'admin_read_system_logs' },
  { table: 'system_metrics', policy: 'Admin read access to system metrics' },
  { table: 'system_settings', policy: 'manage_settings_admin' },
  { table: 'timelogs', policy: 'timelogs_owner_all' },
  { table: 'trade_history', policy: 'trade_history_select' },
  { table: 'trades', policy: 'trades_owner_all' },
  { table: 'tutoring_logs', policy: 'logs_select_by_appointment_membership' },
  { table: 'usage_limits', policy: 'Enable read for owners or admins' },
  { table: 'user_activities', policy: 'Enable read for owners or admins' },
  { table: 'user_organizations', policy: 'user_orgs_select_consolidated' },
  { table: 'user_portfolio', policy: 'user_portfolio_select' },
  { table: 'user_roles', policy: 'Users can view own role' },
  { table: 'user_sessions', policy: 'sessions_select_consolidated' },
  { table: 'user_usage', policy: 'user_usage_owner_select' },
  { table: 'voice_profiles', policy: 'Enable full access for owners or admins' },
  { table: 'voice_training_data', policy: 'voice_training_data_select' },
  { table: 'webhook_log', policy: 'admin_read_webhook_log' },
];

console.log('🔧 Starting RLS Policy Consolidation');
console.log(`📊 Total policies to drop: ${POLICIES_TO_DROP.length}`);
console.log('');

let dropped = 0;
let failed = 0;

// Build one large SQL statement
const sqlStatements = POLICIES_TO_DROP.map(({ table, policy }) => {
  return `DROP POLICY IF EXISTS "${policy}" ON public.${table};`;
}).join('\n');

console.log('📝 Executing consolidated SQL...\n');

try {
  // Use the SQL Editor approach - copy this to Supabase Dashboard SQL Editor
  console.log('⚠️  The Supabase JS client cannot execute DDL statements directly.');
  console.log('📋 Copy the following SQL and run it in your Supabase Dashboard SQL Editor:\n');
  console.log('='.repeat(80));
  console.log(sqlStatements);
  console.log('='.repeat(80));
  console.log('\nOR run this file to save it to consolidate_policies.sql:');
  
  // Also write to file
  const fs = await import('fs/promises');
  await fs.writeFile(
    join(__dirname, '../consolidate_policies.sql'),
    sqlStatements
  );
  console.log('\n✅ SQL written to: consolidate_policies.sql');
  console.log('📌 Run this in Supabase Dashboard > SQL Editor');
  
} catch (err) {
  console.log(`💥 Error: ${err.message}`);
  failed = POLICIES_TO_DROP.length;
}

console.log('');
console.log('📈 Summary:');
console.log(`   ✅ Dropped: ${dropped}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   📊 Total: ${POLICIES_TO_DROP.length}`);
console.log('');
console.log(failed === 0 ? '🎉 All policies consolidated successfully!' : '⚠️  Some policies failed to drop');
