import https from 'https';
import fs from 'fs';

const token = fs.readFileSync(process.env.TEMP + '/sb_token.txt', 'utf8').trim();
const projectId = 'tvsxloejfsrdganemsmg';

async function run(sql, label) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const ok = !data.toLowerCase().includes('"error"') && !data.includes('ERROR:');
        console.log(ok ? `✅ ${label}` : `❌ ${label}: ${data.slice(0, 300)}`);
        resolve(ok);
      });
    });
    req.on('error', e => { console.error(label, e.message); resolve(false); });
    req.write(body);
    req.end();
  });
}

await run(
  `CREATE TABLE IF NOT EXISTS public.layman_law_knowledge (
    id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    volume_number integer     NOT NULL,
    topic         text        NOT NULL,
    key_name      text        NOT NULL UNIQUE,
    content       jsonb       NOT NULL,
    created_at    timestamptz DEFAULT now()
  );`,
  'Create layman_law_knowledge table'
);

await run(`ALTER TABLE public.layman_law_knowledge ENABLE ROW LEVEL SECURITY;`, 'Enable RLS');

await run(
  `DROP POLICY IF EXISTS "public_read_legal_knowledge" ON public.layman_law_knowledge;
   CREATE POLICY "public_read_legal_knowledge" ON public.layman_law_knowledge
   FOR SELECT TO authenticated USING (true);`,
  'Create read policy'
);

await run(
  `CREATE INDEX IF NOT EXISTS idx_layman_law_content_gin ON public.layman_law_knowledge USING gin(content);`,
  'Create GIN index'
);

// Seed 10 Volume I entries
const entries = [
  {
    volume_number: 1,
    key_name: 'fcra_dispute_procedure',
    topic: 'FCRA — How to Dispute a Credit Report Error',
    content: {
      summary: 'Under 15 U.S.C. 1681i, you have the right to dispute any inaccurate or incomplete information on your credit report. The bureau must investigate within 30 days and correct or delete unverifiable information.',
      steps: ['Write a dispute letter identifying each error clearly','Send via certified mail with return receipt to all three bureaus','Attach copies (not originals) of supporting documents','Bureau has 30 days to investigate','If unverifiable, item must be deleted'],
      key_statute: '15 U.S.C. 1681i', deadline_days: 30, guardrail: false
    }
  },
  {
    volume_number: 1,
    key_name: 'fdcpa_debt_validation',
    topic: 'FDCPA — Your Right to Validate a Debt',
    content: {
      summary: 'Under 15 U.S.C. 1692g, when a debt collector contacts you, you have 30 days to request written verification of the debt. They must stop collection activity until they provide it.',
      steps: ['Send written validation request within 30 days of first contact','Send via certified mail return receipt','Request original creditor name, itemized amount, chain of assignment','Collector must cease all collection until validation is provided'],
      key_statute: '15 U.S.C. 1692g', deadline_days: 30, guardrail: false
    }
  },
  {
    volume_number: 1,
    key_name: 'cease_and_desist',
    topic: 'FDCPA — How to Stop Debt Collector Contact',
    content: {
      summary: 'Under 15 U.S.C. 1692c(c), you can send a written cease and desist letter to stop a debt collector from contacting you. They may only contact you one final time after receipt.',
      steps: ['Write a cease and desist letter','Send via certified mail return receipt','Collector may only contact you once more after receipt','Any additional contact = FDCPA violation — $1,000 statutory damages'],
      key_statute: '15 U.S.C. 1692c(c)', deadline_days: null, guardrail: false
    }
  },
  {
    volume_number: 1,
    key_name: 'tila_disclosure_rights',
    topic: 'TILA — Truth in Lending Disclosure Rights',
    content: {
      summary: 'Under 15 U.S.C. 1601, creditors must clearly disclose APR, total finance charge, total amount financed, and total repayment amount before you sign. Failure to disclose gives you rescission rights.',
      steps: ['Request full TILA disclosure before signing any credit agreement','Verify APR, total finance charge, and total payments are clearly stated','For home loans: 3 business days to rescind after signing','If disclosures were improper — rescission rights up to 3 years'],
      key_statute: '15 U.S.C. 1601', deadline_days: 3, guardrail: false
    }
  },
  {
    volume_number: 1,
    key_name: 'cfpb_complaint_procedure',
    topic: 'How to File a CFPB Complaint',
    content: {
      summary: 'The CFPB accepts complaints against banks, debt collectors, and credit bureaus. Filing creates a federal record and companies must respond within 15 days.',
      steps: ['Go to consumerfinance.gov/complaint','Select the type of product','Describe what happened clearly and factually','Attach supporting documents','CFPB forwards to company — response required within 15 days','You receive a tracking number'],
      key_statute: '12 U.S.C. 5493', deadline_days: 15, guardrail: false
    }
  },
  {
    volume_number: 1,
    key_name: 'statute_of_limitations',
    topic: 'Statute of Limitations on Debt Collection',
    content: {
      summary: 'Georgia statute of limitations on written contracts is 6 years (O.C.G.A. 9-3-24). After this window collectors cannot sue to enforce the debt.',
      steps: ['Determine when debt first became delinquent','Georgia: 6 years for written contracts','Do NOT make any payment on a time-barred debt — it can restart the clock','If sued on a time-barred debt — raise statute of limitations as affirmative defense'],
      key_statute: 'O.C.G.A. 9-3-24', deadline_days: null, guardrail: false
    }
  },
  {
    volume_number: 1,
    key_name: 'credit_reporting_timeline',
    topic: 'How Long Negative Items Stay on Your Credit Report',
    content: {
      summary: 'Under 15 U.S.C. 1681c, most negative items can only remain on your credit report for 7 years. Bankruptcy Chapter 7 stays for 10 years.',
      items: {'Late payments':'7 years from first delinquency','Charge-offs':'7 years from original delinquency','Collections':'7 years from original delinquency','Chapter 7 bankruptcy':'10 years','Chapter 13 bankruptcy':'7 years','Hard inquiries':'2 years','Medical debt under $500':'Cannot be reported (CFPB 2025 rule)'},
      key_statute: '15 U.S.C. 1681c', guardrail: false
    }
  },
  {
    volume_number: 1,
    key_name: 'fdcpa_prohibited_acts',
    topic: 'What Debt Collectors Are Prohibited From Doing',
    content: {
      summary: 'The FDCPA prohibits abusive, deceptive, and unfair collection practices. Violations give you the right to sue for $1,000 statutory damages plus actual damages plus attorney fees.',
      prohibited: ['Calling before 8 AM or after 9 PM','Using profane or abusive language','False statements (claiming to be an attorney, threatening arrest for civil debt)','Misrepresenting the amount owed','Contacting third parties about your debt','Continuing contact after written cease and desist'],
      remedy: 'Sue in federal district court within 1 year — $1,000 statutory damages + actual damages + attorney fees',
      key_statute: '15 U.S.C. 1692', guardrail: false
    }
  },
  {
    volume_number: 1,
    key_name: 'dispossessory_defense',
    topic: 'Georgia Eviction (Dispossessory) — Your 7-Day Rule',
    content: {
      summary: 'In Georgia, when you receive a dispossessory summons you have exactly 7 calendar days to file a written answer. Missing this deadline results in automatic default judgment.',
      steps: ['File written answer at Magistrate Court within 7 calendar days','Assert all defenses simultaneously: improper notice, habitability, retaliation, discrimination','Pay any undisputed rent into court registry if you want to stay','Request jury trial in your answer if applicable'],
      key_statute: 'O.C.G.A. 44-7-56', deadline_days: 7, critical: true, guardrail: false
    }
  },
  {
    volume_number: 1,
    key_name: 'guardrail_scope_boundary',
    topic: 'SYSTEM GUARDRAIL — Scope Boundary',
    content: {
      summary: 'This knowledge base covers verifiable federal and state consumer protection statutes only.',
      redirect: 'For questions about FCRA, FDCPA, TILA, Georgia consumer law, CFPB procedures, or basic tenant rights I can help directly. For broader legal strategy specific to your situation, consult a licensed attorney.',
      guardrail: true
    }
  }
];

for (const e of entries) {
  const contentStr = JSON.stringify(e.content).replace(/'/g, "''");
  const topicStr = e.topic.replace(/'/g, "''");
  await run(
    `INSERT INTO public.layman_law_knowledge (volume_number, topic, key_name, content)
     VALUES (${e.volume_number}, '${topicStr}', '${e.key_name}', '${contentStr}')
     ON CONFLICT (key_name) DO NOTHING;`,
    `Seed: ${e.key_name}`
  );
}

console.log('\nLayman Law foundation complete.');
