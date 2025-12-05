// supabase/functions/refresh_roman_event_daily/index.ts
console.info('refresh_roman_event_daily: sanity check start');

function runRefresh() {
  // TODO: Replace this with your real refresh logic
  // Example: await refreshMaterializedView();
  return 'Refresh logic ran successfully.';
}

Deno.serve(async (req) => {
  const envSecret = Deno.env.get('REFRESH_SECRET') ?? '';
  const hdr = req.headers.get('x-refresh-secret') ?? '';
  if (!(envSecret.length > 0 && hdr === envSecret)) {
    return new Response(
      JSON.stringify({ ok: false, message: 'Unauthorized: bad secret' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  const start = Date.now();
  try {
    const message = await runRefresh();
    const duration_ms = Date.now() - start;
    return new Response(
      JSON.stringify({ ok: true, message, duration_ms }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, message: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});