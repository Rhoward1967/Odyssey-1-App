import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BusinessDebtDefenseEngine, BusinessDebtAccount, BusinessLegalAnalysis } from '@/services/businessDebtDefenseEngine';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Shield, DollarSign, Calendar, Building, FileText, TrendingUp } from 'lucide-react';

interface BusinessDebt {
  id: string;
  creditor: string;
  creditorType: string;
  originalAmount: number;
  currentAmount: number;
  accountNumber: string;
  contractType: 'written' | 'oral' | 'implied';
  personalGuarantee: boolean;
  corporateVeilIntact: boolean;
  lastPaymentDate: string;
  dateOfDefault: string;
  status: string;
  statuteExpired: boolean;
  defenseStrength: number;
  riskLevel: string;
  businessEntityId?: string;
}

export function BusinessDebtTracker() {
  const [debts, setDebts] = useState<BusinessDebt[]>([]);
  const [selectedDebt, setSelectedDebt] = useState<BusinessDebt | null>(null);
  const [analysis, setAnalysis] = useState<BusinessLegalAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDebt, setNewDebt] = useState({
    creditor: '',
    creditorType: 'bank',
    originalAmount: '',
    currentAmount: '',
    accountNumber: '',
    contractType: 'written' as 'written' | 'oral' | 'implied',
    personalGuarantee: false,
    corporateVeilIntact: true,
    lastPaymentDate: '',
    dateOfDefault: ''
  });

  const engine = new BusinessDebtDefenseEngine();

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      const { data, error } = await supabase
        .from('business_debt_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDebts(data || []);
    } catch (error) {
      console.error('Error loading business debts:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDebt = async () => {
    try {
      const { error } = await supabase
        .from('business_debt_accounts')
        .insert({
          creditor: newDebt.creditor,
          creditor_type: newDebt.creditorType,
          original_amount: parseFloat(newDebt.originalAmount),
          current_amount: parseFloat(newDebt.currentAmount),
          account_number: newDebt.accountNumber,
          contract_type: newDebt.contractType,
          personal_guarantee: newDebt.personalGuarantee,
          corporate_veil_intact: newDebt.corporateVeilIntact,
          last_payment_date: newDebt.lastPaymentDate,
          date_of_default: newDebt.dateOfDefault,
          status: 'active',
          statute_expired: false,
          defense_strength: 50,
          risk_level: 'MEDIUM'
        });

      if (error) throw error;

      setShowAddForm(false);
      setNewDebt({
        creditor: '',
        creditorType: 'bank',
        originalAmount: '',
        currentAmount: '',
        accountNumber: '',
        contractType: 'written',
        personalGuarantee: false,
        corporateVeilIntact: true,
        lastPaymentDate: '',
        dateOfDefault: ''
      });
      await loadDebts();
    } catch (error) {
      console.error('Error saving debt:', error);
      alert('Failed to save debt. Please try again.');
    }
  };

  const analyzeDebt = (debt: BusinessDebt) => {
    const account: BusinessDebtAccount = {
      creditor: debt.creditor,
      creditorType: debt.creditorType,
      originalAmount: debt.originalAmount,
      currentAmount: debt.currentAmount,
      lastPaymentDate: new Date(debt.lastPaymentDate),
      dateOfDefault: new Date(debt.dateOfDefault),
      accountNumber: debt.accountNumber,
      contractType: debt.contractType,
      personalGuarantee: debt.personalGuarantee,
      corporateVeilIntact: debt.corporateVeilIntact,
      businessEntityId: debt.businessEntityId
    };

    const result = engine.analyzeBusinessDebt(account);
    setAnalysis(result);
    setSelectedDebt(debt);
  };

  const getRiskBadge = (risk: string) => {
    const colors = {
      LOW: 'bg-green-500',
      MEDIUM: 'bg-yellow-500',
      HIGH: 'bg-orange-500',
      CRITICAL: 'bg-red-500 animate-pulse'
    };
    return <Badge className={colors[risk as keyof typeof colors]}>{risk}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-blue-500',
      statute_expired: 'bg-green-500',
      disputed: 'bg-yellow-500',
      settled: 'bg-gray-500',
      paid: 'bg-gray-400',
      judgment: 'bg-red-500',
      discharged_bankruptcy: 'bg-purple-500'
    };
    return <Badge className={colors[status as keyof typeof colors] || 'bg-gray-500'}>{status.replace('_', ' ')}</Badge>;
  };

  const totalBusinessDebt = debts.reduce((sum, debt) => sum + debt.currentAmount, 0);
  const personallyGuaranteedDebt = debts
    .filter(d => d.personalGuarantee)
    .reduce((sum, debt) => sum + debt.currentAmount, 0);
  const statuteExpiredDebt = debts
    .filter(d => d.statuteExpired)
    .reduce((sum, debt) => sum + debt.currentAmount, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Business Debt</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBusinessDebt.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{debts.length} accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personally Guaranteed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">${personallyGuaranteedDebt.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">YOU are liable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statute Expired</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">${statuteExpiredDebt.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Time-barred</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected by LLC</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              ${debts.filter(d => !d.personalGuarantee && d.corporateVeilIntact)
                .reduce((sum, d) => sum + d.currentAmount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Personal assets safe</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Warnings */}
      {personallyGuaranteedDebt > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>CRITICAL:</strong> You have ${personallyGuaranteedDebt.toLocaleString()} in personally guaranteed debt. 
            Your LLC does NOT protect your personal assets on these debts.
          </AlertDescription>
        </Alert>
      )}

      {/* Debt List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Business Debt Accounts</CardTitle>
              <CardDescription>Commercial debt NOT protected by FDCPA consumer laws</CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Building className="mr-2 h-4 w-4" />
              Add Business Debt
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {debts.map((debt) => (
              <Card key={debt.id} className="cursor-pointer hover:bg-accent" onClick={() => analyzeDebt(debt)}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{debt.creditor}</h3>
                        {getRiskBadge(debt.riskLevel)}
                        {getStatusBadge(debt.status)}
                        {debt.personalGuarantee && (
                          <Badge className="bg-red-500 animate-pulse">PERSONAL GUARANTEE</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Creditor Type:</span>
                          <span className="ml-2 font-medium">{debt.creditorType}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Contract Type:</span>
                          <span className="ml-2 font-medium">{debt.contractType}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Current Amount:</span>
                          <span className="ml-2 font-bold">${debt.currentAmount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Defense Strength:</span>
                          <span className="ml-2 font-bold">{debt.defenseStrength}%</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Analyze</Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {debts.length === 0 && !loading && (
              <div className="text-center py-12 text-muted-foreground">
                <Building className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No business debts tracked yet</p>
                <p className="text-sm">Add your first business debt to start analyzing your defense options</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Panel */}
      {analysis && selectedDebt && (
        <Card>
          <CardHeader>
            <CardTitle>Legal Analysis: {selectedDebt.creditor}</CardTitle>
            <CardDescription>Commercial debt defense strategy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Warnings */}
              {analysis.warnings.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      {analysis.warnings.map((warning, i) => (
                        <div key={i}>{warning}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Key Findings */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground mb-1">Statute of Limitations</div>
                    <div className="text-2xl font-bold">
                      {analysis.statuteExpired ? (
                        <span className="text-green-500">EXPIRED ✓</span>
                      ) : (
                        <span className="text-orange-500">Active</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Expires: {analysis.statuteExpiryDate.toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground mb-1">Personal Liability</div>
                    <div className="text-2xl font-bold">
                      {analysis.personalLiability ? (
                        <span className="text-red-500">YES</span>
                      ) : (
                        <span className="text-green-500">NO ✓</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Corporate Shield: {analysis.corporateShieldIntact ? 'Intact ✓' : 'Pierced ⚠️'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommended Action */}
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommended Action:</strong><br />
                  {analysis.recommendedAction}
                </AlertDescription>
              </Alert>

              {/* Next Steps */}
              <div>
                <h4 className="font-bold mb-2">Next Steps:</h4>
                <ol className="space-y-2">
                  {analysis.nextSteps.map((step, i) => (
                    <li key={i} className="flex items-start">
                      <span className="font-bold mr-2">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Available Defenses */}
              <div>
                <h4 className="font-bold mb-2">Applicable Defenses ({analysis.applicableDefenses.length}):</h4>
                <div className="grid grid-cols-2 gap-2">
                  {analysis.applicableDefenses.slice(0, 10).map((defense, i) => (
                    <Badge key={i} variant="outline">{defense}</Badge>
                  ))}
                </div>
              </div>

              {/* Defense Strength */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold">Defense Strength</h4>
                  <span className="text-2xl font-bold">{analysis.estimatedDefenseStrength}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full ${
                      analysis.estimatedDefenseStrength > 70 ? 'bg-green-500' :
                      analysis.estimatedDefenseStrength > 40 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${analysis.estimatedDefenseStrength}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Debt Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add Business Debt Account</CardTitle>
              <CardDescription>Commercial debt (NOT protected by FDCPA consumer laws)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Creditor Name *</Label>
                    <Input
                      value={newDebt.creditor}
                      onChange={(e) => setNewDebt({...newDebt, creditor: e.target.value})}
                      placeholder="ABC Bank"
                    />
                  </div>
                  <div>
                    <Label>Creditor Type</Label>
                    <Select value={newDebt.creditorType} onValueChange={(v) => setNewDebt({...newDebt, creditorType: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">Bank</SelectItem>
                        <SelectItem value="supplier">Supplier/Vendor</SelectItem>
                        <SelectItem value="mca">Merchant Cash Advance</SelectItem>
                        <SelectItem value="landlord">Landlord</SelectItem>
                        <SelectItem value="contractor">Contractor</SelectItem>
                        <SelectItem value="equipment_lease">Equipment Lease</SelectItem>
                        <SelectItem value="business_credit_card">Business Credit Card</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Original Amount *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newDebt.originalAmount}
                      onChange={(e) => setNewDebt({...newDebt, originalAmount: e.target.value})}
                      placeholder="10000.00"
                    />
                  </div>
                  <div>
                    <Label>Current Amount Owed *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newDebt.currentAmount}
                      onChange={(e) => setNewDebt({...newDebt, currentAmount: e.target.value})}
                      placeholder="12500.00"
                    />
                  </div>
                </div>

                <div>
                  <Label>Account Number</Label>
                  <Input
                    value={newDebt.accountNumber}
                    onChange={(e) => setNewDebt({...newDebt, accountNumber: e.target.value})}
                    placeholder="Last 4 digits or full account #"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Last Payment Date *</Label>
                    <Input
                      type="date"
                      value={newDebt.lastPaymentDate}
                      onChange={(e) => setNewDebt({...newDebt, lastPaymentDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Date of Default *</Label>
                    <Input
                      type="date"
                      value={newDebt.dateOfDefault}
                      onChange={(e) => setNewDebt({...newDebt, dateOfDefault: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label>Contract Type</Label>
                  <Select value={newDebt.contractType} onValueChange={(v: any) => setNewDebt({...newDebt, contractType: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="written">Written Contract (6 year SOL in GA)</SelectItem>
                      <SelectItem value="oral">Oral Agreement (4 year SOL in GA)</SelectItem>
                      <SelectItem value="implied">Implied Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="personalGuarantee"
                      checked={newDebt.personalGuarantee}
                      onChange={(e) => setNewDebt({...newDebt, personalGuarantee: e.target.checked})}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="personalGuarantee" className="cursor-pointer">
                      Personal Guarantee (CRITICAL: You are personally liable if checked)
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="corporateVeil"
                      checked={newDebt.corporateVeilIntact}
                      onChange={(e) => setNewDebt({...newDebt, corporateVeilIntact: e.target.checked})}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="corporateVeil" className="cursor-pointer">
                      Corporate Veil Intact (LLC protections still valid)
                    </Label>
                  </div>
                </div>

                {newDebt.personalGuarantee && (
                  <Alert className="border-red-500 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>WARNING:</strong> Personal guarantee means YOU are personally liable. 
                      LLC protection does NOT apply. This debt can come after your personal assets.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2 pt-4">
                  <Button onClick={saveDebt} className="flex-1">
                    Save Business Debt
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
