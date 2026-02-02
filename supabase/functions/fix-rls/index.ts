import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

Deno.serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Execute SQL statements one by one
    const statements = [
      // CUSTOMERS TABLE
      `CREATE POLICY "Users can view own customers" ON customers
       FOR SELECT TO authenticated
       USING (user_id = (SELECT auth.uid()) OR user_id IS NULL)`,
      
      `CREATE POLICY "Users can insert own customers" ON customers
       FOR INSERT TO authenticated
       WITH CHECK (user_id = (SELECT auth.uid()))`,
      
      `CREATE POLICY "Users can update own customers" ON customers
       FOR UPDATE TO authenticated
       USING (user_id = (SELECT auth.uid()))
       WITH CHECK (user_id = (SELECT auth.uid()))`,
      
      // COMPANY_PROFILES TABLE
      `CREATE POLICY "Users can view own profile" ON company_profiles
       FOR SELECT TO authenticated
       USING (user_id = (SELECT auth.uid()))`,
      
      `CREATE POLICY "Users can update own profile" ON company_profiles
       FOR UPDATE TO authenticated
       USING (user_id = (SELECT auth.uid()))
       WITH CHECK (user_id = (SELECT auth.uid()))`
    ];

    const results = [];
    
    for (const stmt of statements) {
      const { data, error } = await supabaseClient.rpc('execute_sql', {
        query: stmt
      });
      
      results.push({
        statement: stmt.substring(0, 50) + '...',
        success: !error,
        error: error?.message
      });
    }

    return new Response(
      JSON.stringify({ results }, null, 2),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
