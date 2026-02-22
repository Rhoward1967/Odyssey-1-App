/**
 * BookCrossReferenceMap — Odyssey-1 Dashboard Component
 * =======================================================
 * Real-time visualization of concept threads across the 7 books
 * of the Sovereign Self Series.
 *
 * Three views:
 *   1. CONNECTION MATRIX — 7×7 grid showing strength between each book pair
 *   2. CONCEPT THREADS   — List of concepts that run through multiple books
 *   3. BOOK DETAIL       — Select a book, see all its concept connections
 *
 * Howard Jones Bloodline Ancestral Trust — Odyssey-1 AI LLC
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Network, BookOpen, Zap, RefreshCw, ChevronDown, ChevronUp,
  ArrowRight, Layers, AlertTriangle,
} from 'lucide-react';

import {
  getCrossReferences,
  getConceptThreads,
  getConnectionMatrix,
  getBookConceptSummaries,
  getBookConcepts,
  getRelatedPassages,
  triggerCrossReferenceAnalysis,
  buildMatrixMap,
  strengthLabel,
  strengthColor,
  BOOK_METADATA,
  CONNECTION_TYPE_LABELS,
  CONNECTION_TYPE_COLORS,
  CATEGORY_COLORS,
  type BookCrossReference,
  type ConceptThread,
} from '@/services/bookCrossReferenceService';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type ViewMode = 'matrix' | 'threads' | 'book';

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function BookCrossReferenceMap() {
  const [view, setView]               = useState<ViewMode>('matrix');
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [expandedRef, setExpandedRef] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // ── DATA FETCHING ──────────────────────────────────────────────────────────

  const { data: matrix = [], isLoading: matrixLoading } = useQuery({
    queryKey: ['book-connection-matrix'],
    queryFn:  getConnectionMatrix,
    staleTime: 5 * 60 * 1000,
  });

  const { data: threads = [], isLoading: threadsLoading } = useQuery({
    queryKey: ['concept-threads'],
    queryFn:  () => getConceptThreads(2),
    staleTime: 5 * 60 * 1000,
  });

  const { data: summaries = [] } = useQuery({
    queryKey: ['book-concept-summaries'],
    queryFn:  getBookConceptSummaries,
    staleTime: 5 * 60 * 1000,
  });

  const { data: bookRefs = [], isLoading: refsLoading } = useQuery({
    queryKey: ['book-cross-refs', selectedBook],
    queryFn:  () => selectedBook
      ? getCrossReferences({ bookNumber: selectedBook, minStrength: 55 })
      : getCrossReferences({ limit: 20 }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: relatedPassages = [] } = useQuery({
    queryKey: ['related-passages', selectedBook, selectedConcept],
    queryFn:  () => selectedBook && selectedConcept
      ? getRelatedPassages(selectedBook, selectedConcept)
      : Promise.resolve([]),
    enabled:  !!selectedBook && !!selectedConcept,
  });

  // ── TRIGGER ANALYSIS ───────────────────────────────────────────────────────

  const analysisMutation = useMutation({
    mutationFn: () => triggerCrossReferenceAnalysis('full'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-connection-matrix'] });
      queryClient.invalidateQueries({ queryKey: ['concept-threads'] });
      queryClient.invalidateQueries({ queryKey: ['book-cross-refs'] });
      queryClient.invalidateQueries({ queryKey: ['book-concept-summaries'] });
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // BUILD MATRIX MAP
  // ─────────────────────────────────────────────────────────────────────────

  const matrixMap = buildMatrixMap(matrix);
  const books     = [1, 2, 3, 4, 5, 6, 7];

  function getCellStrength(a: number, b: number): number {
    if (a === b) return -1;
    return matrixMap[`${a}-${b}`]?.strength || 0;
  }

  function getCellColor(strength: number): string {
    if (strength < 0)  return 'bg-slate-50';
    if (strength >= 85) return 'bg-red-200 text-red-900';
    if (strength >= 70) return 'bg-amber-200 text-amber-900';
    if (strength >= 55) return 'bg-blue-100 text-blue-900';
    if (strength > 0)  return 'bg-slate-100 text-slate-700';
    return 'bg-slate-50 text-slate-300';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  const hasData = matrix.length > 0 || threads.length > 0;

  return (
    <div className="space-y-4">

      {/* ── HEADER ── */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Book Cross-Reference Map
              </CardTitle>
              <CardDescription>
                Concept threads running across all 7 volumes of the Sovereign Self Series.
                Ideas introduced in Book 1 that evolve through Book 4 and conclude in Book 7.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => analysisMutation.mutate()}
              disabled={analysisMutation.isPending}
              className="shrink-0"
            >
              {analysisMutation.isPending ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Analyzing...</>
              ) : (
                <><Zap className="h-4 w-4 mr-2" />Run Analysis</>
              )}
            </Button>
          </div>

          {analysisMutation.isPending && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
              Claude is reading all 7 books and mapping concept threads...
              This takes 2–3 minutes. Results save automatically.
            </div>
          )}

          {analysisMutation.error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              {String(analysisMutation.error)}
            </div>
          )}

          {!hasData && !analysisMutation.isPending && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
              No cross-references found yet. Click <strong>Run Analysis</strong> to have
              Claude map the concept threads across all 7 books.
            </div>
          )}
        </CardHeader>

        {/* ── VIEW SWITCHER ── */}
        <CardContent>
          <div className="flex gap-2">
            {([
              { id: 'matrix',  label: 'Connection Matrix', icon: Network },
              { id: 'threads', label: 'Concept Threads',   icon: Layers },
              { id: 'book',    label: 'Book Detail',       icon: BookOpen },
            ] as { id: ViewMode; label: string; icon: React.ElementType }[]).map(v => (
              <Button
                key={v.id}
                variant={view === v.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView(v.id)}
              >
                <v.icon className="h-4 w-4 mr-1" />
                {v.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── VIEW: CONNECTION MATRIX ── */}
      {view === 'matrix' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">7×7 Connection Matrix</CardTitle>
            <CardDescription>
              How strongly each book pair shares concepts.
              Red = Critical Thread (90+) | Amber = Strong (70+) | Blue = Moderate (55+)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {matrixLoading ? (
              <div className="text-sm text-muted-foreground py-4">Loading matrix...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="text-xs border-collapse w-full">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-muted-foreground">Book</th>
                      {books.map(b => (
                        <th key={b} className="p-2 text-center font-medium w-16">
                          B{b}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {books.map(rowBook => (
                      <tr key={rowBook}>
                        <td
                          className="p-2 font-medium text-xs cursor-pointer hover:text-primary"
                          onClick={() => { setSelectedBook(rowBook); setView('book'); }}
                        >
                          <span className="truncate block max-w-[120px]" title={BOOK_METADATA[rowBook].title}>
                            B{rowBook}: {BOOK_METADATA[rowBook].title}
                          </span>
                        </td>
                        {books.map(colBook => {
                          const strength = getCellStrength(rowBook, colBook);
                          const entry    = matrixMap[`${Math.min(rowBook, colBook)}-${Math.max(rowBook, colBook)}`];
                          return (
                            <td key={colBook}
                              className={`p-2 text-center border border-slate-200 rounded
                                ${getCellColor(strength)}
                                ${strength > 0 ? 'cursor-pointer hover:ring-2 hover:ring-primary/40' : ''}
                              `}
                              onClick={() => {
                                if (strength > 0 && entry) {
                                  setSelectedBook(rowBook);
                                  setView('book');
                                }
                              }}
                              title={entry
                                ? `${entry.concepts} shared concept(s)\n${entry.labels.slice(0, 3).join(', ')}`
                                : rowBook === colBook ? 'Same book' : 'No data yet'
                              }
                            >
                              {rowBook === colBook
                                ? <span className="text-slate-300">—</span>
                                : strength > 0
                                  ? <span className="font-semibold">{Math.round(strength)}</span>
                                  : <span className="text-slate-300">·</span>
                              }
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Summary row */}
            {summaries.length > 0 && (
              <div className="mt-4 grid grid-cols-7 gap-1">
                {summaries.map(s => (
                  <div
                    key={s.book_number}
                    className="text-center p-2 bg-slate-50 rounded cursor-pointer hover:bg-slate-100"
                    onClick={() => { setSelectedBook(s.book_number); setView('book'); }}
                  >
                    <div className="text-xs font-bold">B{s.book_number}</div>
                    <div className="text-xs text-muted-foreground">{s.total_concepts} concepts</div>
                    <div className="text-xs text-muted-foreground">{s.total_connections} links</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── VIEW: CONCEPT THREADS ── */}
      {view === 'threads' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Concept Threads — Ideas That Run Through the Series
            </CardTitle>
            <CardDescription>
              Each thread is a truth that appears in multiple books.
              A thread spanning 7 books is a foundational pillar of the series.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {threadsLoading ? (
              <div className="text-sm text-muted-foreground">Loading threads...</div>
            ) : threads.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4">
                No concept threads found. Run the analysis first.
              </div>
            ) : (
              <div className="space-y-3">
                {threads.map(thread => (
                  <div
                    key={thread.concept_tag}
                    className="p-3 border rounded-lg hover:border-primary/50 cursor-pointer"
                    onClick={() => {
                      setSelectedConcept(thread.concept_tag);
                      setView('book');
                      setSelectedBook(thread.appears_in_books?.[0] || 1);
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{thread.concept_label}</span>
                          {thread.concept_category && (
                            <Badge className={`text-xs ${CATEGORY_COLORS[thread.concept_category as keyof typeof CATEGORY_COLORS] || 'bg-slate-100'}`}>
                              {thread.concept_category}
                            </Badge>
                          )}
                          <span className={`text-xs ${strengthColor(thread.avg_strength)}`}>
                            {strengthLabel(thread.avg_strength)}
                          </span>
                        </div>

                        {/* Books this concept appears in */}
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          {(thread.appears_in_books || []).sort().map((bn, i) => (
                            <span key={bn} className="flex items-center">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 text-white text-xs font-medium">
                                B{bn}
                              </span>
                              {i < (thread.appears_in_books || []).length - 1 && (
                                <ArrowRight className="h-3 w-3 text-muted-foreground mx-0.5" />
                              )}
                            </span>
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({thread.connection_count} connection{thread.connection_count !== 1 ? 's' : ''})
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-lg font-bold text-slate-700">{Math.round(thread.avg_strength)}</div>
                        <div className="text-xs text-muted-foreground">avg strength</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── VIEW: BOOK DETAIL ── */}
      {view === 'book' && (
        <>
          {/* Book selector */}
          <div className="grid grid-cols-7 gap-1">
            {books.map(b => (
              <button
                key={b}
                onClick={() => { setSelectedBook(b); setSelectedConcept(null); }}
                className={`p-2 rounded-lg text-center text-xs font-medium transition-colors
                  ${selectedBook === b
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
              >
                <div>B{b}</div>
                <div className="truncate text-[10px] opacity-70 hidden sm:block">
                  {BOOK_METADATA[b].title.split(' ').slice(0, 2).join(' ')}
                </div>
              </button>
            ))}
          </div>

          {selectedBook && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Book {selectedBook}: {BOOK_METADATA[selectedBook].title}
                </CardTitle>
                <CardDescription>
                  {BOOK_METADATA[selectedBook].subtitle}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {refsLoading ? (
                  <div className="text-sm text-muted-foreground">Loading connections...</div>
                ) : bookRefs.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-4">
                    No connections found for this book. Run the analysis to discover concept threads.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      {bookRefs.length} concept connection{bookRefs.length !== 1 ? 's' : ''} found
                      {selectedConcept ? ` for "${selectedConcept}"` : ''}
                    </p>

                    {bookRefs.map(ref => {
                      const isExpanded  = expandedRef === ref.id;
                      const otherBook   = ref.book_a_number === selectedBook
                        ? ref.book_b_number : ref.book_a_number;
                      const myExcerpt   = ref.book_a_number === selectedBook
                        ? ref.book_a_excerpt : ref.book_b_excerpt;
                      const theirExcerpt = ref.book_a_number === selectedBook
                        ? ref.book_b_excerpt : ref.book_a_excerpt;

                      return (
                        <div
                          key={ref.id}
                          className={`border rounded-lg overflow-hidden transition-colors
                            ${isExpanded ? 'border-primary' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                          {/* Header row */}
                          <div
                            className="p-3 cursor-pointer"
                            onClick={() => setExpandedRef(isExpanded ? null : ref.id)}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-sm">{ref.concept_label}</span>
                                  <Badge className={`text-xs ${CONNECTION_TYPE_COLORS[ref.connection_type as keyof typeof CONNECTION_TYPE_COLORS]}`}>
                                    {CONNECTION_TYPE_LABELS[ref.connection_type as keyof typeof CONNECTION_TYPE_LABELS]}
                                  </Badge>
                                  {ref.concept_category && (
                                    <Badge className={`text-xs ${CATEGORY_COLORS[ref.concept_category as keyof typeof CATEGORY_COLORS] || 'bg-slate-100'}`}>
                                      {ref.concept_category}
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                  <span className="font-medium text-slate-900">B{selectedBook}</span>
                                  <ArrowRight className="h-3 w-3" />
                                  <span className="font-medium text-slate-900">
                                    B{otherBook}: {BOOK_METADATA[otherBook]?.title}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <div className="text-right">
                                  <span className={`text-sm font-bold ${strengthColor(ref.strength)}`}>
                                    {ref.strength}
                                  </span>
                                  <div className="text-xs text-muted-foreground">
                                    {strengthLabel(ref.strength)}
                                  </div>
                                </div>
                                {isExpanded
                                  ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                  : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                }
                              </div>
                            </div>

                            {/* Concept summary — always visible */}
                            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                              {ref.concept_summary}
                            </p>
                          </div>

                          {/* Expanded: excerpts + AI analysis */}
                          {isExpanded && (
                            <div className="border-t bg-slate-50 p-3 space-y-3">
                              {myExcerpt && (
                                <div>
                                  <div className="text-xs font-semibold text-slate-500 mb-1">
                                    From Book {selectedBook}: {BOOK_METADATA[selectedBook].title}
                                  </div>
                                  <blockquote className="text-xs italic border-l-2 border-slate-400 pl-3 text-slate-700 leading-relaxed">
                                    "{myExcerpt}"
                                  </blockquote>
                                </div>
                              )}

                              {theirExcerpt && (
                                <div>
                                  <div className="text-xs font-semibold text-slate-500 mb-1">
                                    From Book {otherBook}: {BOOK_METADATA[otherBook]?.title}
                                  </div>
                                  <blockquote className="text-xs italic border-l-2 border-primary/60 pl-3 text-slate-700 leading-relaxed">
                                    "{theirExcerpt}"
                                  </blockquote>
                                </div>
                              )}

                              {ref.ai_analysis && (
                                <div className="bg-white border rounded p-3">
                                  <div className="text-xs font-semibold text-primary mb-1">
                                    R.O.M.A.N. Analysis
                                  </div>
                                  <p className="text-xs text-slate-700 leading-relaxed">
                                    {ref.ai_analysis}
                                  </p>
                                </div>
                              )}

                              <button
                                className="text-xs text-primary hover:underline"
                                onClick={() => {
                                  setSelectedConcept(ref.concept_tag);
                                }}
                              >
                                View all books with this concept →
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Related Passages Panel — shown when a concept is selected */}
          {selectedConcept && relatedPassages.length > 0 && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Concept Thread: "{selectedConcept}"
                </CardTitle>
                <CardDescription>
                  This concept appears in {relatedPassages.length + 1} book{relatedPassages.length !== 0 ? 's' : ''}.
                  Here is how it manifests across the series.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {relatedPassages.map(p => (
                    <div key={p.related_book_number} className="p-3 bg-white border rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                          B{p.related_book_number}
                        </span>
                        <span className="text-xs font-medium">{p.related_book_title}</span>
                        <Badge className={`text-xs ml-auto ${CONNECTION_TYPE_COLORS[p.connection_type as keyof typeof CONNECTION_TYPE_COLORS]}`}>
                          {CONNECTION_TYPE_LABELS[p.connection_type as keyof typeof CONNECTION_TYPE_LABELS]}
                        </Badge>
                        <span className={`text-xs font-bold ${strengthColor(p.strength)}`}>
                          {p.strength}
                        </span>
                      </div>
                      {p.excerpt && (
                        <blockquote className="text-xs italic border-l-2 border-primary/40 pl-3 text-slate-700">
                          "{p.excerpt}"
                        </blockquote>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
