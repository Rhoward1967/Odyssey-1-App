/**
 * BookLivingIntelligence — R.O.M.A.N. Intelligence Feed
 * =======================================================
 * R.O.M.A.N. is the system. Claude is the analysis engine R.O.M.A.N. calls.
 *
 * This component is the command center for the living intelligence pipeline:
 *   LEFT:   Submit new intelligence → R.O.M.A.N. processes it
 *   CENTER: Live feed of all intelligence with book/concept mappings
 *   RIGHT:  New Trap Alerts — patterns not yet named in the 8 books
 *
 * Fully real-time via Supabase subscriptions. No refresh needed.
 *
 * Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Radio, AlertTriangle, BookOpen, Clock, ChevronDown, ChevronUp,
  ExternalLink, Zap, Shield, Eye,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

import {
  submitIntelligence,
  getIntelligenceFeed,
  getActiveTrapAlerts,
  promoteTrapToBook9,
  CATEGORY_LABELS,
  THREAT_LEVEL_LABELS,
  THREAT_LEVEL_COLORS,
  TRAP_STATUS_COLORS,
  CATEGORY_COLORS,
  type IntelligenceCategory,
  type BookIntelligence,
  type TrapAlert,
} from '@/services/bookIntelligenceService';

import { BOOK_METADATA } from '@/services/bookCrossReferenceService';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES: IntelligenceCategory[] = [
  'digital_id', 'cbdc', 'surveillance_ai', 'legislation', 'finance', 'nature', 'governance',
];

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function PulsingDot({ color = 'bg-green-500' }: { color?: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
    </span>
  );
}

function ThreatBadge({ level }: { level: string }) {
  const colors = THREAT_LEVEL_COLORS[level as keyof typeof THREAT_LEVEL_COLORS] || 'bg-slate-100 text-slate-700';
  const label  = THREAT_LEVEL_LABELS[level as keyof typeof THREAT_LEVEL_LABELS] || level;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colors}`}>
      {level === 'new_trap' && <Zap className="h-3 w-3" />}
      {level === 'critical' && <AlertTriangle className="h-3 w-3" />}
      {label}
    </span>
  );
}

function BookTags({ books }: { books: number[] }) {
  if (!books?.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {books.map(n => (
        <span key={n} className={`px-1.5 py-0.5 rounded text-xs font-medium ${BOOK_METADATA[n]?.color?.replace('from-', 'bg-').split(' ')[0] || 'bg-slate-200'} text-white`}>
          B{n}
        </span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT PANEL
// ─────────────────────────────────────────────────────────────────────────────

function SubmitPanel({ onSuccess }: { onSuccess: (result: any) => void }) {
  const [headline,    setHeadline]    = useState('');
  const [content,     setContent]     = useState('');
  const [category,    setCategory]    = useState<IntelligenceCategory>('governance');
  const [sourceLabel, setSourceLabel] = useState('');
  const [sourceUrl,   setSourceUrl]   = useState('');
  const [sourceDate,  setSourceDate]  = useState(new Date().toISOString().split('T')[0]);
  const [lastResult,  setLastResult]  = useState<any>(null);

  const mutation = useMutation({
    mutationFn: () => submitIntelligence({
      headline,
      content,
      category,
      source_label: sourceLabel || undefined,
      source_url:   sourceUrl   || undefined,
      source_date:  sourceDate  || undefined,
    }),
    onSuccess: (result) => {
      setLastResult(result);
      onSuccess(result);
      setHeadline('');
      setContent('');
      setSourceLabel('');
      setSourceUrl('');
    },
  });

  const canSubmit = headline.trim().length > 0 && content.trim().length > 10 && !mutation.isPending;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Radio className="h-4 w-4 text-cyan-400" />
        <h3 className="font-semibold text-slate-200 text-sm">Feed Intelligence to R.O.M.A.N.</h3>
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1 block">Headline *</label>
        <Input
          value={headline}
          onChange={e => setHeadline(e.target.value)}
          placeholder="Senate passes GENIUS Act stablecoin burn-code..."
          className="bg-slate-800 border-slate-700 text-slate-100 text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1 block">Category *</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value as IntelligenceCategory)}
          className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-md px-3 py-2"
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1 block">Intelligence Content *</label>
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Describe the development in detail. What happened, what system it involves, what it enables or restricts..."
          rows={6}
          className="bg-slate-800 border-slate-700 text-slate-100 text-sm resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Source</label>
          <Input
            value={sourceLabel}
            onChange={e => setSourceLabel(e.target.value)}
            placeholder="Reuters, Congress.gov..."
            className="bg-slate-800 border-slate-700 text-slate-100 text-xs"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Date</label>
          <Input
            type="date"
            value={sourceDate}
            onChange={e => setSourceDate(e.target.value)}
            className="bg-slate-800 border-slate-700 text-slate-100 text-xs"
          />
        </div>
      </div>

      <Button
        onClick={() => mutation.mutate()}
        disabled={!canSubmit}
        className="w-full bg-cyan-700 hover:bg-cyan-600 text-white font-semibold"
      >
        {mutation.isPending ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
            R.O.M.A.N. analyzing...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Radio className="h-4 w-4" />
            Feed to R.O.M.A.N.
          </span>
        )}
      </Button>

      {mutation.isError && (
        <p className="text-red-400 text-xs">{String(mutation.error)}</p>
      )}

      {lastResult && (
        <div className="bg-slate-800 rounded-lg p-3 border border-cyan-800 space-y-2">
          <p className="text-xs text-cyan-300 font-medium">R.O.M.A.N. Analysis Complete</p>
          <div className="flex flex-wrap gap-1">
            <ThreatBadge level={lastResult.threat_level} />
          </div>
          <p className="text-xs text-slate-300">Books updated: <BookTags books={lastResult.books_updated} /></p>
          {lastResult.new_trap_detected && (
            <p className="text-xs text-cyan-400 font-semibold flex items-center gap-1">
              <Zap className="h-3 w-3" /> New Trap: {lastResult.new_trap?.pattern_label}
            </p>
          )}
          <p className="text-xs text-slate-400">{lastResult.message}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INTELLIGENCE CARD
// ─────────────────────────────────────────────────────────────────────────────

function IntelligenceCard({ item }: { item: BookIntelligence }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-lg border p-3 space-y-2 ${
      item.threat_level === 'new_trap'  ? 'border-cyan-700  bg-cyan-950/30' :
      item.threat_level === 'critical'  ? 'border-red-700   bg-red-950/20'  :
      item.threat_level === 'active'    ? 'border-amber-700 bg-amber-950/20':
                                           'border-slate-700 bg-slate-800/50'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-100 leading-snug">{item.headline}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span className={`px-1.5 py-0.5 rounded text-xs ${CATEGORY_COLORS[item.category]}`}>
              {CATEGORY_LABELS[item.category]}
            </span>
            <ThreatBadge level={item.threat_level} />
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              {new Date(item.source_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
            </span>
          </div>
        </div>
        <button onClick={() => setExpanded(e => !e)} className="text-slate-500 hover:text-slate-300 mt-0.5 flex-shrink-0">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Books mapped */}
      {item.mapped_books?.length > 0 && (
        <div className="flex items-center gap-2">
          <BookOpen className="h-3 w-3 text-slate-500 flex-shrink-0" />
          <BookTags books={item.mapped_books} />
        </div>
      )}

      {/* AI analysis */}
      {item.ai_analysis && (
        <p className="text-xs text-slate-400 italic leading-relaxed">{item.ai_analysis}</p>
      )}

      {/* Expanded: full content */}
      {expanded && (
        <div className="pt-1 border-t border-slate-700">
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{item.content}</p>
          {item.source_label && (
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              Source: {item.source_label}
              {item.source_url && (
                <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline ml-1">
                  View →
                </a>
              )}
            </p>
          )}
          {item.appendix_count > 0 && (
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {item.appendix_count} book appendix {item.appendix_count === 1 ? 'entry' : 'entries'} written
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRAP ALERT CARD
// ─────────────────────────────────────────────────────────────────────────────

function TrapCard({ trap, onPromote }: { trap: TrapAlert; onPromote: (tag: string) => void }) {
  const qc = useQueryClient();

  const promoteMutation = useMutation({
    mutationFn: () => promoteTrapToBook9(trap.pattern_tag),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trap-alerts'] });
    },
  });

  return (
    <div className="rounded-lg border border-cyan-700 bg-cyan-950/40 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-cyan-200 flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" />
            {trap.pattern_label}
          </p>
          <span className={`text-xs px-1.5 py-0.5 rounded mt-1 inline-block ${TRAP_STATUS_COLORS[trap.status]}`}>
            {trap.status.toUpperCase()}
          </span>
        </div>
        <span className="text-xs text-slate-400 flex-shrink-0">
          {trap.evidence_count} signal{trap.evidence_count !== 1 ? 's' : ''}
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">{trap.pattern_summary}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Eye className="h-3 w-3 text-slate-500" />
          <span className="text-xs text-slate-500">Threads through:</span>
          <BookTags books={trap.appears_in_books} />
        </div>
      </div>

      {trap.status === 'confirmed' && (
        <Button
          onClick={() => promoteMutation.mutate()}
          disabled={promoteMutation.isPending}
          size="sm"
          className="w-full bg-purple-800 hover:bg-purple-700 text-white text-xs"
        >
          <Shield className="h-3 w-3 mr-1" />
          Promote to Book 9 Canon
        </Button>
      )}

      <p className="text-xs text-slate-500">
        First detected: {new Date(trap.first_detected).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function BookLivingIntelligence() {
  const qc                               = useQueryClient();
  const [filterCategory, setFilterCategory] = useState<IntelligenceCategory | ''>('');
  const [liveActivity,   setLiveActivity]   = useState<string | null>(null);
  const [isLive,         setIsLive]         = useState(false);

  // ── QUERIES ──────────────────────────────────────────────────────────────

  const { data: feed = [] } = useQuery({
    queryKey: ['intelligence-feed', filterCategory],
    queryFn:  () => getIntelligenceFeed({ limit: 50, category: filterCategory || undefined }),
  });

  const { data: traps = [] } = useQuery({
    queryKey: ['trap-alerts'],
    queryFn:  getActiveTrapAlerts,
  });

  // ── REAL-TIME SUBSCRIPTIONS ──────────────────────────────────────────────

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['intelligence-feed'] });
    qc.invalidateQueries({ queryKey: ['trap-alerts'] });
  }, [qc]);

  useEffect(() => {
    const channel = supabase
      .channel('roman-intelligence-live')

      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'book_intelligence',
      }, (payload) => {
        setLiveActivity(`R.O.M.A.N. received: ${(payload.new as any)?.headline?.substring(0, 60)}`);
        invalidate();
        setTimeout(() => setLiveActivity(null), 6000);
      })

      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'book_intelligence',
      }, (payload) => {
        const item = payload.new as any;
        if (item?.status === 'analyzed') {
          setLiveActivity(`Analysis complete — Books ${(item.mapped_books || []).map((n: number) => `B${n}`).join(', ')} updated`);
          invalidate();
          setTimeout(() => setLiveActivity(null), 6000);
        }
      })

      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'book_trap_alerts',
      }, (payload) => {
        setLiveActivity(`⚡ New Trap: ${(payload.new as any)?.pattern_label}`);
        invalidate();
        setTimeout(() => setLiveActivity(null), 8000);
      })

      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'book_trap_alerts',
      }, () => {
        invalidate();
      })

      .subscribe((status) => setIsLive(status === 'SUBSCRIBED'));

    return () => { supabase.removeChannel(channel); };
  }, [invalidate]);

  // ── STATS ─────────────────────────────────────────────────────────────────

  const newTrapCount  = feed.filter(f => f.threat_level === 'new_trap').length;
  const criticalCount = feed.filter(f => f.threat_level === 'critical').length;
  const activeCount   = feed.filter(f => f.threat_level === 'active').length;

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Radio className="h-5 w-5 text-cyan-400" />
            R.O.M.A.N. Living Intelligence Feed
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            New world developments mapped against all 8 books in real-time.
            R.O.M.A.N. receives. Claude analyzes. Books grow.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <PulsingDot color={isLive ? 'bg-green-500' : 'bg-slate-500'} />
            <span className="text-xs text-slate-400">{isLive ? 'Live' : 'Connecting...'}</span>
          </div>
          {liveActivity && (
            <span className="text-xs text-cyan-300 animate-pulse max-w-xs truncate">{liveActivity}</span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Signals',  value: feed.length,    color: 'text-slate-300' },
          { label: 'Active',         value: activeCount,    color: 'text-amber-400' },
          { label: 'Critical',       value: criticalCount,  color: 'text-red-400'   },
          { label: 'Trap Alerts',    value: traps.length,   color: 'text-cyan-400'  },
        ].map(stat => (
          <Card key={stat.label} className="bg-slate-800 border-slate-700">
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main layout: Submit | Feed | Traps */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_280px] gap-4">

        {/* LEFT: Submit panel */}
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <SubmitPanel onSuccess={() => invalidate()} />
          </CardContent>
        </Card>

        {/* CENTER: Intelligence feed */}
        <div className="space-y-3">
          {/* Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400">Filter:</span>
            {(['', ...CATEGORIES] as (IntelligenceCategory | '')[]).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  filterCategory === cat
                    ? 'bg-cyan-700 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === '' ? 'All' : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Feed */}
          {feed.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Radio className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No intelligence on record.</p>
              <p className="text-sm mt-1">Submit the first signal using the panel on the left.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
              {feed.map(item => (
                <IntelligenceCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Trap alerts */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-400" />
            <h3 className="font-semibold text-slate-200 text-sm">
              Trap Alerts
              {traps.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-cyan-900 text-cyan-300 text-xs rounded-full">
                  {traps.length}
                </span>
              )}
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Patterns R.O.M.A.N. has detected that are NOT yet named in the 8-book canon.
            Confirmed patterns are Book 9 candidates.
          </p>

          {traps.length === 0 ? (
            <div className="text-center py-8 text-slate-600">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No new traps detected yet.</p>
              <p className="text-xs mt-1">R.O.M.A.N. watches every signal.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {traps.map(trap => (
                <TrapCard
                  key={trap.id}
                  trap={trap}
                  onPromote={() => {
                    qc.invalidateQueries({ queryKey: ['trap-alerts'] });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
