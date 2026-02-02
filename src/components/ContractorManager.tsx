import {
  AlertCircle,
  Briefcase,
  CheckCircle,
  Clock,
  Copy,
  DollarSign,
  Eye,
  FileText,
  Mail,
  Plus,
  Send,
  ShieldCheck,
  Users,
  X,
  XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { approveContractor, getContractorsAwaitingApproval, getVoidedCheckUrl, rejectContractor } from '../services/contractorApprovalService';
import { generateContractorOnboardingToken } from '../services/contractorOnboardingService';

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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [inviteContractorName, setInviteContractorName] = useState('');
  const [inviteContractorEmail, setInviteContractorEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  
  // Approval Dashboard State
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [showCheckViewer, setShowCheckViewer] = useState(false);
  const [checkImageUrl, setCheckImageUrl] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  
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
    fetchPendingApprovals();
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

  const fetchPendingApprovals = async () => {
    const pending = await getContractorsAwaitingApproval();
    setPendingApprovals(pending);
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

  const handleViewCheck = async (contractorId: string) => {
    const url = await getVoidedCheckUrl(contractorId);
    if (url) {
      setCheckImageUrl(url);
      setShowCheckViewer(true);
    } else {
      alert('Unable to load voided check image');
    }
  };

  const handleApprove = async (contractorId: string) => {
    if (!confirm('Approve this contractor for direct deposit?')) return;
    
    setProcessingAction(true);
    const { data: { user } } = await supabase.auth.getUser();
    const result = await approveContractor(contractorId, user?.id || '');
    
    if (result.success) {
      alert('✅ Contractor approved! Success email sent.');
      fetchData();
      fetchPendingApprovals();
    } else {
      alert(`Error: ${result.error}`);
    }
    setProcessingAction(false);
  };

  const handleReject = async () => {
    if (!selectedContractor || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    setProcessingAction(true);
    const { data: { user } } = await supabase.auth.getUser();
    const result = await rejectContractor(selectedContractor.id, user?.id || '', rejectionReason);
    
    if (result.success) {
      alert('✅ Contractor rejected. Notification email sent.');
      setShowRejectModal(false);
      setSelectedContractor(null);
      setRejectionReason('');
      fetchData();
      fetchPendingApprovals();
    } else {
      alert(`Error: ${result.error}`);
    }
    setProcessingAction(false);
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
          <div className="flex gap-3">
            <button 
              onClick={() => setShowInviteModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/10"
            >
              <Send className="w-4 h-4" /> SEND INVITE
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/10"
            >
              <Plus className="w-4 h-4" /> ADD CONTRACTOR
            </button>
          </div>
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
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2">Awaiting Approval</p>
                        <p className="text-4xl font-black text-amber-400">{pendingApprovals.length}</p>
                      </div>
                      <AlertCircle className="w-12 h-12 text-amber-400/20" />
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2">Approved</p>
                        <p className="text-4xl font-black text-emerald-400">
                          {contractors.filter(c => c.onboarding_status === 'approved').length}
                        </p>
                      </div>
                      <CheckCircle className="w-12 h-12 text-emerald-400/20" />
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2">Rejected</p>
                        <p className="text-4xl font-black text-red-400">
                          {contractors.filter(c => c.onboarding_status === 'rejected').length}
                        </p>
                      </div>
                      <XCircle className="w-12 h-12 text-red-400/20" />
                    </div>
                  </div>
                </div>

                {/* Pending Approvals List */}
                {pendingApprovals.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center">
                    <ShieldCheck className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500 text-sm">No contractors awaiting approval</p>
                    <p className="text-zinc-700 text-xs mt-2">All submissions have been processed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-400" />
                      PENDING APPROVALS ({pendingApprovals.length})
                    </h3>
                    {pendingApprovals.map(contractor => (
                      <div key={contractor.id} className="bg-zinc-900 border-2 border-amber-500/30 rounded-2xl p-6">
                        <div className="grid grid-cols-12 gap-6 items-start">
                          {/* Contractor Info */}
                          <div className="col-span-3">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                <Users className="w-5 h-5 text-amber-400" />
                              </div>
                              <div>
                                <p className="font-bold text-white">{contractor.full_name}</p>
                                <p className="text-[10px] text-zinc-500 uppercase">{contractor.contractor_type || 'Individual'}</p>
                              </div>
                            </div>
                            <div className="space-y-1 text-xs">
                              <p className="text-zinc-400">{contractor.email}</p>
                              <p className="text-zinc-400">{contractor.phone}</p>
                              {contractor.business_name && (
                                <p className="text-emerald-400 font-semibold">DBA: {contractor.business_name}</p>
                              )}
                            </div>
                          </div>

                          {/* Banking Info (Triple-Lock) */}
                          <div className="col-span-4 bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                            <p className="text-[9px] text-zinc-500 uppercase font-bold mb-3 tracking-widest">
                              🔒 Triple-Lock Verification
                            </p>
                            <div className="grid grid-cols-3 gap-3 text-xs">
                              <div>
                                <span className="text-zinc-600 block mb-1">Routing</span>
                                <code className="text-blue-400 font-mono">{contractor.routing_number || 'N/A'}</code>
                              </div>
                              <div>
                                <span className="text-zinc-600 block mb-1">Account</span>
                                <code className="text-blue-400 font-mono">****{contractor.account_number_last4 || 'N/A'}</code>
                              </div>
                              <div>
                                <span className="text-zinc-600 block mb-1">Check #</span>
                                <code className="text-emerald-400 font-mono">{contractor.verification_check_number || 'N/A'}</code>
                              </div>
                            </div>
                          </div>

                          {/* Signature Verification */}
                          <div className="col-span-3 bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                            <p className="text-[9px] text-zinc-500 uppercase font-bold mb-3 tracking-widest">
                              ✍️ Digital Signature
                            </p>
                            <div className="text-xs space-y-2">
                              <div>
                                <span className="text-zinc-600 block mb-1">Legal Name:</span>
                                <p className="text-white font-semibold">{contractor.full_name}</p>
                              </div>
                              <div>
                                <span className="text-zinc-600 block mb-1">Signature:</span>
                                <p className={contractor.digital_signature?.toLowerCase() === contractor.full_name?.toLowerCase() ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                                  {contractor.digital_signature || 'N/A'}
                                </p>
                              </div>
                              <p className="text-[9px] text-zinc-600">
                                Signed: {contractor.digital_signature_date ? new Date(contractor.digital_signature_date).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="col-span-2 flex flex-col gap-2">
                            <button
                              onClick={() => handleViewCheck(contractor.id)}
                              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                            >
                              <Eye className="w-4 h-4" /> VIEW CHECK
                            </button>
                            <button
                              onClick={() => handleApprove(contractor.id)}
                              disabled={processingAction}
                              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                            >
                              <CheckCircle className="w-4 h-4" /> APPROVE
                            </button>
                            <button
                              onClick={() => { setSelectedContractor(contractor); setShowRejectModal(true); }}
                              disabled={processingAction}
                              className="bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                            >
                              <XCircle className="w-4 h-4" /> REJECT
                            </button>
                          </div>
                        </div>

                        {/* Submission Timestamp */}
                        <div className="mt-4 pt-4 border-t border-zinc-800">
                          <p className="text-[9px] text-zinc-600">
                            Submitted: {contractor.onboarding_completed_at ? new Date(contractor.onboarding_completed_at).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

        {/* Send Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <h3 className="font-bold uppercase text-xs tracking-[0.2em] text-emerald-400">Generate Contractor Invite</h3>
                <button onClick={() => { setShowInviteModal(false); setInviteUrl(''); }} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                {!inviteUrl ? (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setInviteLoading(true);
                    const result = await generateContractorOnboardingToken(
                      inviteContractorName,
                      inviteContractorEmail || undefined
                    );
                    setInviteLoading(false);
                    if (result.success && result.inviteUrl) {
                      setInviteUrl(result.inviteUrl);
                    } else {
                      alert(`Error: ${result.error}`);
                    }
                  }} className="space-y-4">
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2 tracking-widest">Contractor Legal Name</label>
                      <input 
                        required
                        type="text" 
                        value={inviteContractorName}
                        onChange={e => setInviteContractorName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-700"
                        placeholder="e.g. John Smith"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2 tracking-widest">Email (Optional)</label>
                      <input 
                        type="email" 
                        value={inviteContractorEmail}
                        onChange={e => setInviteContractorEmail(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-700"
                        placeholder="contractor@example.com"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={inviteLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-black py-4 rounded-2xl uppercase text-xs tracking-[0.25em] transition-all shadow-xl shadow-emerald-500/20"
                    >
                      {inviteLoading ? 'GENERATING...' : 'GENERATE INVITE LINK'}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
                      <p className="text-[10px] text-emerald-500 uppercase font-bold mb-3 tracking-widest">✓ Invite Link Generated</p>
                      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-3">
                        <code className="text-xs text-zinc-300 break-all flex-1">{inviteUrl}</code>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(inviteUrl);
                            alert('Link copied to clipboard!');
                          }}
                          className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-lg transition-colors flex-shrink-0"
                        >
                          <Copy className="w-4 h-4 text-zinc-400" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
                      <p className="text-[10px] text-blue-400 uppercase font-bold mb-3 tracking-widest flex items-center gap-2">
                        <Mail className="w-3 h-3" /> Email Template
                      </p>
                      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-400 space-y-2">
                        <p><strong className="text-white">Subject:</strong> Action Required: Odyssey-1 Contractor Onboarding</p>
                        <p className="text-[10px] leading-relaxed">
                          Hello {inviteContractorName},<br/><br/>
                          Welcome to Odyssey-1! Please complete your secure onboarding:<br/>
                          {inviteUrl}<br/><br/>
                          Required: Tax ID, Bank Info, Voided Check, Digital Signature<br/>
                          Time: ~5 minutes | Link expires in 7 days
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setShowInviteModal(false);
                        setInviteUrl('');
                        setInviteContractorName('');
                        setInviteContractorEmail('');
                        fetchData();
                      }}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-2xl uppercase text-xs tracking-[0.2em] transition-all"
                    >
                      CLOSE
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
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

        {/* Voided Check Viewer Modal */}
        {showCheckViewer && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-lg z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <h3 className="font-bold uppercase text-xs tracking-[0.2em] text-blue-400">Voided Check Verification</h3>
                <button onClick={() => { setShowCheckViewer(false); setCheckImageUrl(''); }} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 bg-zinc-950">
                {checkImageUrl ? (
                  <img 
                    src={checkImageUrl} 
                    alt="Voided Check" 
                    className="w-full h-auto rounded-xl border-2 border-zinc-800 shadow-xl"
                  />
                ) : (
                  <div className="flex items-center justify-center py-20">
                    <Clock className="w-12 h-12 text-zinc-700 animate-spin" />
                  </div>
                )}
                <p className="text-[10px] text-zinc-600 text-center mt-4 uppercase tracking-widest">
                  Verify routing, account, and check number match the submitted data
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectModal && selectedContractor && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border-2 border-red-500/50 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-red-500/10">
                <h3 className="font-bold uppercase text-xs tracking-[0.2em] text-red-400">Reject Contractor</h3>
                <button onClick={() => { setShowRejectModal(false); setSelectedContractor(null); setRejectionReason(''); }} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <p className="text-white font-bold mb-2">{selectedContractor.full_name}</p>
                  <p className="text-zinc-500 text-xs">{selectedContractor.email}</p>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2 tracking-widest">
                    Rejection Reason (Required) *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none transition-all resize-none"
                    placeholder="e.g., Check number doesn't match uploaded image. Please re-submit with correct information."
                  />
                  <p className="text-[10px] text-zinc-600 mt-2">
                    This message will be sent to the contractor via email
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowRejectModal(false); setSelectedContractor(null); setRejectionReason(''); }}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-2xl uppercase text-xs tracking-[0.2em] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={processingAction || !rejectionReason.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 text-white font-bold py-3 rounded-2xl uppercase text-xs tracking-[0.2em] transition-all"
                  >
                    {processingAction ? 'REJECTING...' : 'CONFIRM REJECT'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractorManager;
