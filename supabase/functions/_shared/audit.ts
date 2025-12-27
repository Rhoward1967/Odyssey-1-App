// supabase/functions/_shared/audit.ts
export interface AuditInput {
  table_schema: string;
  table_name: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'EXECUTE';
  user_role?: string;
  before_row?: Record<string, unknown> | null;
  after_row?: Record<string, unknown> | null;
  details?: Record<string, unknown> | null;
  correlation_id?: string;
}

export async function writeAudit(entry: AuditInput) {
  const url = Deno.env.get('SUPABASE_URL')!
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  
  // v3.0 Schema: Map to both legacy columns AND handshake-optimized structure
  const auditRecord = {
    // Legacy columns (for Discord bot compatibility)
    table_schema: entry.table_schema,
    table_name: entry.table_name,
    action: entry.action,
    
    // Handshake-optimized columns (v2.0)
    event_type: `${entry.action}_${entry.table_name}`.toUpperCase(),
    correlation_id: entry.correlation_id ?? null,
    user_id: entry.user_role ?? 'service_role',
    organization_id: null,
    action_data: {
      table_schema: entry.table_schema,
      table_name: entry.table_name,
      action: entry.action,
      before_row: entry.before_row,
      after_row: entry.after_row,
      details: entry.details
    },
    validation_result: null,
    compliance_score: 100,
    violated_principle: null
  };
  
  const res = await fetch(`${url}/rest/v1/roman_audit_log`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(auditRecord),
  })
  if (!res.ok) {
    const errorText = await res.text();
    console.error('audit write failed:', errorText);
  }
}
