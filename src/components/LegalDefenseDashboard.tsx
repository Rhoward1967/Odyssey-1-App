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
import { romanLegalService } from '@/services/romanLegalService';
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

        {/* Main Content */}
        <Tabs defaultValue="accounts" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700 flex-wrap h-auto justify-start">
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
