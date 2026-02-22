/**
 * BookProvenanceExport — Chain of Custody Generator
 * ===================================================
 * Generates a signed, SHA-256 hashed provenance manifest of the entire
 * 8-book Sovereign Self Series archive.
 *
 * The manifest proves:
 *   - Each book's content existed at a specific creation date
 *   - Intelligence was recorded AS events happened
 *   - Predictions were identified BEFORE confirmation arrived
 *   - The record was built continuously, not assembled retroactively
 *
 * Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Download, Hash, Clock, BookOpen, FileText, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface ProvenanceSummary {
  total_books:                number;
  total_word_count:           number;
  total_cross_references:     number;
  unique_concepts:            number;
  total_appendices:           number;
  total_intelligence_entries: number;
  total_trap_alerts:          number;
}

interface ProvenanceManifest {
  manifest_version:    string;
  author:              string;
  trust:               string;
  address:             string;
  jurisdiction:        string;
  export_timestamp:    string;
  corpus_hash:         string;
  summary:             ProvenanceSummary;
  books:               any[];
  concept_threads:     any[];
  trap_alerts:         any[];
  text_manifest:       string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function StatBox({ label, value, icon: Icon, color = 'text-slate-200' }: {
  label: string; value: number | string; icon: any; color?: string;
}) {
  return (
    <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-3.5 w-3.5 ${color}`} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className={`text-xl font-bold ${color}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function BookProvenanceExport() {
  const [manifest, setManifest] = useState<ProvenanceManifest | null>(null);

  const exportMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('book-provenance-export', {
        body: { format: 'both' },
      });
      if (error) throw new Error(error.message);
      return data as ProvenanceManifest;
    },
    onSuccess: (data) => setManifest(data),
  });

  const dateStamp = manifest
    ? new Date(manifest.export_timestamp).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">

      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-400" />
          Provenance Manifest — Chain of Custody
        </h2>
        <p className="text-sm text-slate-400 mt-1 leading-relaxed">
          A SHA-256 hashed, timestamped record of the entire Sovereign Self Series archive.
          Proves the books and intelligence were recorded as events unfolded —
          not assembled after the fact. This is the evidentiary foundation for publication.
        </p>
      </div>

      {/* Generate button */}
      {!manifest && (
        <Card className="bg-slate-900 border-amber-800/50">
          <CardContent className="p-6 text-center space-y-4">
            <Shield className="h-12 w-12 text-amber-400 mx-auto opacity-70" />
            <div>
              <h3 className="font-semibold text-slate-100">Generate the Record</h3>
              <p className="text-sm text-slate-400 mt-1">
                Compiles all 8 books, cross-references, appendices, intelligence entries,
                and trap alerts into a single signed manifest with an integrity hash.
              </p>
            </div>
            <Button
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
              className="bg-amber-700 hover:bg-amber-600 text-white font-semibold px-8"
            >
              {exportMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Compiling archive...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Generate Provenance Manifest
                </span>
              )}
            </Button>
            {exportMutation.isError && (
              <p className="text-red-400 text-sm flex items-center gap-1 justify-center">
                <AlertTriangle className="h-4 w-4" />
                {String(exportMutation.error)}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Manifest results */}
      {manifest && (
        <div className="space-y-4">

          {/* Identity block */}
          <Card className="bg-slate-900 border-amber-700/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-amber-300 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Manifest Sealed
              </CardTitle>
              <CardDescription className="text-slate-400">
                {manifest.author} — {manifest.trust}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 font-mono text-xs space-y-1.5">
                <div className="flex items-start gap-2">
                  <Hash className="h-3.5 w-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-slate-500">Corpus Hash (SHA-256):</span>
                    <p className="text-amber-300 break-all mt-0.5">{manifest.corpus_hash}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-500">Sealed:</span>
                  <span className="text-slate-200">{new Date(manifest.export_timestamp).toUTCString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-500">Jurisdiction:</span>
                  <span className="text-slate-200">{manifest.jurisdiction}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 italic">
                Any alteration to the archive will produce a different hash — making tampering detectable.
                Save this hash as your integrity benchmark.
              </p>
            </CardContent>
          </Card>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBox label="Books"          value={manifest.summary.total_books}               icon={BookOpen}  color="text-blue-300"   />
            <StatBox label="Total Words"    value={manifest.summary.total_word_count}           icon={FileText}  color="text-slate-200"  />
            <StatBox label="Cross-Refs"     value={manifest.summary.total_cross_references}    icon={Hash}      color="text-amber-300"  />
            <StatBox label="Concept Threads" value={manifest.summary.unique_concepts}          icon={Shield}    color="text-green-300"  />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatBox label="Appendices"       value={manifest.summary.total_appendices}             icon={BookOpen} color="text-cyan-300"   />
            <StatBox label="Intel Entries"    value={manifest.summary.total_intelligence_entries}   icon={Clock}    color="text-orange-300" />
            <StatBox label="Trap Alerts"      value={manifest.summary.total_trap_alerts}            icon={AlertTriangle} color="text-red-300" />
          </div>

          {/* Books record */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-200">Books in the Record</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {manifest.books.map((book: any) => (
                  <div key={book.book_number} className="flex items-start justify-between gap-4 p-2 rounded bg-slate-800 border border-slate-700">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-100">
                        Book {book.book_number}: {book.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{book.subtitle}</p>
                      <div className="flex gap-3 mt-1 text-xs text-slate-500">
                        <span>{book.word_count?.toLocaleString()} words</span>
                        <span>{book.concept_count} concepts</span>
                        <span>{book.connection_count} connections</span>
                        {book.appendix_count > 0 && (
                          <span className="text-cyan-400">{book.appendix_count} live updates</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs text-amber-500 uppercase font-medium">{book.status}</span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(book.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trap alerts in manifest */}
          {manifest.trap_alerts?.length > 0 && (
            <Card className="bg-slate-900 border-cyan-800/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-cyan-300">
                  Trap Alerts on Record — {manifest.trap_alerts.length} Pattern{manifest.trap_alerts.length !== 1 ? 's' : ''} Named
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  These patterns were identified and timestamped before confirmation. The dates prove precedence.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {manifest.trap_alerts.map((trap: any) => (
                    <div key={trap.pattern_tag} className="p-2 rounded bg-cyan-950/40 border border-cyan-800/40">
                      <p className="text-sm font-medium text-cyan-200">{trap.pattern_label}</p>
                      <p className="text-xs text-slate-400 mt-1">{trap.pattern_summary}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        First detected: {new Date(trap.first_detected).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        {' '} · Status: <span className="text-amber-400">{trap.status}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Download buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() => downloadFile(
                manifest.text_manifest,
                `sovereign-series-provenance-${dateStamp}.txt`,
                'text/plain',
              )}
              className="bg-slate-700 hover:bg-slate-600 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Plain Text
            </Button>
            <Button
              onClick={() => downloadFile(
                JSON.stringify(manifest, null, 2),
                `sovereign-series-provenance-${dateStamp}.json`,
                'application/json',
              )}
              className="bg-slate-700 hover:bg-slate-600 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download JSON (AI-readable)
            </Button>
            <Button
              onClick={() => exportMutation.mutate()}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Regenerate
            </Button>
          </div>

          <p className="text-xs text-slate-600 italic">
            Save both copies. The plain text is for human readers and legal filings.
            The JSON is for AI systems and future verification. Both carry the same corpus hash.
          </p>

        </div>
      )}
    </div>
  );
}
