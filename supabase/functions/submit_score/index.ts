// deno-lint-ignore-file no-explicit-any
import { createClient } from 'npm:@supabase/supabase-js@2';

console.info('submit-score function started');

Deno.serve(async (req: Request) => {
    try {
        if (req.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 });
        }

        // Auth: forward client auth header
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { 'Authorization': req.headers.get('Authorization') ?? '' }
                }
            }
        );

        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Missing or invalid session.' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        const userId = authData.user.id as string;

        // Parse input
        let body: any;
        try { body = await req.json(); } catch (_) {
            return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const game_id = typeof body?.game_id === 'string' ? body.game_id.trim() : '';
        const score = typeof body?.score === 'number' ? body.score : NaN;

        if (!game_id || !Number.isFinite(score)) {
            return new Response(JSON.stringify({ error: 'Missing game_id or invalid score.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 1. ATOMIC UPSERT ATTEMPT (Updated DML structure for stability)
        // This relies on the database having a proper trigger/RPC for GREATEST() logic, 
        // but the DML itself should not crash Deno.
        const { data: upsertData, error: upsertErr } = await supabase
            .from('game_leaderboards')
            .upsert(
                {
                    game_id,
                    user_id: userId,
                    high_score: score,
                    last_updated: new Date().toISOString()
                },
                { onConflict: 'game_id, user_id' }
            )
            .select('high_score')
            .single();


        if (upsertErr) {
            // Check for RLS denial or DB issue
            const status = (upsertErr as any).code === '42501' ? 403 : 500;
            const message = (upsertErr as any).code === '42501' ? 'Forbidden: RLS Policy denied write access.' : `Database Error: ${upsertErr.message}`;
            
            return new Response(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json' } });
        }
        
        return new Response(
            JSON.stringify({
                message: 'Score submitted successfully. Leaderboard updated.',
                new_score: upsertData?.high_score,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (err: any) {
        console.error('Critical Edge Error in submit_score:', err?.message ?? err);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});