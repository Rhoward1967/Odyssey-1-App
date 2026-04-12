/**
 * LOB WEBHOOK HANDLER
 * ===================
 * Receives real-time delivery events from Lob and:
 *   1. Updates certified_mail_tracking in Supabase
 *   2. Posts Discord alert to FCRA_ALERT_CHANNEL
 *
 * Lob events handled:
 *   letter.in_transit          → status: in_transit
 *   letter.in_local_area       → status: in_local_area
 *   letter.processed_for_delivery → status: processed_for_delivery
 *   letter.delivered           → status: delivered  ← triggers FCRA clock + Discord alert
 *   letter.returned_to_sender  → status: returned   ← triggers Discord warning
 *
 * Webhook URL (register in Lob dashboard):
 *   https://tvsxloejfsrdganemsmg.supabase.co/functions/v1/lob-webhook
 *
 * © 2026 Rickey Allan Howard / Howard Jones Bloodline Ancestral Trust
 * UCC 1-308 | All Rights Reserved
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const DISCORD_TOKEN      = Deno.env.get('DISCORD_BOT_TOKEN')!;
const DISCORD_CHANNEL_ID = Deno.env.get('DISCORD_FCRA_ALERT_CHANNEL')!;
const LOB_WEBHOOK_SECRET = Deno.env.get('LOB_WEBHOOK_SECRET') || '';   // set after first Lob webhook creation

// ─── Lob → our DB status map ─────────────────────────────────────────────────

const STATUS_MAP: Record<string, string> = {
  'letter.processed':              'sent',
  'letter.in_transit':             'in_transit',
  'letter.in_local_area':          'in_local_area',
  'letter.processed_for_delivery': 'processed_for_delivery',
  'letter.delivered':              'delivered',
  'letter.returned_to_sender':     'returned',
  're-routed':                     'in_transit',
};

// ─── Discord message poster ───────────────────────────────────────────────────

async function postDiscord(content: string): Promise<void> {
  if (!DISCORD_TOKEN || !DISCORD_CHANNEL_ID) return;

  await fetch(`https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages`, {
    method:  'POST',
    headers: {
      'Authorization': `Bot ${DISCORD_TOKEN}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ content }),
  });
}

// ─── Signature verification (optional — requires LOB_WEBHOOK_SECRET) ──────────

async function verifySignature(req: Request, body: string): Promise<boolean> {
  if (!LOB_WEBHOOK_SECRET) return true;   // skip if secret not yet configured

  const signature = req.headers.get('Lob-Signature');
  if (!signature) return false;

  // Lob signature format: "t=timestamp,v1=hmac_sha256_hex"
  const parts   = Object.fromEntries(signature.split(',').map(p => p.split('=')));
  const payload = `${parts.t}.${body}`;

  const key  = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(LOB_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig  = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const hex  = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

  return hex === parts.v1;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const rawBody = await req.text();

  // Verify signature if secret is set
  const valid = await verifySignature(req, rawBody);
  if (!valid) {
    console.error('[lob-webhook] Invalid signature — rejected');
    return new Response('Unauthorized', { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  const eventType     = event?.event_type?.id || event?.event_type || '';
  const letter        = event?.body || event?.letter || {};
  const lobId         = letter.id || '';
  const trackingNum   = letter.tracking_number || '';
  const toCompany     = letter.to?.company || letter.to?.name || 'Unknown';
  const description   = letter.description || '';

  console.log(`[lob-webhook] Event: ${eventType} | Letter: ${lobId} | To: ${toCompany}`);

  const newStatus = STATUS_MAP[eventType];
  if (!newStatus) {
    // Unknown event — ack and move on
    return new Response(JSON.stringify({ received: true, eventType, action: 'ignored' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── Find matching record in DB ──────────────────────────────────────────────
  // Match by Lob ID in notes field, or by tracking number
  const { data: records, error: fetchErr } = await supabase
    .from('certified_mail_tracking')
    .select('id, entity_name, status, fcra_deadline, date_mailed, tracking_number, notes')
    .or(
      lobId        ? `notes.ilike.%${lobId}%`          : 'id.neq.0',
      trackingNum  ? `tracking_number.eq.${trackingNum}` : undefined,
    )
    .limit(5);

  let record = records?.[0] || null;

  // Fallback: search by tracking number directly
  if (!record && trackingNum) {
    const { data: byTracking } = await supabase
      .from('certified_mail_tracking')
      .select('id, entity_name, status, fcra_deadline, date_mailed, tracking_number, notes')
      .eq('tracking_number', trackingNum)
      .limit(1);
    record = byTracking?.[0] || null;
  }

  if (!record) {
    console.warn(`[lob-webhook] No DB record found for letter ${lobId} / tracking ${trackingNum}`);
    // Still ack — Lob will retry on 5xx but we don't want retry loops for unknown letters
    return new Response(JSON.stringify({ received: true, warning: 'no_matching_record' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── Update DB ───────────────────────────────────────────────────────────────
  const updates: Record<string, any> = { status: newStatus };

  if (newStatus === 'delivered') {
    updates.date_delivered = new Date().toISOString().split('T')[0];
  }
  if (trackingNum && !record.tracking_number) {
    updates.tracking_number = trackingNum;
  }

  const { error: updateErr } = await supabase
    .from('certified_mail_tracking')
    .update(updates)
    .eq('id', record.id);

  if (updateErr) {
    console.error('[lob-webhook] DB update failed:', updateErr.message);
  }

  // ── Discord alerts for key events ───────────────────────────────────────────
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  if (newStatus === 'delivered') {
    const deadline = record.fcra_deadline || 'unknown';
    const daysLeft = record.fcra_deadline
      ? Math.ceil((new Date(record.fcra_deadline).getTime() - Date.now()) / 86400000)
      : null;

    await postDiscord(
      `📬 **R.O.M.A.N. — CERTIFIED LETTER DELIVERED**\n` +
      `**Entity:** ${record.entity_name}\n` +
      `**Tracking:** ${trackingNum || record.tracking_number}\n` +
      `**Delivered:** ${today}\n` +
      `**FCRA Response Deadline:** ${deadline}${daysLeft !== null ? ` (${daysLeft} days remaining)` : ''}\n` +
      `**Lob ID:** ${lobId}\n\n` +
      `⏳ Clock is running. If no response by ${deadline}, file CFPB complaint + civil action.\n` +
      `*UCC 1-308 | Howard Jones Bloodline Ancestral Trust*`
    );
  }

  if (newStatus === 'returned') {
    await postDiscord(
      `⚠️ **R.O.M.A.N. — LETTER RETURNED TO SENDER**\n` +
      `**Entity:** ${record.entity_name}\n` +
      `**Tracking:** ${trackingNum || record.tracking_number}\n` +
      `**Lob ID:** ${lobId}\n\n` +
      `Action required: Verify address and refile. The return itself is evidence of service attempt.\n` +
      `*UCC 1-308 | Howard Jones Bloodline Ancestral Trust*`
    );
  }

  if (newStatus === 'in_transit') {
    // Quiet update — no Discord noise for in_transit unless it's a high-value entity
    const highValue = ['transunion', 'equifax', 'experian', 'capital one', 'citibank', 'scj', 'bank of america']
      .some(k => record.entity_name.toLowerCase().includes(k));

    if (highValue) {
      await postDiscord(
        `📮 **R.O.M.A.N. — LETTER IN TRANSIT**\n` +
        `**Entity:** ${record.entity_name}\n` +
        `**Tracking:** ${trackingNum}\n` +
        `Estimated delivery: 1–3 business days.`
      );
    }
  }

  console.log(`[lob-webhook] Updated ${record.entity_name}: ${record.status} → ${newStatus}`);

  return new Response(
    JSON.stringify({ received: true, entity: record.entity_name, status: newStatus }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
