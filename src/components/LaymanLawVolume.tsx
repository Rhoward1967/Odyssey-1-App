import { useState, useEffect } from 'react'
import { X, ChevronRight, BookOpen, HelpCircle } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface KnowledgeEntry {
  id: string
  key_name: string
  topic: string
  content: Record<string, any>
}

interface Props {
  volumeNumber: number
  onClose: () => void
  onAskRoman: (question: string) => void
}

export default function LaymanLawVolume({ volumeNumber, onClose, onAskRoman }: Props) {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [selected, setSelected] = useState<KnowledgeEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEntries()
  }, [volumeNumber])

  async function loadEntries() {
    setLoading(true)
    const { data } = await supabase
      .from('layman_law_knowledge')
      .select('id, key_name, topic, content')
      .eq('volume_number', volumeNumber)
      .neq('key_name', 'guardrail_scope_boundary')
      .order('key_name')
    setEntries(data ?? [])
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <p className="text-xs text-yellow-500 font-medium">Volume {volumeNumber}</p>
            <h2 className="text-lg font-bold text-white">Consumer Protection Fundamentals</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Entry list */}
          <div className="w-64 border-r border-gray-800 overflow-y-auto p-3 space-y-1 shrink-0">
            {loading ? (
              <p className="text-gray-500 text-sm p-3">Loading...</p>
            ) : entries.length === 0 ? (
              <p className="text-gray-500 text-sm p-3">Content coming soon for this volume.</p>
            ) : (
              entries.map(e => (
                <button
                  key={e.id}
                  onClick={() => setSelected(e)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors ${
                    selected?.id === e.id
                      ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3 h-3 shrink-0" />
                    <span className="leading-tight">{e.topic}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Content panel */}
          <div className="flex-1 overflow-y-auto p-6">
            {!selected ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <BookOpen className="w-12 h-12 text-gray-700 mb-3" />
                <p className="text-gray-500 text-sm">Select a topic from the left to begin studying.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">{selected.topic}</h3>

                {selected.content.summary && (
                  <div className="bg-gray-800 rounded-xl p-4 mb-5 border border-gray-700">
                    <p className="text-gray-200 text-sm leading-relaxed">{selected.content.summary}</p>
                  </div>
                )}

                {selected.content.steps && (
                  <div className="mb-5">
                    <h4 className="text-yellow-400 font-semibold text-sm mb-3">Steps to Take</h4>
                    <ol className="space-y-2">
                      {selected.content.steps.map((step: string, i: number) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-300">
                          <span className="text-yellow-500 font-bold shrink-0">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {selected.content.prohibited && (
                  <div className="mb-5">
                    <h4 className="text-red-400 font-semibold text-sm mb-3">Prohibited Practices</h4>
                    <ul className="space-y-2">
                      {selected.content.prohibited.map((item: string, i: number) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-300">
                          <span className="text-red-500 shrink-0">✗</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.content.items && (
                  <div className="mb-5">
                    <h4 className="text-yellow-400 font-semibold text-sm mb-3">Reporting Periods</h4>
                    <div className="space-y-2">
                      {Object.entries(selected.content.items).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm border-b border-gray-800 pb-2">
                          <span className="text-gray-400">{k}</span>
                          <span className="text-white font-medium">{v as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selected.content.remedy && (
                  <div className="bg-green-950/40 border border-green-500/30 rounded-xl p-4 mb-5">
                    <h4 className="text-green-400 font-semibold text-sm mb-1">Your Remedy</h4>
                    <p className="text-gray-300 text-sm">{selected.content.remedy}</p>
                  </div>
                )}

                {selected.content.key_statute && (
                  <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl px-4 py-3 mb-5">
                    <p className="text-blue-400 text-xs font-medium">Key Statute: {selected.content.key_statute}</p>
                  </div>
                )}

                {selected.content.deadline_days && (
                  <div className="bg-red-950/40 border border-red-500/30 rounded-xl px-4 py-3 mb-5">
                    <p className="text-red-400 text-xs font-medium">
                      ⚠ Deadline: {selected.content.deadline_days} days — missing this can destroy your case
                    </p>
                  </div>
                )}

                <button
                  onClick={() => onAskRoman(`Can you explain "${selected.topic}" in more detail?`)}
                  className="flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-sm px-4 py-2.5 rounded-xl transition-colors mt-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  Ask R.O.M.A.N. about this topic
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
