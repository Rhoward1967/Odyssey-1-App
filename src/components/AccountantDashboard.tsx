import { Calculator, FileSpreadsheet, FileText, DollarSign, Building2, Receipt, Briefcase, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface AccountantDashboardProps {
  userId: string;
}

export default function AccountantDashboard({ userId }: AccountantDashboardProps) {
  const [accountantInfo, setAccountantInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccountantInfo = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (user?.user) {
        const { data: admin } = await supabase
          .from('app_admins')
          .select('*')
          .eq('user_id', user.user.id)
          .single();
        setAccountantInfo(admin);
      }
      setLoading(false);
    };
    fetchAccountantInfo();
  }, [userId]);

  if (loading) return <div className="p-4">Loading accountant dashboard...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Accountant & Tax Center</h1>
        <p className="text-gray-300">Complete Financial Management & Tax Filing System</p>
        <Badge className="bg-blue-600/20 text-blue-300">ACCOUNTANT ACCESS</Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full bg-blue-900/30">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookkeeping">Bookkeeping</TabsTrigger>
          <TabsTrigger value="tax">Tax Tools</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-green-900/20 border-green-500/30">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-green-400">$0.00</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-blue-900/20 border-blue-500/30">
              <div className="flex items-center gap-3">
                <Receipt className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Pending Invoices</p>
                  <p className="text-2xl font-bold text-blue-400">0</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-yellow-900/20 border-yellow-500/30">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400">Tax Documents</p>
                  <p className="text-2xl font-bold text-yellow-400">Ready</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* BOOKKEEPING TAB */}
        <TabsContent value="bookkeeping" className="space-y-4">
          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Bookkeeping Tools
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="justify-start h-auto py-4 px-6 bg-blue-900/30 hover:bg-blue-800/50 border-blue-500/30"
                onClick={() => window.open('https://quickbooks.intuit.com', '_blank')}
              >
                <div className="flex flex-col items-start gap-1 w-full">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold">QuickBooks Online</span>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </div>
                  <span className="text-xs text-gray-400">General ledger, invoicing, expenses</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4 px-6 bg-blue-900/30 hover:bg-blue-800/50 border-blue-500/30"
                onClick={() => window.open('https://www.xero.com', '_blank')}
              >
                <div className="flex flex-col items-start gap-1 w-full">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold">Xero Accounting</span>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </div>
                  <span className="text-xs text-gray-400">Alternative accounting platform</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4 px-6 bg-blue-900/30 hover:bg-blue-800/50 border-blue-500/30"
                onClick={() => window.open('https://www.bill.com', '_blank')}
              >
                <div className="flex flex-col items-start gap-1 w-full">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold">Bill.com</span>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </div>
                  <span className="text-xs text-gray-400">Accounts payable automation</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4 px-6 bg-blue-900/30 hover:bg-blue-800/50 border-blue-500/30"
                onClick={() => window.open('https://www.expensify.com', '_blank')}
              >
                <div className="flex flex-col items-start gap-1 w-full">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold">Expensify</span>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </div>
                  <span className="text-xs text-gray-400">Expense tracking & reimbursement</span>
                </div>
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* TAX TOOLS TAB */}
        <TabsContent value="tax" className="space-y-4">
          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Tax Software & E-Filing Systems
            </h3>
            
            <div className="space-y-6">
              {/* Professional Tax Software */}
              <div>
                <h4 className="font-semibold text-green-400 mb-3">Professional Tax Software</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-green-900/30 hover:bg-green-800/50 border-green-500/30"
                    onClick={() => window.open('https://proconnect.intuit.com', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-400" />
                        <span className="font-semibold">ProConnect Tax (Intuit)</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">Professional 1040, 1120, 1065, 990</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-green-900/30 hover:bg-green-800/50 border-green-500/30"
                    onClick={() => window.open('https://www.taxact.com/professional', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-green-400" />
                        <span className="font-semibold">TaxAct Professional</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">Affordable pro tax software</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-green-900/30 hover:bg-green-800/50 border-green-500/30"
                    onClick={() => window.open('https://www.ultimatetax.com', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-400" />
                        <span className="font-semibold">UltimateTax</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">Cloud-based pro tax prep</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-green-900/30 hover:bg-green-800/50 border-green-500/30"
                    onClick={() => window.open('https://www.hrblock.com/tax-software/tax-professional/', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-green-400" />
                        <span className="font-semibold">H&R Block Tax Pro</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">Professional tax software</span>
                    </div>
                  </Button>
                </div>
              </div>

              {/* IRS E-Filing Systems */}
              <div>
                <h4 className="font-semibold text-yellow-400 mb-3">IRS E-Filing & Resources</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-yellow-900/30 hover:bg-yellow-800/50 border-yellow-500/30"
                    onClick={() => window.open('https://www.irs.gov/e-file-providers/before-starting-enrollment-process', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-yellow-400" />
                        <span className="font-semibold">IRS E-File Application</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">Become authorized IRS e-file provider</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-yellow-900/30 hover:bg-yellow-800/50 border-yellow-500/30"
                    onClick={() => window.open('https://www.irs.gov/filing/free-file-do-your-federal-taxes-for-free', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-yellow-400" />
                        <span className="font-semibold">IRS Free File</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">Free federal tax filing</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-yellow-900/30 hover:bg-yellow-800/50 border-yellow-500/30"
                    onClick={() => window.open('https://www.irs.gov/businesses/corporations/form-1120-corporate-income-tax-return', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-yellow-400" />
                        <span className="font-semibold">Form 1120 (Corporate)</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">Corporate tax return resources</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-yellow-900/30 hover:bg-yellow-800/50 border-yellow-500/30"
                    onClick={() => window.open('https://www.irs.gov/payments', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-yellow-400" />
                        <span className="font-semibold">IRS Payment Portal</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">Direct Pay, EFTPS, payment plans</span>
                    </div>
                  </Button>
                </div>
              </div>

              {/* State Tax Systems */}
              <div>
                <h4 className="font-semibold text-blue-400 mb-3">State Tax Resources (Georgia)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-blue-900/30 hover:bg-blue-800/50 border-blue-500/30"
                    onClick={() => window.open('https://gtc.dor.ga.gov/', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <span className="font-semibold">Georgia Tax Center</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">GA DOR e-filing & payments</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-blue-900/30 hover:bg-blue-800/50 border-blue-500/30"
                    onClick={() => window.open('https://dor.georgia.gov/taxes/business-taxes', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-400" />
                        <span className="font-semibold">GA Business Taxes</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">Sales tax, withholding, corporate</span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* REPORTS TAB */}
        <TabsContent value="reports" className="space-y-4">
          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Financial Reports</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Profit & Loss Statement
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Balance Sheet
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Receipt className="w-4 h-4 mr-2" />
                Cash Flow Statement
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="w-4 h-4 mr-2" />
                Accounts Receivable Aging
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calculator className="w-4 h-4 mr-2" />
                Tax Summary Report
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Access Footer */}
      <Card className="p-4 bg-purple-900/20 border-purple-500/30">
        <h4 className="font-semibold text-purple-300 mb-3">Accountant Resources</h4>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-purple-600/30 text-purple-200 cursor-pointer hover:bg-purple-600/50"
                 onClick={() => window.open('https://www.aicpa.org', '_blank')}>
            AICPA Resources
          </Badge>
          <Badge className="bg-purple-600/30 text-purple-200 cursor-pointer hover:bg-purple-600/50"
                 onClick={() => window.open('https://www.irs.gov/tax-professionals', '_blank')}>
            IRS Tax Pro Center
          </Badge>
          <Badge className="bg-purple-600/30 text-purple-200 cursor-pointer hover:bg-purple-600/50"
                 onClick={() => window.open('https://www.journalofaccountancy.com', '_blank')}>
            Journal of Accountancy
          </Badge>
          <Badge className="bg-purple-600/30 text-purple-200 cursor-pointer hover:bg-purple-600/50"
                 onClick={() => window.open('/app/invoicing', '_blank')}>
            Invoicing System
          </Badge>
        </div>
      </Card>
    </div>
  );
}
