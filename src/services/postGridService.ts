/**
 * R.O.M.A.N. POSTGRID SERVICE
 * ============================
 * Certified mail automation via PostGrid API.
 * Handles: sending, tracking, delivery confirmation (green card),
 * FCRA deadline monitoring, and Discord status reporting.
 *
 * © 2026 Rickey Allan Howard / Howard Jones Bloodline Ancestral Trust
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)!;
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY)!;
const supabase = createClient(supabaseUrl, supabaseKey);

const POSTGRID_API_KEY = process.env.POSTGRID_API_KEY!;
const POSTGRID_BASE = 'https://api.postgrid.com/print-mail/v1';

// ─── Sender (Howard Jones Bloodline Ancestral Trust) ────────────────────────
export const SOVEREIGN_SENDER = {
  firstName: 'Rickey',
  lastName: 'Howard',
  companyName: 'Howard Jones Bloodline Ancestral Trust',
  addressLine1: 'P.O. Box 80054',
  city: 'Athens',
  provinceOrState: 'GA',
  postalOrZip: '30608',
  country: 'US',
};

// ─── Types ───────────────────────────────────────────────────────────────────
export interface PostGridRecipient {
  companyName: string;          // Required for business recipients
  firstName?: string;           // Optional — use for individuals
  lastName?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  provinceOrState: string;
  postalOrZip: string;
  country?: string;
}

export interface PostGridLetter {
  id: string;
  status: 'draft' | 'ready' | 'printing' | 'processed' | 'in_transit' | 'in_local_area' | 'delivered' | 'returned_to_sender';
  trackingNumber?: string;
  description?: string;
  to?: any;
  from?: any;
  mailingClass?: string;
  extraService?: string;
  createdAt?: string;
  updatedAt?: string;
  sendDate?: string;
  url?: string;
}

export interface SendLetterOptions {
  to: PostGridRecipient;
  htmlContent: string;
  description: string;
  entityName: string;
  certified?: boolean;         // default: true
  returnReceipt?: boolean;     // default: true (green card)
  fcraDeadlineDays?: number;  // default: 30
}

// ─── Core API helper ─────────────────────────────────────────────────────────
async function pgRequest(method: string, path: string, body?: any): Promise<any> {
  const res = await fetch(`${POSTGRID_BASE}${path}`, {
    method,
    headers: {
      'x-api-key': POSTGRID_API_KEY,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`PostGrid API error ${res.status}: ${data?.error?.message || JSON.stringify(data)}`);
  }
  return data;
}

// ─── Send a certified letter ──────────────────────────────────────────────────
export async function sendCertifiedLetter(opts: SendLetterOptions): Promise<PostGridLetter> {
  const {
    to,
    htmlContent,
    description,
    entityName,
    certified = true,
    returnReceipt = true,
    fcraDeadlineDays = 30,
  } = opts;

  // Try certified_return_receipt first, fall back to certified, then first_class
  const serviceOptions = certified
    ? (returnReceipt ? ['certified_return_receipt', 'certified', undefined] : ['certified', undefined])
    : [undefined];

  let letter: any = null;
  let lastError: string = '';

  for (const extraService of serviceOptions) {
    try {
      letter = await pgRequest('POST', '/letters', {
        to: { ...to, country: to.country || 'US' },
        from: SOVEREIGN_SENDER,
        html: htmlContent,
        mailingClass: 'first_class',
        ...(extraService ? { extraService } : {}),
        description,
        mergeVariables: {},
      });
      console.log(`[PostGrid] Letter created with service: ${extraService || 'first_class'}`);
      break;
    } catch (err: any) {
      lastError = err.message;
      console.warn(`[PostGrid] Failed with extraService=${extraService}: ${err.message} — trying fallback`);
    }
  }

  if (!letter) throw new Error(`PostGrid send failed after all fallbacks: ${lastError}`);

  // Log to outbound_notices
  const fcraDeadline = new Date();
  fcraDeadline.setDate(fcraDeadline.getDate() + fcraDeadlineDays);

  try {
    await supabase.from('outbound_notices').upsert({
      postgrid_id: letter.id,
      tracking_no: letter.trackingNumber || null,
      status: letter.status,
      current_hash: letter.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'postgrid_id' });
  } catch {
    // outbound_notices logging failure is non-fatal
  }

  // Also log to certified_mail_tracking
  try {
    await supabase.from('certified_mail_tracking').insert({
      entity_name: entityName,
      tracking_number: letter.trackingNumber || letter.id,
      date_mailed: new Date().toISOString().split('T')[0],
      fcra_deadline: fcraDeadline.toISOString().split('T')[0],
      status: 'sent',
      notes: `PostGrid ID: ${letter.id} | ${description}`,
    });
  } catch {
    // DB logging failure is non-fatal — letter was already sent
  }

  console.log(`[PostGrid] Letter sent to ${entityName} — ID: ${letter.id} | Status: ${letter.status}`);
  return letter;
}

// ─── Get a single letter's status ────────────────────────────────────────────
export async function getLetterStatus(postGridId: string): Promise<PostGridLetter> {
  return pgRequest('GET', `/letters/${postGridId}`);
}

// ─── List all letters ─────────────────────────────────────────────────────────
export async function listLetters(limit = 40): Promise<PostGridLetter[]> {
  const data = await pgRequest('GET', `/letters?limit=${limit}&skip=0`);
  return data?.data || data || [];
}

// ─── Sync PostGrid delivery status → certified_mail_tracking ─────────────────
export async function syncDeliveryStatus(): Promise<{ updated: number; delivered: string[]; errors: string[] }> {
  const result = { updated: 0, delivered: [] as string[], errors: [] as string[] };

  // Get all records that have a PostGrid ID in notes
  const { data: records } = await supabase
    .from('certified_mail_tracking')
    .select('id, entity_name, tracking_number, status, notes, date_mailed, fcra_deadline')
    .eq('status', 'sent');

  if (!records || records.length === 0) return result;

  for (const record of records) {
    try {
      // Extract PostGrid ID from notes if present
      const pgIdMatch = record.notes?.match(/PostGrid ID:\s*([^\s|]+)/);
      if (!pgIdMatch) continue;

      const pgId = pgIdMatch[1];
      const letter = await getLetterStatus(pgId);

      if (letter.status !== record.status) {
        const updates: any = { status: letter.status };
        if (letter.trackingNumber && !record.tracking_number.includes('PG')) {
          updates.tracking_number = letter.trackingNumber;
        }
        if (letter.status === 'delivered') {
          updates.date_delivered = new Date().toISOString().split('T')[0];
          result.delivered.push(record.entity_name);
        }

        await supabase
          .from('certified_mail_tracking')
          .update(updates)
          .eq('id', record.id);

        result.updated++;
        console.log(`[PostGrid Sync] ${record.entity_name}: ${record.status} → ${letter.status}`);
      }
    } catch (err: any) {
      result.errors.push(`${record.entity_name}: ${err.message}`);
    }
  }

  return result;
}

// ─── Get full campaign status report ──────────────────────────────────────────
export async function getCampaignStatus(): Promise<string> {
  const { data: records } = await supabase
    .from('certified_mail_tracking')
    .select('entity_name, tracking_number, date_mailed, date_delivered, fcra_deadline, status, notes')
    .order('date_mailed', { ascending: true });

  if (!records || records.length === 0) {
    return '**R.O.M.A.N. — MAIL CAMPAIGN**\n\nNo records found in certified_mail_tracking.';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const delivered = records.filter(r => r.status === 'delivered');
  const sent = records.filter(r => r.status === 'sent');
  const overdue = delivered.filter(r => {
    if (!r.fcra_deadline) return false;
    return new Date(r.fcra_deadline) < today;
  });
  const awaitingDeadline = delivered.filter(r => {
    if (!r.fcra_deadline) return false;
    return new Date(r.fcra_deadline) >= today;
  });

  let response = `**R.O.M.A.N. — FCRA CERTIFIED MAIL STATUS**\n`;
  response += `*Howard Jones Bloodline Ancestral Trust | ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}*\n\n`;
  response += `📊 **TOTALS:** ${records.length} entities | ✅ ${delivered.length} delivered | 📬 ${sent.length} unconfirmed | 🚨 ${overdue.length} in default\n\n`;

  if (overdue.length > 0) {
    response += `🚨 **IN DEFAULT (delivered + deadline passed):**\n`;
    overdue.forEach(r => {
      const daysOverdue = Math.floor((today.getTime() - new Date(r.fcra_deadline).getTime()) / 86400000);
      response += `• **${r.entity_name}** — Delivered: ${r.date_delivered || 'unknown'} | Deadline: ${r.fcra_deadline} | **${daysOverdue} days overdue**\n`;
    });
    response += '\n';
  }

  if (sent.length > 0) {
    response += `📬 **UNCONFIRMED DELIVERY (needs follow-up):**\n`;
    sent.forEach(r => {
      const daysOut = Math.floor((today.getTime() - new Date(r.date_mailed).getTime()) / 86400000);
      response += `• **${r.entity_name}** — Mailed: ${r.date_mailed} (${daysOut} days ago) | Tracking: ${r.tracking_number}\n`;
    });
    response += '\n';
  }

  if (awaitingDeadline.length > 0) {
    response += `⏳ **DELIVERED — AWAITING RESPONSE:**\n`;
    awaitingDeadline.forEach(r => {
      const daysLeft = Math.ceil((new Date(r.fcra_deadline).getTime() - today.getTime()) / 86400000);
      response += `• **${r.entity_name}** — Deadline: ${r.fcra_deadline} (${daysLeft} days left)\n`;
    });
  }

  response += `\n*All rights reserved. UCC 1-308. Without Prejudice.*`;
  return response;
}

// ─── Generate standard FCRA dispute letter HTML ──────────────────────────────
export function generateFCRALetterHTML(params: {
  entityName: string;
  entityAddress: string;
  accountNumber?: string;
  disputeType: 'initial' | 'follow_up' | 'default_notice';
  customBody?: string;
}): string {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const { entityName, accountNumber, disputeType, customBody } = params;

  const headers: Record<string, string> = {
    initial: 'NOTICE OF DISPUTE — FCRA § 611',
    follow_up: 'FOLLOW-UP NOTICE — FAILURE TO RESPOND',
    default_notice: 'NOTICE OF DEFAULT — FCRA VIOLATION',
  };

  const bodies: Record<string, string> = {
    initial: `This letter constitutes formal written notice of dispute under the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681i. You are hereby notified that the undersigned disputes the accuracy and/or completeness of information maintained in your records. You are required by law to conduct a reasonable reinvestigation within 30 days of receipt of this notice.`,
    follow_up: `This is a follow-up to our previous certified correspondence. To date, no response has been received. Your failure to respond within the statutory 30-day period constitutes a violation of the FCRA, 15 U.S.C. § 1681i. Continued non-compliance may result in civil liability under 15 U.S.C. § 1681n and § 1681o.`,
    default_notice: `NOTICE: You have failed to respond within the statutory 30-day window required by the FCRA, 15 U.S.C. § 1681i. This constitutes a willful violation of federal consumer protection law. The undersigned reserves all rights and remedies, including but not limited to civil action under 15 U.S.C. § 1681n (actual damages, punitive damages, and attorney's fees).`,
  };

  // PostGrid HTML format:
  // - DO NOT include a recipient address block in the HTML — PostGrid injects it automatically.
  // - The address region occupies approximately the top 3.5in of the first page (return + TO address blocks).
  // - padding-top: 4in ensures letter body starts safely below the address window.
  // - Keep content to ~5in of vertical space max to avoid overflow issues.
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #000; }
  .page { width: 8.5in; min-height: 11in; padding-left: 1in; padding-right: 1in; padding-top: 4in; padding-bottom: 1in; }
  p { margin-bottom: 12pt; }
  .sig-line { border-top: 1px solid #000; width: 200px; margin: 6pt 0 3pt 0; }
</style>
</head>
<body>
<div class="page">

<p>${today}</p>

<p><strong>${headers[disputeType]}${accountNumber ? `<br/>Account No. ${accountNumber}` : ''}</strong></p>

<p>To Whom It May Concern:</p>

<p>${customBody || bodies[disputeType]}</p>

<p>This correspondence is transmitted via USPS Certified Mail with Return Receipt Requested. All rights reserved without prejudice. UCC 1-308.</p>

<p>Sincerely,</p>
<div class="sig-line"></div>
<p>Rickey Allan Howard, Grantor<br/>Howard Jones Bloodline Ancestral Trust<br/>P.O. Box 80054 | Athens, GA 30608</p>

</div>
</body>
</html>`;
}

// ─── Known FCRA entity addresses ─────────────────────────────────────────────
export const FCRA_ENTITY_ADDRESSES: Record<string, PostGridRecipient & { displayAddress: string }> = {
  'transunion': {
    companyName: 'TransUnion LLC',
    addressLine1: '555 W Adams St',
    city: 'Chicago',
    provinceOrState: 'IL',
    postalOrZip: '60661',
    displayAddress: '555 W Adams St, Chicago, IL 60661',
  },
  'equifax': {
    companyName: 'Equifax Information Services LLC',
    addressLine1: 'P.O. Box 740256',
    city: 'Atlanta',
    provinceOrState: 'GA',
    postalOrZip: '30374',
    displayAddress: 'P.O. Box 740256, Atlanta, GA 30374',
  },
  'experian': {
    companyName: 'Experian National Consumer Assistance Center',
    addressLine1: 'P.O. Box 4500',
    city: 'Allen',
    provinceOrState: 'TX',
    postalOrZip: '75013',
    displayAddress: 'P.O. Box 4500, Allen, TX 75013',
  },
  'capital one': {
    companyName: 'Capital One Financial Corporation',
    addressLine1: '1680 Capital One Drive',
    city: 'McLean',
    provinceOrState: 'VA',
    postalOrZip: '22102',
    displayAddress: '1680 Capital One Drive, McLean, VA 22102',
  },
  'citibank': {
    companyName: 'Citibank NA Legal Department',
    addressLine1: '5800 S Corporate Pl',
    city: 'Sioux Falls',
    provinceOrState: 'SD',
    postalOrZip: '57108',
    displayAddress: '5800 S Corporate Pl, Sioux Falls, SD 57108',
  },
  'bank of america': {
    companyName: 'Bank of America Vehicle Loan Servicing',
    addressLine1: '100 N Tryon St',
    city: 'Charlotte',
    provinceOrState: 'NC',
    postalOrZip: '28255',
    displayAddress: '100 N Tryon St, Charlotte, NC 28255',
  },
  'american express': {
    companyName: 'American Express Legal and Compliance',
    addressLine1: 'P.O. Box 981535',
    city: 'El Paso',
    provinceOrState: 'TX',
    postalOrZip: '79998',
    displayAddress: 'P.O. Box 981535, El Paso, TX 79998',
  },
  'synchrony': {
    companyName: 'Synchrony Bank Legal Department',
    addressLine1: 'P.O. Box 965035',
    city: 'Orlando',
    provinceOrState: 'FL',
    postalOrZip: '32896',
    displayAddress: 'P.O. Box 965035, Orlando, FL 32896',
  },
  'jpmorgan': {
    companyName: 'JPMorgan Chase Bank NA',
    addressLine1: 'P.O. Box 15369',
    city: 'Wilmington',
    provinceOrState: 'DE',
    postalOrZip: '19850',
    displayAddress: 'P.O. Box 15369, Wilmington, DE 19850',
  },
  'chase': {
    companyName: 'JPMorgan Chase Bank NA',
    addressLine1: 'P.O. Box 15369',
    city: 'Wilmington',
    provinceOrState: 'DE',
    postalOrZip: '19850',
    displayAddress: 'P.O. Box 15369, Wilmington, DE 19850',
  },
  'dun': {
    companyName: 'Dun and Bradstreet Legal Department',
    addressLine1: '5335 Gate Pkwy',
    city: 'Jacksonville',
    provinceOrState: 'FL',
    postalOrZip: '32256',
    displayAddress: '5335 Gate Pkwy, Jacksonville, FL 32256',
  },
  'peach state': {
    companyName: 'Peach State Federal Credit Union',
    addressLine1: '1050 Gaines School Road',
    addressLine2: 'Ste 100',
    city: 'Athens',
    provinceOrState: 'GA',
    postalOrZip: '30605',
    displayAddress: '1050 Gaines School Road Ste 100, Athens, GA 30605',
  },
  'intuit': {
    companyName: 'Intuit Financing Inc Legal Department',
    addressLine1: '2700 Coast Ave',
    city: 'Mountain View',
    provinceOrState: 'CA',
    postalOrZip: '94043',
    displayAddress: '2700 Coast Ave, Mountain View, CA 94043',
  },
};

export function findEntityAddress(query: string): (PostGridRecipient & { displayAddress: string }) | null {
  const q = query.toLowerCase();
  for (const [key, addr] of Object.entries(FCRA_ENTITY_ADDRESSES)) {
    if (q.includes(key)) return addr;
  }
  return null;
}
