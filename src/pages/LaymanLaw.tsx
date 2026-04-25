import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import LaymanLawVolume from '@/components/LaymanLawVolume'
import LaymanLawCompanion from '@/components/LaymanLawCompanion'
import { BookOpen, Award, Flame, Lock, Star } from 'lucide-react'

const VOLUMES = [
  { number: 1,  title: 'Consumer Protection Fundamentals', description: 'FCRA, FDCPA, TILA — your rights with creditors and debt collectors' },
  { number: 2,  title: 'Debt Collection Defense',          description: 'Validation letters, cease and desist, dispossessory defense' },
  { number: 3,  title: 'Credit Report Mastery',            description: 'Disputes, reporting timelines, CFPB complaint procedures' },
  { number: 4,  title: 'Contract Law Basics',              description: 'What makes a contract valid, breach, and your remedies' },
  { number: 5,  title: 'Tenant and Housing Rights',        description: 'Lease law, habitability standards, eviction defense' },
  { number: 6,  title: 'Small Claims and Court Procedures',description: 'How to file, what to expect, how to win your case' },
  { number: 7,  title: 'Identity Theft and Fraud',         description: '18 U.S.C. §1028 protections, recovery procedures, fraud alerts' },
  { number: 8,  title: 'Business Formation Basics',        description: 'LLCs, EINs, operating agreements, protecting your assets' },
  { number: 9,  title: 'Estate Planning Fundamentals',     description: 'Wills, trusts, beneficiaries, protecting generational wealth' },
  { number: 10, title: 'Sovereign Financial Literacy',     description: 'UCC filings, trust structures, asset protection strategy' },
]

export default function LaymanLaw() {
  const [activeVolume, setActiveVolume]     = useState<number | null>(null)
  const [companionOpen, setCompanionOpen]   = useState(false)
  const [progress, setProgress]             = useState<Record<number, { completed: boolean; score: number }>>({})
  const [streak, setStreak]                 = useState(0)
  const [certificates, setCertificates]     = useState<number[]>([])
  const [isSubscribed, setIsSubscribed]     = useState(false)
  const [checkingOut, setCheckingOut]       = useState(false)

  useEffect(() => { loadProgress() }, [])

  async function loadProgress() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: prog }, { data: streakData }, { data: certs }, { data: sub }] = await Promise.all([
      supabase.from('ll_volume_progress').select('volume_number, completed, best_score').eq('user_id', user.id),
      supabase.from('ll_streaks').select('current_streak').eq('user_id', user.id).maybeSingle(),
      supabase.from('ll_certificates').select('volume_number').eq('user_id', user.id),
      supabase.from('subscriptions').select('status').eq('user_id', user.id).eq('plan_name', 'layman_law').eq('status', 'active').maybeSingle(),
    ])

    const progressMap: Record<number, { completed: boolean; score: number }> = {}
    for (const p of (prog ?? [])) {
      progressMap[p.volume_number] = { completed: p.completed, score: p.best_score ?? 0 }
    }
    setProgress(progressMap)
    setStreak(streakData?.current_streak ?? 0)
    setCertificates((certs ?? []).map(c => c.volume_number))
    setIsSubscribed(!!sub)
  }

  async function handleSubscribe() {
    setCheckingOut(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: { session } } = await supabase.auth.getSession()
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const res = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ tier: 'layman_law', price: '9.99', userId: user.id, userEmail: user.email }),
      })
      const { url, error } = await res.json()
      if (error) { console.error('Checkout error:', error); return }
      if (url) window.location.href = url
    } finally {
      setCheckingOut(false)
    }
  }

  const completedCount = Object.values(progress).filter(p => p.completed).length

  const volumeList = VOLUMES.map((v, i) => {
    const prevCompleted = i === 0 || progress[i]?.completed === true
    const canOpen = i === 0
      ? true
      : isSubscribed && prevCompleted
    return {
      ...v,
      canOpen,
      completed:  progress[v.number]?.completed ?? false,
      hasCert:    certificates.includes(v.number),
      needsSub:   i > 0 && !isSubscribed,
    }
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-yellow-500/30 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">Layman's Law</h1>
            <p className="text-gray-400 text-sm mt-1">Legal literacy for everyone — powered by R.O.M.A.N.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-1 text-orange-400">
                <Flame className="w-4 h-4" />
                <span className="font-bold">{streak}</span>
              </div>
              <p className="text-xs text-gray-500">Day Streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-yellow-400">
                <Award className="w-4 h-4" />
                <span className="font-bold">{certificates.length}</span>
              </div>
              <p className="text-xs text-gray-500">Certificates</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-green-400">
                <BookOpen className="w-4 h-4" />
                <span className="font-bold">{completedCount}/10</span>
              </div>
              <p className="text-xs text-gray-500">Volumes</p>
            </div>
            <button
              onClick={() => setCompanionOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Ask R.O.M.A.N.
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-gray-900 px-6 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-24">Your Progress</span>
            <div className="flex-1 bg-gray-800 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / 10) * 100}%` }}
              />
            </div>
            <span className="text-xs text-yellow-400 w-12 text-right">{completedCount * 10}%</span>
          </div>
        </div>
      </div>

      {/* Freemium upgrade banner */}
      {!isSubscribed && (
        <div className="bg-gradient-to-r from-yellow-900/40 to-amber-900/40 border-b border-yellow-500/30 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-yellow-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-yellow-300">Free preview: Volume I · Topics 1–3</p>
                <p className="text-xs text-gray-400">Unlock all 10 volumes + R.O.M.A.N. deep dives for $9.99/month</p>
              </div>
            </div>
            <button
              onClick={handleSubscribe}
              disabled={checkingOut}
              className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-black font-bold px-5 py-2 rounded-lg text-sm transition-colors shrink-0"
            >
              {checkingOut ? 'Redirecting…' : 'Unlock Full Access — $9.99/mo'}
            </button>
          </div>
        </div>
      )}

      {/* Volume grid */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {volumeList.map(vol => (
            <button
              key={vol.number}
              onClick={() => vol.canOpen ? setActiveVolume(vol.number) : (vol.needsSub ? handleSubscribe() : null)}
              className={`text-left p-5 rounded-xl border transition-all duration-200 ${
                vol.canOpen
                  ? vol.completed
                    ? 'bg-green-950/40 border-green-500/40 hover:border-green-400/60'
                    : 'bg-gray-900 border-gray-700 hover:border-yellow-500/60 hover:bg-gray-800'
                  : vol.needsSub
                    ? 'bg-yellow-900/10 border-yellow-500/20 hover:border-yellow-500/40 cursor-pointer'
                    : 'bg-gray-900/40 border-gray-800 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Volume {vol.number}</span>
                <div className="flex items-center gap-1">
                  {vol.hasCert && <Award className="w-4 h-4 text-yellow-400" />}
                  {!vol.canOpen && vol.needsSub && <Star className="w-4 h-4 text-yellow-600" />}
                  {!vol.canOpen && !vol.needsSub && <Lock className="w-4 h-4 text-gray-600" />}
                  {vol.completed && <span className="text-xs text-green-400">✓</span>}
                </div>
              </div>
              <h3 className={`font-semibold text-sm mb-1 ${vol.canOpen ? 'text-white' : vol.needsSub ? 'text-yellow-200/70' : 'text-gray-600'}`}>
                {vol.title}
              </h3>
              <p className={`text-xs leading-relaxed ${vol.canOpen ? 'text-gray-400' : vol.needsSub ? 'text-gray-500' : 'text-gray-700'}`}>
                {vol.description}
              </p>
              {vol.canOpen && !vol.completed && (
                <div className="mt-3 text-xs text-yellow-500 font-medium">Start →</div>
              )}
              {vol.completed && (
                <div className="mt-3 text-xs text-green-400 font-medium">Completed ✓</div>
              )}
              {vol.needsSub && (
                <div className="mt-3 text-xs text-yellow-500 font-medium">Subscribe to unlock →</div>
              )}
              {!vol.canOpen && !vol.needsSub && (
                <div className="mt-3 text-xs text-gray-600">Complete Volume {vol.number - 1} to unlock</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Volume modal */}
      {activeVolume !== null && (
        <LaymanLawVolume
          volumeNumber={activeVolume}
          isSubscribed={isSubscribed}
          onClose={() => { setActiveVolume(null); loadProgress() }}
          onAskRoman={() => { setActiveVolume(null); setCompanionOpen(true) }}
          onSubscribe={handleSubscribe}
        />
      )}

      {/* R.O.M.A.N. Companion */}
      {companionOpen && (
        <LaymanLawCompanion onClose={() => setCompanionOpen(false)} />
      )}
    </div>
  )
}
