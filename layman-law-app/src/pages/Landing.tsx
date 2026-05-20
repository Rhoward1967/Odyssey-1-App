import { useNavigate } from 'react-router-dom'
import { BookOpen, Shield, Scale, CheckCircle, Star } from 'lucide-react'

const FEATURES = [
  { icon: BookOpen, text: '20 volumes of real law — from Tort Law to Environmental Law, every area that touches your everyday life' },
  { icon: Scale,    text: 'Real scenarios, not definitions — learn what a debt collector can legally do at 9pm and your rights at a traffic stop' },
  { icon: Star,     text: 'Series I Certificate after Final Exam — 50 scenario-based mastery questions, 80% to pass' },
  { icon: Shield,   text: 'Consumer protection, tax law, digital privacy, self-defense — the law that operates on you every day' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="w-16 h-16 bg-yellow-500/20 border border-yellow-500/40 rounded-2xl flex items-center justify-center mb-6">
          <Scale className="w-8 h-8 text-yellow-400" />
        </div>

        <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
          Know Your Rights. All of Them.
        </h1>
        <p className="text-xl text-yellow-400 font-semibold mb-4">
          The law applies to you every single day — most people just don't know it.
        </p>
        <p className="text-gray-400 text-base max-w-sm mb-10 leading-relaxed">
          Layman's Law is a complete legal education system built for people who were never taught the rules the system runs on. 20 volumes. 300+ lessons. Real scenarios. No law degree required.
        </p>

        <div className="w-full max-w-sm space-y-3 mb-8">
          <button
            onClick={() => navigate('/login?mode=signup')}
            className="w-full bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-black font-bold py-4 rounded-2xl text-base transition-colors"
          >
            Start Learning Free
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium py-4 rounded-2xl text-base transition-colors"
          >
            Sign In
          </button>
        </div>

        <p className="text-xs text-gray-600">Volume I free forever · Full access $9.99/month · Cancel anytime</p>
      </div>

      {/* Features */}
      <div className="bg-gray-900 border-t border-gray-800 px-6 py-10">
        <h2 className="text-center text-white font-bold text-lg mb-6">What you'll learn</h2>
        <div className="max-w-sm mx-auto space-y-4">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="px-6 py-10 text-center">
        <div className="bg-gray-900 border border-yellow-500/30 rounded-2xl p-6 max-w-sm mx-auto">
          <p className="text-xs text-yellow-500 font-semibold uppercase tracking-wider mb-1">Full Access</p>
          <p className="text-3xl font-bold text-white mb-1">$9.99<span className="text-base font-normal text-gray-400">/month</span></p>
          <p className="text-xs text-gray-500 mb-5">Cancel anytime</p>
          <ul className="text-sm text-gray-300 space-y-2 text-left mb-5">
            {['All 20 volumes', 'Unlimited R.O.M.A.N. Q&A', 'Series I Certificate after Final Exam', 'Offline reading'].map(f => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate('/login?mode=signup')}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-6 text-center border-t border-gray-900">
        <p className="text-xs text-gray-700">
          Legal education only — not legal advice. Consult an attorney for your specific situation.
        </p>
        <p className="text-xs text-gray-800 mt-1">© 2026 Howard Jones Bloodline Ancestral Trust</p>
      </div>
    </div>
  )
}
