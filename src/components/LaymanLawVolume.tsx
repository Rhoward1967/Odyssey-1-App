import { useState, useEffect } from 'react'
import { X, BookOpen, HelpCircle, Lock, Star } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface Volume {
  id: number
  num: string
  title: string
  subject: string | null
}

interface Chapter {
  id: string
  chapter_index: number
  title: string
  subtitle: string | null
  content_html: string
}

interface Props {
  volumeNumber: number
  isSubscribed: boolean
  onClose: () => void
  onAskRoman: (question: string) => void
  onSubscribe: () => void
}

const FREE_TOPIC_LIMIT = 3

export default function LaymanLawVolume({ volumeNumber, isSubscribed, onClose, onAskRoman, onSubscribe }: Props) {
  const [volume, setVolume]       = useState<Volume | null>(null)
  const [chapters, setChapters]   = useState<Chapter[]>([])
  const [selected, setSelected]   = useState<Chapter | null>(null)
  const [loading, setLoading]     = useState(true)
  const [showPaywall, setShowPaywall] = useState(false)

  useEffect(() => { load() }, [volumeNumber])

  async function load() {
    setLoading(true)
    setSelected(null)
    setShowPaywall(false)
    const [{ data: vol }, { data: chap }] = await Promise.all([
      supabase
        .from('ll_volumes')
        .select('id, num, title, subject')
        .eq('id', volumeNumber)
        .maybeSingle(),
      supabase
        .from('ll_chapters')
        .select('id, chapter_index, title, subtitle, content_html')
        .eq('volume_id', volumeNumber)
        .eq('is_active', true)
        .order('chapter_index'),
    ])
    setVolume(vol ?? null)
    setChapters(chap ?? [])
    setLoading(false)
  }

  function isChapterLocked(index: number) {
    if (isSubscribed) return false
    if (volumeNumber === 1) return index >= FREE_TOPIC_LIMIT
    return true
  }

  function handleChapterClick(chapter: Chapter, index: number) {
    if (isChapterLocked(index)) {
      setShowPaywall(true)
    } else {
      setSelected(chapter)
      setShowPaywall(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <style>{READING_STYLES}</style>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <p className="text-xs text-yellow-500 font-medium">
              Volume {volume?.num ?? volumeNumber}
            </p>
            <h2 className="text-lg font-bold text-white">
              {volume?.title ?? 'Loading…'}
            </h2>
            {volume?.subject && (
              <p className="text-xs text-gray-500 mt-0.5">{volume.subject}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 border-r border-gray-800 overflow-y-auto p-3 space-y-1 shrink-0">
            {loading ? (
              <p className="text-gray-500 text-sm p-3">Loading…</p>
            ) : chapters.length === 0 ? (
              <p className="text-gray-500 text-sm p-3">Content coming soon for this volume.</p>
            ) : (
              <>
                {chapters.map((c, i) => {
                  const locked = isChapterLocked(i)
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleChapterClick(c, i)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors ${
                        locked
                          ? 'text-gray-600 hover:bg-gray-800/50 cursor-pointer'
                          : selected?.id === c.id
                            ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {locked
                          ? <Lock className="w-3 h-3 shrink-0 text-yellow-600" />
                          : <BookOpen className="w-3 h-3 shrink-0" />
                        }
                        <span className="leading-tight">{c.title}</span>
                      </div>
                    </button>
                  )
                })}

                {!isSubscribed && volumeNumber === 1 && chapters.length > FREE_TOPIC_LIMIT && (
                  <div className="px-3 py-2 mt-2 border-t border-gray-800">
                    <p className="text-xs text-yellow-600">
                      {chapters.length - FREE_TOPIC_LIMIT} more chapters — subscribe to unlock
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {showPaywall ? (
              <PaywallPanel onSubscribe={onSubscribe} onClose={() => setShowPaywall(false)} />
            ) : !selected ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <BookOpen className="w-12 h-12 text-gray-700 mb-3" />
                <p className="text-gray-500 text-sm">Select a chapter from the left to begin studying.</p>
                {!isSubscribed && volumeNumber === 1 && (
                  <p className="text-xs text-yellow-600 mt-2">
                    Chapters 1–{FREE_TOPIC_LIMIT} are free. Subscribe to unlock the rest.
                  </p>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{selected.title}</h3>
                {selected.subtitle && (
                  <p className="text-sm text-gray-500 mb-5">{selected.subtitle}</p>
                )}
                <div
                  className="ll-reading text-gray-300 text-sm"
                  dangerouslySetInnerHTML={{ __html: selected.content_html }}
                />
                <button
                  onClick={() => onAskRoman(`Can you explain "${selected.title}" in more detail?`)}
                  className="flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-sm px-4 py-2.5 rounded-xl transition-colors mt-6"
                >
                  <HelpCircle className="w-4 h-4" />
                  Ask R.O.M.A.N. about this chapter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PaywallPanel({ onSubscribe, onClose }: { onSubscribe: () => void; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
        <Star className="w-8 h-8 text-yellow-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Unlock Full Access</h3>
      <p className="text-gray-400 text-sm mb-6 max-w-sm">
        This chapter is part of the full Layman's Law curriculum. Subscribe to unlock all volumes, all chapters, and unlimited R.O.M.A.N. guidance.
      </p>

      <div className="bg-gray-800 border border-yellow-500/30 rounded-2xl p-5 mb-6 w-full max-w-sm">
        <p className="text-yellow-400 font-bold text-lg mb-1">$9.99 / month</p>
        <ul className="text-xs text-gray-300 space-y-1.5 text-left mt-3">
          <li className="flex gap-2"><span className="text-green-400">✓</span> All 20 volumes of real law</li>
          <li className="flex gap-2"><span className="text-green-400">✓</span> Unlimited R.O.M.A.N. legal Q&amp;A</li>
          <li className="flex gap-2"><span className="text-green-400">✓</span> FCRA, FDCPA, TILA, tort law, tax law &amp; more</li>
          <li className="flex gap-2"><span className="text-green-400">✓</span> Series I Certificate after Final Exam</li>
          <li className="flex gap-2"><span className="text-green-400">✓</span> Cancel anytime</li>
        </ul>
      </div>

      <button
        onClick={onSubscribe}
        className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3 rounded-xl text-sm transition-colors w-full max-w-sm"
      >
        Subscribe — $9.99/month
      </button>
      <button onClick={onClose} className="mt-3 text-xs text-gray-600 hover:text-gray-400 transition-colors">
        Continue with free chapters
      </button>
    </div>
  )
}

const READING_STYLES = `
.ll-reading .read-body { margin-bottom: 1rem; line-height: 1.65; }
.ll-reading .read-h2 { color: #facc15; font-weight: 600; font-size: 1rem; margin-top: 1.5rem; margin-bottom: 0.75rem; }
.ll-reading .read-bullet { padding-left: 1.25rem; position: relative; margin-bottom: 0.5rem; line-height: 1.55; }
.ll-reading .read-bullet::before { content: "•"; color: #facc15; position: absolute; left: 0.25rem; font-weight: bold; }
.ll-reading .read-callout { background: rgba(30, 58, 138, 0.25); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 0.75rem; padding: 1rem; margin: 1rem 0; }
.ll-reading .read-scenario { background: #1f2937; border: 1px solid #374151; border-radius: 0.75rem; padding: 1rem; margin: 1rem 0; }
.ll-reading .read-scenario-label { color: #facc15; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
.ll-reading .read-scenario-text { color: #d1d5db; font-size: 0.875rem; line-height: 1.6; }
.ll-reading .read-term { margin: 0.875rem 0; border-left: 3px solid rgba(250, 204, 21, 0.4); padding-left: 0.875rem; }
.ll-reading .read-term-name { color: #fde047; font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem; }
.ll-reading .read-term-def { color: #d1d5db; font-size: 0.875rem; line-height: 1.6; }
.ll-reading .read-warning { background: rgba(127, 29, 29, 0.25); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 0.75rem; padding: 1rem; margin: 1rem 0; color: #fecaca; }
.ll-reading strong { color: #fff; font-weight: 600; }
.ll-reading em { color: #fde047; font-style: italic; }
`
