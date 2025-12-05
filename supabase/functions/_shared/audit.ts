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
  const res = await fetch(`${url}/rest/v1/roman_audit_log`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify([
      {
        table_schema: entry.table_schema,
        table_name: entry.table_name,
        action: entry.action,
        user_role: entry.user_role ?? 'service_role',
        before_row: entry.before_row ?? null,
        after_row: entry.after_row ?? null,
        correlation_id: entry.correlation_id ?? null,
        // details can be merged into after_row.details if needed
      },
    ]),
  })
  if (!res.ok) console.error('audit write failed', await res.text())
}
