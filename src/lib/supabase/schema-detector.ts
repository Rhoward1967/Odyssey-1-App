import { supabase } from '../supabase';

export interface TableStatus {
  table_name: string;
  exists: boolean;
  error?: string;
  sample_columns?: string[];
}

export interface SystemHealth {
  database_connected: boolean;
  rls_function_exists: boolean;
  critical_tables_ready: boolean;
  workforce_system_ready: boolean;
}

export async function detectExistingTables(): Promise<TableStatus[]> {
  const expectedTables = [
    // Core workforce tables
    'employees',
    'time_entries', 
    'time_correction_audit',
    'payroll_runs',
    'employee_benefits',
    // Business operation tables
    'bids', // Keep checking this one
    'janitorial_leads',
    'agents', 
    'export_formats',
    'research_exports',
    'rfqs'
  ];

  const results: TableStatus[] = [];

  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('id') // Just select ID to minimize data transfer
        .limit(1);

      if (error) {
        results.push({
          table_name: tableName,
          exists: false,
          error: error.message
        });
      } else {
        results.push({
          table_name: tableName,
          exists: true,
          sample_columns: data && data.length > 0 ? Object.keys(data[0]) : ['accessible']
        });
      }
    } catch (err) {
      results.push({
        table_name: tableName,
        exists: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  return results;
}

export async function checkRLSFunction(): Promise<{ exists: boolean; error?: string }> {
  try {
    // Test the RLS function with a dummy user ID
    const { data, error } = await supabase.rpc('is_user_org_admin', { user_id: 'test-id' });
    
    if (error && error.message.includes('function') && error.message.includes('does not exist')) {
      return { exists: false, error: 'Function is_user_org_admin does not exist' };
    }
    
    return { exists: true };
  } catch (err) {
    return { 
      exists: false, 
      error: err instanceof Error ? err.message : 'Unknown error checking RLS function'
    };
  }
}

export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    const [tableStatuses, rlsStatus] = await Promise.all([
      detectExistingTables(),
      checkRLSFunction()
    ]);

    const existingTables = tableStatuses.filter(t => t.exists);
    const criticalTables = ['employees', 'time_entries', 'bids'];
    const criticalTablesReady = criticalTables.every(table => 
      existingTables.some(t => t.table_name === table)
    );

    return {
      database_connected: existingTables.length > 0,
      rls_function_exists: rlsStatus.exists,
      critical_tables_ready: criticalTablesReady,
      workforce_system_ready: existingTables.length >= 8 // Most tables ready
    };
  } catch (error) {
    return {
      database_connected: false,
      rls_function_exists: false,
      critical_tables_ready: false,
      workforce_system_ready: false
    };
  }
}
