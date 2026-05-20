import { useState } from 'react';
import { Shield, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { romanLegalService, SOVEREIGN_TOOLKIT_REGISTRY, type ScenarioRouteResult } from '@/services/romanLegalService';

const TOOLKIT_COLORS: Record<string, string> = {
  'TK-01': 'border-red-500 bg-red-900/20',
  'TK-02': 'border-yellow-500 bg-yellow-900/20',
  'TK-03': 'border-blue-500 bg-blue-900/20',
  'TK-04': 'border-purple-500 bg-purple-900/20',
  'TK-05': 'border-green-500 bg-green-900/20',
  'TK-06': 'border-orange-500 bg-orange-900/20',
  'TK-07': 'border-teal-500 bg-teal-900/20',
};

const TOOLKIT_ACCENT: Record<string, string> = {
  'TK-01': 'text-red-300',
  'TK-02': 'text-yellow-300',
  'TK-03': 'text-blue-300',
  'TK-04': 'text-purple-300',
  'TK-05': 'text-green-300',
  'TK-06': 'text-orange-300',
  'TK-07': 'text-teal-300',
};

interface Props { onBack: () => void; }

export default function LegalScenarioAnalyzer({ onBack }: Props) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ScenarioRouteResult | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const analyze = () => {
    if (!input.trim()) return;
    const r = romanLegalService.analyzeScenario(input);
    setResult(r);
  };

  const selectToolkit = (id: string) => {
    const tk = Object.values(SOVEREIGN_TOOLKIT_REGISTRY).find(t => t.id === id);
    if (!tk) return;
    setResult({
      matched: true,
      toolkit: tk,
      triggersMatched: [],
      immediateAction: tk.immediate_action,
      counterCanonWordsInPlay: tk.counter_canon_volumes,
      linguisticWarning: '',
      standingAssertion: tk.standing_assertion,
    });
    setInput('');
  };

  return (
    <div className="col-span-3 flex flex-col space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-white transition-colors">
          &larr; Back
        </button>
        <span className="text-white font-semibold text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-400" />
          Sovereign Toolkit — Scenario Analyzer
        </span>
      </div>

      <div className="space-y-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Describe your situation... (e.g. 'I was pulled over and the officer wants to search my car' or 'I received a collection letter from a debt collector' or 'I was served a court summons')"
          rows={3}
          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-green-500 resize-none transition-colors"
        />
        <Button onClick={analyze} disabled={!input.trim()} className="bg-green-600 hover:bg-green-700 w-full">
          Analyze Situation — Route to Toolkit
        </Button>
      </div>

      {result && (
        <div className={`rounded-xl border p-4 space-y-4 ${result.matched && result.toolkit ? TOOLKIT_COLORS[result.toolkit.id] : 'border-slate-600 bg-slate-800'}`}>
          {result.matched && result.toolkit ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${TOOLKIT_ACCENT[result.toolkit.id]}`}>
                    {result.toolkit.id} — {result.toolkit.title}
                  </span>
                  {result.triggersMatched.length > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Matched: {result.triggersMatched.join(', ')}
                    </p>
                  )}
                </div>
                <span className="text-xs text-green-400 font-semibold bg-green-900/40 px-2 py-0.5 rounded">TOOLKIT ACTIVE</span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Immediate Action</p>
                <p className="text-sm text-white leading-relaxed">{result.toolkit.immediate_action}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Standing Assertion</p>
                <p className="text-sm text-gray-200 leading-relaxed italic">&ldquo;{result.toolkit.standing_assertion}&rdquo;</p>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Core Protocol</p>
                  <p className="text-sm text-gray-300">{result.toolkit.core_protocol}</p>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Counter-Canon</p>
                  <p className="text-sm text-gray-300">{result.toolkit.counter_canon_volumes.join(', ')}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Primary Defense</p>
                <p className="text-sm text-gray-300">{result.toolkit.primary_defense}</p>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-300 font-semibold text-sm">No specific toolkit matched</p>
                <p className="text-gray-400 text-xs mt-1">Try being more specific, or browse all 7 toolkits below.</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="border border-slate-700 rounded-xl overflow-hidden">
        <button
          onClick={() => setExpanded(expanded ? null : 'all')}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-sm text-gray-300 transition-colors"
        >
          <span className="font-medium">Browse All 7 Sovereign Toolkits</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="grid grid-cols-1 gap-px bg-slate-700">
            {Object.values(SOVEREIGN_TOOLKIT_REGISTRY).map(tk => (
              <button
                key={tk.id}
                onClick={() => selectToolkit(tk.id)}
                className="flex items-center justify-between px-4 py-3 bg-slate-800 hover:bg-slate-700/80 text-left transition-colors group"
              >
                <div>
                  <span className={`text-xs font-bold ${TOOLKIT_ACCENT[tk.id]}`}>{tk.id}</span>
                  <span className="text-sm text-white ml-2">{tk.title}</span>
                </div>
                <span className="text-xs text-gray-600 group-hover:text-gray-400 transition-colors">
                  {tk.triggers.slice(0, 3).join(', ')}...
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
