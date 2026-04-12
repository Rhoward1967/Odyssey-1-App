/**
 * R.O.M.A.N. LOB SERVICE
 * =======================
 * Certified mail automation via Lob API.
 * Drop-in replacement for postGridService.ts.
 * Handles: sending, tracking, delivery confirmation (green card),
 * FCRA deadline monitoring, and Discord status reporting.
 *
 * Lob API docs: https://docs.lob.com
 * Certified mail: extraService: 'certified' | 'certified_return_receipt'
 *
 * © 2026 Rickey Allan Howard / Howard Jones Bloodline Ancestral Trust
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)!;
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY)!;
const supabase = createClient(supabaseUrl, supabaseKey);

const LOB_API_KEY = process.env.LOB_API_KEY!;
const LOB_BASE    = 'https://api.lob.com/v1';

// ─── Sender (Howard Jones Bloodline Ancestral Trust) ────────────────────────

export const SOVEREIGN_SENDER = {
  name:            'Rickey Allan Howard',
  company:         'Howard Jones Bloodline Ancestral Trust',
  address_line1:   'P.O. Box 80054',
  address_city:    'Athens',
  address_state:   'GA',
  address_zip:     '30608',
  address_country: 'US',
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LobRecipient {
  name?:            string;
  company?:         string;
  address_line1:    string;
  address_line2?:   string;
  address_city:     string;
  address_state:    string;
  address_zip:      string;
  address_country?: string;
  // For display / logging
  displayAddress?:  string;
}

export interface LobLetter {
  id:               string;
  status:           'draft' | 'ready' | 'printing' | 'processed_for_delivery' | 'in_transit' | 'in_local_area' | 'delivered' | 're-routed' | 'returned_to_sender' | 'mailed';
  tracking_number?: string;
  description?:     string;
  to?:              any;
  from?:            any;
  extra_service?:   string;
  date_created?:    string;
  date_modified?:   string;
  send_date?:       string;
  url?:             string;
}

export interface SendLetterOptions {
  to:                LobRecipient;
  htmlContent:       string;
  description:       string;
  entityName:        string;
  certified?:        boolean;   // default: true
  returnReceipt?:    boolean;   // default: true (green card)
  fcraDeadlineDays?: number;    // default: 30
}

// ─── Core API helper ─────────────────────────────────────────────────────────

async function lobRequest(method: string, path: string, body?: Record<string, any>): Promise<any> {
  const auth = Buffer.from(`${LOB_API_KEY}:`).toString('base64');

  const res = await fetch(`${LOB_BASE}${path}`, {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type':  'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();
  if (!res.ok) {
    const errMsg = data?.error?.message || data?.message || JSON.stringify(data);
    throw new Error(`Lob API error ${res.status}: ${errMsg}`);
  }
  return data;
}

// ─── Send a certified letter ──────────────────────────────────────────────────

export async function sendCertifiedLetter(opts: SendLetterOptions): Promise<LobLetter> {
  const {
    to,
    htmlContent,
    description,
    entityName,
    certified      = true,
    returnReceipt  = true,
    fcraDeadlineDays = 30,
  } = opts;

  // Lob extra_service values:
  // 'certified'                → certified, no green card
  // 'certified_return_receipt' → certified + green card
  // undefined                  → first class (no cert)
  const extraService = certified
    ? (returnReceipt ? 'certified_return_receipt' : 'certified')
    : undefined;

  const toAddress = {
    ...(to.name    ? { name: to.name }       : {}),
    ...(to.company ? { company: to.company } : {}),
    address_line1:    to.address_line1,
    ...(to.address_line2 ? { address_line2: to.address_line2 } : {}),
    address_city:     to.address_city,
    address_state:    to.address_state,
    address_zip:      to.address_zip,
    address_country:  to.address_country || 'US',
  };

  const payload: Record<string, any> = {
    description,
    to:           toAddress,
    from:         SOVEREIGN_SENDER,
    file:         htmlContent,
    color:        false,
    double_sided: false,
    use_type:     'operational',
    ...(extraService ? { extra_service: extraService } : {}),
  };

  const letter: LobLetter = await lobRequest('POST', '/letters', payload);

  console.log(`[Lob] Letter sent to ${entityName} — ID: ${letter.id} | Status: ${letter.status} | Service: ${extraService || 'first_class'}`);

  // ── Log to certified_mail_tracking ──
  const fcraDeadline = new Date();
  fcraDeadline.setDate(fcraDeadline.getDate() + fcraDeadlineDays);

  try {
    await supabase.from('certified_mail_tracking').insert({
      entity_name:      entityName,
      tracking_number:  letter.tracking_number || letter.id,
      date_mailed:      new Date().toISOString().split('T')[0],
      fcra_deadline:    fcraDeadline.toISOString().split('T')[0],
      status:           'sent',
      notes:            `Lob ID: ${letter.id} | ${description}`,
    });
  } catch {
    // DB logging failure is non-fatal — letter was already sent
  }

  return letter;
}

// ─── Get a single letter's status ────────────────────────────────────────────

export async function getLetterStatus(lobId: string): Promise<LobLetter> {
  return lobRequest('GET', `/letters/${lobId}`);
}

// ─── List all letters ─────────────────────────────────────────────────────────

export async function listLetters(limit = 40): Promise<LobLetter[]> {
  const data = await lobRequest('GET', `/letters?limit=${limit}`);
  return data?.data || [];
}

// ─── Sync Lob delivery status → certified_mail_tracking ──────────────────────

export async function syncDeliveryStatus(): Promise<{ updated: number; delivered: string[]; errors: string[] }> {
  const result = { updated: 0, delivered: [] as string[], errors: [] as string[] };

  const { data: records } = await supabase
    .from('certified_mail_tracking')
    .select('id, entity_name, tracking_number, status, notes, date_mailed, fcra_deadline')
    .eq('status', 'sent');

  if (!records || records.length === 0) return result;

  for (const record of records) {
    try {
      const lobIdMatch = record.notes?.match(/Lob ID:\s*([^\s|]+)/);
      if (!lobIdMatch) continue;

      const lobId  = lobIdMatch[1];
      const letter = await getLetterStatus(lobId);

      // Normalize Lob status → our status
      const mapped = letter.status === 'delivered'          ? 'delivered'
                   : letter.status === 'returned_to_sender' ? 'returned'
                   : 'sent';

      if (mapped !== record.status) {
        const updates: any = { status: mapped };
        if (letter.tracking_number) updates.tracking_number = letter.tracking_number;
        if (mapped === 'delivered') {
          updates.date_delivered = new Date().toISOString().split('T')[0];
          result.delivered.push(record.entity_name);
        }

        await supabase
          .from('certified_mail_tracking')
          .update(updates)
          .eq('id', record.id);

        result.updated++;
        console.log(`[Lob Sync] ${record.entity_name}: ${record.status} → ${mapped}`);
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

  const delivered       = records.filter(r => r.status === 'delivered');
  const sent            = records.filter(r => r.status === 'sent');
  const overdue         = delivered.filter(r => r.fcra_deadline && new Date(r.fcra_deadline) < today);
  const awaitingDeadline = delivered.filter(r => r.fcra_deadline && new Date(r.fcra_deadline) >= today);

  let response = `**R.O.M.A.N. — FCRA CERTIFIED MAIL STATUS (via Lob)**\n`;
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
    response += `📬 **UNCONFIRMED DELIVERY:**\n`;
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
// (Identical to postGridService — Lob uses the same HTML format)

export function generateFCRALetterHTML(params: {
  entityName:    string;
  entityAddress: string;
  accountNumber?: string;
  disputeType:   'initial' | 'follow_up' | 'default_notice';
  customBody?:   string;
}): string {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const { entityName, accountNumber, disputeType, customBody } = params;

  const headers: Record<string, string> = {
    initial:        'NOTICE OF DISPUTE — FCRA § 611',
    follow_up:      'FOLLOW-UP NOTICE — FAILURE TO RESPOND',
    default_notice: 'NOTICE OF DEFAULT — FCRA VIOLATION',
  };

  const bodies: Record<string, string> = {
    initial:        `This letter constitutes formal written notice of dispute under the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681i. You are hereby notified that the undersigned disputes the accuracy and/or completeness of information maintained in your records. You are required by law to conduct a reasonable reinvestigation within 30 days of receipt of this notice.`,
    follow_up:      `This is a follow-up to our previous certified correspondence. To date, no response has been received. Your failure to respond within the statutory 30-day period constitutes a violation of the FCRA, 15 U.S.C. § 1681i. Continued non-compliance may result in civil liability under 15 U.S.C. § 1681n and § 1681o.`,
    default_notice: `NOTICE: You have failed to respond within the statutory 30-day window required by the FCRA, 15 U.S.C. § 1681i. This constitutes a willful violation of federal consumer protection law. The undersigned reserves all rights and remedies, including but not limited to civil action under 15 U.S.C. § 1681n (actual damages, punitive damages, and attorney's fees).`,
  };

  // Lob HTML format:
  // - DO NOT include a recipient address block in the HTML — Lob injects it automatically.
  // - The address region occupies approximately the top 3.5in of the first page.
  // - padding-top: 4in ensures letter body starts safely below the address window.
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

${!customBody ? `<p>This correspondence is transmitted via USPS Certified Mail with Return Receipt Requested. All rights reserved without prejudice. UCC 1-308.</p>
<p>Sincerely,</p>
<div class="sig-line"></div>
<p>Rickey Allan Howard, Grantor<br/>Howard Jones Bloodline Ancestral Trust<br/>P.O. Box 80054 | Athens, GA 30608</p>` : ''}

</div>
</body>
</html>`;
}

// ─── Known FCRA entity addresses (Lob format) ────────────────────────────────

export const FCRA_ENTITY_ADDRESSES: Record<string, LobRecipient> = {
  'transunion': {
    company:       'TransUnion LLC',
    address_line1: '555 W Adams St',
    address_city:  'Chicago',
    address_state: 'IL',
    address_zip:   '60661',
    displayAddress: '555 W Adams St, Chicago, IL 60661',
  },
  'equifax': {
    company:       'Equifax Information Services LLC',
    address_line1: 'P.O. Box 740256',
    address_city:  'Atlanta',
    address_state: 'GA',
    address_zip:   '30374',
    displayAddress: 'P.O. Box 740256, Atlanta, GA 30374',
  },
  'experian': {
    company:       'Experian Consumer Assistance',   // max 40 chars — Lob limit
    address_line1: 'P.O. Box 4500',
    address_city:  'Allen',
    address_state: 'TX',
    address_zip:   '75013',
    displayAddress: 'P.O. Box 4500, Allen, TX 75013',
  },
  'capital one': {
    company:       'Capital One Financial Corporation',
    address_line1: '1680 Capital One Drive',
    address_city:  'McLean',
    address_state: 'VA',
    address_zip:   '22102',
    displayAddress: '1680 Capital One Drive, McLean, VA 22102',
  },
  'citibank': {
    company:       'Citibank NA Legal Department',
    address_line1: '5800 S Corporate Pl',
    address_city:  'Sioux Falls',
    address_state: 'SD',
    address_zip:   '57108',
    displayAddress: '5800 S Corporate Pl, Sioux Falls, SD 57108',
  },
  'bank of america': {
    company:       'Bank of America Vehicle Loan Servicing',
    address_line1: '100 N Tryon St',
    address_city:  'Charlotte',
    address_state: 'NC',
    address_zip:   '28255',
    displayAddress: '100 N Tryon St, Charlotte, NC 28255',
  },
  'american express': {
    company:       'American Express Legal and Compliance',
    address_line1: 'P.O. Box 981535',
    address_city:  'El Paso',
    address_state: 'TX',
    address_zip:   '79998',
    displayAddress: 'P.O. Box 981535, El Paso, TX 79998',
  },
  'synchrony': {
    company:       'Synchrony Bank Legal Department',
    address_line1: 'P.O. Box 965035',
    address_city:  'Orlando',
    address_state: 'FL',
    address_zip:   '32896',
    displayAddress: 'P.O. Box 965035, Orlando, FL 32896',
  },
  'jpmorgan': {
    company:       'JPMorgan Chase Bank NA',
    address_line1: 'P.O. Box 15369',
    address_city:  'Wilmington',
    address_state: 'DE',
    address_zip:   '19850',
    displayAddress: 'P.O. Box 15369, Wilmington, DE 19850',
  },
  'chase': {
    company:       'JPMorgan Chase Bank NA',
    address_line1: 'P.O. Box 15369',
    address_city:  'Wilmington',
    address_state: 'DE',
    address_zip:   '19850',
    displayAddress: 'P.O. Box 15369, Wilmington, DE 19850',
  },
  'dun': {
    company:       'Dun and Bradstreet Legal Department',
    address_line1: '5335 Gate Pkwy',
    address_city:  'Jacksonville',
    address_state: 'FL',
    address_zip:   '32256',
    displayAddress: '5335 Gate Pkwy, Jacksonville, FL 32256',
  },
  'peach state': {
    company:        'Peach State Federal Credit Union',
    address_line1:  '1050 Gaines School Road',
    address_line2:  'Ste 100',
    address_city:   'Athens',
    address_state:  'GA',
    address_zip:    '30605',
    displayAddress: '1050 Gaines School Road Ste 100, Athens, GA 30605',
  },
  'intuit': {
    company:       'Intuit Financing Inc Legal Department',
    address_line1: '2700 Coast Ave',
    address_city:  'Mountain View',
    address_state: 'CA',
    address_zip:   '94043',
    displayAddress: '2700 Coast Ave, Mountain View, CA 94043',
  },
  'scj': {
    name:          'Kayla Risner',
    company:       'SCJ Commercial Financial Services',
    address_line1: '17507 S DuPont Highway STE. 2',
    address_city:  'Harrington',
    address_state: 'DE',
    address_zip:   '19952',
    displayAddress: '17507 S DuPont Highway STE. 2, Harrington, DE 19952',
  },
  'fundbox': {
    name:          'Kayla Risner',
    company:       'SCJ Commercial Financial Services',
    address_line1: '17507 S DuPont Highway STE. 2',
    address_city:  'Harrington',
    address_state: 'DE',
    address_zip:   '19952',
    displayAddress: '17507 S DuPont Highway STE. 2, Harrington, DE 19952',
  },
};

export function findEntityAddress(query: string): LobRecipient | null {
  const q = query.toLowerCase();
  for (const [key, addr] of Object.entries(FCRA_ENTITY_ADDRESSES)) {
    if (q.includes(key)) return addr;
  }
  return null;
}
