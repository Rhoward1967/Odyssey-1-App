import { useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { Button } from './ui/button';

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SYSTEM_PROMPT = `You are the Counter-Canon legal reference system — a Dictionary of Living Law authored by Rickey Allan Howard (Howard Jones Bloodline Ancestral Trust).

For any legal term provided, return the full 7-part Counter-Canon analysis:

1. DOMINANT DEFINITION — How the system currently deploys this word against people
2. EMBEDDED ASSUMPTION — The unstated premise the dominant definition relies on
3. COUNTER-DEFINITION — The legally grounded alternative definition (cite real statutes/cases)
4. AUTHORITY — Statutory and case law that supports the counter-definition
5. PRACTICAL APPLICATION — Exactly how to deploy this counter-definition in a real situation
6. THE TRUTH — The irreducible statement about this word that exists beyond legal argument
7. STRATEGIC NOTE — One tactical observation about how this word is weaponized and how to neutralize it

Format each section clearly with the section label bolded. Be precise, cite real law. No pseudolaw.

The Counter-Canon covers these volumes:
- Vol. 1: Foundational words (Citizen, Person, Commerce, Labor, Property, Sovereign)
- Vol. 2: Transactional words (Contract, Jurisdiction, Debt, Evidence, Tax)
- Vol. 3: Enforcement words (Detention, Search, Arrest, Force, Warrant)
- Vol. 4: Land/Heritage words (Land, Title, Ownership, Ancestral, Sacred)
- Vol. 5: Spiritual words (Religion, Belief, Conscience, Sincerity, Burden)
- Vol. 6: Equity words (Race, Discrimination, Badge, Remedy, Equality)
- Vol. 7: Administrative words (Agency, Regulation, Ultra Vires, Mandate)
- Vol. 8: Latin Root Dictionary (etymology as legal precision tool)`;

const QUICK_TERMS = [
  'Citizen', 'Person', 'Debt', 'Contract', 'Jurisdiction',
  'Property', 'Labor', 'Commerce', 'Sovereign', 'Warrant',
  'Evidence', 'Mandate', 'Agency', 'Title', 'Remedy',
];

interface Section {
  label: string;
  content: string;
  color: string;
}

function parseResponse(text: string): Section[] {
  const LABELS = [
    { key: '1. DOMINANT DEFINITION', label: 'Dominant Definition', color: 'text-red-300' },
    { key: '2. EMBEDDED ASSUMPTION', label: 'Embedded Assumption', color: 'text-orange-300' },
    { key: '3. COUNTER-DEFINITION', label: 'Counter-Definition', color: 'text-green-300' },
    { key: '4. AUTHORITY', label: 'Authority', color: 'text-blue-300' },
    { key: '5. PRACTICAL APPLICATION', label: 'Practical Application', color: 'text-purple-300' },
    { key: '6. THE TRUTH', label: 'The Truth', color: 'text-yellow-300' },
    { key: '7. STRATEGIC NOTE', label: 'Strategic Note', color: 'text-teal-300' },
  ];

  const sections: Section[] = [];
  for (let i = 0; i < LABELS.length; i++) {
    const start = text.indexOf(LABELS[i].key);
    if (start === -1) continue;
    const end = i < LABELS.length - 1 ? text.indexOf(LABELS[i + 1].key) : undefined;
    const raw = end !== undefined ? text.slice(start, end) : text.slice(start);
    const content = raw.replace(LABELS[i].key, '').replace(/^[\s:—\-]+/, '').trim();
    if (content) sections.push({ label: LABELS[i].label, content, color: LABELS[i].color });
  }
  return sections.length >= 3 ? sections : [{ label: 'Analysis', content: text, color: 'text-gray-200' }];
}

interface Props { onBack: () => void; }

export default function LegalCounterCanon({ onBack }: Props) {
  const [term, setTerm] = useState('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState('');

  const lookup = async (t?: string) => {
    const query = (t || term).trim();
    if (!query || loading) return;
    setLoading(true);
    setResult('');
    setSearched(query);

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
            { role: 'user', content: `Counter-Canon analysis for the legal term: "${query}"` },
          ],
        }),
      });
      const data = await res.json();
      setResult(data.response || 'No result returned.');
    } catch {
      setResult('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const sections = result ? parseResponse(result) : [];

  return (
    <div className="col-span-3 flex flex-col space-y-4" style={{ maxHeight: 560, overflowY: 'auto' }}>
      <div className="flex items-center gap-3 sticky top-0 bg-transparent pb-1">
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-white transition-colors shrink-0">
          &larr; Back
        </button>
        <span className="text-white font-semibold text-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-yellow-400" />
          Counter-Canon — Dictionary of Living Law
        </span>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 focus-within:border-yellow-500 transition-colors">
          <Search className="w-4 h-4 text-gray-500 shrink-0" />
          <input
            value={term}
            onChange={e => setTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && lookup()}
            placeholder="Enter any legal term..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
        </div>
        <Button onClick={() => lookup()} disabled={!term.trim() || loading} className="bg-yellow-600 hover:bg-yellow-700 shrink-0">
          {loading ? 'Looking up...' : 'Look Up'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_TERMS.map(t => (
          <button
            key={t}
            onClick={() => { setTerm(t); lookup(t); }}
            className="px-2.5 py-1 rounded-full text-xs bg-slate-700 text-gray-300 hover:bg-yellow-800/40 hover:text-yellow-300 transition-colors"
          >
            {t}
          </button>
        ))}
      </div>

      {loading && (
        <div className="bg-slate-800 rounded-xl p-6 text-center">
          <div className="animate-pulse text-yellow-400 text-sm">Consulting the Counter-Canon...</div>
        </div>
      )}

      {!loading && sections.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
            <span className="text-white font-bold text-base">&ldquo;{searched}&rdquo;</span>
            <span className="text-xs text-gray-500">Counter-Canon Analysis</span>
          </div>
          {sections.map((s, i) => (
            <div key={i} className="bg-slate-800/60 rounded-xl px-4 py-3">
              <p className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${s.color}`}>{s.label}</p>
              <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{s.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
