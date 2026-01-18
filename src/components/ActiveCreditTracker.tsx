import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabaseClient';
import { AlertTriangle, Bot, DollarSign, Loader2, Plus, Shield, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CreditAccount {
  id: string;
  creditorName: string;
  accountNumberLast4: string;
  accountType: string;
  accountStatus: string;
  reportedBalance: number;
  creditLimit?: number;
  utilizationPercent?: number;
  currentApr?: number;
  originalApr?: number;
  penaltyApr?: number;
  annualFee: number;
  lateFeesTotal: number;
  accountOpened: Date;
  ageYears?: number;
  ageMonths?: number;
  latePaymentsCount: number;
  hasViolations: boolean;
  violationTypes?: string[];
  potentialDamages: number;
  recommendedAction?: string;
  priority?: string;
  notes?: string;
}

export default function ActiveCreditTracker() {
  const [accounts, setAccounts] = useState<CreditAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  
  const [newAccount, setNewAccount] = useState({
    creditorName: '',
    accountNumberLast4: '',
    accountType: 'credit_card',
    accountStatus: 'open',
    reportedBalance: '',
    creditLimit: '',
    utilizationPercent: '',
    currentApr: '',
    originalApr: '',
    accountOpened: '',
    ageYears: '',
    ageMonths: '',
    latePaymentsCount: '0',
    annualFee: '0',
    notes: ''
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('active_credit_accounts')
        .select('*')
        .order('priority', { ascending: true })
        .order('reported_balance', { ascending: false });

      if (error) throw error;

      if (data) {
        setAccounts(data.map(row => ({
          id: row.id,
          creditorName: row.creditor_name,
          accountNumberLast4: row.account_number_last4,
          accountType: row.account_type,
          accountStatus: row.account_status,
          reportedBalance: parseFloat(row.reported_balance),
          creditLimit: row.credit_limit ? parseFloat(row.credit_limit) : undefined,
          utilizationPercent: row.utilization_percent,
          currentApr: row.current_apr ? parseFloat(row.current_apr) : undefined,
          originalApr: row.original_apr ? parseFloat(row.original_apr) : undefined,
          penaltyApr: row.penalty_apr ? parseFloat(row.penalty_apr) : undefined,
          annualFee: parseFloat(row.annual_fee || 0),
          lateFeesTotal: parseFloat(row.late_fees_total || 0),
          accountOpened: new Date(row.account_opened),
          ageYears: row.age_years,
          ageMonths: row.age_months,
          latePaymentsCount: row.late_payments_count || 0,
          hasViolations: row.has_violations,
          violationTypes: row.violation_types,
          potentialDamages: parseFloat(row.potential_damages || 0),
          recommendedAction: row.recommended_action,
          priority: row.priority,
          notes: row.notes
        })));
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const analyzeForViolations = (account: typeof newAccount) => {
    const violations: string[] = [];
    let damages = 0;
    let priority: 'urgent' | 'high' | 'medium' | 'low' = 'medium';
    let action = '';

    const currentApr = parseFloat(account.currentApr || '0');
    const originalApr = parseFloat(account.originalApr || '0');
    const utilization = parseInt(account.utilizationPercent || '0');
    const balance = parseFloat(account.reportedBalance || '0');

    // Check for unfair APR increases (CARD Act violation)
    if (currentApr > originalApr + 5) {
      violations.push('unfair_rate_increase');
      damages += 1000; // Potential TILA/CARD Act violation
      action = 'Dispute rate increase - request justification under CARD Act';
      priority = 'high';
    }

    // Check for excessive APR (potential state usury law violation)
    if (currentApr > 36) {
      violations.push('usury_violation');
      damages += 2000; // Many states cap at 36%
      action = 'File state usury law complaint - rate may be illegal';
      priority = 'urgent';
    }

    // Over-limit (100%+ utilization) - potential unfair practice
    if (utilization >= 100) {
      violations.push('over_limit_allowed');
      damages += 500;
      if (!action) action = 'Demand removal of over-limit fees - CARD Act prohibits charging over-limit without consent';
      priority = 'high';
    }

    // High utilization on high-interest account
    if (utilization > 80 && currentApr > 25) {
      if (!action) action = 'Request hardship rate reduction or payment plan';
      if (priority === 'medium') priority = 'high';
    }

    // High balance with unfair terms
    if (balance > 10000 && currentApr > 20) {
      if (!action) action = 'Consider balance transfer or settlement negotiation';
    }

    return {
      hasViolations: violations.length > 0,
      violations,
      damages,
      priority,
      action: action || 'Monitor for compliance issues'
    };
  };

  const addAccount = async () => {
    if (!newAccount.creditorName || !newAccount.accountNumberLast4 || !newAccount.reportedBalance || !newAccount.accountOpened) {
      alert('Please fill in creditor name, account number, balance, and opening date');
      return;
    }

    const analysis = analyzeForViolations(newAccount);

    try {
      const { error } = await supabase
        .from('active_credit_accounts')
        .insert({
          creditor_name: newAccount.creditorName,
          account_number_last4: newAccount.accountNumberLast4,
          account_type: newAccount.accountType,
          account_status: newAccount.accountStatus,
          reported_balance: parseFloat(newAccount.reportedBalance),
          credit_limit: newAccount.creditLimit ? parseFloat(newAccount.creditLimit) : null,
          utilization_percent: newAccount.utilizationPercent ? parseInt(newAccount.utilizationPercent) : null,
          current_apr: newAccount.currentApr ? parseFloat(newAccount.currentApr) : null,
          original_apr: newAccount.originalApr ? parseFloat(newAccount.originalApr) : null,
          account_opened: newAccount.accountOpened,
          age_years: newAccount.ageYears ? parseInt(newAccount.ageYears) : null,
          age_months: newAccount.ageMonths ? parseInt(newAccount.ageMonths) : null,
          late_payments_count: parseInt(newAccount.latePaymentsCount),
          annual_fee: parseFloat(newAccount.annualFee),
          has_violations: analysis.hasViolations,
          violation_types: analysis.violations.length > 0 ? analysis.violations : null,
          potential_damages: analysis.damages,
          recommended_action: analysis.action,
          priority: analysis.priority,
          notes: newAccount.notes || null
        });

      if (error) throw error;

      await loadAccounts();
      setShowAdd(false);
      setNewAccount({
        creditorName: '',
        accountNumberLast4: '',
        accountType: 'credit_card',
        accountStatus: 'open',
        reportedBalance: '',
        creditLimit: '',
        utilizationPercent: '',
        currentApr: '',
        originalApr: '',
        accountOpened: '',
        ageYears: '',
        ageMonths: '',
        latePaymentsCount: '0',
        annualFee: '0',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding account:', error);
      alert('Failed to add account');
    }
  };

  const totalDebt = accounts.reduce((sum, acc) => sum + acc.reportedBalance, 0);
  const totalViolations = accounts.filter(acc => acc.hasViolations).length;
  const totalPotentialDamages = accounts.reduce((sum, acc) => sum + acc.potentialDamages, 0);
  const avgUtilization = accounts.length > 0 
    ? Math.round(accounts.reduce((sum, acc) => sum + (acc.utilizationPercent || 0), 0) / accounts.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="text-sm text-slate-400">Total Debt</div>
            <div className="text-2xl font-bold text-white">${totalDebt.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="text-sm text-slate-400">Avg Utilization</div>
            <div className="text-2xl font-bold text-yellow-400">{avgUtilization}%</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-red-900/50">
          <CardContent className="p-4">
            <div className="text-sm text-red-400">Violations Found</div>
            <div className="text-2xl font-bold text-red-400">{totalViolations}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-green-900/50">
          <CardContent className="p-4">
            <div className="text-sm text-green-400">Potential Damages</div>
            <div className="text-2xl font-bold text-green-400">${totalPotentialDamages.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Account Button */}
      <Button onClick={() => setShowAdd(true)} className="bg-blue-600 hover:bg-blue-700">
        <Plus className="w-4 h-4 mr-2" />
        Add Credit Account
      </Button>

      {/* Accounts List */}
      <div className="space-y-3">
        {accounts.map(account => (
          <Card key={account.id} className={`bg-slate-800 ${account.hasViolations ? 'border-red-700' : 'border-slate-700'}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">{account.creditorName}</h3>
                    {account.hasViolations && (
                      <Badge variant="destructive" className="bg-red-600">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {account.violationTypes?.length || 0} Violations
                      </Badge>
                    )}
                    {account.priority === 'urgent' && (
                      <Badge className="bg-red-600">URGENT</Badge>
                    )}
                    {account.priority === 'high' && (
                      <Badge className="bg-orange-600">HIGH PRIORITY</Badge>
                    )}
                  </div>
                  <div className="text-sm text-slate-400">
                    Account ending in {account.accountNumberLast4}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">${account.reportedBalance.toLocaleString()}</div>
                  {account.utilizationPercent && (
                    <div className={`text-sm ${account.utilizationPercent >= 100 ? 'text-red-400' : account.utilizationPercent >= 80 ? 'text-yellow-400' : 'text-slate-400'}`}>
                      {account.utilizationPercent}% utilized
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                {account.currentApr && (
                  <div>
                    <div className="text-slate-400">Current APR</div>
                    <div className={`font-semibold ${account.currentApr > 30 ? 'text-red-400' : account.currentApr > 20 ? 'text-yellow-400' : 'text-white'}`}>
                      {account.currentApr}%
                    </div>
                  </div>
                )}
                {account.creditLimit && (
                  <div>
                    <div className="text-slate-400">Credit Limit</div>
                    <div className="text-white font-semibold">${account.creditLimit.toLocaleString()}</div>
                  </div>
                )}
                {account.ageYears !== undefined && (
                  <div>
                    <div className="text-slate-400">Account Age</div>
                    <div className="text-white font-semibold">{account.ageYears}yrs {account.ageMonths}mos</div>
                  </div>
                )}
              </div>

              {account.hasViolations && account.violationTypes && (
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-3">
                  <div className="text-red-300 font-semibold mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Identified Violations:
                  </div>
                  <ul className="text-sm text-red-200 space-y-1 mb-2">
                    {account.violationTypes.map((violation, idx) => (
                      <li key={idx}>• {violation.replace(/_/g, ' ').toUpperCase()}</li>
                    ))}
                  </ul>
                  {account.potentialDamages > 0 && (
                    <div className="text-green-300 font-semibold">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Potential Damages: ${account.potentialDamages.toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              {account.recommendedAction && (
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
                  <div className="text-blue-300 font-semibold mb-1 flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    Recommended Action:
                  </div>
                  <div className="text-blue-200 text-sm">{account.recommendedAction}</div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {accounts.length === 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No credit accounts tracked yet</p>
              <p className="text-slate-500 text-sm mt-1">Add your accounts to analyze for violations</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Account Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-3xl my-8">
            <CardHeader>
              <CardTitle className="text-white">Add Credit Account</CardTitle>
              <CardDescription className="text-slate-400">Track credit accounts and identify unfair practices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creditorName" className="text-white">Creditor Name *</Label>
                  <Input
                    id="creditorName"
                    value={newAccount.creditorName}
                    onChange={(e) => setNewAccount({...newAccount, creditorName: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                    placeholder="e.g., CAPITAL ONE"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountNumberLast4" className="text-white">Last 4 Digits *</Label>
                  <Input
                    id="accountNumberLast4"
                    value={newAccount.accountNumberLast4}
                    onChange={(e) => setNewAccount({...newAccount, accountNumberLast4: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                    placeholder="1234"
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportedBalance" className="text-white">Balance *</Label>
                  <Input
                    id="reportedBalance"
                    type="number"
                    step="0.01"
                    value={newAccount.reportedBalance}
                    onChange={(e) => setNewAccount({...newAccount, reportedBalance: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                    placeholder="5000.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="creditLimit" className="text-white">Credit Limit</Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    step="0.01"
                    value={newAccount.creditLimit}
                    onChange={(e) => setNewAccount({...newAccount, creditLimit: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                    placeholder="10000.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="utilizationPercent" className="text-white">Utilization %</Label>
                  <Input
                    id="utilizationPercent"
                    type="number"
                    value={newAccount.utilizationPercent}
                    onChange={(e) => setNewAccount({...newAccount, utilizationPercent: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                    placeholder="80"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentApr" className="text-white">Current APR %</Label>
                  <Input
                    id="currentApr"
                    type="number"
                    step="0.01"
                    value={newAccount.currentApr}
                    onChange={(e) => setNewAccount({...newAccount, currentApr: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                    placeholder="29.99"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="originalApr" className="text-white">Original APR %</Label>
                  <Input
                    id="originalApr"
                    type="number"
                    step="0.01"
                    value={newAccount.originalApr}
                    onChange={(e) => setNewAccount({...newAccount, originalApr: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                    placeholder="19.99"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountOpened" className="text-white">Opened Date *</Label>
                  <Input
                    id="accountOpened"
                    type="date"
                    value={newAccount.accountOpened}
                    onChange={(e) => setNewAccount({...newAccount, accountOpened: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ageYears" className="text-white">Age (Years)</Label>
                  <Input
                    id="ageYears"
                    type="number"
                    value={newAccount.ageYears}
                    onChange={(e) => setNewAccount({...newAccount, ageYears: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                    placeholder="7"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ageMonths" className="text-white">Age (Months)</Label>
                  <Input
                    id="ageMonths"
                    type="number"
                    value={newAccount.ageMonths}
                    onChange={(e) => setNewAccount({...newAccount, ageMonths: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white">Notes</Label>
                <Textarea
                  id="notes"
                  value={newAccount.notes}
                  onChange={(e) => setNewAccount({...newAccount, notes: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                  placeholder="Any additional details about unfair practices..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowAdd(false)} variant="outline" className="border-slate-600">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={addAccount} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Analyze & Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
