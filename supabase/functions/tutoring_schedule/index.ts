/// <reference types="https://raw.githubusercontent.com/denoland/deno/main/cli/tsc/lib/deno.ts" />
// deno-lint-ignore-file no-explicit-any
import { createClient } from 'npm:@supabase/supabase-js@2';

const BUCKET = 'media_recordings';
const EXPIRATION_SECONDS = 3600; // 1 hour expiration for signed URLs

// CRITICAL FIX: Add check for SERVICE_ROLE_KEY before initialization
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY secret. Tutoring functions will be limited.');
}

// --- Supabase Service Role Client Setup ---
// Uses the Service Role Key for elevated permissions (needed for signed URL generation and logging)
const supabaseSrv = SERVICE_ROLE_KEY ? createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    SERVICE_ROLE_KEY
) : null; // Set to null if key is missing

console.info('tutoring function started');

// Main Deno service handler (using Deno.serve for compliance)
Deno.serve(async (req: Request) => {
    try {
        if (req.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 });
        }
        
        // CHECK 1: Ensure Service Role Client is operational for logging/admin tasks
        if (!supabaseSrv) {
             return new Response(JSON.stringify({ error: 'Internal Error: Service Role key not found.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }


        // User-scoped client: forwards Authorization to respect RLS
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { 'Authorization': req.headers.get('Authorization') ?? '' },
                }
            }
        );

        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData?.user) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Missing or invalid session.' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        const userId = authData.user.id as string;

        // 2. Input Parsing
        let body: any;
        try { body = await req.json(); } catch (_) {
            return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const action = typeof body?.action === 'string' ? body.action : '';
        if (!action) {
            return new Response(JSON.stringify({ error: 'Missing action.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (action === 'schedule') {
            // --- Action A: Schedule New Appointment ---
            const tutor_id = typeof body?.tutor_id === 'string' ? body.tutor_id : null;
            const start_time = typeof body?.start_time === 'string' ? body.start_time : null;
            const notes = typeof body?.notes === 'string' ? body.notes : null;

            if (!tutor_id || !start_time) {
                return new Response(JSON.stringify({ error: 'Missing required fields for scheduling.' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            // Create appointment (RLS enforces user_id = auth.uid() via the RLS policy)
            const { data: appt, error: insertErr } = await supabase
                .from('tutoring_appointments')
                .insert({ user_id: userId, tutor_id, start_time, notes, status: 'scheduled' })
                .select('id, user_id, tutor_id, start_time, status')
                .single();

            if (insertErr) {
                // Check for RLS denial
                const status = (insertErr as any).code === '42501' ? 403 : 500;
                 return new Response(JSON.stringify({ error: `Scheduling failed: ${insertErr.message}` }), {
                    status,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            // Compliance log (service role only write)
            const logInsert = supabaseSrv.from('tutoring_logs').insert({
                appointment_id: appt.id,
                user_id: appt.user_id,
                tutor_id: appt.tutor_id,
                event: 'appointment_scheduled',
                payload: { start_time: appt.start_time, status: appt.status },
            });

            // Await compliance log insert directly for maximum compatibility
            await logInsert;

            return new Response(JSON.stringify({
                message: 'Appointment scheduled successfully.',
                appointment: appt,
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });

        } else if (action === 'get_signed_url') {
            // --- Action B: Generate Signed URL for Recording Access ---
            const path_to_file = typeof body?.path_to_file === 'string' ? body.path_to_file : '';

            if (!path_to_file) {
                return new Response(JSON.stringify({ error: 'Missing path_to_file for signed URL.' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            // Enforce bucket path does not escape expected structure
            const segments = path_to_file.split('/').filter(Boolean);
            if (segments.length < 2 || segments[0] === '..') {
                return new Response(
                    JSON.stringify({ error: 'Invalid file path format. Must be APPOINTMENT_ID/filename.' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }
            const appointmentId = segments[0];

            // 1. Check Authorization (RLS check on appointment table)
            const { data: appointment, error: apptErr } = await supabase
                .from('tutoring_appointments')
                .select('user_id, tutor_id')
                .eq('id', appointmentId)
                .maybeSingle();

            if (apptErr || !appointment || !([appointment.user_id, appointment.tutor_id]).includes(userId)) {
                return new Response(JSON.stringify({ error: 'Forbidden: User is not associated with this appointment.' }), {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            // 2. Generate Signed URL using Service Role
            const { data: urlData, error: urlError } = await supabaseSrv.storage
                .from(BUCKET)
                .createSignedUrl(path_to_file, EXPIRATION_SECONDS);

            if (urlError) {
                throw new Error(`Failed to generate signed URL: ${urlError.message}`);
            }

            return new Response(JSON.stringify({
                message: 'Signed URL generated.',
                signed_url: urlData?.signedUrl,
                expires_in: EXPIRATION_SECONDS,
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });

        } else {
            return new Response(JSON.stringify({ error: 'Invalid action specified.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

    } catch (err: any) {
        console.error('Critical Edge Error in tutoring_schedule:', err?.message ?? err);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});