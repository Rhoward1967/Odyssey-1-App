/**
 * R.O.M.A.N. DATABASE KNOWLEDGE - Complete Database Map
 * 
 * © 2025 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 * 
 * Part of the ODYSSEY-1 Genesis Protocol
 * R.O.M.A.N. must know EVERY table, EVERY column, EVERY relationship
 */

export interface DatabaseTable {
  name: string;
  purpose: string;
  key_columns: string[];
  relationships?: string[];
  read_access: 'global' | 'restricted';
  write_access: 'global' | 'restricted' | 'read-only';
}

/**
 * COMPLETE DATABASE SCHEMA
 * R.O.M.A.N. has GLOBAL READ access to all tables
 * R.O.M.A.N. has GLOBAL WRITE access to all tables EXCEPT governance tables
 */
export const ROMAN_DATABASE_KNOWLEDGE: DatabaseTable[] = [
  // === CORE USER & AUTHENTICATION ===
  {
    name: 'profiles',
    purpose: 'User profiles and authentication data',
    key_columns: ['id', 'email', 'full_name', 'role', 'avatar_url'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'organizations',
    purpose: 'Company/organization master data',
    key_columns: ['id', 'name', 'subdomain', 'owner_id'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'user_organizations',
    purpose: 'Links users to organizations with roles',
    key_columns: ['user_id', 'organization_id', 'role'],
    relationships: ['profiles', 'organizations'],
    read_access: 'global',
    write_access: 'global'
  },

  // === WORKFORCE MANAGEMENT ===
  {
    name: 'employees',
    purpose: 'Employee master data - demographics, pay, status',
    key_columns: ['id', 'first_name', 'last_name', 'email', 'hourly_rate', 'status'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'time_entries',
    purpose: 'Employee clock in/out records',
    key_columns: ['id', 'employee_id', 'clock_in', 'clock_out', 'status'],
    relationships: ['employees'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'paystubs',
    purpose: 'Generated paystubs for employees',
    key_columns: ['id', 'employee_id', 'pay_period_start', 'pay_period_end', 'gross_pay', 'net_pay'],
    relationships: ['employees'],
    read_access: 'global',
    write_access: 'global'
  },

  // === TAX & PAYROLL SYSTEM ===
  {
    name: 'federal_tax_brackets',
    purpose: 'IRS federal income tax brackets by year and filing status',
    key_columns: ['id', 'year', 'filing_status', 'bracket_min', 'bracket_max', 'rate'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'state_tax_brackets',
    purpose: 'State income tax brackets',
    key_columns: ['id', 'state', 'year', 'bracket_min', 'bracket_max', 'rate'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'payroll_tax_rates',
    purpose: 'Social Security, Medicare, FUTA, SUTA rates',
    key_columns: ['id', 'year', 'tax_type', 'rate', 'wage_base'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'employee_w4_forms',
    purpose: 'Employee W-4 withholding elections',
    key_columns: ['id', 'employee_id', 'filing_status', 'allowances', 'extra_withholding'],
    relationships: ['employees'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'employee_state_withholding',
    purpose: 'State-specific withholding elections',
    key_columns: ['id', 'employee_id', 'state', 'allowances'],
    relationships: ['employees'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'contractor_1099_info',
    purpose: 'Independent contractor tax information',
    key_columns: ['id', 'contractor_id', 'business_name', 'ein', 'ssn'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'form_1099_nec',
    purpose: 'Generated 1099-NEC forms for contractors',
    key_columns: ['id', 'contractor_id', 'year', 'amount', 'status'],
    relationships: ['contractor_1099_info'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'tax_form_generation_log',
    purpose: 'Audit log of all tax form generations',
    key_columns: ['id', 'form_type', 'recipient_id', 'generated_at', 'generated_by'],
    read_access: 'global',
    write_access: 'global'
  },

  // === SCHEDULING & WORKFORCE PLANNING ===
  {
    name: 'shift_templates',
    purpose: 'Reusable shift templates (e.g., Morning, Evening, Night)',
    key_columns: ['id', 'name', 'start_time', 'end_time', 'break_duration'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'work_locations',
    purpose: 'Physical work locations/sites',
    key_columns: ['id', 'name', 'address', 'timezone'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'employee_schedules',
    purpose: 'Assigned work schedules for employees',
    key_columns: ['id', 'employee_id', 'shift_date', 'start_time', 'end_time', 'location_id'],
    relationships: ['employees', 'work_locations'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'teams',
    purpose: 'Work teams/departments',
    key_columns: ['id', 'name', 'manager_id'],
    relationships: ['employees'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'team_members',
    purpose: 'Links employees to teams',
    key_columns: ['team_id', 'employee_id', 'role'],
    relationships: ['teams', 'employees'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'schedule_modifications',
    purpose: 'Tracks changes to schedules (swaps, time-off)',
    key_columns: ['id', 'employee_id', 'original_start', 'new_start', 'reason'],
    relationships: ['employees'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'training_assignments',
    purpose: 'Employee training and certifications',
    key_columns: ['id', 'employee_id', 'training_name', 'completion_date', 'expires_at'],
    relationships: ['employees'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'schedule_templates',
    purpose: 'Repeating schedule patterns',
    key_columns: ['id', 'name', 'pattern_type', 'organization_id'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'schedule_template_details',
    purpose: 'Details of schedule template patterns',
    key_columns: ['id', 'template_id', 'day_of_week', 'shift_template_id'],
    relationships: ['schedule_templates', 'shift_templates'],
    read_access: 'global',
    write_access: 'global'
  },

  // === BANKING & PAYMENTS ===
  {
    name: 'company_bank_accounts',
    purpose: 'Company bank accounts for payroll funding',
    key_columns: ['id', 'account_name', 'account_number', 'routing_number', 'balance'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'employee_payment_methods',
    purpose: 'Employee direct deposit or check preferences',
    key_columns: ['id', 'employee_id', 'payment_type', 'account_number', 'routing_number'],
    relationships: ['employees'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'payment_transactions',
    purpose: 'Record of all payment transactions',
    key_columns: ['id', 'employee_id', 'amount', 'status', 'transaction_date'],
    relationships: ['employees'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'payment_batches',
    purpose: 'Grouped payment batches for payroll runs',
    key_columns: ['id', 'batch_date', 'total_amount', 'status'],
    read_access: 'global',
    write_access: 'global'
  },

  // === TRADING & FINANCE ===
  {
    name: 'trades',
    purpose: 'All executed trades (paper and live)',
    key_columns: ['id', 'user_id', 'symbol', 'side', 'quantity', 'price', 'mode', 'tx_hash', 'gas_used'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'positions',
    purpose: 'Current open positions',
    key_columns: ['id', 'user_id', 'symbol', 'quantity', 'entry_price', 'unrealized_pnl'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'watchlists',
    purpose: 'User watchlists for tracking assets',
    key_columns: ['id', 'user_id', 'symbol', 'notes'],
    read_access: 'global',
    write_access: 'global'
  },

  // === BUSINESS OPERATIONS ===
  {
    name: 'businesses',
    purpose: 'Business master data',
    key_columns: ['id', 'name', 'business_type', 'owner_id'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'customers',
    purpose: 'Customer/client records',
    key_columns: ['id', 'business_id', 'name', 'email', 'phone'],
    relationships: ['businesses'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'appointments',
    purpose: 'Scheduled appointments',
    key_columns: ['id', 'customer_id', 'start_time', 'end_time', 'status'],
    relationships: ['customers'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'services',
    purpose: 'Services offered by business',
    key_columns: ['id', 'business_id', 'name', 'price', 'duration'],
    relationships: ['businesses'],
    read_access: 'global',
    write_access: 'global'
  },

  // === GOVERNMENT BIDDING ===
  {
    name: 'bids',
    purpose: 'Government contract bids and proposals',
    key_columns: ['id', 'opportunity_id', 'title', 'status', 'submission_date'],
    read_access: 'global',
    write_access: 'global'
  },

  // === R.O.M.A.N. AI SYSTEM ===
  {
    name: 'agents',
    purpose: 'Autonomous AI agents created by R.O.M.A.N.',
    key_columns: ['id', 'name', 'type', 'config', 'status'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'roman_commands',
    purpose: 'History of all R.O.M.A.N. commands executed',
    key_columns: ['id', 'user_intent', 'action', 'parameters', 'result', 'executed_at'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'roman_learning_log',
    purpose: 'R.O.M.A.N.\'s learning data - continuous improvement',
    key_columns: ['id', 'user_intent', 'generated_command', 'validation_result', 'execution_result', 'confidence_score'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'roman_audit_log',
    purpose: 'R.O.M.A.N.\'s self-audit results',
    key_columns: ['id', 'audit_type', 'timestamp', 'findings', 'recommendations'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'cost_metrics',
    purpose: 'AI API usage and cost tracking',
    key_columns: ['id', 'provider', 'model', 'tokens', 'cost', 'timestamp'],
    read_access: 'global',
    write_access: 'global'
  },

  // === AI INTELLIGENCE & EVOLUTION ===
  {
    name: 'ai_technology_tracking',
    purpose: 'Tracks new AI models, papers, advancements',
    key_columns: ['id', 'advancement_type', 'title', 'source_organization', 'impact_level', 'should_upgrade'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'ai_research_papers',
    purpose: 'Academic papers R.O.M.A.N. monitors from arXiv',
    key_columns: ['id', 'arxiv_id', 'title', 'abstract', 'relevance_score', 'status'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'ai_model_benchmarks',
    purpose: 'Performance benchmarks of AI models',
    key_columns: ['id', 'model_name', 'provider', 'mmlu_score', 'cost_per_1k_tokens', 'roman_rating'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'roman_capability_evolution',
    purpose: 'Tracks R.O.M.A.N.\'s capability improvements over time',
    key_columns: ['id', 'capability_name', 'previous_model', 'new_model', 'improvement_percentage'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'agi_timeline_predictions',
    purpose: 'R.O.M.A.N.\'s predictions about AGI timeline',
    key_columns: ['id', 'prediction_date', 'agi_probability', 'confidence', 'reasoning'],
    read_access: 'global',
    write_access: 'global'
  },

  // === COMPLIANCE & GOVERNANCE (READ-ONLY) ===
  {
    name: 'governance_principles',
    purpose: 'The 9 Constitutional Principles - IMMUTABLE',
    key_columns: ['id', 'principle_number', 'name', 'description'],
    read_access: 'global',
    write_access: 'read-only'  // R.O.M.A.N. CANNOT MODIFY
  },
  {
    name: 'governance_changes',
    purpose: 'Log of governance changes (Rickey only)',
    key_columns: ['id', 'changed_by', 'change_description', 'timestamp'],
    read_access: 'global',
    write_access: 'read-only'  // R.O.M.A.N. CANNOT MODIFY
  },
  {
    name: 'governance_log',
    purpose: 'Audit trail of governance access',
    key_columns: ['id', 'actor', 'action', 'timestamp'],
    read_access: 'global',
    write_access: 'read-only'  // R.O.M.A.N. CANNOT MODIFY
  },
  {
    name: 'compliance_rules',
    purpose: 'Compliance rules R.O.M.A.N. must enforce',
    key_columns: ['id', 'rule_name', 'jurisdiction', 'effective_date', 'status'],
    read_access: 'global',
    write_access: 'global'  // R.O.M.A.N. CAN UPDATE RULES (not governance)
  },
  {
    name: 'compliance_audit_log',
    purpose: 'Compliance check audit trail',
    key_columns: ['id', 'check_type', 'result', 'timestamp'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'ai_decisions',
    purpose: 'Explainable AI decision tracking',
    key_columns: ['id', 'decision_type', 'reasoning', 'confidence', 'timestamp'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'ai_consents',
    purpose: 'User consent for AI operations',
    key_columns: ['id', 'user_id', 'consent_type', 'granted_at'],
    relationships: ['profiles'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'bias_checks',
    purpose: 'AI bias detection and mitigation logs',
    key_columns: ['id', 'check_type', 'bias_detected', 'mitigation_applied'],
    read_access: 'global',
    write_access: 'global'
  },

  // === SYSTEM TELEMETRY ===
  {
    name: 'system_metrics',
    purpose: 'Real-time system performance metrics',
    key_columns: ['id', 'metric_name', 'value', 'timestamp'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'system_alerts',
    purpose: 'System alerts and notifications',
    key_columns: ['id', 'alert_type', 'severity', 'message', 'timestamp'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'user_sessions',
    purpose: 'Active user sessions',
    key_columns: ['id', 'user_id', 'started_at', 'last_activity'],
    relationships: ['profiles'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'performance_snapshots',
    purpose: 'Periodic system performance snapshots',
    key_columns: ['id', 'cpu_usage', 'memory_usage', 'timestamp'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'feature_usage',
    purpose: 'Feature usage analytics',
    key_columns: ['id', 'feature_name', 'user_id', 'usage_count'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'ai_intelligence_metrics',
    purpose: 'R.O.M.A.N.\'s intelligence metrics',
    key_columns: ['id', 'metric_type', 'value', 'timestamp'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'compliance_checks',
    purpose: 'Automated compliance check results',
    key_columns: ['id', 'check_name', 'passed', 'timestamp'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'activity_logs',
    purpose: 'User activity audit trail',
    key_columns: ['id', 'user_id', 'action', 'timestamp'],
    relationships: ['profiles'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'system_logs',
    purpose: 'General system logs',
    key_columns: ['id', 'log_level', 'message', 'timestamp'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'system_knowledge',
    purpose: 'R.O.M.A.N.\'s knowledge base',
    key_columns: ['id', 'topic', 'content', 'confidence'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'system_config',
    purpose: 'System configuration settings',
    key_columns: ['id', 'key', 'value', 'updated_at'],
    read_access: 'global',
    write_access: 'global'
  },

  // === SUBSCRIPTION & BILLING ===
  {
    name: 'subscription_tiers',
    purpose: 'Available subscription plans',
    key_columns: ['id', 'name', 'price', 'features'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'user_subscriptions',
    purpose: 'User subscription status',
    key_columns: ['id', 'user_id', 'tier_id', 'status', 'expires_at'],
    relationships: ['profiles', 'subscription_tiers'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'subscriptions',
    purpose: 'Stripe subscription records',
    key_columns: ['id', 'user_id', 'stripe_subscription_id', 'status'],
    relationships: ['profiles'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'payment_methods',
    purpose: 'Stripe payment methods',
    key_columns: ['id', 'user_id', 'stripe_payment_method_id', 'last4'],
    relationships: ['profiles'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'payments_v2',
    purpose: 'Payment transaction records',
    key_columns: ['id', 'user_id', 'amount', 'status', 'timestamp'],
    relationships: ['profiles'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'stripe_events',
    purpose: 'Stripe webhook events',
    key_columns: ['id', 'event_type', 'event_data', 'processed'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'usage_events',
    purpose: 'API usage events for billing',
    key_columns: ['id', 'user_id', 'event_type', 'quantity', 'timestamp'],
    relationships: ['profiles'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'user_usage',
    purpose: 'User usage aggregates',
    key_columns: ['id', 'user_id', 'period', 'total_events', 'total_cost'],
    relationships: ['profiles'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'provider_costs',
    purpose: 'AI provider pricing data',
    key_columns: ['id', 'provider', 'model', 'input_price', 'output_price'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'tax_rates',
    purpose: 'Tax rates for billing',
    key_columns: ['id', 'jurisdiction', 'rate', 'effective_date'],
    read_access: 'global',
    write_access: 'global'
  },

  // === COMPANY HANDBOOK ===
  {
    name: 'handbook_categories',
    purpose: 'Handbook content categories',
    key_columns: ['id', 'name', 'order', 'organization_id'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'handbook_sections',
    purpose: 'Handbook content sections',
    key_columns: ['id', 'category_id', 'title', 'content', 'version'],
    relationships: ['handbook_categories'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'handbook_section_history',
    purpose: 'Version history of handbook sections',
    key_columns: ['id', 'section_id', 'content', 'changed_by', 'changed_at'],
    relationships: ['handbook_sections'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'handbook_acknowledgments',
    purpose: 'Employee handbook acknowledgments',
    key_columns: ['id', 'user_id', 'section_id', 'acknowledged_at'],
    relationships: ['profiles', 'handbook_sections'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'handbook_quiz_questions',
    purpose: 'Handbook comprehension quiz questions',
    key_columns: ['id', 'section_id', 'question_text'],
    relationships: ['handbook_sections'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'handbook_quiz_options',
    purpose: 'Quiz question answer options',
    key_columns: ['id', 'question_id', 'option_text', 'is_correct'],
    relationships: ['handbook_quiz_questions'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'handbook_quiz_results',
    purpose: 'Employee quiz results',
    key_columns: ['id', 'user_id', 'question_id', 'selected_option_id', 'is_correct'],
    relationships: ['profiles', 'handbook_quiz_questions'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'handbook_access_log',
    purpose: 'Handbook access audit trail',
    key_columns: ['id', 'user_id', 'section_id', 'accessed_at'],
    relationships: ['profiles', 'handbook_sections'],
    read_access: 'global',
    write_access: 'global'
  },

  // === BOOKS & KNOWLEDGE ===
  {
    name: 'books',
    purpose: 'Rickey\'s published books catalog',
    key_columns: ['id', 'title', 'subtitle', 'isbn', 'publish_date', 'cover_url'],
    read_access: 'global',
    write_access: 'global'
  },

  // === STUDY GROUPS ===
  {
    name: 'study_groups',
    purpose: 'Collaborative study groups',
    key_columns: ['id', 'name', 'description', 'created_by'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'study_group_members',
    purpose: 'Study group membership',
    key_columns: ['id', 'group_id', 'user_id', 'role'],
    relationships: ['study_groups', 'profiles'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'study_group_messages',
    purpose: 'Study group chat messages',
    key_columns: ['id', 'group_id', 'user_id', 'message', 'timestamp'],
    relationships: ['study_groups', 'profiles'],
    read_access: 'global',
    write_access: 'global'
  },
  {
    name: 'study_group_resources',
    purpose: 'Study group shared resources',
    key_columns: ['id', 'group_id', 'resource_type', 'url', 'uploaded_by'],
    relationships: ['study_groups'],
    read_access: 'global',
    write_access: 'global'
  },

  // === FILE STORAGE ===
  {
    name: 'user_files',
    purpose: 'User uploaded files metadata',
    key_columns: ['id', 'user_id', 'file_name', 'storage_path', 'file_size'],
    relationships: ['profiles'],
    read_access: 'global',
    write_access: 'global'
  },

  // === DOCUMENTS ===
  {
    name: 'documents',
    purpose: 'Document management system',
    key_columns: ['id', 'title', 'content', 'owner_id', 'organization_id'],
    relationships: ['profiles', 'organizations'],
    read_access: 'global',
    write_access: 'global'
  }
];

/**
 * Get all tables R.O.M.A.N. has write access to
 */
export function getWriteableTables(): DatabaseTable[] {
  return ROMAN_DATABASE_KNOWLEDGE.filter(table => 
    table.write_access === 'global'
  );
}

/**
 * Get governance tables (read-only)
 */
export function getGovernanceTables(): DatabaseTable[] {
  return ROMAN_DATABASE_KNOWLEDGE.filter(table => 
    table.write_access === 'read-only'
  );
}

/**
 * Get table by name
 */
export function getTableInfo(tableName: string): DatabaseTable | undefined {
  return ROMAN_DATABASE_KNOWLEDGE.find(table => 
    table.name === tableName
  );
}

/**
 * Database summary for R.O.M.A.N.'s awareness
 */
export function getDatabaseSummary() {
  const total = ROMAN_DATABASE_KNOWLEDGE.length;
  const writeable = getWriteableTables().length;
  const governance = getGovernanceTables().length;

  return {
    total_tables: total,
    writeable_tables: writeable,
    read_only_tables: governance,
    access_level: 'GLOBAL - Full database visibility',
    restrictions: 'Cannot modify governance_principles, governance_changes, governance_log'
  };
}
