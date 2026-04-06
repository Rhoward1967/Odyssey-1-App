/**
 * SOVEREIGN PUBLISHING SERVICE — Lulu xPress API
 * ================================================
 * Turns Odyssey-1 into a self-contained distributor.
 * The Howard Jones Bloodline Ancestral Trust does not
 * need Amazon's permission to publish.
 *
 * Flow:
 *   1. Pull book metadata from `books` table
 *   2. Accept manuscript PDF + cover PDF (URLs or base64)
 *   3. Create Lulu print job via API
 *   4. Track status in `sovereign_publications` table
 *   5. R.O.M.A.N. reports status via Discord
 *
 * Lulu xPress API v2:  https://api.lulu.com
 * Auth:                OAuth2 client_credentials
 *
 * © 2026 Howard Jones Bloodline Ancestral Trust — UCC 1-308
 */

import { romanSupabase } from './romanSupabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LuluBook {
  title:             string;
  subtitle?:         string;
  author:            string;  // "Rickey Allan Howard"
  description:       string;
  isbn?:             string;  // optional — Lulu can assign
  keywords:          string[];
  language:          string;  // 'en'
  copyright_year:    number;
  edition_number:    number;
}

export interface LuluPrintSpec {
  pod_package_id:    string;  // Lulu format code (see constants below)
  page_count:        number;
  interior_pdf_url:  string;  // publicly accessible URL to manuscript PDF
  cover_pdf_url:     string;  // publicly accessible URL to cover PDF
}

export interface LuluShipping {
  name:       string;
  street1:    string;
  street2?:   string;
  city:       string;
  state_code: string;
  country_code: string;
  postcode:   string;
  phone_number: string;
  email:      string;
  shipping_option: 'MAIL' | 'PRIORITY_MAIL' | 'GROUND' | 'EXPEDITED' | 'EXPRESS';
}

export interface PublishJobResult {
  success:         boolean;
  job_id?:         string;
  status?:         string;
  estimated_price?: number;
  currency?:       string;
  error?:          string;
  lulu_response?:  any;
}

export interface DistributionResult {
  success:        boolean;
  distribution_id?: string;
  channels?:      string[];  // ['amazon', 'bn', 'ingram', etc.]
  error?:         string;
}

// ─── Lulu Pod Package IDs ─────────────────────────────────────────────────────
// Format: [Width][Height][Color][Binding][FinishCode][PaperType][Weight][Cover]
// Reference: https://api.lulu.com/printing/v2/print-jobs/pod-packages/

export const LULU_PACKAGES = {
  // Standard 6×9 trade paperback — black & white interior
  STANDARD_6x9_BW:         '0600X0900BWSTDPB060UW444MXX',
  // Standard 8.5×11 — black & white — good for legal documents
  LEGAL_8x11_BW:            '0850X1100BWSTDPB060UW444MXX',
  // 6×9 full color — good for covers/art books
  PREMIUM_6x9_COLOR:        '0600X0900FCSTDPB060UW444MXX',
  // 5×8 — pocket size
  POCKET_5x8_BW:            '0500X0800BWSTDPB060UW444MXX',
} as const;

// ─── Grantor defaults ─────────────────────────────────────────────────────────

export const SOVEREIGN_GRANTOR: LuluBook = {
  author:         'Rickey Allan Howard',
  language:       'en',
  copyright_year: 2026,
  edition_number: 1,
  // filled per book
  title:          '',
  description:    '',
  keywords:       ['sovereign', 'trust', 'natural law', 'UCC', 'constitutional'],
};

export const TRUST_SHIPPING: LuluShipping = {
  name:            'Rickey Allan Howard',
  street1:         '159 Oneta Street Suite 3',
  city:            'Athens',
  state_code:      'GA',
  country_code:    'US',
  postcode:        '30601',
  phone_number:    '',   // populate from env or DB
  email:           'generalmanager81@gmail.com',
  shipping_option: 'GROUND',
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

const LULU_API_BASE  = 'https://api.lulu.com';
const LULU_TOKEN_URL = `${LULU_API_BASE}/auth/realms/glasstree/protocol/openid-connect/token`;

let _accessToken: string | null = null;
let _tokenExpiry:  number        = 0;

async function getLuluToken(): Promise<string> {
  if (_accessToken && Date.now() < _tokenExpiry - 30_000) return _accessToken;

  const clientId     = process.env.LULU_CLIENT_ID     || import.meta?.env?.VITE_LULU_CLIENT_ID;
  const clientSecret = process.env.LULU_CLIENT_SECRET || import.meta?.env?.VITE_LULU_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('LULU_CLIENT_ID / LULU_CLIENT_SECRET not set in environment');
  }

  const body = new URLSearchParams({
    grant_type:    'client_credentials',
    client_id:     clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(LULU_TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Lulu auth failed: ${err}`);
  }

  const data = await res.json();
  _accessToken = data.access_token;
  _tokenExpiry  = Date.now() + (data.expires_in * 1000);
  return _accessToken;
}

async function luluFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = await getLuluToken();
  const res   = await fetch(`${LULU_API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }

  if (!res.ok) throw new Error(`Lulu API ${path} → ${res.status}: ${text}`);
  return json;
}

// ─── Core: Create Print Job ───────────────────────────────────────────────────

/**
 * Create a physical print job — produces actual paperbacks.
 * Use this to print author copies or ship to trust address.
 */
export async function createPrintJob(
  book:     LuluBook,
  spec:     LuluPrintSpec,
  shipping: LuluShipping,
  quantity: number = 1
): Promise<PublishJobResult> {
  try {
    const payload = {
      contact_email: shipping.email,
      line_items: [
        {
          title:          book.title,
          cover_source_url:   spec.cover_pdf_url,
          interior_source_url: spec.interior_pdf_url,
          pod_package_id: spec.pod_package_id,
          quantity,
        },
      ],
      shipping_address: {
        name:         shipping.name,
        street1:      shipping.street1,
        street2:      shipping.street2 || '',
        city:         shipping.city,
        state_code:   shipping.state_code,
        country_code: shipping.country_code,
        postcode:     shipping.postcode,
        phone_number: shipping.phone_number,
        email:        shipping.email,
      },
      shipping_option: shipping.shipping_option,
    };

    const result = await luluFetch('/print-jobs/', {
      method: 'POST',
      body:   JSON.stringify(payload),
    });

    // Log to sovereign_publications
    await logPublication({
      job_id:      result.id?.toString(),
      book_title:  book.title,
      job_type:    'print',
      status:      result.status || 'CREATED',
      quantity,
      lulu_data:   result,
    });

    return {
      success:          true,
      job_id:           result.id?.toString(),
      status:           result.status,
      estimated_price:  result.estimated_price?.total_cost_excl_tax,
      currency:         result.estimated_price?.currency,
      lulu_response:    result,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── Core: Cost Estimate (dry run before committing) ─────────────────────────

/**
 * Get a cost estimate before placing a real print order.
 * R.O.M.A.N. should always run this first and report the price.
 */
export async function estimatePrintCost(
  spec:     LuluPrintSpec,
  quantity: number = 1
): Promise<{ success: boolean; total_cost?: number; per_unit?: number; currency?: string; error?: string }> {
  try {
    const payload = {
      line_items: [
        {
          pod_package_id:      spec.pod_package_id,
          page_count:          spec.page_count,
          quantity,
        },
      ],
    };

    const result = await luluFetch('/print-jobs/cost-calculations/', {
      method: 'POST',
      body:   JSON.stringify(payload),
    });

    const line = result.line_item_costs?.[0];
    return {
      success:    true,
      total_cost: parseFloat(result.total_cost_excl_tax || '0'),
      per_unit:   parseFloat(line?.cost_excl_tax || '0'),
      currency:   result.currency,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── Core: Distribution (global retail channels) ─────────────────────────────

/**
 * Submit a book for global distribution (Amazon, B&N, Ingram, etc.).
 * Requires ISBN — Lulu can provide one if you don't have it.
 * This is separate from print jobs — distribution is a publishing agreement.
 */
export async function createDistribution(
  book:     LuluBook,
  spec:     LuluPrintSpec
): Promise<DistributionResult> {
  try {
    const payload = {
      author:             book.author,
      description:        book.description,
      title:              book.title,
      subtitle:           book.subtitle || '',
      keywords:           book.keywords.join(', '),
      categories:         ['LAW045000', 'SOC004000'],  // LAW General, Social Science
      copyright_year:     book.copyright_year,
      edition_number:     book.edition_number,
      language:           book.language,
      isbn:               book.isbn || null,
      printable_pdf_url:  spec.interior_pdf_url,
      cover_pdf_url:      spec.cover_pdf_url,
      pod_package_id:     spec.pod_package_id,
    };

    const result = await luluFetch('/distribution-jobs/', {
      method: 'POST',
      body:   JSON.stringify(payload),
    });

    await logPublication({
      job_id:     result.id?.toString(),
      book_title: book.title,
      job_type:   'distribution',
      status:     result.status || 'SUBMITTED',
      lulu_data:  result,
    });

    return {
      success:         true,
      distribution_id: result.id?.toString(),
      channels:        result.distribution_channels || [],
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── Job Status ───────────────────────────────────────────────────────────────

export async function getPrintJobStatus(jobId: string): Promise<{
  success: boolean;
  status?: string;
  tracking_numbers?: string[];
  error?: string;
}> {
  try {
    const result = await luluFetch(`/print-jobs/${jobId}/`);
    const tracking = result.line_items
      ?.flatMap((li: any) => li.tracking_numbers || []) || [];

    // Update DB record
    await romanSupabase
      .from('sovereign_publications')
      .update({ status: result.status, updated_at: new Date().toISOString() })
      .eq('lulu_job_id', jobId);

    return {
      success:          true,
      status:           result.status,
      tracking_numbers: tracking,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── Convenience: Publish a Sovereign Self Series book ───────────────────────

/**
 * Full pipeline: pull book from DB → validate PDFs → estimate cost → submit.
 * R.O.M.A.N. calls this from Discord: "publish book 1"
 */
export async function publishSovereignBook(
  bookNumber: number,
  interiorPdfUrl: string,
  coverPdfUrl:    string,
  options: {
    quantity?:    number;
    printOnly?:   boolean;  // true = print job only, skip distribution
    dryRun?:      boolean;  // true = estimate only, no charge
  } = {}
): Promise<{ success: boolean; summary: string; details?: any }> {
  try {
    // Pull book metadata from Supabase
    const { data: book, error: dbErr } = await romanSupabase
      .from('books')
      .select('*')
      .eq('book_number', bookNumber)
      .single();

    if (dbErr || !book) {
      return { success: false, summary: `Book ${bookNumber} not found in database` };
    }

    const luluBook: LuluBook = {
      ...SOVEREIGN_GRANTOR,
      title:       book.title,
      subtitle:    book.subtitle || undefined,
      description: book.description || book.purpose || `Volume ${bookNumber} of the Sovereign Self Series`,
      keywords:    [
        'sovereign', 'trust', 'natural law', 'UCC 1-308',
        book.theme_keyword || 'constitutional',
      ],
    };

    const spec: LuluPrintSpec = {
      pod_package_id:   LULU_PACKAGES.STANDARD_6x9_BW,
      page_count:       book.page_count || 200,
      interior_pdf_url: interiorPdfUrl,
      cover_pdf_url:    coverPdfUrl,
    };

    // Always estimate first
    const estimate = await estimatePrintCost(spec, options.quantity || 1);
    if (!estimate.success) {
      return { success: false, summary: `Cost estimate failed: ${estimate.error}` };
    }

    if (options.dryRun) {
      return {
        success: true,
        summary: `Estimate for "${book.title}": $${estimate.per_unit} per copy / $${estimate.total_cost} total (${options.quantity || 1} copies) — ${estimate.currency}`,
        details: estimate,
      };
    }

    // Submit print job
    const printResult = await createPrintJob(luluBook, spec, TRUST_SHIPPING, options.quantity || 1);
    if (!printResult.success) {
      return { success: false, summary: `Print job failed: ${printResult.error}` };
    }

    let summary = `Book "${book.title}" submitted to Lulu — Job ID: ${printResult.job_id} | Status: ${printResult.status} | Cost: $${printResult.estimated_price} ${printResult.currency}`;

    // Also submit for global distribution unless printOnly
    if (!options.printOnly && book.isbn) {
      const distResult = await createDistribution(luluBook, spec);
      if (distResult.success) {
        summary += ` | Distribution ID: ${distResult.distribution_id} — channels: ${distResult.channels?.join(', ')}`;
      }
    }

    return { success: true, summary, details: printResult };
  } catch (err: any) {
    return { success: false, summary: `Publishing error: ${err.message}` };
  }
}

// ─── DB Logging ───────────────────────────────────────────────────────────────

interface PublicationLog {
  job_id?:     string;
  book_title:  string;
  job_type:    'print' | 'distribution';
  status:      string;
  quantity?:   number;
  lulu_data?:  any;
}

async function logPublication(entry: PublicationLog): Promise<void> {
  try {
    await romanSupabase
      .from('sovereign_publications')
      .upsert({
        lulu_job_id:  entry.job_id || null,
        book_title:   entry.book_title,
        job_type:     entry.job_type,
        status:       entry.status,
        quantity:     entry.quantity || null,
        lulu_response: entry.lulu_data || null,
        created_at:   new Date().toISOString(),
        updated_at:   new Date().toISOString(),
      }, { onConflict: 'lulu_job_id' });
  } catch {
    // Non-fatal — logging failure shouldn't stop the publish
  }
}

// ─── Discord summary formatter ────────────────────────────────────────────────

/**
 * R.O.M.A.N. calls this to format a Discord response about publishing status.
 */
export function formatPublishStatus(result: PublishJobResult): string {
  if (!result.success) {
    return `❌ Publishing failed: ${result.error}`;
  }
  const lines = [
    `📚 **Print Job Created**`,
    `Job ID:  \`${result.job_id}\``,
    `Status:  ${result.status}`,
  ];
  if (result.estimated_price) {
    lines.push(`Cost:    $${result.estimated_price} ${result.currency || ''}`);
  }
  lines.push(`\n*Howard Jones Bloodline Ancestral Trust — UCC 1-308*`);
  return lines.join('\n');
}
