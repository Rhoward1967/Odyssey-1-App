import ActiveCreditTracker from '@/components/ActiveCreditTracker';
import { BusinessDebtTracker } from '@/components/BusinessDebtTracker';
import { ContractAnalyzer } from '@/components/ContractAnalyzer';
import CreditInquiryTracker from '@/components/CreditInquiryTracker';
import EvidenceLog from '@/components/EvidenceLog';
import { InsuranceGapTracker } from '@/components/InsuranceGapTracker';
import { PaymentPlanCalculator } from '@/components/PaymentPlanCalculator';
import { RomanStrategyPanel } from '@/components/RomanStrategyPanel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabaseClient';
import type { DebtAccount, LegalAnalysis } from '@/services/legalDefenseEngine';
import { legalDefenseEngine } from '@/services/legalDefenseEngine';
import { romanLegalService, type ScenarioRouteResult } from '@/services/romanLegalService';
import { RomanGuildFirewall, type CapacityNotice } from '@/services/romanSovereignProcessor';
import type { USPSTrackingInfo } from '@/services/uspsTrackingService';
import { uspsTrackingService } from '@/services/uspsTrackingService';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  FileText,
  Mail,
  Package,
  Scale,
  Shield,
  TrendingDown,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Legal Defense Dashboard
 * 
 * Uses REAL consumer protection law to defend against debt collectors:
 * - FDCPA (Fair Debt Collection Practices Act)
 * - FCRA (Fair Credit Reporting Act)  
 * - Georgia Statute of Limitations
 * 
 * You didn't write these rules - you're using them.
 */

interface TrackedAccount {
  id: string;
  creditor: string;
  originalAmount: number;
  currentAmount: number;
  lastPaymentDate: Date;
  dateOfDefault: Date;
  accountNumber: string;
  collectionAgency?: string;
  collectionLetterReceived?: Date;
  analysis?: LegalAnalysis;
  certifiedMailTracking?: string;
  responseReceived?: string;
  status: 'active' | 'statute_expired' | 'validation_pending' | 'disputed' | 'settled';
}

export default function LegalDefenseDashboard() {
  const [accounts, setAccounts] = useState<TrackedAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<TrackedAccount | null>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Aggregated debt totals from all sources
  const [totalDebtAllSources, setTotalDebtAllSources] = useState(0);
  const [totalAccountsAllSources, setTotalAccountsAllSources] = useState(0);
  
  // Response analyzer state
  const [showResponseAnalyzer, setShowResponseAnalyzer] = useState(false);
  const [analyzerAccount, setAnalyzerAccount] = useState<TrackedAccount | null>(null);
  const [responseText, setResponseText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  // Settlement calculator state
  const [showSettlement, setShowSettlement] = useState(false);
  const [settlementAccount, setSettlementAccount] = useState<TrackedAccount | null>(null);
  const [settlementOffer, setSettlementOffer] = useState<any>(null);
  
  // Add account form state
  const [newAccountForm, setNewAccountForm] = useState({
    creditor: '',
    originalAmount: '',
    currentAmount: '',
    accountNumber: '',
    lastPaymentDate: '',
    dateOfDefault: '',
    collectionLetterReceived: '',
    collectionAgency: '',
    status: 'active' as TrackedAccount['status']
  });
  
  // USPS tracking state
  const [trackingInfo, setTrackingInfo] = useState<Map<string, USPSTrackingInfo>>(new Map());

  // Sovereign Toolkit Routing state
  const [scenarioInput, setScenarioInput] = useState('');
  const [scenarioResult, setScenarioResult] = useState<ScenarioRouteResult | null>(null);

  // Guild Firewall state
  const [guildInput, setGuildInput] = useState('');
  const [guildResult, setGuildResult] = useState<CapacityNotice | null>(null);
  const [repName, setRepName] = useState('');
  const [repRole, setRepRole] = useState('');

  // Book Sync (Layer 5 — Paperback QR Bridge) state
  const [bookSyncToolkitId, setBookSyncToolkitId] = useState('');
  const [bookSyncContext, setBookSyncContext] = useState('');
  const [bookSyncResult, setBookSyncResult] = useState<{ record: any; amendmentLetter: string } | null>(null);
  const [bookSyncLoading, setBookSyncLoading] = useState(false);

  // Load accounts from Supabase on mount
  useEffect(() => {
    loadAccounts();
    loadAllDebtSources();
  }, []);

  const loadAllDebtSources = async () => {
    try {
      // Load from all debt tables
      const [legalDefense, businessDebt, activeCredit] = await Promise.all([
        supabase.from('legal_defense_accounts').select('current_amount'),
        supabase.from('business_debt_accounts').select('current_amount'),
        supabase.from('active_credit_accounts').select('reported_balance')
      ]);

      console.log('Legal Defense:', legalDefense);
      console.log('Business Debt:', businessDebt);
      console.log('Active Credit:', activeCredit);

      let total = 0;
      let count = 0;

      if (legalDefense.data) {
        const legalTotal = legalDefense.data.reduce((sum, row) => sum + parseFloat(row.current_amount || 0), 0);
        console.log('Legal Defense Total:', legalTotal);
        total += legalTotal;
        count += legalDefense.data.length;
      }

      if (businessDebt.data) {
        const businessTotal = businessDebt.data.reduce((sum, row) => sum + parseFloat(row.current_amount || 0), 0);
        console.log('Business Debt Total:', businessTotal);
        total += businessTotal;
        count += businessDebt.data.length;
      }

      if (activeCredit.data) {
        const creditTotal = activeCredit.data.reduce((sum, row) => sum + parseFloat(row.reported_balance || 0), 0);
        console.log('Active Credit Total:', creditTotal, 'Count:', activeCredit.data.length);
        total += creditTotal;
        count += activeCredit.data.length;
      }

      console.log('FINAL TOTAL:', total, 'COUNT:', count);
      setTotalDebtAllSources(total);
      setTotalAccountsAllSources(count);
    } catch (error) {
      console.error('Error loading all debt sources:', error);
    }
  };

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('legal_defense_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const trackedAccounts: TrackedAccount[] = data.map(row => ({
          id: row.id,
          creditor: row.creditor,
          originalAmount: parseFloat(row.original_amount),
          currentAmount: parseFloat(row.current_amount),
          lastPaymentDate: new Date(row.last_payment_date),
          dateOfDefault: new Date(row.date_of_default),
          accountNumber: row.account_number,
          collectionAgency: row.collection_agency || undefined,
          collectionLetterReceived: row.collection_letter_received ? new Date(row.collection_letter_received) : undefined,
          certifiedMailTracking: row.certified_mail_tracking || undefined,
          responseReceived: row.response_text || undefined,
          status: row.status,
          analysis: row.statute_expired !== null ? {
            account: {} as DebtAccount,
            statuteExpired: row.statute_expired,
            validationDeadline: null,
            recommendedAction: '',
            applicableLaw: row.applicable_laws || [],
            riskLevel: row.risk_level || 'MEDIUM',
            estimatedDefenseStrength: row.defense_strength || 50
          } : undefined
        }));

        // Analyze accounts that don't have analysis
        const analyzed = trackedAccounts.map(account => {
          if (!account.analysis) {
            return {
              ...account,
              analysis: legalDefenseEngine.analyzeAccount(account)
            };
          }
          return account;
        });

        setAccounts(analyzed);

        // Load USPS tracking for accounts with tracking numbers
        const trackingNumbers = analyzed
          .filter(acc => acc.certifiedMailTracking)
          .map(acc => acc.certifiedMailTracking!);
        
        if (trackingNumbers.length > 0) {
          const trackingResults = await uspsTrackingService.trackMultiple(trackingNumbers);
          setTrackingInfo(trackingResults);
        }
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAccount = async (account: Omit<TrackedAccount, 'id' | 'analysis'>) => {
    try {
      const analysis = legalDefenseEngine.analyzeAccount(account);
      
      const { data, error } = await supabase
        .from('legal_defense_accounts')
        .insert({
          creditor: account.creditor,
          original_amount: account.originalAmount,
          current_amount: account.currentAmount,
          account_number: account.accountNumber,
          last_payment_date: account.lastPaymentDate.toISOString(),
          date_of_default: account.dateOfDefault.toISOString(),
          collection_letter_received: account.collectionLetterReceived?.toISOString(),
          collection_agency: account.collectionAgency,
          status: account.status,
          statute_expired: analysis.statuteExpired,
          defense_strength: analysis.estimatedDefenseStrength,
          risk_level: analysis.riskLevel,
          applicable_laws: analysis.applicableLaw
        })
        .select()
        .single();

      if (error) throw error;

      await loadAccounts();
      await loadAllDebtSources();
      setShowAddAccount(false);
      
      // Reset form
      setNewAccountForm({
        creditor: '',
        originalAmount: '',
        currentAmount: '',
        accountNumber: '',
        lastPaymentDate: '',
        dateOfDefault: '',
        collectionLetterReceived: '',
        collectionAgency: '',
        status: 'active'
      });
    } catch (error) {
      console.error('Error saving account:', error);
      alert('Failed to save account. Please try again.');
    }
  };

  const updateAccount = async (id: string, updates: Partial<TrackedAccount>) => {
    try {
      const { error } = await supabase
        .from('legal_defense_accounts')
        .update({
          ...updates,
          certified_mail_tracking: updates.certifiedMailTracking,
          response_text: updates.responseReceived
        })
        .eq('id', id);

      if (error) throw error;

      await loadAccounts();
      await loadAllDebtSources();
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const generateLetter = async (account: TrackedAccount, type: 'validation' | 'credit_dispute' | 'settlement' | 'cease_desist', useRoman: boolean = false) => {
    let letter = '';
    
    if (useRoman) {
      // Use R.O.M.A.N. for contextual letter generation
      try {
        setLoading(true);
        letter = await romanLegalService.generateLetter({
          type,
          account: account,
          settlementOffer: settlementOffer?.recommendedOffer
        });
      } catch (error) {
        console.error('R.O.M.A.N. letter generation error:', error);
        alert('R.O.M.A.N. letter generation failed. Using template instead.');
        useRoman = false; // Fallback to template
      } finally {
        setLoading(false);
      }
    }
    
    if (!useRoman) {
      // Fallback to template-based generation
      if (type === 'validation') {
        letter = legalDefenseEngine.generateValidationLetter(
          account,
          'Rickey Allan Howard',
          '149 Oneta St, Athens, GA 30601'
        );
      } else if (type === 'credit_dispute') {
        letter = legalDefenseEngine.generateCreditDisputeLetter(
          account.accountNumber,
          account.creditor,
          'This account is inaccurate and unverifiable',
          'Rickey Allan Howard',
          '149 Oneta St, Athens, GA 30601',
          'XXXX'
        );
      } else if (type === 'settlement' && settlementOffer) {
        letter = legalDefenseEngine.generateSettlementLetter(
          account,
          settlementOffer.recommendedOffer,
          'Rickey Allan Howard',
          '149 Oneta St, Athens, GA 30601'
        );
      } else if (type === 'cease_desist') {
        letter = legalDefenseEngine.generateCeaseAndDesistLetter(
          account,
          'Rickey Allan Howard',
          '149 Oneta St, Athens, GA 30601',
          'all'
        );
      }
    }

    // Download as text file
    const blob = new Blob([letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${useRoman ? 'roman_' : ''}${type}_letter_${account.creditor}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const analyzeResponse = async () => {
    if (!analyzerAccount || !responseText) return;

    try {
      setLoading(true);
      
      // Use R.O.M.A.N. for strategic analysis
      const romanStrategy = await romanLegalService.analyzeResponse(
        responseText,
        analyzerAccount
      );
      
      setAnalysisResult({
        isValidated: romanStrategy.isValidated,
        legalStrength: romanStrategy.defenseStrength,
        violations: romanStrategy.detectedViolations.map(v => ({
          statute: '15 USC §1692',
          description: v,
          severity: 'MODERATE' as const,
          statutoryDamages: 1000,
          evidence: 'Detected in response'
        })),
        nextAction: romanStrategy.recommendedAction + '\n\n' + romanStrategy.nextSteps.join('\n')
      });
      
      // Save response to database
      await updateAccount(analyzerAccount.id, {
        responseReceived: responseText,
        status: romanStrategy.isValidated ? 'active' : 'disputed'
      });
      
    } catch (error) {
      console.error('R.O.M.A.N. analysis error:', error);
      // Fallback to template analysis
      const result = legalDefenseEngine.analyzeResponseAdvanced(responseText, analyzerAccount);
      setAnalysisResult(result);
      
      await updateAccount(analyzerAccount.id, {
        responseReceived: responseText,
        status: result.isValidated ? 'active' : 'disputed'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSettlement = async (account: TrackedAccount) => {
    try {
      setLoading(true);
      // Use R.O.M.A.N. for strategic settlement calculation
      const romanOffer = await romanLegalService.recommendSettlement(account);
      setSettlementOffer(romanOffer);
      setSettlementAccount(account);
      setShowSettlement(true);
    } catch (error) {
      console.error('R.O.M.A.N. settlement error:', error);
      // Fallback to template calculation
      const offer = legalDefenseEngine.calculateSettlementOffer(account);
      setSettlementOffer(offer);
      setSettlementAccount(account);
      setShowSettlement(true);
    } finally {
      setLoading(false);
    }
  };

  const trackCertifiedMail = async (account: TrackedAccount) => {
    if (!account.certifiedMailTracking) return;

    try {
      const tracking = await uspsTrackingService.trackPackage(account.certifiedMailTracking);
      setTrackingInfo(prev => new Map(prev).set(account.certifiedMailTracking!, tracking));
    } catch (error) {
      console.error('Error tracking package:', error);
      alert('Failed to track package. Please check tracking number.');
    }
  };

  const totalDebt = totalDebtAllSources; // Use aggregated total from all sources
  const totalAccountCount = totalAccountsAllSources;
  const expiredAccounts = accounts.filter(acc => acc.analysis?.statuteExpired).length;
  const activeDefenses = accounts.filter(acc => acc.status === 'validation_pending' || acc.status === 'disputed').length;
  const potentialSavings = accounts
    .filter(acc => acc.analysis?.statuteExpired)
    .reduce((sum, acc) => sum + (acc.currentAmount * 0.75), 0); // 75% savings on expired debts

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading accounts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Shield className="w-10 h-10 text-green-400" />
              Legal Defense Dashboard
            </h1>
            <p className="text-slate-300 mt-2">Using Federal & Georgia Law to Protect Your Rights</p>
          </div>
          <Button 
            onClick={() => setShowAddAccount(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            Add Account
          </Button>
        </div>

        {/* UCC-1 Filing Protection Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            UCC-1 Filing Protection (Active)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Layer */}
            <Card className="bg-gradient-to-br from-emerald-950 to-slate-800 border-emerald-700">
              <CardHeader>
                <CardTitle className="text-emerald-300">Personal Security Interest</CardTitle>
                <CardDescription className="text-emerald-200/70">Record #029-2026-000102</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Filing Date:</span>
                    <span className="text-white font-semibold">February 5, 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">County:</span>
                    <span className="text-white font-semibold">Clarke County, GA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Status:</span>
                    <Badge className="bg-emerald-600 text-white">✓ RECORDED</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Secured Party:</span>
                    <span className="text-emerald-300 font-semibold">ODYSSEY-1 AI LLC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Debtors:</span>
                    <span className="text-white text-sm">Rickey & Christla Howard</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Lien Value:</span>
                    <span className="text-emerald-300 font-bold text-lg">$350,000</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-emerald-700">
                  <p className="text-xs text-emerald-200">
                    <strong>Collateral:</strong> All personal assets, income, earnings, labor services, financial accounts
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Business Layer */}
            <Card className="bg-gradient-to-br from-blue-950 to-slate-800 border-blue-700">
              <CardHeader>
                <CardTitle className="text-blue-300">Business Security Interest</CardTitle>
                <CardDescription className="text-blue-200/70">Record #029-2026-000007</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Filing Date:</span>
                    <span className="text-white font-semibold">January 7, 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">County:</span>
                    <span className="text-white font-semibold">Clarke County, GA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Status:</span>
                    <Badge className="bg-blue-600 text-white">✓ RECORDED</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Secured Party:</span>
                    <span className="text-blue-300 font-semibold">ODYSSEY-1 AI LLC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Debtor Entities:</span>
                    <span className="text-white text-sm">HJS Services LLC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Lien Value:</span>
                    <span className="text-blue-300 font-bold text-lg">$350,000</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-blue-700">
                  <p className="text-xs text-blue-200">
                    <strong>Collateral:</strong> All business assets, accounts, equipment, revenue
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Combined Protection Summary */}
          <Alert className="bg-gradient-to-r from-emerald-900/30 to-blue-900/30 border-emerald-600/50">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <AlertTitle className="text-emerald-300 text-lg">Two-Layer Senior Priority Lien</AlertTitle>
            <AlertDescription className="text-slate-200 mt-2">
              <div className="space-y-1">
                <p>✓ Total Lien Value: <span className="font-bold text-emerald-300">$700,000</span></p>
                <p>✓ Combined Priority: <span className="font-bold">Senior Position</span> in both personal and business assets</p>
                <p>✓ Protection Scope: All personal income, labor services, business revenue</p>
                <p>✓ Filing Jurisdiction: Clarke County, Georgia (with nationwide UCC database notice)</p>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* Trust Asset Protection Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-indigo-400" />
            Trust Asset Shelter (HJFAT-2026-001 • HOWARD-JONES-DYNASTY-2026)
          </h2>
          
          <Card className="bg-gradient-to-br from-indigo-950 to-slate-800 border-indigo-700">
            <CardHeader>
              <CardTitle className="text-indigo-300">Howard Jones Family Ancestral Trust</CardTitle>
              <CardDescription className="text-indigo-200/70">Certificate #: HJFAT-2026-001 • Bloodline Trust ID: HOWARD-JONES-DYNASTY-2026</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Trust Role in Legal Defense */}
              <Alert className="bg-indigo-900/30 border-indigo-600">
                <Shield className="h-5 w-5 text-indigo-400" />
                <AlertTitle className="text-indigo-300">Asset Protection Layer</AlertTitle>
                <AlertDescription className="text-slate-200">
                  The Trust holds intellectual property, patents, and business assets. These assets are NOT personally liable for individual debts - they belong to the trust entity.
                </AlertDescription>
              </Alert>

              {/* Trust Asset Valuation */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-indigo-900/40 rounded-lg border border-indigo-600">
                  <p className="text-indigo-300 text-xs font-semibold">IP Portfolio Value</p>
                  <p className="text-white text-2xl font-bold">$5.6B</p>
                  <p className="text-indigo-200 text-xs mt-1">Patents, software, designs</p>
                </div>
                <div className="p-3 bg-indigo-900/40 rounded-lg border border-indigo-600">
                  <p className="text-indigo-300 text-xs font-semibold">Business Assets</p>
                  <p className="text-white text-2xl font-bold">Included</p>
                  <p className="text-indigo-200 text-xs mt-1">Equipment, accounts, systems</p>
                </div>
                <div className="p-3 bg-indigo-900/40 rounded-lg border border-indigo-600">
                  <p className="text-indigo-300 text-xs font-semibold">Debt Reduction</p>
                  <p className="text-indigo-300 text-2xl font-bold">$5.6B</p>
                  <p className="text-indigo-200 text-xs mt-1">Assets sheltered from creditors</p>
                </div>
              </div>

              {/* Effective Debt Exposure Calculation */}
              <div className="space-y-3">
                <h4 className="text-indigo-300 font-semibold">Effective Debt Exposure Analysis</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                    <span className="text-slate-300">Reported Total Debt:</span>
                    <span className="text-white font-semibold">${totalDebt.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                    <span className="text-slate-300">Assets Protected by Trust:</span>
                    <span className="text-indigo-300 font-semibold">-$5,600,000,000</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-indigo-900/50 rounded-lg border-2 border-indigo-600">
                    <span className="text-indigo-200 font-semibold">Net Exposed Assets:</span>
                    <span className="text-indigo-300 font-bold text-lg">Minimal*</span>
                  </div>
                </div>

                <p className="text-xs text-indigo-200 italic">
                  *Trust structure means creditors cannot access IP portfolio, business assets, or future business income attributed to trust entities. Only personal unsecured assets remain exposed.
                </p>
              </div>

              {/* Legal Protection Details */}
              <div className="space-y-2">
                <h4 className="text-indigo-300 font-semibold text-sm">How Trust Protects Legal Defense:</h4>
                
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-200 text-sm"><strong>Creditor Judgment Limits:</strong> Even if creditors win lawsuits, they can only execute against personal assets, not trust assets.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-200 text-sm"><strong>Settlement Negotiations:</strong> Trust-owned revenue stream reduces settlement demands (creditors see less collectible assets).</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-200 text-sm"><strong>Business Continuity:</strong> Critical IP and assets remain operational (protected by trust) even during debt disputes.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-200 text-sm"><strong>Statutory Defense:</strong> Georgia law recognizes trust structures for business liability separation and asset protection.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Combined Defense Value */}
              <Alert className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-indigo-500">
                <Shield className="h-5 w-5 text-indigo-300" />
                <AlertTitle className="text-indigo-300">Trust + UCC-1 Combined Defense Value</AlertTitle>
                <AlertDescription className="text-slate-200 mt-2">
                  <div className="space-y-1 text-sm">
                    <p><strong>Layer 1 - Asset Shelter:</strong> $5.6B in trust assets untouchable by creditors</p>
                    <p><strong>Layer 2 - UCC-1 Priority:</strong> $700K senior lien on remaining personal/business assets</p>
                    <p><strong>Combined Effect:</strong> Creditors face settlement-only strategy (litigation ROI near zero)</p>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300">Total Debt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                ${totalDebt.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1">{totalAccountCount} accounts tracked</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300">Statute Expired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 flex items-center gap-2">
                {expiredAccounts}
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Unenforceable in court</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300">Active Defenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
                {activeDefenses}
                <Scale className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Letters sent or pending</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300">Potential Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 flex items-center gap-2">
                ${potentialSavings.toLocaleString()}
                <TrendingDown className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Settlement opportunities</p>
            </CardContent>
          </Card>
        </div>

        {/* Trust Asset Protection Section */}
        <Card className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border-emerald-700 mb-6">
          <CardHeader>
            <CardTitle className="text-emerald-300 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Howard Jones Family Ancestral Trust - Asset Shelter
            </CardTitle>
            <CardDescription className="text-emerald-200">
              Protective legal structure for intellectual property, business assets, and operational systems • Certificate #: HJFAT-2026-001 • Bloodline Trust ID: HOWARD-JONES-DYNASTY-2026
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Asset Valuations */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-4 border border-emerald-700/30">
                <p className="text-xs text-slate-400 mb-2">IP Patents & Systems (Working Valuation)</p>
                <p className="text-2xl font-bold text-emerald-400">$5.6B</p>
                <p className="text-xs text-slate-500 mt-2">29 patents + Odyssey-1 systems + R.O.M.A.N. 2.0 + Universal Math engine</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-emerald-700/30">
                <p className="text-xs text-slate-400 mb-2">Operational Business Assets</p>
                <p className="text-2xl font-bold text-emerald-400">Included</p>
                <p className="text-xs text-slate-500 mt-2">Odyssey-1 AI LLC, revenue streams, database platform, operational infrastructure</p>
              </div>
            </div>

            {/* Total Protected */}
            <div className="bg-gradient-to-r from-emerald-900/40 to-emerald-800/40 rounded-lg p-4 border border-emerald-600">
              <p className="text-sm text-slate-300 mb-2">Total Protected Assets (Working Valuation)</p>
              <p className="text-3xl font-bold text-emerald-300">$5.6B</p>
              <p className="text-xs text-slate-400 mt-2">Status: <span className="text-emerald-400 font-semibold">SHELTERED FROM CREDITOR CLAIMS</span></p>
            </div>

            {/* How Trust Protects */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-emerald-300">Trust Protection Mechanisms</h4>
              
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 text-sm"><strong>Liability Separation:</strong> Trust-owned assets cannot be seized for personal debts (trust is separate legal entity)</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 text-sm"><strong>Creditor Judgment Limits:</strong> Even if creditors win lawsuits, they can only execute against personal assets, not trust assets</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 text-sm"><strong>Settlement Negotiations:</strong> Trust-owned revenue stream reduces settlement demands (creditors see less collectible assets)</p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 text-sm"><strong>Business Continuity:</strong> Critical IP and assets remain operational (protected by trust) even during debt disputes</p>
                </div>
              </div>
            </div>

            {/* Combined Defense Value */}
            <Alert className="bg-gradient-to-r from-emerald-900/60 to-teal-900/60 border-emerald-600">
              <Shield className="h-5 w-5 text-emerald-300" />
              <AlertTitle className="text-emerald-300">Total Defense Value</AlertTitle>
              <AlertDescription className="text-slate-200 mt-2">
                <div className="space-y-1 text-sm">
                  <p><strong>Trust Shelter:</strong> $5.6B protected from creditor claims</p>
                  <p><strong>UCC-1 Senior Liens:</strong> $700K priority position (2-layer filing)</p>
                  <p><strong>Combined Effect:</strong> $5.6007B in protective value. Substantially all material assets sheltered; creditors can only execute against minimal personal assets.</p>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="accounts" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700 flex-wrap h-auto justify-start">
            <TabsTrigger value="guild">⚖️ Guild Firewall</TabsTrigger>
            <TabsTrigger value="sovereign">🛡️ Sovereign Toolkit</TabsTrigger>
            <TabsTrigger value="booksync">📖 Book Sync</TabsTrigger>
            <TabsTrigger value="accounts">Collection Accounts</TabsTrigger>
            <TabsTrigger value="business">Business Debt</TabsTrigger>
            <TabsTrigger value="payment">💰 Payment Plan</TabsTrigger>
            <TabsTrigger value="contracts">⚖️ Contract Analyzer</TabsTrigger>
            <TabsTrigger value="insurance">🛡️ Coverage Gaps</TabsTrigger>
            <TabsTrigger value="roman">🤖 R.O.M.A.N. Strategy</TabsTrigger>
            <TabsTrigger value="credit">Active Credit</TabsTrigger>
            <TabsTrigger value="inquiries">Credit Inquiries</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
            <TabsTrigger value="letters">Letters</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
          </TabsList>

          {/* Accounts Tab */}
          {/* ── GUILD FIREWALL TAB ────────────────────────────────────── */}
          <TabsContent value="guild" className="space-y-4">
            <Card className="bg-gradient-to-br from-slate-900 to-red-950 border-red-800">
              <CardHeader>
                <CardTitle className="text-red-300 flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Guild Firewall — Capacity Protection
                </CardTitle>
                <CardDescription className="text-red-200/70">
                  Detects attorney/officer-of-court interactions that may waive your rights or create unwanted joinder. Generates Capacity Notices and sanitizes legal drafts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Shield Status */}
                <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">Shield Status: Capacity Protection</span>
                  <Badge className={guildResult?.severity === 'CRITICAL' ? 'bg-red-600 text-white animate-pulse' : guildResult?.severity === 'WARNING' ? 'bg-amber-600 text-white' : 'bg-green-700 text-white'}>
                    {guildResult?.severity === 'CRITICAL' ? '🔴 CRITICAL — Divided Loyalty Detected' : guildResult?.severity === 'WARNING' ? '🟡 WARNING — Capacity Notice Recommended' : '🟢 ACTIVE'}
                  </Badge>
                </div>

                {/* Guild Interaction Analyzer */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Paste Attorney Communication / Legal Document</Label>
                  <Textarea
                    className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
                    placeholder="Paste the letter, email, or document from an attorney or court..."
                    value={guildInput}
                    onChange={e => setGuildInput(e.target.value)}
                  />
                  <Button
                    className="bg-red-700 hover:bg-red-800 w-full"
                    onClick={() => setGuildResult(RomanGuildFirewall.processGuildInteraction(guildInput))}
                    disabled={!guildInput.trim()}
                  >
                    Scan for Guild Traps
                  </Button>
                </div>

                {guildResult && (
                  <div className="space-y-4">
                    {/* Notice Type */}
                    <div className="bg-red-900/40 border border-red-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-red-300 font-bold">Notice Type: {guildResult.noticeType.replace(/_/g, ' ')}</h4>
                        <Badge className={guildResult.severity === 'CRITICAL' ? 'bg-red-600' : guildResult.severity === 'WARNING' ? 'bg-amber-600' : 'bg-slate-600'}>{guildResult.severity}</Badge>
                      </div>
                      <p className="text-white text-sm leading-relaxed">{guildResult.draftedStatement}</p>
                    </div>

                    {/* Traps Found */}
                    {guildResult.guildTrapsDetected.length > 0 && (
                      <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
                        <h4 className="text-amber-300 font-bold mb-3">⚠️ Guild Traps Detected ({guildResult.guildTrapsDetected.length})</h4>
                        <div className="space-y-3">
                          {guildResult.guildTrapsDetected.map((trap, i) => (
                            <div key={i} className="border-l-2 border-amber-600 pl-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-red-800 text-white text-xs">"{trap.term}"</Badge>
                                <span className="text-slate-400 text-xs">→</span>
                                <Badge className="bg-green-800 text-white text-xs">{trap.sovereignCorrection}</Badge>
                              </div>
                              <p className="text-slate-300 text-xs">{trap.risk}</p>
                              <p className="text-slate-500 text-xs">{trap.counterCanonVol}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sovereign Reservation */}
                    <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
                      <h4 className="text-slate-300 font-bold mb-2">📜 Sovereign Reservation</h4>
                      <p className="text-slate-200 text-sm italic">{guildResult.sovereignReservation}</p>
                    </div>
                  </div>
                )}

                {/* Representative Audit */}
                <div className="border-t border-slate-700 pt-4 space-y-3">
                  <h4 className="text-slate-300 font-semibold">Attorney / Representative Audit</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-slate-400 text-xs">Representative Name</Label>
                      <input
                        className="w-full bg-slate-800 border border-slate-600 text-white rounded px-3 py-2 text-sm"
                        placeholder="John Smith"
                        value={repName}
                        onChange={e => setRepName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-slate-400 text-xs">Role / Title</Label>
                      <input
                        className="w-full bg-slate-800 border border-slate-600 text-white rounded px-3 py-2 text-sm"
                        placeholder="Attorney, Esq., Counsel..."
                        value={repRole}
                        onChange={e => setRepRole(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    className="bg-slate-700 hover:bg-slate-600 w-full"
                    onClick={() => {
                      const audit = RomanGuildFirewall.auditRepresentative(repName, repRole);
                      alert(audit.isDividedLoyalty
                        ? `⚠️ DIVIDED LOYALTY DETECTED\n\n${audit.loyaltyWarning}\n\n---MANDATORY NOTICE---\n${audit.mandatoryNotice}`
                        : `✅ ${audit.loyaltyWarning}\n\n---LIMITED SCOPE STATEMENT---\n${audit.limitedScopeStatement}`
                      );
                    }}
                    disabled={!repName.trim()}
                  >
                    Audit Representative
                  </Button>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* ── SOVEREIGN TOOLKIT TAB ─────────────────────────────────── */}
          <TabsContent value="sovereign" className="space-y-4">
            <Card className="bg-gradient-to-br from-purple-950 to-slate-900 border-purple-700">
              <CardHeader>
                <CardTitle className="text-purple-300 flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Sovereign Toolkit Router
                </CardTitle>
                <CardDescription className="text-purple-200/70">
                  Describe your situation. R.O.M.A.N. routes to the correct Toolkit and identifies Counter-Canon linguistic traps in play.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Describe Your Situation</Label>
                  <Textarea
                    className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
                    placeholder="e.g. I received an IRS notice about back taxes... / I was pulled over and they want to search my car... / I got a court summons from a debt collector..."
                    value={scenarioInput}
                    onChange={e => setScenarioInput(e.target.value)}
                  />
                </div>
                <Button
                  className="bg-purple-600 hover:bg-purple-700 w-full"
                  onClick={() => setScenarioResult(romanLegalService.analyzeScenario(scenarioInput))}
                  disabled={!scenarioInput.trim()}
                >
                  Activate Sovereign Toolkit
                </Button>

                {scenarioResult && (
                  <div className="space-y-4 mt-4">
                    {scenarioResult.matched && scenarioResult.toolkit ? (
                      <>
                        {/* Active Toolkit Banner */}
                        <div className="bg-purple-900/60 border border-purple-500 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-purple-300 text-sm font-mono">{scenarioResult.toolkit.id}</span>
                            <Badge className="bg-purple-600 text-white">ACTIVE</Badge>
                          </div>
                          <h3 className="text-white text-lg font-bold">{scenarioResult.toolkit.title}</h3>
                          <p className="text-purple-200 text-sm mt-1">Protocol: {scenarioResult.toolkit.core_protocol}</p>
                          <p className="text-slate-300 text-sm mt-1">Counter-Canon: {scenarioResult.toolkit.counter_canon_volumes.join(', ')}</p>
                        </div>

                        {/* Immediate Action */}
                        <div className="bg-amber-900/40 border border-amber-600 rounded-lg p-4">
                          <h4 className="text-amber-300 font-bold mb-2">⚡ IMMEDIATE ACTION</h4>
                          <p className="text-white text-sm leading-relaxed">{scenarioResult.immediateAction}</p>
                        </div>

                        {/* Primary Defense */}
                        <div className="bg-green-900/40 border border-green-600 rounded-lg p-4">
                          <h4 className="text-green-300 font-bold mb-2">⚖️ PRIMARY DEFENSE</h4>
                          <p className="text-white text-sm leading-relaxed">{scenarioResult.toolkit.primary_defense}</p>
                        </div>

                        {/* Linguistic Warning */}
                        <div className={`border rounded-lg p-4 ${scenarioResult.counterCanonWordsInPlay.length > 0 ? 'bg-red-900/40 border-red-600' : 'bg-slate-800 border-slate-600'}`}>
                          <h4 className={`font-bold mb-2 ${scenarioResult.counterCanonWordsInPlay.length > 0 ? 'text-red-300' : 'text-slate-300'}`}>
                            🔍 Linguistic Trap Scan
                          </h4>
                          <p className="text-white text-sm">{scenarioResult.linguisticWarning}</p>
                          {scenarioResult.counterCanonWordsInPlay.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {scenarioResult.counterCanonWordsInPlay.map(word => (
                                <Badge key={word} className="bg-red-700 text-white text-xs">{word}</Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Standing Assertion */}
                        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
                          <h4 className="text-slate-300 font-bold mb-2">📜 Standing Assertion</h4>
                          <p className="text-slate-200 text-sm italic leading-relaxed">"{scenarioResult.standingAssertion}"</p>
                        </div>
                      </>
                    ) : (
                      <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
                        <p className="text-slate-300">{scenarioResult.immediateAction}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════
              LAYER 5 — PAPERBACK QR BRIDGE / BOOK SYNC
              Links physical Sovereign Self Series books (QR codes) to live
              case law amendments post-print. Active Amendment Record system.
              ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="booksync" className="space-y-4">
            <Card className="bg-gradient-to-br from-amber-950 to-slate-900 border-amber-700">
              <CardHeader>
                <CardTitle className="text-amber-300 flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Paperback QR Bridge — Active Amendment Records
                </CardTitle>
                <CardDescription className="text-amber-200/70">
                  Your physical books are living documents. Scan QR codes or select a Toolkit to retrieve post-print case law updates and generate a Letter of Amendment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* 7-Toolkit Summary Grid */}
                <div>
                  <h4 className="text-amber-300 font-semibold mb-3 text-sm uppercase tracking-wide">All 7 Sovereign Toolkits — Amendment Status</h4>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {romanLegalService.getBookSyncSummary().map((entry: any) => (
                      <button
                        key={entry.toolkitId}
                        className="text-left bg-slate-800 hover:bg-amber-900/40 border border-slate-600 hover:border-amber-600 rounded-lg p-3 transition-colors"
                        onClick={() => setBookSyncToolkitId(entry.toolkitId)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-amber-400 font-mono text-xs">{entry.toolkitId}</span>
                          <Badge className={entry.criticalUpdateCount > 0 ? 'bg-red-700 text-white text-xs' : 'bg-slate-600 text-slate-300 text-xs'}>
                            {entry.criticalUpdateCount > 0 ? `${entry.criticalUpdateCount} CRITICAL` : 'current'}
                          </Badge>
                        </div>
                        <p className="text-white text-sm font-medium">{entry.toolkitTitle}</p>
                        <p className="text-slate-400 text-xs mt-1">
                          {entry.highUrgencyCases} high-urgency case{entry.highUrgencyCases !== 1 ? 's' : ''}
                          {entry.hasStatutoryUpdates ? ' · statutory updates' : ''}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amendment Record Lookup */}
                <div className="border-t border-amber-800 pt-4 space-y-3">
                  <h4 className="text-amber-300 font-semibold text-sm uppercase tracking-wide">Generate Letter of Amendment</h4>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Toolkit ID (e.g. TK-01)</Label>
                    <Input
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="TK-01 through TK-07"
                      value={bookSyncToolkitId}
                      onChange={e => setBookSyncToolkitId(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Your Situation (optional — personalizes the letter)</Label>
                    <Textarea
                      className="bg-slate-800 border-slate-600 text-white min-h-[80px]"
                      placeholder="Describe your current matter so R.O.M.A.N. can tailor the amendment letter to your case..."
                      value={bookSyncContext}
                      onChange={e => setBookSyncContext(e.target.value)}
                    />
                  </div>
                  <Button
                    className="bg-amber-600 hover:bg-amber-700 w-full"
                    disabled={!bookSyncToolkitId.trim() || bookSyncLoading}
                    onClick={async () => {
                      setBookSyncLoading(true);
                      setBookSyncResult(null);
                      const result = await romanLegalService.getAmendmentRecord(
                        bookSyncToolkitId.trim(),
                        bookSyncContext.trim() || undefined
                      );
                      setBookSyncResult(result);
                      setBookSyncLoading(false);
                    }}
                  >
                    {bookSyncLoading ? 'Fetching Amendments...' : 'Retrieve Amendment Record'}
                  </Button>
                </div>

                {/* Amendment Record Results */}
                {bookSyncResult && (
                  <div className="space-y-4 border-t border-amber-800 pt-4">
                    {bookSyncResult.record ? (
                      <>
                        {/* Record Header */}
                        <div className="bg-amber-900/40 border border-amber-600 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-amber-300 font-mono text-sm">{bookSyncResult.record.toolkitId}</span>
                            {bookSyncResult.record.criticalUpdates?.length > 0 && (
                              <Badge className="bg-red-700 text-white">{bookSyncResult.record.criticalUpdates.length} CRITICAL</Badge>
                            )}
                          </div>
                          <h3 className="text-white font-bold">{bookSyncResult.record.toolkitTitle}</h3>
                          <p className="text-slate-400 text-xs mt-1">Last Synced: {bookSyncResult.record.lastUpdated} · Print v{bookSyncResult.record.printVersion} → Live v{bookSyncResult.record.liveVersion}</p>
                          {bookSyncResult.record.criticalUpdates?.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {bookSyncResult.record.criticalUpdates.map((u: string, i: number) => (
                                <li key={i} className="text-red-300 text-xs">⚠ {u}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Recent Case Law */}
                        {bookSyncResult.record.recentCaseLaw?.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-amber-300 font-semibold text-sm">Post-Print Case Law Updates</h4>
                            {bookSyncResult.record.recentCaseLaw.map((c: any, i: number) => (
                              <div key={i} className={`rounded-lg p-3 border ${c.urgency === 'CRITICAL' ? 'bg-red-900/30 border-red-700' : c.urgency === 'HIGH' ? 'bg-orange-900/30 border-orange-700' : 'bg-slate-800 border-slate-600'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={c.urgency === 'CRITICAL' ? 'bg-red-700 text-white text-xs' : c.urgency === 'HIGH' ? 'bg-orange-600 text-white text-xs' : 'bg-slate-600 text-slate-300 text-xs'}>
                                    {c.urgency}
                                  </Badge>
                                  <span className="text-white text-sm font-medium">{c.case}</span>
                                  <span className="text-slate-400 text-xs">({c.decided})</span>
                                </div>
                                <p className="text-slate-300 text-sm">{c.impact}</p>
                                <p className="text-amber-200 text-xs mt-1 font-mono">{c.citation} · {c.court}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Amendment Letter */}
                        <div className="space-y-2">
                          <h4 className="text-amber-300 font-semibold text-sm">Letter of Amendment</h4>
                          <div className="bg-slate-900 border border-slate-600 rounded-lg p-4">
                            <pre className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                              {bookSyncResult.amendmentLetter}
                            </pre>
                          </div>
                          <Button
                            variant="outline"
                            className="border-amber-700 text-amber-300 hover:bg-amber-900/30 w-full"
                            onClick={() => {
                              const blob = new Blob([bookSyncResult.amendmentLetter], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `Amendment_Letter_${bookSyncToolkitId}_${new Date().toISOString().split('T')[0]}.txt`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Amendment Letter
                          </Button>
                        </div>
                      </>
                    ) : (
                      <Alert className="bg-red-900 border-red-700">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="text-white">Toolkit Not Found</AlertTitle>
                        <AlertDescription className="text-red-200">
                          No amendment record found for "{bookSyncToolkitId}". Use TK-01 through TK-07.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">{accounts.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-12 text-center">
                  <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Accounts Added</h3>
                  <p className="text-slate-400 mb-6">Add your first debt account to start using legal defense tools</p>
                  <Button onClick={() => setShowAddAccount(true)} className="bg-green-600 hover:bg-green-700">
                    Add Account
                  </Button>
                </CardContent>
              </Card>
            ) : (
              accounts.map(account => (
                <Card key={account.id} className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          {account.creditor}
                          {account.analysis?.statuteExpired && (
                            <Badge variant="outline" className="bg-green-900 text-green-300 border-green-700">
                              Statute Expired
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          Account #{account.accountNumber}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant="outline"
                        className={`
                          ${account.analysis?.riskLevel === 'LOW' ? 'bg-green-900 text-green-300 border-green-700' : ''}
                          ${account.analysis?.riskLevel === 'MEDIUM' ? 'bg-yellow-900 text-yellow-300 border-yellow-700' : ''}
                          ${account.analysis?.riskLevel === 'HIGH' ? 'bg-red-900 text-red-300 border-red-700' : ''}
                        `}
                      >
                        {account.analysis?.riskLevel} Risk
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Amount */}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Current Amount:</span>
                      <span className="text-2xl font-bold text-white">${account.currentAmount.toLocaleString()}</span>
                    </div>

                    {/* Defense Strength */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Defense Strength:</span>
                        <span className="text-white font-semibold">{account.analysis?.estimatedDefenseStrength}%</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all"
                          style={{ width: `${account.analysis?.estimatedDefenseStrength}%` }}
                        />
                      </div>
                    </div>

                    {/* Recommended Action */}
                    <Alert className="bg-slate-900 border-blue-700">
                      <Scale className="h-4 w-4" />
                      <AlertTitle className="text-white">Recommended Action</AlertTitle>
                      <AlertDescription className="text-slate-300">
                        {account.analysis?.recommendedAction}
                      </AlertDescription>
                    </Alert>

                    {/* Applicable Laws */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-slate-300">Applicable Laws:</h4>
                      <div className="flex flex-wrap gap-2">
                        {account.analysis?.applicableLaw.map((law, idx) => (
                          <Badge key={idx} variant="outline" className="bg-slate-900 text-slate-300 border-slate-600">
                            {law.split(' ')[0]} {law.split(' ')[1]}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Upload Documents Section */}
                    <div className="space-y-2 pt-2 border-t border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-slate-400 uppercase tracking-wide">Contract Documents</span>
                      </div>
                      <Button 
                        onClick={() => setSelectedAccount(account)}
                        variant="outline"
                        className="w-full border-green-600 text-green-300 hover:bg-green-900"
                        size="sm"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Upload Loan/Credit Agreement → Evidence Tab
                      </Button>
                      <p className="text-xs text-slate-400">
                        Upload original agreements for AI contract analysis
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-2 border-t border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-slate-400 uppercase tracking-wide">R.O.M.A.N. AI-Generated Letters</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!account.analysis?.statuteExpired && account.collectionAgency && (
                          <Button 
                            onClick={() => generateLetter(account, 'validation', true)}
                            className="bg-blue-600 hover:bg-blue-700"
                            size="sm"
                          >
                            <Bot className="w-4 h-4 mr-2" />
                            Validation Letter
                          </Button>
                        )}
                        <Button 
                          onClick={() => generateLetter(account, 'credit_dispute', true)}
                          variant="outline"
                          className="border-blue-600 text-blue-300 hover:bg-blue-900"
                          size="sm"
                        >
                          <Bot className="w-4 h-4 mr-2" />
                          Credit Dispute
                        </Button>
                        <Button 
                          onClick={() => calculateSettlement(account)}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <Bot className="w-4 h-4 mr-2" />
                          Settlement Offer
                        </Button>
                        <Button 
                          onClick={() => generateLetter(account, 'cease_desist', true)}
                          variant="outline"
                          className="border-red-600 text-red-300 hover:bg-red-900"
                          size="sm"
                        >
                          <Bot className="w-4 h-4 mr-2" />
                          Cease & Desist
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2 mt-4">
                        <Scale className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-slate-400 uppercase tracking-wide">Analysis Tools</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          onClick={() => {
                            setAnalyzerAccount(account);
                            setShowResponseAnalyzer(true);
                          }}
                          variant="outline"
                          className="border-purple-600 text-purple-300 hover:bg-purple-900"
                          size="sm"
                        >
                          <Scale className="w-4 h-4 mr-2" />
                          Analyze Response
                        </Button>
                        {account.certifiedMailTracking && (
                          <Button 
                            onClick={() => trackCertifiedMail(account)}
                            variant="outline"
                            className="border-yellow-600 text-yellow-300 hover:bg-yellow-900"
                            size="sm"
                          >
                            <Package className="w-4 h-4 mr-2" />
                            Track Mail
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* USPS Tracking Status */}
                    {account.certifiedMailTracking && trackingInfo.has(account.certifiedMailTracking) && (
                      <Alert className="bg-blue-900 border-blue-700 mt-4">
                        <Package className="h-4 w-4" />
                        <AlertTitle className="text-white">USPS Tracking</AlertTitle>
                        <AlertDescription className="text-slate-300">
                          {trackingInfo.get(account.certifiedMailTracking)!.status}
                          {trackingInfo.get(account.certifiedMailTracking)!.deliveryDate && (
                            <div className="mt-2">
                              Delivered: {trackingInfo.get(account.certifiedMailTracking)!.deliveryDate?.toLocaleDateString()}
                              <br />
                              Response Due: {uspsTrackingService.calculateResponseDeadline(
                                trackingInfo.get(account.certifiedMailTracking)!.deliveryDate!
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Business Debt Tab */}
          <TabsContent value="business">
            <BusinessDebtTracker />
          </TabsContent>

          {/* Payment Plan Calculator Tab */}
          <TabsContent value="payment">
            <PaymentPlanCalculator userId={''} />
          </TabsContent>

          {/* Contract Analyzer Tab */}
          <TabsContent value="contracts">
            <ContractAnalyzer />
          </TabsContent>

          {/* Insurance Gap Tracker Tab */}
          <TabsContent value="insurance">
            <InsuranceGapTracker />
          </TabsContent>

          {/* R.O.M.A.N. Strategy Tab */}
          <TabsContent value="roman">
            <RomanStrategyPanel userId={''} />
          </TabsContent>

          {/* Active Credit Tab */}
          <TabsContent value="credit">
            <ActiveCreditTracker />
          </TabsContent>

          {/* Credit Inquiries Tab */}
          <TabsContent value="inquiries">
            <CreditInquiryTracker />
          </TabsContent>

          {/* Deadlines Tab */}
          <TabsContent value="deadlines">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Upcoming Deadlines
                </CardTitle>
                <CardDescription className="text-slate-400">
                  FDCPA validation & FCRA dispute windows
                </CardDescription>
              </CardHeader>
              <CardContent>
                {accounts.filter(acc => acc.analysis?.validationDeadline).length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No active deadlines</p>
                ) : (
                  <div className="space-y-3">
                    {accounts
                      .filter(acc => acc.analysis?.validationDeadline)
                      .map(account => (
                        <div key={account.id} className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                          <div>
                            <p className="text-white font-semibold">{account.creditor}</p>
                            <p className="text-sm text-slate-400">Validation deadline</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold">
                              {account.analysis?.validationDeadline?.toLocaleDateString()}
                            </p>
                            <p className="text-sm text-yellow-400">
                              {Math.ceil((account.analysis!.validationDeadline!.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Letters Tab */}
          <TabsContent value="letters">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Letter Templates
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Court-tested FDCPA & FCRA compliant letters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-blue-900 border-blue-700">
                  <Mail className="h-4 w-4" />
                  <AlertTitle className="text-white">Important: Certified Mail Required</AlertTitle>
                  <AlertDescription className="text-slate-300">
                    All letters MUST be sent via USPS Certified Mail with Return Receipt Requested.
                    Cost: ~$8 per letter. Without proof of delivery, you have no legal evidence.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-slate-900 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Debt Validation Letter</CardTitle>
                      <CardDescription className="text-slate-400">15 USC §1692g</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-300 mb-4">
                        Forces collection agency to prove: (1) Original creditor, (2) Amount breakdown, (3) Legal assignment.
                      </p>
                      <Button 
                        onClick={() => accounts[0] && generateLetter(accounts[0], 'validation', true)}
                        className="w-full bg-blue-600 hover:bg-blue-700" 
                        disabled={accounts.length === 0}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Generate Letter
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Credit Report Dispute</CardTitle>
                      <CardDescription className="text-slate-400">15 USC §1681i</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-300 mb-4">
                        Credit bureau must verify within 30 days or remove item. Send to all 3 bureaus.
                      </p>
                      <Button 
                        onClick={() => accounts[0] && generateLetter(accounts[0], 'credit_dispute', true)}
                        className="w-full bg-purple-600 hover:bg-purple-700" 
                        disabled={accounts.length === 0}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Generate Letter
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evidence Tab */}
          <TabsContent value="evidence">
            {selectedAccount ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Evidence for {selectedAccount.creditor}
                  </h3>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedAccount(null)}
                    className="border-slate-600"
                  >
                    Back to Accounts
                  </Button>
                </div>
                <EvidenceLog 
                  accountId={selectedAccount.id} 
                  accountName={selectedAccount.creditor}
                />
              </div>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Select an Account</CardTitle>
                  <CardDescription className="text-slate-400">
                    Choose an account to view and upload evidence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {accounts.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No accounts added yet</p>
                  ) : (
                    <div className="space-y-2">
                      {accounts.map(account => (
                        <Button
                          key={account.id}
                          variant="outline"
                          className="w-full justify-between border-slate-600 hover:bg-slate-700"
                          onClick={() => setSelectedAccount(account)}
                        >
                          <span className="text-white">{account.creditor}</span>
                          <span className="text-slate-400">#{account.accountNumber}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Strategy Tab */}
          <TabsContent value="strategy">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Legal Defense Strategy
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Understanding how to use the law in your favor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">The Rules (You Didn't Write Them)</h3>
                  
                  <div className="space-y-3">
                    <Alert className="bg-green-900 border-green-700">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle className="text-green-300">Georgia Statute of Limitations: 6 Years</AlertTitle>
                      <AlertDescription className="text-green-200">
                        O.C.G.A. §9-3-24 - After 6 years from last payment, debt becomes unenforceable in court. 
                        They can't sue you. Don't acknowledge it, don't make payments (resets clock).
                      </AlertDescription>
                    </Alert>

                    <Alert className="bg-blue-900 border-blue-700">
                      <Scale className="h-4 w-4" />
                      <AlertTitle className="text-blue-300">FDCPA: 30 Days to Demand Proof</AlertTitle>
                      <AlertDescription className="text-blue-200">
                        15 USC §1692g - You have 30 days from first collection letter to demand validation.
                        They must prove: (1) Original creditor, (2) Amount owed, (3) Legal assignment. 
                        If they can't prove it, they must stop collecting or face $1,000 statutory damages.
                      </AlertDescription>
                    </Alert>

                    <Alert className="bg-purple-900 border-purple-700">
                      <FileText className="h-4 w-4" />
                      <AlertTitle className="text-purple-300">FCRA: Force Credit Bureau Verification</AlertTitle>
                      <AlertDescription className="text-purple-200">
                        15 USC §1681i - Credit bureaus must verify disputed items within 30 days or remove them.
                        If original creditor doesn't respond to verification request, item gets deleted.
                      </AlertDescription>
                    </Alert>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-lg space-y-4">
                    <h4 className="text-white font-semibold">What Wins:</h4>
                    <ul className="space-y-2 text-slate-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Certified Mail:</strong> Proof of delivery = legal evidence. Regular mail doesn't count.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>30-Day Deadlines:</strong> Validation & dispute windows create legal pressure.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>FDCPA Violations:</strong> $1,000 statutory damages per violation + attorney fees.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Statute Expired:</strong> If 6+ years old in Georgia, unenforceable.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-red-900 p-6 rounded-lg space-y-4">
                    <h4 className="text-white font-semibold">What Loses:</h4>
                    <ul className="space-y-2 text-red-200">
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Phone Calls:</strong> No proof of what was said. All communication in writing.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Ignoring Deadlines:</strong> Miss 30-day windows = lose rights.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Acknowledging Old Debt:</strong> Saying "I owe this" can restart statute.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Partial Payments:</strong> Even $1 resets the 6-year statute clock.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Add Account Modal (simplified version) */}
        {showAddAccount && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="bg-slate-800 border-slate-700 w-full max-w-2xl my-8">
              <CardHeader>
                <CardTitle className="text-white">Add Debt Account</CardTitle>
                <CardDescription className="text-slate-400">Enter account details for legal analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="creditor" className="text-white">Creditor Name *</Label>
                    <Input
                      id="creditor"
                      value={newAccountForm.creditor}
                      onChange={(e) => setNewAccountForm({...newAccountForm, creditor: e.target.value})}
                      className="bg-slate-900 border-slate-700 text-white"
                      placeholder="e.g., Capital One"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber" className="text-white">Account Number *</Label>
                    <Input
                      id="accountNumber"
                      value={newAccountForm.accountNumber}
                      onChange={(e) => setNewAccountForm({...newAccountForm, accountNumber: e.target.value})}
                      className="bg-slate-900 border-slate-700 text-white"
                      placeholder="Last 4 digits: ****1234"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="originalAmount" className="text-white">Original Amount *</Label>
                    <Input
                      id="originalAmount"
                      type="number"
                      step="0.01"
                      value={newAccountForm.originalAmount}
                      onChange={(e) => setNewAccountForm({...newAccountForm, originalAmount: e.target.value})}
                      className="bg-slate-900 border-slate-700 text-white"
                      placeholder="5000.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currentAmount" className="text-white">Current Amount Claimed *</Label>
                    <Input
                      id="currentAmount"
                      type="number"
                      step="0.01"
                      value={newAccountForm.currentAmount}
                      onChange={(e) => setNewAccountForm({...newAccountForm, currentAmount: e.target.value})}
                      className="bg-slate-900 border-slate-700 text-white"
                      placeholder="7500.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastPaymentDate" className="text-white">Last Payment Date *</Label>
                    <Input
                      id="lastPaymentDate"
                      type="date"
                      value={newAccountForm.lastPaymentDate}
                      onChange={(e) => setNewAccountForm({...newAccountForm, lastPaymentDate: e.target.value})}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateOfDefault" className="text-white">Date of Default *</Label>
                    <Input
                      id="dateOfDefault"
                      type="date"
                      value={newAccountForm.dateOfDefault}
                      onChange={(e) => setNewAccountForm({...newAccountForm, dateOfDefault: e.target.value})}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="collectionAgency" className="text-white">Collection Agency</Label>
                    <Input
                      id="collectionAgency"
                      value={newAccountForm.collectionAgency}
                      onChange={(e) => setNewAccountForm({...newAccountForm, collectionAgency: e.target.value})}
                      className="bg-slate-900 border-slate-700 text-white"
                      placeholder="e.g., Midland Credit"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="collectionLetterReceived" className="text-white">Letter Received Date</Label>
                    <Input
                      id="collectionLetterReceived"
                      type="date"
                      value={newAccountForm.collectionLetterReceived}
                      onChange={(e) => setNewAccountForm({...newAccountForm, collectionLetterReceived: e.target.value})}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => {
                      setShowAddAccount(false);
                      setNewAccountForm({
                        creditor: '',
                        originalAmount: '',
                        currentAmount: '',
                        accountNumber: '',
                        lastPaymentDate: '',
                        dateOfDefault: '',
                        collectionLetterReceived: '',
                        collectionAgency: '',
                        status: 'active'
                      });
                    }} 
                    variant="outline" 
                    className="border-slate-600"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      if (!newAccountForm.creditor || !newAccountForm.accountNumber || 
                          !newAccountForm.originalAmount || !newAccountForm.currentAmount ||
                          !newAccountForm.lastPaymentDate || !newAccountForm.dateOfDefault) {
                        alert('Please fill in all required fields (*)');
                        return;
                      }
                      saveAccount({
                        creditor: newAccountForm.creditor,
                        accountNumber: newAccountForm.accountNumber,
                        originalAmount: parseFloat(newAccountForm.originalAmount),
                        currentAmount: parseFloat(newAccountForm.currentAmount),
                        lastPaymentDate: new Date(newAccountForm.lastPaymentDate),
                        dateOfDefault: new Date(newAccountForm.dateOfDefault),
                        collectionLetterReceived: newAccountForm.collectionLetterReceived ? new Date(newAccountForm.collectionLetterReceived) : undefined,
                        collectionAgency: newAccountForm.collectionAgency || undefined,
                        status: newAccountForm.status
                      });
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Scale className="w-4 h-4 mr-2" />
                    Analyze & Add Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Response Analyzer Modal */}
        {showResponseAnalyzer && analyzerAccount && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="bg-slate-800 border-slate-700 w-full max-w-4xl my-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Scale className="w-6 h-6" />
                  Response Analyzer - {analyzerAccount.creditor}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Paste collection agency response to detect FDCPA violations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="response" className="text-white">Collection Agency Response</Label>
                  <Textarea
                    id="response"
                    placeholder="Paste the full text of their response letter here..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="min-h-[200px] bg-slate-900 border-slate-700 text-white"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={analyzeResponse} className="bg-purple-600 hover:bg-purple-700">
                    <Scale className="w-4 h-4 mr-2" />
                    Analyze for Violations
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowResponseAnalyzer(false);
                      setResponseText('');
                      setAnalysisResult(null);
                    }} 
                    variant="outline" 
                    className="border-slate-600"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>

                {/* Analysis Results */}
                {analysisResult && (
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                      <div>
                        <h3 className="text-white font-semibold">Validation Status</h3>
                        <p className="text-sm text-slate-400">
                          {analysisResult.isValidated ? 'Complete' : 'Insufficient'}
                        </p>
                      </div>
                      <Badge variant="outline" className={
                        analysisResult.isValidated 
                          ? 'bg-green-900 text-green-300 border-green-700' 
                          : 'bg-red-900 text-red-300 border-red-700'
                      }>
                        {analysisResult.isValidated ? 'VALIDATED' : 'INVALID'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                      <div>
                        <h3 className="text-white font-semibold">Legal Defense Strength</h3>
                        <p className="text-sm text-slate-400">Your position strength</p>
                      </div>
                      <div className="text-3xl font-bold text-blue-400">
                        {analysisResult.legalStrength}%
                      </div>
                    </div>

                    {/* Violations Detected */}
                    {analysisResult.violations.length > 0 && (
                      <Alert className="bg-red-900 border-red-700">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="text-white">
                          {analysisResult.violations.length} FDCPA Violation(s) Detected
                        </AlertTitle>
                        <AlertDescription className="text-red-200 space-y-3 mt-3">
                          {analysisResult.violations.map((violation: any, idx: number) => (
                            <div key={idx} className="p-3 bg-red-950 rounded">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="bg-red-900 text-red-200 border-red-700">
                                  {violation.statute}
                                </Badge>
                                <Badge variant="outline" className={
                                  violation.severity === 'CRITICAL' ? 'bg-red-900 border-red-600' :
                                  violation.severity === 'MODERATE' ? 'bg-yellow-900 border-yellow-600' :
                                  'bg-blue-900 border-blue-600'
                                }>
                                  {violation.severity}
                                </Badge>
                              </div>
                              <p className="text-sm">{violation.description}</p>
                              <p className="text-xs mt-2 text-red-300">
                                Statutory Damages: ${violation.statutoryDamages.toLocaleString()}
                              </p>
                            </div>
                          ))}
                          <div className="mt-4 p-3 bg-green-950 rounded border border-green-700">
                            <p className="font-semibold text-green-300">
                              Total Potential Damages: ${analysisResult.violations.reduce((sum: number, v: any) => sum + v.statutoryDamages, 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-green-200 mt-1">
                              Plus actual damages + attorney fees (paid by violator if you win)
                            </p>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Next Action */}
                    <Alert className="bg-blue-900 border-blue-700">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle className="text-white">Recommended Next Steps</AlertTitle>
                      <AlertDescription className="text-blue-200 whitespace-pre-line">
                        {analysisResult.nextAction}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settlement Calculator Modal */}
        {showSettlement && settlementAccount && settlementOffer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-slate-800 border-slate-700 w-full max-w-3xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-6 h-6" />
                  Settlement Calculator - {settlementAccount.creditor}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Strategic settlement offer based on debt age and collectability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Debt */}
                <div className="p-4 bg-slate-900 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Current Balance:</span>
                    <span className="text-3xl font-bold text-white">
                      ${settlementAccount.currentAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Strategy */}
                <Alert className="bg-blue-900 border-blue-700">
                  <TrendingDown className="h-4 w-4" />
                  <AlertTitle className="text-white">Strategy: {settlementOffer.strategy}</AlertTitle>
                  <AlertDescription className="text-blue-200">
                    {settlementOffer.reasoning}
                  </AlertDescription>
                </Alert>

                {/* Recommended Offer */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-900 rounded-lg border border-green-700">
                    <h3 className="text-sm text-green-300 mb-2">Recommended Offer</h3>
                    <p className="text-3xl font-bold text-white">
                      ${settlementOffer.recommendedOffer.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-200 mt-2">
                      {Math.round((settlementOffer.recommendedOffer / settlementAccount.currentAmount) * 100)}% of balance
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-900 rounded-lg border border-yellow-700">
                    <h3 className="text-sm text-yellow-300 mb-2">Maximum Offer</h3>
                    <p className="text-3xl font-bold text-white">
                      ${settlementOffer.maxOffer.toLocaleString()}
                    </p>
                    <p className="text-sm text-yellow-200 mt-2">
                      {Math.round((settlementOffer.maxOffer / settlementAccount.currentAmount) * 100)}% of balance
                    </p>
                  </div>
                </div>

                {/* Potential Savings */}
                <div className="p-4 bg-purple-900 rounded-lg border border-purple-700">
                  <h3 className="text-purple-300 font-semibold mb-2">Potential Savings</h3>
                  <p className="text-2xl font-bold text-white">
                    ${(settlementAccount.currentAmount - settlementOffer.recommendedOffer).toLocaleString()}
                  </p>
                  <p className="text-sm text-purple-200 mt-1">
                    By negotiating settlement vs paying full balance
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => generateLetter(settlementAccount, 'settlement')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Generate Settlement Letter
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowSettlement(false);
                      setSettlementOffer(null);
                    }} 
                    variant="outline" 
                    className="border-slate-600"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>

                {/* Important Notes */}
                <Alert className="bg-yellow-900 border-yellow-700">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-white">Settlement Rules</AlertTitle>
                  <AlertDescription className="text-yellow-200">
                    <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                      <li>NEVER make payment before getting written settlement agreement</li>
                      <li>Demand "PAID IN FULL" reporting to credit bureaus (not "settled for less")</li>
                      <li>Get confirmation no 1099-C tax form will be issued</li>
                      <li>Use cashier's check or money order (protects against unauthorized withdrawals)</li>
                      <li>Keep all documentation forever</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
