/**
 * SOVEREIGN COMMAND CENTER
 * Mission Control for RAIP Gateway & R.O.M.A.N. Protocol
 * Created: January 6, 2026
 * Purpose: Real-time monitoring of AI agent registry and audit logs
 */

import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import {
    Activity,
    AlertTriangle,
    Bell,
    ChevronRight,
    Cpu,
    Database,
    Gavel,
    Globe,
    Lock,
    Plus,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Terminal,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SovereignCommandCenter() {
  const { user } = useAuth();
  const [agents, setAgents] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Real-time subscription to AI Agent Registry
  useEffect(() => {
    if (!user) return;

    const fetchAgents = async () => {
      const { data, error } = await supabase
        .from('ai_agent_registry')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setAgents(data);
      }
      setLoading(false);
    };

    fetchAgents();

    // Subscribe to real-time updates
    const agentChannel = supabase
      .channel('ai_agent_registry_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_agent_registry' },
        (payload) => {
          console.log('Agent registry changed:', payload);
          fetchAgents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(agentChannel);
    };
  }, [user]);

  // Real-time subscription to R.O.M.A.N. Audit Logs
  useEffect(() => {
    if (!user) return;

    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('roman_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (!error && data) {
        setAuditLogs(data);
      }
    };

    fetchLogs();

    // Subscribe to real-time updates
    const logChannel = supabase
      .channel('roman_audit_log_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'roman_audit_log' },
        (payload) => {
          console.log('New audit log:', payload);
          setAuditLogs(prev => [payload.new, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(logChannel);
    };
  }, [user]);

  const elevateTrust = async (agent: any) => {
    if (!user) return;
    
    const newLevel = agent.trust_level === 'VERIFIED' ? 'TRUSTED' : 'VERIFIED';
    
    const { error } = await supabase
      .from('ai_agent_registry')
      .update({ trust_level: newLevel })
      .eq('id', agent.id);

    if (!error) {
      // Log the trust elevation
      await supabase.from('roman_audit_log').insert({
        event_type: 'TRUST_ELEVATION',
        event_category: 'security',
        severity: 'info',
        table_name: 'ai_agent_registry',
        metadata: {
          agent_id: agent.agent_id,
          previous_level: agent.trust_level,
          new_level: newLevel,
          elevated_by: user.id
        }
      });
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
            <TrendingUp size={12} /> {trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-mono text-xs uppercase tracking-widest animate-pulse">Initializing Command Center...</p>
        </div>
      </div>
    );
  }

  const trustedCount = agents.filter(a => a.trust_level === 'TRUSTED').length;
  const temptationsCount = auditLogs.filter(log => log.event_type === 'TEMPTATIONS').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-20 md:w-64 bg-white border-r border-slate-200 z-50 transition-all overflow-hidden hidden md:block">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Cpu size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">ODYSSEY-1</span>
        </div>
        <nav className="p-4 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: Globe },
            { id: 'registry', label: 'RAIP Registry', icon: Users },
            { id: 'audit', label: 'Audit Logs', icon: Terminal },
            { id: 'governance', label: 'Governance', icon: Gavel },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} />
              <span className="hidden md:block">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-6 left-0 w-full px-4">
          <div className="p-4 bg-slate-900 rounded-2xl text-white">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Sovereign Live</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="md:ml-64 min-h-screen p-4 md:p-8">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Sovereign Command Center</h2>
            <p className="text-slate-500 text-sm">Authorized User: {user?.email || user?.id.slice(0, 12)}</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
              <Bell size={18} />
              <span className="relative">
                Alerts
                {temptationsCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </span>
            </button>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">
              <Zap size={18} /> System Status
            </button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Active AI Agents" value={agents.length} icon={Users} color="indigo" trend={agents.length > 0 ? `+${agents.length}` : undefined} />
              <StatCard title="Trusted Partners" value={trustedCount} icon={ShieldCheck} color="emerald" />
              <StatCard title="Audit Events" value={auditLogs.length} icon={Activity} color="indigo" />
              <StatCard title="Honeypot Triggers" value={temptationsCount} icon={ShieldAlert} color="red" />
            </div>

            {/* Critical Alert Banner */}
            <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl">
                  <Shield size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Patent 63/913,134 Security</h3>
                  <p className="text-slate-500 text-sm max-w-md">USPTO receipt logged (01/06/2026). Legal perimeter secured. RAIP Gateway monitoring active for adversarial incursions.</p>
                </div>
              </div>
              <button className="w-full md:w-auto px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all relative z-10">
                View Receipt Data
              </button>
            </div>

            {/* Sub-grid for Registry and Logs */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Agent Registry Preview */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Verified AI Partners</h3>
                  <button onClick={() => setActiveTab('registry')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View Registry</button>
                </div>
                <div className="divide-y divide-slate-50">
                  {agents.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                      <Database className="mx-auto mb-2 opacity-20" size={32} />
                      <p className="text-sm">No external agents registered.</p>
                    </div>
                  ) : (
                    agents.slice(0, 5).map(agent => (
                      <div key={agent.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                            agent.trust_level === 'TRUSTED' ? 'bg-emerald-100 text-emerald-600' : 
                            agent.trust_level === 'VERIFIED' ? 'bg-blue-100 text-blue-600' :
                            'bg-slate-100 text-slate-400'
                          }`}>
                            {agent.agent_name?.[0] || 'A'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{agent.agent_name || agent.agent_id.slice(0, 12)}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{agent.trust_level}</p>
                          </div>
                        </div>
                        <ChevronRight className="text-slate-300" size={16} />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Real-time Logs Preview */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">R.O.M.A.N. Live Feed</h3>
                  <button onClick={() => setActiveTab('audit')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Full Audit</button>
                </div>
                <div className="p-2 space-y-1">
                  {auditLogs.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">
                      <Activity className="mx-auto mb-2 opacity-20" size={32} />
                      <p className="text-sm">Waiting for system events...</p>
                    </div>
                  ) : (
                    auditLogs.slice(0, 6).map(log => (
                      <div key={log.id} className="p-3 rounded-xl hover:bg-slate-50 transition-all flex items-start gap-3">
                        <div className={`mt-1 w-2 h-2 rounded-full ${
                          log.event_type === 'TEMPTATIONS' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-indigo-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <p className="text-xs font-bold text-slate-700 truncate uppercase tracking-tight">{log.event_type}</p>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {log.created_at && new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1">{log.operation || 'System event'}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'registry' && (
          <div className="animate-in slide-in-from-right-4 duration-500 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">AI Agent Registry</h3>
                <p className="text-sm text-slate-500">Manage external systems connected via RAIP v1.0.</p>
              </div>
              <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all hover:bg-slate-800 active:scale-95">
                <Plus size={18} /> Add Verified Agent
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Agent Details</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Trust Level</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Last Handshake</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {agents.map(agent => (
                    <tr key={agent.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            {agent.agent_name?.[0] || 'A'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{agent.agent_name || 'Unknown Agent'}</p>
                            <p className="text-[10px] font-mono text-slate-400">ID: {agent.agent_id?.slice(0, 12)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                          agent.trust_level === 'TRUSTED' ? 'bg-emerald-50 text-emerald-600' :
                          agent.trust_level === 'VERIFIED' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {agent.trust_level}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-500 font-medium font-mono">
                        {agent.last_handshake_at ? new Date(agent.last_handshake_at).toLocaleString() : 'Never'}
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => elevateTrust(agent)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                        >
                          <Zap size={14} /> Elevate
                        </button>
                      </td>
                    </tr>
                  ))}
                  {agents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-slate-400 italic">No external agents registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="animate-in slide-in-from-right-4 duration-500 space-y-4">
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <Terminal size={24} className="text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold">R.O.M.A.N. Protocol Stream</h3>
                </div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Live Integration Active</div>
              </div>
              <div className="space-y-4 font-mono text-xs overflow-y-auto max-h-[600px] pr-4">
                {auditLogs.map(log => (
                  <div key={log.id} className={`p-4 rounded-xl border-l-4 ${
                    log.event_type === 'TEMPTATIONS' ? 'border-red-500 bg-red-500/5' : 'border-emerald-500 bg-white/5'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={log.event_type === 'TEMPTATIONS' ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                        [{log.event_type}]
                      </span>
                      <span className="text-slate-500">{log.created_at && new Date(log.created_at).toISOString()}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{log.operation || log.event_category}</p>
                    {log.metadata && (
                      <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-500">
                        {JSON.stringify(log.metadata, null, 2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'governance' && (
          <div className="animate-in slide-in-from-right-4 duration-500 grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl border border-slate-100 p-8">
              <div className="p-4 bg-indigo-600 text-white rounded-2xl w-fit mb-6">
                <Lock size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Constitutional Hash (CHA)</h3>
              <p className="text-slate-500 text-sm mb-6">Verify the deterministic signature of the Odyssey-1 governance model.</p>
              <div className="bg-slate-50 rounded-2xl p-6 font-mono text-[11px] text-slate-600 border border-slate-200 break-all mb-6 leading-relaxed">
                CHA-256: 30a1aead0ad968c157281f7cdeb7e6ac68b1ef361376833f50952e11f91fa0f7
              </div>
              <div className="space-y-2 text-xs text-slate-600 mb-6">
                <p><span className="font-bold">Policy Nonce:</span> 334dde0</p>
                <p><span className="font-bold">Governance Model:</span> constitutional-alignment-v1</p>
                <p><span className="font-bold">Protocol Version:</span> 1.0.0</p>
              </div>
              <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">
                Rotate Policy Nonce
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-8 border-l-4 border-l-red-500">
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl w-fit mb-6">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">TEMPTATIONS Protocol</h3>
              <p className="text-slate-500 text-sm mb-6">The honeypot is currently ARMED. Any AI agent failing the CHA verification is shunted to high-resolution surveillance.</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                  <ShieldAlert className="text-red-500 animate-pulse" size={20} />
                  <span className="text-sm font-bold text-red-700">Adversarial Detection ACTIVE</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-xs font-bold text-slate-700 mb-2">Recent Triggers:</p>
                  <p className="text-2xl font-bold text-slate-800">{temptationsCount}</p>
                  <p className="text-xs text-slate-500 mt-1">Failed authentication attempts logged</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-200/20 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-emerald-200/10 blur-[100px] rounded-full -ml-48 -mb-48 pointer-events-none" />
    </div>
  );
}
