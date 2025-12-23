import {
  Briefcase,
  Clock,
  DollarSign,
  FileText,
  Plus,
  ShieldCheck,
  Users,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * 🛰️ CONTRACTOR MANAGER (v2.0 - LIVE)
 * Purpose: Forensic-grade labor management and 1099 compliance tracking.
 * Integration: public.contractors & public.contractor_payments
 * Optimization: Consolidated Supabase Client (Master Singleton Pattern)
 */

const ContractorManager = () => {
  const [activeTab, setActiveTab] = useState('roster');
  const [contractors, setContractors] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State for New Contractor (Defaults to $262.00 extraction rate)
  const [newContractor, setNewContractor] = useState({
    full_name: '',
    email: '',
    phone: '',
    flat_rate_cents: 26200, 
    payment_method: 'check'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Contractors
      const { data: contractorData, error: cError } = await supabase
        .from('contractors')
        .select('*')
        .order('created_at', { ascending: false });

      if (cError) throw cError;
      setContractors(contractorData || []);

      // 2. Fetch Payments with Contractor Join
      const { data: paymentData, error: pError } = await supabase
        .from('contractor_payments')
        .select('*, contractors(full_name)')
        .order('payment_date', { ascending: false });

      if (pError) throw pError;
      setPayments(paymentData || []);
    } catch (err) {
      console.error("Forensic Audit Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContractor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('contractors')
        .insert([newContractor]);

      if (error) throw error;
      
      setShowAddModal(false);
      setNewContractor({ full_name: '', email: '', phone: '', flat_rate_cents: 26200, payment_method: 'check' });
      fetchData();
    } catch (err) {
      console.error("Onboarding Error:", err.message);
    }
  };

  // Dynamic Monthly Extraction Overhead calculation
  const monthlyLaborCost = contractors.reduce((acc, curr) => acc + (Number(curr.flat_rate_cents || 0) / 100), 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10 border-b border-zinc-800 pb-8">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter flex items-center gap-3 text-white">
              <Users className="text-blue-500 w-8 h-8" />
              CONTRACTOR MANAGER
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Odyssey-1 // HJS Services Labor Ops</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/10"
          >
            <Plus className="w-4 h-4" /> ADD CONTRACTOR
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          {['roster', 'compliance', 'payments'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                activeTab === tab 
                ? 'bg-blue-500 border-blue-400 text-white shadow-lg' 
                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Clock className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Polling Database...</p>
          </div>
        ) : (
          <>
            {activeTab === 'roster' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contractors.length === 0 ? (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-900 rounded-3xl">
                    <Users className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                    <p className="text-zinc-500 text-sm">No contractors found. Begin the extraction by onboarding your first cleaner.</p>
                  </div>
                ) : (
                  contractors.map(c => (
                    <div key={c.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-blue-500/30 transition-all">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center">
                          <Briefcase className="w-6 h-6 text-zinc-500" />
                        </div>
                        <span className={`text-[9px] px-2 py-1 rounded font-bold uppercase ${c.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {c.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg mb-1">{c.full_name}</h3>
                      <p className="text-xs text-zinc-500 mb-6">Flat Rate: ${(c.flat_rate_cents / 100).toFixed(2)}</p>
                      
                      <div className="space-y-3 pt-4 border-t border-zinc-800">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-zinc-500 uppercase font-bold tracking-widest">W-9 Compliance</span>
                          <span className={c.w9_status === 'verified' ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                            {(c.w9_status || 'pending').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'compliance' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3 italic">
                  <ShieldCheck className="text-emerald-500 w-5 h-5" />
                  1099 FORENSIC READINESS
                </h2>
                <div className="space-y-4">
                  <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileText className="text-blue-400 w-6 h-6" />
                      <div>
                        <p className="text-sm font-bold tracking-tight">W-9 Secure Repository</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Encrypted state storage enabled.</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 uppercase block mb-1">Verified Nodes</span>
                      <span className="text-2xl font-black text-emerald-500">
                        {contractors.filter(c => c.w9_status === 'verified').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <div className="flex justify-between items-end mb-10 text-white">
                  <div>
                    <h2 className="text-2xl font-black italic tracking-tighter flex items-center gap-3">
                      <DollarSign className="text-emerald-500 w-6 h-6" />
                      EXTRACTION OVERHEAD
                    </h2>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mt-2">Aggregated Monthly Liability</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Total Net Pay</span>
                    <p className="text-4xl font-black text-emerald-400">${monthlyLaborCost.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {payments.length === 0 ? (
                    <div className="p-10 text-center bg-zinc-950 border border-dashed border-zinc-800 rounded-2xl">
                      <p className="text-xs text-zinc-600 uppercase font-bold italic tracking-widest">No transaction history detected in cycle.</p>
                    </div>
                  ) : (
                    payments.map(p => (
                      <div key={p.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between hover:border-zinc-700 transition-colors">
                        <div className="flex items-center gap-6">
                          <div className="p-3 bg-zinc-900 rounded-xl">
                            <Clock className="text-zinc-600 w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{p.contractors?.full_name || 'System Auto-Payment'}</p>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase">{p.payment_date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black">${(p.amount_cents / 100).toFixed(2)}</p>
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${
                            p.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Add Contractor Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <h3 className="font-bold uppercase text-xs tracking-[0.2em] text-blue-400">Onboard New Cleaner</h3>
                <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddContractor} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2 tracking-widest">Legal Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={newContractor.full_name}
                    onChange={e => setNewContractor({...newContractor, full_name: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700"
                    placeholder="e.g. John Smith"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2 tracking-widest">Rate (Cents)</label>
                    <input 
                      type="number" 
                      value={newContractor.flat_rate_cents}
                      onChange={e => setNewContractor({...newContractor, flat_rate_cents: Number(e.target.value)})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2 tracking-widest">Method</label>
                    <select 
                      value={newContractor.payment_method}
                      onChange={e => setNewContractor({...newContractor, payment_method: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none appearance-none cursor-pointer"
                    >
                      <option value="check">Check</option>
                      <option value="zelle">Zelle</option>
                      <option value="direct_deposit">Direct Deposit</option>
                    </select>
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl uppercase text-xs tracking-[0.25em] transition-all shadow-xl shadow-blue-500/20"
                >
                  Confirm Handshake
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractorManager;
