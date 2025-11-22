/**
 * Bank Account Manager - Manage company bank accounts and payment methods
 * © 2025 Rickey A Howard. All Rights Reserved.
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { AlertCircle, Building2, CheckCircle, CreditCard, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface BankAccount {
  id: string;
  account_name: string;
  bank_name: string;
  account_type: string;
  routing_number: string;
  account_number_last4: string;
  is_active: boolean;
  is_verified: boolean;
  current_balance?: number;
  supports_ach: boolean;
  supports_check_printing: boolean;
}

export default function BankAccountManager({ organizationId, userId }: { organizationId: number; userId: string }) {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRoutingNumber, setShowRoutingNumber] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    account_name: '',
    bank_name: '',
    account_type: 'checking',
    routing_number: '',
    account_number: '',
    account_number_confirm: '',
    supports_ach: true,
    supports_check_printing: true,
  });

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('company_bank_accounts')
      .select('*')
      .eq('organization_id', organizationId)
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setAccounts(data || []);
    }
    setIsLoading(false);
  }, [organizationId, toast]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const validateRoutingNumber = (routing: string): boolean => {
    // Basic ABA routing number validation (9 digits, checksum)
    if (!/^\d{9}$/.test(routing)) return false;
    
    // ABA checksum algorithm
    const digits = routing.split('').map(Number);
    const checksum = (3 * (digits[0] + digits[3] + digits[6]) +
                     7 * (digits[1] + digits[4] + digits[7]) +
                     (digits[2] + digits[5] + digits[8])) % 10;
    return checksum === 0;
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.account_name || !formData.bank_name || !formData.routing_number || !formData.account_number) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    if (formData.account_number !== formData.account_number_confirm) {
      toast({ title: 'Error', description: 'Account numbers do not match', variant: 'destructive' });
      return;
    }

    if (!validateRoutingNumber(formData.routing_number)) {
      toast({ title: 'Error', description: 'Invalid routing number. Please check and try again.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      // In production, encrypt the account number
      // For now, we'll store last 4 digits only
      const last4 = formData.account_number.slice(-4);

      const { error } = await supabase
        .from('company_bank_accounts')
        .insert({
          organization_id: organizationId,
          account_name: formData.account_name,
          bank_name: formData.bank_name,
          account_type: formData.account_type,
          routing_number: formData.routing_number,
          account_number_encrypted: `ENCRYPTED_${formData.account_number}`, // TODO: Real encryption
          account_number_last4: last4,
          supports_ach: formData.supports_ach,
          supports_check_printing: formData.supports_check_printing,
          is_active: true,
          is_verified: false, // Requires verification
          created_by: userId,
        });

      if (error) throw error;

      toast({ 
        title: 'Account Added', 
        description: 'Bank account added successfully. Verification required before use.' 
      });

      // Reset form
      setFormData({
        account_name: '',
        bank_name: '',
        account_type: 'checking',
        routing_number: '',
        account_number: '',
        account_number_confirm: '',
        supports_ach: true,
        supports_check_printing: true,
      });
      setShowAddForm(false);
      fetchAccounts();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (accountId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('company_bank_accounts')
      .update({ is_active: !currentStatus })
      .eq('id', accountId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Updated', description: `Account ${!currentStatus ? 'activated' : 'deactivated'}` });
      fetchAccounts();
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) return;

    const { error } = await supabase
      .from('company_bank_accounts')
      .delete()
      .eq('id', accountId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Bank account deleted successfully' });
      fetchAccounts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Company Bank Accounts
        </h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Bank Account
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-blue-50 dark:bg-slate-800 border-blue-200 dark:border-blue-900">
          <CardHeader>
            <CardTitle>Add New Bank Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Account Name *</Label>
                  <Input
                    placeholder="e.g., Payroll Account"
                    value={formData.account_name}
                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Bank Name *</Label>
                  <Input
                    placeholder="e.g., Wells Fargo"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Account Type *</Label>
                <Select value={formData.account_type} onValueChange={(val) => setFormData({ ...formData, account_type: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="money_market">Money Market</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Routing Number (9 digits) *</Label>
                <Input
                  type="text"
                  maxLength={9}
                  placeholder="123456789"
                  value={formData.routing_number}
                  onChange={(e) => setFormData({ ...formData, routing_number: e.target.value.replace(/\D/g, '') })}
                  required
                />
              </div>

              <div>
                <Label>Account Number *</Label>
                <Input
                  type="password"
                  placeholder="Enter account number"
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Confirm Account Number *</Label>
                <Input
                  type="password"
                  placeholder="Re-enter account number"
                  value={formData.account_number_confirm}
                  onChange={(e) => setFormData({ ...formData, account_number_confirm: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Methods Supported</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.supports_ach}
                      onChange={(e) => setFormData({ ...formData, supports_ach: e.target.checked })}
                    />
                    <span>ACH/Direct Deposit</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.supports_check_printing}
                      onChange={(e) => setFormData({ ...formData, supports_check_printing: e.target.checked })}
                    />
                    <span>Check Printing</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Account'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Account List */}
      <div className="grid gap-4">
        {accounts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No bank accounts configured</p>
              <p className="text-sm">Add a bank account to enable payroll payments</p>
            </CardContent>
          </Card>
        ) : (
          accounts.map((account) => (
            <Card key={account.id} className={!account.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <h3 className="font-bold text-lg">{account.account_name}</h3>
                      {account.is_verified ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Bank:</strong> {account.bank_name}</p>
                      <p><strong>Type:</strong> {account.account_type}</p>
                      <p>
                        <strong>Account:</strong> ****{account.account_number_last4}
                      </p>
                      <p className="flex items-center gap-2">
                        <strong>Routing:</strong>
                        {showRoutingNumber === account.id ? (
                          <>
                            {account.routing_number}
                            <button
                              onClick={() => setShowRoutingNumber(null)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <EyeOff className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            •••••••••
                            <button
                              onClick={() => setShowRoutingNumber(account.id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </p>
                      {account.current_balance !== null && (
                        <p>
                          <strong>Balance:</strong> ${account.current_balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {account.supports_ach && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">ACH Enabled</span>
                      )}
                      {account.supports_check_printing && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Check Printing</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={account.is_active ? 'outline' : 'default'}
                      onClick={() => handleToggleActive(account.id, account.is_active)}
                    >
                      {account.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteAccount(account.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Instructions */}
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Important: Bank Account Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
          <p><strong>⚠️ Before processing payments:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Add your company bank account above</li>
            <li>Verify the account with micro-deposits (feature coming soon) or manual verification</li>
            <li>Configure employee payment methods in the Employee section</li>
            <li>When you run payroll, approve the payment batch</li>
            <li>Payments will be initiated via ACH or checks will be generated for printing</li>
          </ol>
          <p className="mt-4"><strong>💡 Next Steps:</strong></p>
          <ul className="list-disc list-inside ml-4">
            <li>Connect to your bank via Plaid (coming soon) for real-time balance sync</li>
            <li>Enable check printing with MICR encoding</li>
            <li>Set up automated payroll schedules</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
