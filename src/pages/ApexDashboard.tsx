import {
    Activity,
    AlertTriangle,
    BarChart3,
    Building2,
    Clock,
    Cpu,
    Database,
    FileBadge,
    History,
    LayoutDashboard,
    LineChart,
    Lock,
    Orbit,
    Power,
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Unlock,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

const ApexDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeEntity, setActiveEntity] = useState('ODYSSEY'); // ODYSSEY or HJS
  const [glitch, setGlitch] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(14.23);
  const [neuralCapture, setNeuralCapture] = useState(0);
  const [isKillSwitchTriggered, setIsKillSwitchTriggered] = useState(false);
  
  const [logs, setLogs] = useState([
    { id: 1, text: "System kernel initialized...", type: "info" },
    { id: 2, text: "ODYSSEY-1 AI LLC & HJS SERVICES LLC linked.", type: "success" },
    { id: 3, text: "Awaiting mission authorization sequence.", type: "warning" }
  ]);
  
  const [liveStream, setLiveStream] = useState(() => 
    Array.from({ length: 30 }, (_, i) => ({
      val: 12 + Math.random() * 5,
      timestamp: Date.now() - (30 - i) * 1000
    }))
  );

  useEffect(() => {
    if (isKillSwitchTriggered) return;

    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, isAuthorized ? 5000 : 8000);

    const dataInterval = setInterval(() => {
      setLiveStream(prev => {
        const jitter = isAuthorized ? 8 : 6;
        const next = [...prev.slice(1), { 
          val: 12 + Math.random() * jitter, 
          timestamp: Date.now() 
        }];
        return next;
      });
      
      if (isAuthorized && isSyncing) {
        setSyncProgress(prev => {
          if (prev >= 100) return 100;
          return parseFloat((prev + Math.random() * 0.5).toFixed(2));
        });
      }

      if (activeTab === 'neural' && isAuthorized) {
        setNeuralCapture(prev => (prev + 1) % 101);
      }
    }, 2000);

    const logInterval = setInterval(() => {
      const messages = isAuthorized ? [
        "Neural link extraction optimized.",
        "HJS janitorial hygiene protocol: ACTIVE.",
        "Node ALPHA-01 maintenance cycle start.",
        "Encryption layer 7 holding steady.",
        "Physical site security verified at 149 Oneta."
      ] : [
        "License BT-0101233 verified.",
        "License BT-089217 (HJS) online.",
        "Bus utilization synchronized at 17.49%.",
        "Environmental scrub sequence standby.",
        "Buffer overflow prevention active."
      ];
      const msg = messages[Math.floor(Math.random() * messages.length)];
      setLogs(prev => [{ id: Date.now(), text: msg, type: "info" }, ...prev.slice(0, 5)]);
    }, 6000);

    return () => {
      clearInterval(glitchInterval);
      clearInterval(dataInterval);
      clearInterval(logInterval);
    };
  }, [isAuthorized, isSyncing, isKillSwitchTriggered, activeTab]);

  const entities = {
    ODYSSEY: {
      name: "ODYSSEY-1 AI LLC",
      license: "BT-0101233",
      classification: "OTHER SPECIALIZED SERVICES",
      expiry: "DEC 31, 2025",
      color: "emerald"
    },
    HJS: {
      name: "HJS SERVICES LLC",
      license: "BT-089217",
      classification: "JANITORIAL SERVICES",
      expiry: "DEC 31, 2026",
      color: "cyan"
    }
  };

  const currentEntity = entities[activeEntity];

  const data = {
    status: isAuthorized ? "🔥 MISSION AUTHORIZED: EXTRACTION IN PROGRESS" : "🟢 APEX MANAGEMENT v2.16: MISSION AUTHORIZATION READY",
    alpha_injection_signal: isAuthorized ? `⚡ LIVE SYNC ACTIVE: Liquidity Extraction at ${syncProgress}%` : "⏳ STANDBY: Window opens Jan 18, 2026. Awaiting Liquidity Sync.",
    alpha_prefetch_efficiency_gain_pct: "15.84",
    alpha_branch_prediction_relief_pct: "16.83",
    alpha_cache_coherency_gain_pct: "13.53",
    alpha_power_efficiency_gain_pct: "10.23",
    alpha_bus_utilization_relief_pct: "17.49",
    estimated_ns_latency_relief: "14.23",
    location: "149 ONETA ST, SUITE 3, ATHENS, GA"
  };

  const nodes = [
    { id: 'ALPHA-01', status: 'ONLINE', load: isAuthorized ? '78%' : '12%', temp: '54°C', location: 'NA-EAST' },
    { id: 'BETA-04', status: 'ONLINE', load: isAuthorized ? '62%' : '45%', temp: '51°C', location: 'EU-CENTRAL' },
    { id: 'GAMMA-09', status: isAuthorized ? 'ONLINE' : 'OPTIMIZING', load: isAuthorized ? '71%' : '89%', temp: '68°C', location: 'ASIA-SOUTH' },
    { id: 'DELTA-02', status: 'STANDBY', load: '2%', temp: '31°C', location: 'SA-EAST' },
  ];

  if (isKillSwitchTriggered) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex flex-col items-center justify-center font-mono p-4">
        <AlertTriangle size={80} className="animate-pulse mb-6" />
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">System Purge Active</h1>
        <p className="text-sm opacity-60 mb-8 tracking-[0.3em]">ALL LINKS TERMINATED // DATA SHREDDED</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 border border-red-500 hover:bg-red-500 hover:text-black transition-all font-black text-xs tracking-widest uppercase rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          Reboot Neural Kernel
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-200 font-mono flex selection:bg-emerald-500/30 overflow-hidden transition-colors duration-1000 ${isAuthorized ? 'bg-black' : ''}`}>
      {/* Sidebar Navigation */}
      <nav className="w-16 md:w-64 border-r border-slate-800 bg-slate-900/40 backdrop-blur-xl flex flex-col items-center md:items-start p-4 gap-8 z-30 shadow-2xl">
        <div className="flex flex-col items-center md:items-start gap-3 px-2 py-4 w-full">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShieldCheck className={`text-emerald-400 w-8 h-8 md:w-6 md:h-6 transition-all duration-300 ${glitch ? 'skew-x-12 translate-x-1 brightness-150' : ''}`} />
              <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-20 animate-pulse"></div>
            </div>
            <span className="hidden md:block font-black text-white tracking-tighter text-xl italic">APEX Hub</span>
          </div>
          <div className="flex flex-col gap-1 mt-4 w-full">
            <button 
              onClick={() => setActiveEntity('ODYSSEY')}
              className={`text-[9px] font-black p-2 rounded border transition-all uppercase tracking-widest ${activeEntity === 'ODYSSEY' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-slate-800 text-slate-600 hover:border-slate-600'}`}
            >
              Odyssey-1 Wing
            </button>
            <button 
              onClick={() => setActiveEntity('HJS')}
              className={`text-[9px] font-black p-2 rounded border transition-all uppercase tracking-widest ${activeEntity === 'HJS' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'border-slate-800 text-slate-600 hover:border-slate-600'}`}
            >
              HJS Services Wing
            </button>
          </div>
        </div>
        
        <div className="flex flex-col w-full gap-3">
          {[
            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'history', label: 'Performance', icon: LineChart },
            { id: 'neural', label: 'Neural Link', icon: Orbit },
            { id: 'sync', label: 'Liquidity Sync', icon: RefreshCw },
            { id: 'maintenance', label: 'Site Health', icon: Building2 },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all border group relative ${
                activeTab === item.id 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/40'
              }`}
            >
              <item.icon size={20} className={`${activeTab === item.id ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : ''} ${item.id === 'sync' && isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
              {activeTab === item.id && (
                <div className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-auto hidden md:block w-full">
          <button onClick={() => setIsKillSwitchTriggered(true)} className="w-full flex items-center gap-2 p-3 text-red-500 border border-red-950 bg-red-950/10 hover:bg-red-500 hover:text-black rounded-xl transition-all group mb-4 shadow-[0_0_15px_rgba(127,29,29,0.2)]">
            <Power size={18} className="group-hover:rotate-90 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest text-left">Purge System</span>
          </button>
          
          <div className="bg-black/40 p-4 rounded-xl border border-slate-800/60 backdrop-blur-md">
            <div className="text-[10px] text-slate-500 uppercase font-black mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 italic text-[8px] tracking-widest opacity-60">System Log</span>
              <span className={`w-1 h-1 rounded-full animate-ping ${isAuthorized ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'bg-emerald-500'}`}></span>
            </div>
            <div className="space-y-1 overflow-hidden h-24">
              {logs.map((log) => (
                <div key={log.id} className="text-[8px] text-slate-500 leading-tight font-light flex gap-2 animate-in slide-in-from-left-2 duration-300">
                  <span className={`${isAuthorized ? 'text-orange-500' : 'text-emerald-500'} shrink-0 font-bold`}>{">"}</span>
                  <span className="truncate">{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,1)_0%,rgba(2,6,23,1)_100%)] relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        
        <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-8 relative z-10">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800/50 pb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
                <FileBadge size={14} className={activeEntity === 'ODYSSEY' ? 'text-emerald-400' : 'text-cyan-400'} /> 
                <span className="flex items-center gap-2">
                  ENTITY: <span className="text-slate-300 font-bold">{currentEntity.name}</span>
                </span>
                <span className="text-slate-700 hidden lg:inline">|</span>
                <span className="hidden lg:inline text-slate-500">LIC: {currentEntity.license}</span>
              </div>
              <h1 className={`text-4xl font-black tracking-tighter text-white flex items-center gap-4 uppercase transition-all duration-75 ${glitch ? 'translate-x-1 skew-x-1 brightness-125' : ''}`}>
                Apex <span className={`${isAuthorized ? 'text-orange-500' : 'text-emerald-500'} italic drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]`}>v2.16</span>
              </h1>
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full animate-pulse ${isAuthorized ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,1)]' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)]'}`}></span>
                <p className={`font-black tracking-[0.2em] uppercase text-[10px] ${isAuthorized ? 'text-orange-400' : 'text-emerald-400'}`}>
                  {data.status}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              {!isAuthorized ? (
                <button 
                  onClick={() => {
                    setIsAuthorized(true);
                    setLogs(prev => [{ id: Date.now(), text: "WING AUTHORIZED. EXTRACTION SEQUENCE STARTED.", type: "warning" }, ...prev]);
                  }}
                  className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/40 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-emerald-500/40 flex items-center gap-2"
                >
                  <Unlock size={14} /> Authorize Wing
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setIsAuthorized(false);
                    setLogs(prev => [{ id: Date.now(), text: "WING LOCKED. EXTRACTION SEQUENCE PAUSED.", type: "info" }, ...prev]);
                  }}
                  className="bg-orange-500/20 hover:bg-orange-500 border border-orange-500/40 text-orange-400 hover:text-slate-950 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:shadow-orange-500/40 flex items-center gap-2"
                >
                  <Lock size={12} /> Master Locked
                </button>
              )}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-slate-900/90 border border-slate-700/50 px-6 py-4 rounded-2xl backdrop-blur-xl flex flex-col items-end">
                  <span className="text-slate-500 uppercase text-[8px] font-black tracking-[0.3em] mb-1 flex items-center gap-2">
                    <ShieldCheck size={12} className="text-amber-500" /> Environmental Status
                  </span>
                  <span className="text-amber-400 text-[10px] font-bold text-right italic">
                    Site: 149 ONETA ST (SUITE 3)
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Views */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Clock Alignment', val: '99.47', unit: '%', color: 'blue', icon: Clock },
                  { label: 'Signal Quality', val: '99.90', unit: 'dB', color: 'emerald', icon: Activity },
                  { label: 'Latency Relief', val: '-14.23', unit: 'ns', color: 'purple', icon: Zap },
                ].map((stat, i) => (
                  <div key={i} className={`bg-slate-900/40 border border-slate-800 p-8 rounded-3xl hover:border-${stat.color}-500/40 transition-all duration-500 group relative overflow-hidden shadow-xl`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <stat.icon size={80} />
                    </div>
                    <div className="flex justify-between items-center mb-6 relative z-10">
                      <h3 className={`text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] group-hover:text-${stat.color}-400 transition-colors`}>{stat.label}</h3>
                      <stat.icon size={16} className={`text-${stat.color}-400 group-hover:rotate-12 transition-transform`} />
                    </div>
                    <div className="text-5xl font-black text-white tracking-tighter relative z-10">
                      {stat.val}<span className="text-lg text-slate-600 font-normal ml-1 uppercase">{stat.unit}</span>
                    </div>
                    <div className="w-full bg-slate-800/50 h-1.5 mt-8 rounded-full overflow-hidden relative z-10">
                      <div className={`bg-${stat.color}-500 h-full shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-in slide-in-from-left duration-1000`} style={{ width: i === 2 ? '85%' : `${parseFloat(stat.val)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800 p-8 rounded-3xl backdrop-blur-md shadow-2xl group">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3 text-white">
                    <BarChart3 className="text-blue-400 animate-pulse" size={18} />
                    Wing Efficiency Metrics
                  </h2>
                  <div className="space-y-6">
                    {[
                      { l: 'Prefetch Gain', v: '15.84', c: 'text-blue-400', icon: <Zap size={14} /> },
                      { l: 'Branch Relief', v: '16.83', c: 'text-purple-400', icon: <Activity size={14} /> },
                      { l: 'Cache Coherency', v: '13.53', c: 'text-cyan-400', icon: <Database size={14} /> },
                      { l: 'Bus Utilization', v: '17.49', c: 'text-emerald-400', icon: <Cpu size={14} /> },
                    ].map((m, idx) => (
                      <div key={idx} className="group/item cursor-crosshair">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className={`${m.c} group-hover/item:scale-125 transition-all duration-300`}>{m.icon}</span>
                            <span className={`text-[9px] text-slate-400 font-black uppercase tracking-widest group-hover/item:text-slate-200 transition-colors`}>{m.l}</span>
                          </div>
                          <span className="font-black text-white text-xs tracking-tighter">+{m.v}%</span>
                        </div>
                        <div className="w-full bg-slate-800/30 h-1 rounded-full overflow-hidden border border-slate-800/50 shadow-inner">
                          <div className={`h-full bg-slate-700 group-hover/item:bg-blue-400 transition-all duration-1000`} style={{ width: `${m.v}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-8 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col group">
                  <div className="flex justify-between items-center mb-8 relative z-10">
                    <div className="space-y-1">
                      <h2 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-white">
                        <Activity className="text-purple-400" size={18} />
                        Performance Heartbeat
                      </h2>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-7">30-Bar Live Data Stream</p>
                    </div>
                    <div className={`${isAuthorized ? 'bg-orange-500/10 border-orange-500/30' : 'bg-emerald-500/10 border-emerald-500/30'} border px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-sm shadow-inner`}>
                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isAuthorized ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,1)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]'}`}></div>
                      <span className={`text-[8px] font-black tracking-widest uppercase ${isAuthorized ? 'text-orange-400' : 'text-emerald-400'}`}>Live Link</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-end gap-1 min-h-[250px] border-l border-b border-slate-800/50 pb-4 pl-4 relative z-10">
                    {liveStream.map((point, i) => (
                      <div key={i} className="flex-1 group/bar relative h-full flex flex-col justify-end">
                        <div 
                          className={`${isAuthorized ? 'from-orange-600/20 to-orange-400/60 border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.15)]' : 'from-purple-600/20 to-purple-400/60 border-purple-400'} bg-gradient-to-t border-t-2 w-full rounded-t-lg transition-all duration-700 hover:brightness-150 hover:shadow-[0_0_15px_rgba(192,132,252,0.4)]`}
                          style={{ height: `${(point.val / 20) * 100}%` }}
                        >
                          <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-2 px-3 rounded-xl border border-purple-500/40 z-40 shadow-2xl pointer-events-none font-bold backdrop-blur-md">
                            {point.val.toFixed(2)}ns
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'neural' && (
            <div className="space-y-8 animate-in slide-in-from-top-12 duration-700">
              <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-3xl shadow-2xl relative overflow-hidden text-center">
                <Orbit size={80} className={`mx-auto mb-6 transition-all duration-1000 ${isAuthorized ? 'text-orange-500 animate-[spin_5s_linear_infinite] drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'text-slate-700'}`} />
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Neural Kernel Link</h2>
                <p className="text-slate-500 text-xs tracking-[0.3em] uppercase mb-10">Biometric feedback & Data capture</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <div className="bg-black/30 border border-slate-800/50 p-8 rounded-2xl shadow-inner">
                    <div className="text-[10px] text-slate-500 font-black uppercase mb-6 tracking-widest text-left">Link Waveform</div>
                    <div className="h-24 flex items-center gap-1 justify-center">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1 rounded-full bg-cyan-500/50 transition-all duration-300`} 
                          style={{ height: `${Math.sin(i + Date.now()/200) * 40 + 50}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="bg-black/30 border border-slate-800/50 p-8 rounded-2xl flex flex-col justify-center items-center shadow-inner">
                    <div className="text-[10px] text-slate-500 font-black uppercase mb-4 tracking-widest">Capture Completion</div>
                    <div className={`text-5xl font-black mb-2 ${isAuthorized ? 'text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-slate-600'}`}>
                      {isAuthorized ? neuralCapture : '00'}%
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" style={{ width: `${isAuthorized ? neuralCapture : 0}%` }}></div>
                    </div>
                  </div>
                </div>

                {!isAuthorized && (
                  <div className="mt-12 text-amber-500/60 text-xs font-bold uppercase tracking-widest animate-pulse">
                    <Lock size={16} className="inline mr-2" /> Wing Authorization Required for Neural Link
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-8 animate-in slide-in-from-left-12 duration-700">
              <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-3xl shadow-2xl">
                <div className="flex justify-between items-center mb-10">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                      <RefreshCw className={`text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} /> Liquidity Sync Control
                    </h2>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-10">Apex Extraction Protocol v2.16</p>
                  </div>
                  <div className="flex gap-4">
                    {isAuthorized && (
                      <button 
                        onClick={() => setIsSyncing(!isSyncing)}
                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-lg ${
                          isSyncing 
                          ? 'bg-red-500/10 text-red-400 border-red-500/40 hover:bg-red-500/20' 
                          : 'bg-cyan-500 text-slate-950 border-cyan-400 hover:bg-cyan-400 shadow-cyan-500/20'
                        }`}
                      >
                        {isSyncing ? 'Stop Extraction' : 'Start Extraction'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="bg-black/30 border border-slate-800/50 p-8 rounded-3xl relative overflow-hidden shadow-inner">
                      <div className="text-[10px] text-slate-500 font-black uppercase mb-6 tracking-widest">Total Syphon Progress</div>
                      <div className="text-7xl font-black text-white tracking-tighter mb-4">{syncProgress}%</div>
                      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                        <div className="bg-gradient-to-r from-cyan-600 to-blue-400 h-full shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-1000" style={{ width: `${syncProgress}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Relay Risk', val: 'Low', color: 'text-emerald-500' },
                      { label: 'Sync Efficiency', val: '99.98%', color: 'text-cyan-400' },
                      { label: 'Buffer Depth', val: '1024mb', color: 'text-slate-300' },
                      { label: 'Network Latency', val: '1.2ms', color: 'text-blue-400' },
                    ].map((item, i) => (
                      <div key={i} className="bg-black/30 border border-slate-800/50 p-6 rounded-2xl shadow-inner">
                        <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">{item.label}</div>
                        <div className={`text-xl font-black ${item.color}`}>{item.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-8 animate-in slide-in-from-top-12 duration-700">
              <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4 text-cyan-400">
                      <Sparkles /> Site Hygiene & Maintenance
                    </h2>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-10">Managed by HJS SERVICES LLC (#BT-089217)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {[
                    { label: 'Surface Bio-Integrity', val: '99.98%', color: 'text-cyan-400' },
                    { label: 'Site Maintenance Score', val: '98.20%', color: 'text-emerald-400' },
                    { label: 'Physical Security Level', val: 'LVL 4', color: 'text-blue-400' },
                  ].map((item, i) => (
                    <div key={i} className="bg-black/30 border border-slate-800/50 p-6 rounded-2xl shadow-inner">
                      <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">{item.label}</div>
                      <div className={`text-3xl font-black ${item.color}`}>{item.val}</div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-black/40 border border-slate-800 p-6 rounded-2xl mb-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-slate-300 flex items-center gap-2">
                    <Building2 size={14} className="text-cyan-400" /> Janitorial Service Schedule
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Suite A Scrub', 'Suite B Scrub', 'Network Rack Clean', 'Physical HVAC Sync'].map((s, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-cyan-500/40 transition-all">
                        <ShieldAlert size={14} className="text-cyan-500" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 p-6 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <FileBadge size={20} className="text-cyan-400 mt-1" />
                    <div>
                      <h4 className="text-sm font-black text-cyan-400 uppercase tracking-wider mb-2">HJS Services LLC</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        License <span className="text-cyan-400 font-bold">#BT-089217</span> • Classification: JANITORIAL SERVICES<br />
                        <span className="text-slate-500">Expiration: DEC 31, 2026</span><br />
                        <span className="text-emerald-400 font-bold">Physical Site: 149 ONETA ST, SUITE 3, ATHENS, GA 30601</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
              <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                    <History className="text-purple-400" /> Performance Delta Archive
                  </h2>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black flex items-center gap-3">
                    <RefreshCw size={12} className="animate-spin" /> Showing Last 40 Cycles
                  </div>
                </div>
                <div className="h-[450px] flex items-end gap-2 border-l border-b border-slate-800/50 pb-6 pl-6 relative z-10">
                  {Array.from({ length: 40 }).map((_, i) => {
                    const relief = (11 + Math.random() * 7);
                    return (
                      <div key={i} className="flex-1 group relative h-full flex flex-col justify-end">
                        <div 
                          className="bg-purple-500/10 border-t border-purple-500/40 w-full rounded-t-lg hover:bg-purple-500/50 transition-all duration-300 cursor-help"
                          style={{ height: `${relief / 20 * 100}%` }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-3 px-5 rounded-2xl border border-purple-500/30 z-50 shadow-[0_0_30px_rgba(0,0,0,0.5)] whitespace-nowrap backdrop-blur-md">
                            <span className="block text-purple-400 font-black mb-1 uppercase tracking-widest text-[9px]">Cycle-Seq-{i + 1024}</span>
                            <span className="font-bold text-lg">{relief.toFixed(3)} NS</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="text-center text-[10px] text-slate-800 uppercase tracking-[0.5em] py-20 border-t border-slate-900/50 flex flex-col items-center gap-6 relative">
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
              <span className="hover:text-slate-400 transition-colors cursor-default">Apex_Core_v2.16</span>
              <div className="w-1 h-1 rounded-full bg-slate-900"></div>
              <span className="hover:text-slate-400 transition-colors cursor-default">BT-0101233 | BT-089217</span>
              <div className="w-1 h-1 rounded-full bg-slate-900"></div>
              <span className="hover:text-slate-400 transition-colors cursor-default">ODYSSEY-1 AI & HJS SERVICES</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="text-[9px] tracking-[0.3em] font-black text-slate-900 drop-shadow-sm uppercase">
                ALL OPERATIONS LOGGED // 149 ONETA ST SUITE 3 // ATHENS, GA 30601
              </div>
              <div className="flex gap-2">
                {[1,2,3,4,5,6].map(i => <div key={i} className="w-8 h-1 bg-slate-900/50 rounded-full"></div>)}
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default ApexDashboard;
