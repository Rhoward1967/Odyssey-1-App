import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { BookOpen, Award, Flame, Lock, Star, LogOut } from 'lucide-react'
import LaymanLawVolume from '../components/LaymanLawVolume'
import LaymanLawCompanion from '../components/LaymanLawCompanion'

const ARCHITECT_EMAILS = ['generalmanager81@gmail.com']

type Volume = {
  id: number
  num: string
  emoji: string
  title: string
  subject: string
  is_locked: boolean
  sort_order: number
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export default function Dashboard() {
  const navigate = useNavigate()
  const [volumes, setVolumes]             = useState<Volume[]>([])
  const [activeVolume, setActiveVolume]   = useState<number | null>(null)
  const [companionOpen, setCompanionOpen] = useState(false)
  const [progress, setProgress]           = useState<Record<number, { completed: boolean }>>({})
  const [streak, setStreak]               = useState(0)
  const [certificates, setCertificates]   = useState<number[]>([])
  const [isSubscribed, setIsSubscribed]   = useState(false)
  const [isArchitect, setIsArchitect]     = useState(false)
  const [checkingOut, setCheckingOut]     = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: vols } = await supabase
      .from('ll_volumes')
      .select('id, num, emoji, title, subject, is_locked, sort_order')
      .eq('is_active', true)
      .order('sort_order')
    setVolumes(vols ?? [])

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
    const architect = user.email ? ARCHITECT_EMAILS.includes(user.email.toLowerCase()) : false
    setIsArchitect(architect)
    setIsSubscribed(!!sub || architect)
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

  const volumeList = volumes.map((v, i) => {
    const prevVol = i > 0 ? volumes[i - 1] : null
    const prevCompleted = i === 0 || (prevVol ? progress[prevVol.id]?.completed === true : false)
    return {
      ...v,
      number:      v.sort_order,
      description: v.subject,
      prevNum:     prevVol?.num ?? null,
      canOpen:     isArchitect || (i === 0 ? true : isSubscribed && prevCompleted),
      completed:   progress[v.id]?.completed ?? false,
      hasCert:     certificates.includes(v.id),
      needsSub:    i > 0 && !isSubscribed && !isArchitect,
    }
  })

  return (
    <div className="min-h-screen bg-gray-950 pb-6">

      {/* Header */}
      <div className="bg-gray-900 border-b border-yellow-500/20 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-yellow-400">Layman's Law</h1>
            <p className="text-xs text-gray-500">Real law, powered by R.O.M.A.N.</p>
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
            <div className="bg-yellow-500 h-1.5 rounded-full transition-all" style={{ width: `${volumes.length > 0 ? (completedCount / volumes.length) * 100 : 0}%` }} />
          </div>
          <span className="text-xs text-gray-500">{completedCount}/{volumes.length}</span>
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
                  <span className="text-xs text-gray-600">{vol.emoji} Vol {vol.num}</span>
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
          onClose={() => { setActiveVolume(null); loadData() }}
          onAskRoman={() => { setActiveVolume(null); setCompanionOpen(true) }}
          onSubscribe={handleSubscribe}
        />
      )}

      {companionOpen && <LaymanLawCompanion onClose={() => setCompanionOpen(false)} />}
    </div>
  )
}
