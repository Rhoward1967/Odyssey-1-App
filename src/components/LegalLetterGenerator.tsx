import { useState } from 'react';
import { FileText, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SYSTEM_PROMPT = `You are a consumer protection legal letter drafting assistant. Generate professional, court-ready letters using ONLY legitimate federal and state law.

LEGAL STANDARDS:
- 15 USC §1692g — Debt validation requirements (FDCPA)
- 15 USC §1692c — Cease communication requirements (FDCPA)
- 15 USC §1681 — Credit report dispute rights (FCRA)
- O.C.G.A. §9-3-24 — Georgia 6-year SOL (written contracts)
- O.C.G.A. §9-3-25 — Georgia 4-year SOL (oral agreements)

FORBIDDEN: No sovereign citizen theories, no redemption theory, no strawman arguments. ONLY legitimate consumer protection law.

FORMAT:
- Professional business letter format
- Today's date, sender block, recipient block
- Re: line with account reference
- Body with clear legal citations
- Closing with signature block placeholder [YOUR NAME] / [YOUR ADDRESS]
- Send via: Certified Mail, Return Receipt Requested`;

type LetterType = 'validation' | 'dispute' | 'cease' | 'settlement';

const LETTER_TYPES: { key: LetterType; label: string; description: string; color: string }[] = [
  { key: 'validation', label: 'Debt Validation Request', description: '15 USC §1692g — 30-day window', color: 'border-blue-500 bg-blue-900/20' },
  { key: 'dispute', label: 'Credit Report Dispute', description: '15 USC §1681 — FCRA dispute', color: 'border-purple-500 bg-purple-900/20' },
  { key: 'cease', label: 'Cease & Desist', description: '15 USC §1692c — Stop all contact', color: 'border-red-500 bg-red-900/20' },
  { key: 'settlement', label: 'Settlement Offer', description: 'Negotiate reduced payoff', color: 'border-green-500 bg-green-900/20' },
];

function buildPrompt(type: LetterType, fields: Record<string, string>): string {
  const base = `Generate a ${type} letter for the following situation:\n\nCreditor/Collector: ${fields.creditor}\nAccount Number: ${fields.account || 'Unknown'}\nAmount Claimed: ${fields.amount ? '$' + fields.amount : 'Unknown'}\nDate of First Contact/Letter: ${fields.date || 'Unknown'}\n${fields.settlement ? 'Settlement Offer: $' + fields.settlement + '\n' : ''}${fields.notes ? 'Additional Context: ' + fields.notes + '\n' : ''}`;

  const instructions: Record<LetterType, string> = {
    validation: 'Generate a formal debt validation demand letter under 15 USC §1692g. Demand: (1) name of original creditor, (2) itemized amount breakdown, (3) proof of legal right to collect, (4) copy of original signed agreement. State that collector must cease collection activity until validation is provided.',
    dispute: 'Generate a FCRA credit report dispute letter under 15 USC §1681. Dispute the accuracy of this account on all three credit bureaus. Demand investigation within 30 days. State that failure to verify must result in deletion.',
    cease: 'Generate a cease and desist letter under 15 USC §1692c(c). Instruct the collector to stop ALL communications immediately. State the only permissible future contacts. Warn of FDCPA litigation if contact continues.',
    settlement: `Generate a settlement offer letter. Offer ${fields.settlement ? '$' + fields.settlement : 'a reduced amount'} as full satisfaction of the alleged debt. Include: full release of all claims, deletion from all credit bureaus, no 1099-C issuance (or acknowledgment if unavoidable), confidentiality clause. State offer expires in 15 days.`,
  };

  return base + '\n\nInstructions: ' + instructions[type];
}

interface Props { onBack: () => void; }

export default function LegalLetterGenerator({ onBack }: Props) {
  const [letterType, setLetterType] = useState<LetterType>('validation');
  const [fields, setFields] = useState({ creditor: '', account: '', amount: '', date: '', settlement: '', notes: '' });
  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields(f => ({ ...f, [k]: e.target.value }));

  const generate = async () => {
    if (!fields.creditor.trim()) return;
    setLoading(true);
    setLetter('');
    try {
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({
          provider: 'anthropic',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildPrompt(letterType, fields) },
          ],
        }),
      });
      const data = await res.json();
      setLetter(data.response || 'Error generating letter.');
    } catch {
      setLetter('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="col-span-3 flex flex-col space-y-4" style={{ maxHeight: 560, overflowY: 'auto' }}>
      <div className="flex items-center gap-3 sticky top-0 bg-transparent pb-1">
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-white transition-colors shrink-0">
          &larr; Back
        </button>
        <span className="text-white font-semibold text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          Legal Letter Generator
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {LETTER_TYPES.map(lt => (
          <button
            key={lt.key}
            onClick={() => setLetterType(lt.key)}
            className={`text-left px-3 py-2.5 rounded-xl border transition-colors ${
              letterType === lt.key ? lt.color : 'border-slate-700 bg-slate-800/50 hover:bg-slate-700/50'
            }`}
          >
            <p className="text-sm font-semibold text-white">{lt.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{lt.description}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-gray-300 text-xs">Creditor / Collector Name *</Label>
          <Input value={fields.creditor} onChange={set('creditor')} placeholder="e.g. Midland Credit Management" className="bg-slate-700 border-slate-600 text-white text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-gray-300 text-xs">Account Number</Label>
          <Input value={fields.account} onChange={set('account')} placeholder="Last 4 digits OK" className="bg-slate-700 border-slate-600 text-white text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-gray-300 text-xs">Amount Claimed ($)</Label>
          <Input value={fields.amount} onChange={set('amount')} placeholder="e.g. 4500" type="number" className="bg-slate-700 border-slate-600 text-white text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-gray-300 text-xs">Date of First Contact</Label>
          <Input value={fields.date} onChange={set('date')} type="date" className="bg-slate-700 border-slate-600 text-white text-sm" />
        </div>
        {letterType === 'settlement' && (
          <div className="space-y-1.5 col-span-2">
            <Label className="text-gray-300 text-xs">Settlement Offer ($)</Label>
            <Input value={fields.settlement} onChange={set('settlement')} placeholder="e.g. 1200" type="number" className="bg-slate-700 border-slate-600 text-white text-sm" />
          </div>
        )}
        <div className="space-y-1.5 col-span-2">
          <Label className="text-gray-300 text-xs">Additional Context (optional)</Label>
          <textarea
            value={fields.notes}
            onChange={set('notes')}
            placeholder="Any specific violations, dates of contact, harassment, etc."
            rows={2}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 resize-none transition-colors"
          />
        </div>
      </div>

      <Button onClick={generate} disabled={!fields.creditor.trim() || loading} className="bg-blue-600 hover:bg-blue-700 w-full">
        {loading ? 'Generating Letter...' : 'Generate Letter'}
      </Button>

      {letter && (
        <div className="bg-slate-900 border border-slate-600 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800">
            <span className="text-xs text-gray-400 font-medium">GENERATED LETTER — Review before sending</span>
            <button onClick={copy} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="p-4 max-h-80 overflow-y-auto">
            <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono leading-relaxed">{letter}</pre>
          </div>
          <div className="px-4 py-2 border-t border-slate-700 bg-slate-800/50">
            <p className="text-xs text-yellow-500">Send via Certified Mail, Return Receipt Requested. Keep your tracking number.</p>
          </div>
        </div>
      )}
    </div>
  );
}
