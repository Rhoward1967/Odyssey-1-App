import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { BookOpen, Award, Flame, Lock, Star, LogOut } from 'lucide-react'
import LaymanLawVolume from '../components/LaymanLawVolume'
import LaymanLawCompanion from '../components/LaymanLawCompanion'

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

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeVolume, setActiveVolume]   = useState<number | null>(null)
  const [companionOpen, setCompanionOpen] = useState(false)
  const [progress, setProgress]           = useState<Record<number, { completed: boolean }>>({})
  const [streak, setStreak]               = useState(0)
  const [certificates, setCertificates]   = useState<number[]>([])
  const [isSubscribed, setIsSubscribed]   = useState(false)
  const [checkingOut, setCheckingOut]     = useState(false)

  useEffect(() => { loadProgress() }, [])

  async function loadProgress() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: prog }, { data: streakData }, { data: certs }, { data: sub }] = await Promise.all([
      supabase.from('ll_volume_progress').select('volume_number, completed').eq('user_id', user.id),
      supabase.from('ll_streaks').select('current_streak').eq('user_id', user.id).maybeSingle(),
      supabase.from('ll_certificates').select('volume_number').eq('user_id', user.id),
      supabase.from('subscriptions').select('status').eq('user_id', user.id).eq('plan_name', 'layman_law').eq('status', 'active').maybeSingle(),
    ])

    const map: Record<number, { completed: boolean }> = {}
    for (const p of (prog ?? [])) map[p.volume_number] = { completed: p.completed }
    setProgress(map)
    setStreak(streakData?.current_streak ?? 0)
    setCertificates((certs ?? []).map(c => c.volume_number))
    setIsSubscribed(!!sub)
  }

  async function handleSubscribe() {
    setCheckingOut(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()
      if (!user || !session) return
      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ tier: 'layman_law', price: '9.99', userId: user.id, userEmail: user.email }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally {
      setCheckingOut(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  const completedCount = Object.values(progress).filter(p => p.completed).length

  const volumeList = VOLUMES.map((v, i) => ({
    ...v,
    canOpen:   i === 0 ? true : isSubscribed && (progress[i]?.completed === true),
    completed: progress[v.number]?.completed ?? false,
    hasCert:   certificates.includes(v.number),
    needsSub:  i > 0 && !isSubscribed,
  }))

  return (
    <div className="min-h-screen bg-gray-950 pb-6">

      {/* Header */}
      <div className="bg-gray-900 border-b border-yellow-500/20 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-yellow-400">Layman's Law</h1>
            <p className="text-xs text-gray-500">Legal literacy powered by R.O.M.A.N.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-orange-400">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-bold">{streak}</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-400">
              <Award className="w-4 h-4" />
              <span className="text-sm font-bold">{certificates.length}</span>
            </div>
            <button onClick={handleSignOut} className="text-gray-600 hover:text-gray-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-gray-800 rounded-full h-1.5">
            <div className="bg-yellow-500 h-1.5 rounded-full transition-all" style={{ width: `${completedCount * 10}%` }} />
          </div>
          <span className="text-xs text-gray-500">{completedCount}/10</span>
        </div>
      </div>

      {/* Upgrade banner */}
      {!isSubscribed && (
        <div className="mx-4 mt-4 bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-yellow-300 font-semibold text-sm">Free preview: Vol I · Topics 1–3</p>
            <p className="text-gray-500 text-xs mt-0.5">$9.99/mo unlocks everything</p>
          </div>
          <button
            onClick={handleSubscribe}
            disabled={checkingOut}
            className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-black font-bold px-4 py-2 rounded-xl text-xs shrink-0 transition-colors"
          >
            {checkingOut ? '…' : 'Unlock'}
          </button>
        </div>
      )}

      {/* R.O.M.A.N. button */}
      <div className="px-4 mt-4">
        <button
          onClick={() => setCompanionOpen(true)}
          className="w-full bg-gray-900 border border-yellow-500/30 hover:border-yellow-500/60 rounded-2xl p-4 flex items-center gap-3 transition-colors"
        >
          <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center shrink-0">
            <span className="text-yellow-400 font-bold text-sm">R</span>
          </div>
          <div className="text-left">
            <p className="text-white font-semibold text-sm">Ask R.O.M.A.N.</p>
            <p className="text-gray-500 text-xs">Your legal literacy companion</p>
          </div>
          <Star className="w-4 h-4 text-yellow-500/60 ml-auto" />
        </button>
      </div>

      {/* Volume list */}
      <div className="px-4 mt-4 space-y-3">
        <p className="text-xs text-gray-600 uppercase tracking-wider font-medium px-1">Volumes</p>
        {volumeList.map(vol => (
          <button
            key={vol.number}
            onClick={() => vol.canOpen ? setActiveVolume(vol.number) : (vol.needsSub ? handleSubscribe() : null)}
            className={`w-full text-left p-4 rounded-2xl border transition-all ${
              vol.canOpen
                ? vol.completed
                  ? 'bg-green-950/30 border-green-500/30 active:bg-green-950/50'
                  : 'bg-gray-900 border-gray-800 active:bg-gray-800'
                : vol.needsSub
                  ? 'bg-yellow-900/10 border-yellow-500/20 active:bg-yellow-900/20'
                  : 'bg-gray-900/40 border-gray-900 opacity-40'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-600">Vol {vol.number}</span>
                  {vol.completed && <span className="text-xs text-green-400 font-medium">✓ Done</span>}
                  {vol.needsSub && <span className="text-xs text-yellow-600">Subscribe</span>}
                </div>
                <p className={`font-semibold text-sm ${vol.canOpen ? 'text-white' : vol.needsSub ? 'text-yellow-200/60' : 'text-gray-600'}`}>
                  {vol.title}
                </p>
                <p className={`text-xs mt-0.5 leading-relaxed ${vol.canOpen ? 'text-gray-500' : 'text-gray-700'}`}>
                  {vol.description}
                </p>
              </div>
              <div className="shrink-0 mt-1">
                {vol.hasCert && <Award className="w-4 h-4 text-yellow-400" />}
                {!vol.canOpen && vol.needsSub && <Star className="w-4 h-4 text-yellow-700" />}
                {!vol.canOpen && !vol.needsSub && <Lock className="w-4 h-4 text-gray-700" />}
              </div>
            </div>
          </button>
        ))}
      </div>

      {activeVolume !== null && (
        <LaymanLawVolume
          volumeNumber={activeVolume}
          isSubscribed={isSubscribed}
          onClose={() => { setActiveVolume(null); loadProgress() }}
          onAskRoman={() => { setActiveVolume(null); setCompanionOpen(true) }}
          onSubscribe={handleSubscribe}
        />
      )}

      {companionOpen && <LaymanLawCompanion onClose={() => setCompanionOpen(false)} />}
    </div>
  )
}
