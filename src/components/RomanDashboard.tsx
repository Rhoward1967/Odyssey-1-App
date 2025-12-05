import { createClient } from '@supabase/supabase-js';
import {
    Activity,
    BrainCircuit,
    Lock,
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
    Terminal
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function RomanDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    // Fetch metrics
    const { data: metricData } = await supabase
      .from('roman_ops_metrics')
      .select('*')
      .single();
    // Fetch trends
    const { data: trendData } = await supabase
      .from('roman_daily_trends')
      .select('*');
    // Fetch recent logs (last 20)
    const { data: logData } = await supabase
      .from('roman_commands')
      .select('id, command_text, status, logical_validation, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    setMetrics(metricData);
    setTrends(trendData || []);
    setLogs(
      (logData || []).map((log) => ({
        id: log.id,
        cmd: log.command_text,
        status: log.status,
        risk: log.logical_validation?.risk_score ?? 0,
        time: new Date(log.created_at).toLocaleTimeString(),
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
     
  }, []);

  const refreshData = async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <header className="mb-8 flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
            <BrainCircuit className="text-indigo-400 h-8 w-8" />
            R.O.M.A.N.
            <span className="text-slate-500 text-lg font-normal">Dual-Hemisphere Operations</span>
          </h1>
          <p className="text-slate-400 mt-1">System Status: <span className="text-emerald-400 font-mono">ONLINE // SOVEREIGN</span></p>
        </div>
        <button 
          onClick={refreshData}
          className={`flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all ${loading ? 'opacity-70' : ''}`}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Pulse
        </button>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="24h Volume"
          value={metrics?.commands_24h ?? '--'}
          icon={<Activity className="text-blue-400" />}
          sub="Commands Processed"
        />
        <KpiCard
          title="Approval Rate"
          value={metrics ? `${((metrics.total_approved / metrics.total_commands) * 100).toFixed(1)}%` : '--'}
          icon={<ShieldCheck className="text-emerald-400" />}
          sub="Governance Pass"
        />
        <KpiCard
          title="Intervention Rate"
          value={metrics ? `${((metrics.total_corrections / metrics.total_commands) * 100).toFixed(1)}%` : '--'}
          icon={<ShieldAlert className="text-amber-400" />}
          sub="Logic Core Corrections"
        />
        <KpiCard
          title="Avg Risk Score"
          value={metrics?.avg_risk_score ?? '--'}
          icon={<Lock className="text-rose-400" />}
          sub="0-10 Scale"
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 space-y-8">
          {/* Activity Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              Hemisphere Activity (14 Days)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 12}} />
                  <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend />
                  <Bar dataKey="approved" name="Approved" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="corrected" name="Corrected" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="volume" name="Total Vol" fill="#3b82f6" fillOpacity={0.1} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Profile */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Lock className="h-5 w-5 text-rose-400" />
              Risk Score Trend
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 12}} />
                  <YAxis stroke="#64748b" tick={{fontSize: 12}} domain={[0, 10]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                  />
                  <Line type="monotone" dataKey="risk" stroke="#f43f5e" strokeWidth={2} dot={{fill: '#f43f5e'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full flex flex-col">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Terminal className="h-5 w-5 text-slate-400" />
            Live Governance Feed
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {logs.map((log) => (
              <div key={log.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${getStatusColor(log.status)}`}>
                    {log.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{log.time}</span>
                </div>
                <p className="text-sm text-slate-200 font-mono truncate">{log.cmd}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <span>Risk Score:</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${getRiskColor(log.risk)}`} 
                      style={{ width: `${(log.risk / 10) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono">{log.risk}/10</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 text-center">
             <button className="text-sm text-indigo-400 hover:text-indigo-300">View Full Audit Log</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helpers
function KpiCard({ title, value, icon, sub }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:bg-slate-800/50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-slate-500">{sub}</div>
    </div>
  );
}

function getStatusColor(status) {
  switch (status) {
    case 'APPROVED': return 'bg-emerald-500/10 text-emerald-400';
    case 'CORRECTED_BY_LOGIC': return 'bg-amber-500/10 text-amber-400';
    case 'BLOCKED_BY_LOGIC': return 'bg-rose-500/10 text-rose-400';
    default: return 'bg-slate-500/10 text-slate-400';
  }
}

function getRiskColor(score) {
  if (score < 4) return 'bg-emerald-500';
  if (score < 8) return 'bg-amber-500';
  return 'bg-rose-500';
}
