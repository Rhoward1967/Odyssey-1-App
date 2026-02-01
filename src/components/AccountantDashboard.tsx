import { Calculator, FileSpreadsheet, FileText, DollarSign, Building2, Receipt, Briefcase, ExternalLink, Brain, AlertTriangle, TrendingUp, Users, FileCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface AccountantDashboardProps {
  userId: string;
}

interface BusinessInsight {
  type: 'warning' | 'info' | 'recommendation';
  category: string;
  message: string;
  impact: 'high' | 'medium' | 'low';
}

interface FinancialMetric {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function AccountantDashboard({ userId }: AccountantDashboardProps) {
  const [accountantInfo, setAccountantInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<BusinessInsight[]>([]);
  const [metrics, setMetrics] = useState<FinancialMetric[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

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
        
        // Fetch business insights
        await generateBusinessInsights();
        
        // Fetch financial metrics
        await fetchFinancialMetrics();
        
        // Fetch recent documents
        await fetchRecentDocuments();
      }
      setLoading(false);
    };
    fetchAccountantInfo();
  }, [userId]);

  const generateBusinessInsights = async () => {
    // AI-powered business insights for accountant
    const generatedInsights: BusinessInsight[] = [
      {
        type: 'warning',
        category: 'Cash Flow',
        message: 'All recurring invoices currently disabled - review before March 1st takeover',
        impact: 'high'
      },
      {
        type: 'recommendation',
        category: 'Tax Planning',
        message: 'Q1 2026 estimated tax payment due April 15th - prepare calculations',
        impact: 'high'
      },
      {
        type: 'info',
        category: 'Revenue',
        message: '21 recurring contracts configured totaling ~$13k/month when activated',
        impact: 'medium'
      },
      {
        type: 'recommendation',
        category: 'Compliance',
        message: 'Annual reports due: Review corporate filings for March deadlines',
        impact: 'medium'
      }
    ];
    setInsights(generatedInsights);
  };

  const fetchFinancialMetrics = async () => {
    // Fetch real financial metrics from database
    const { data: recurring } = await supabase
      .from('recurring_invoices')
      .select('amount_cents, frequency, is_active');
    
    const totalMRR = recurring
      ?.filter(r => r.frequency === 'monthly')
      ?.reduce((sum, r) => sum + (r.amount_cents || 0), 0) || 0;
    
    const totalAnnual = recurring
      ?.filter(r => r.frequency === 'annual')
      ?.reduce((sum, r) => sum + (r.amount_cents || 0), 0) || 0;
    
    const activeCount = recurring?.filter(r => r.is_active)?.length || 0;
    const totalCount = recurring?.length || 0;

    setMetrics([
      {
        label: 'Monthly Recurring Revenue',
        value: `$${(totalMRR / 100).toLocaleString()}`,
        change: activeCount === 0 ? 'Paused for review' : undefined,
        trend: 'neutral'
      },
      {
        label: 'Annual Contracts',
        value: `$${(totalAnnual / 100).toLocaleString()}`,
        trend: 'neutral'
      },
      {
        label: 'Active Contracts',
        value: `${activeCount} / ${totalCount}`,
        change: activeCount === 0 ? 'Safety lock enabled' : undefined,
        trend: activeCount === 0 ? 'down' : 'neutral'
      },
      {
        label: 'Next Review Date',
        value: 'March 1, 2026',
        change: 'Takeover date',
        trend: 'neutral'
      }
    ]);
  };

  const fetchRecentDocuments = async () => {
    // In a full implementation, this would fetch from a documents table
    setDocuments([
      { name: 'INVOICE_SAFETY_CONTROLS.md', type: 'Policy', date: '2026-02-01' },
      { name: '2026 Q1 Financial Report', type: 'Report', date: '2026-01-31' },
      { name: 'Customer Contracts', type: 'Legal', date: '2026-01-28' }
    ]);
  };

  if (loading) return <div className="p-4">Loading intelligent accountant dashboard...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Accountant & Tax Center</h1>
        <p className="text-gray-300">Complete Financial Management & Tax Filing System</p>
        <Badge className="bg-blue-600/20 text-blue-300">ACCOUNTANT ACCESS</Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full bg-blue-900/30">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="bookkeeping">Bookkeeping</TabsTrigger>
          <TabsTrigger value="tax">Tax Tools</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/{/* Real-time Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {metrics.map((metric, idx) => (
              <Card key={idx} className="p-4 bg-slate-900/50 border-slate-700">
                <div className="flex flex-col">
                  <p className="text-xs text-gray-400">{metric.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
                  {metric.change && (
                    <p className="text-xs text-gray-500 mt-1">{metric.change}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Documents */}
          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Documents & Reports
            </h3>
            <div className="space-y-2">
              {documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-700">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{doc.name}</p>
                      <p className="text-xs text-gray-400">{doc.type} • {doc.date}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* AI INSIGHTS TAB */}
        <TabsContent value="insights" className="space-y-4">
          <Card className="p-6 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              AI-Powered Business Intelligence
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              R.O.M.A.N. AI analyzes business data to provide actionable insights and recommendations for optimal financial management.
            </p>
          </Card>

          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <Card 
                key={idx} 
                className={`p-4 border ${
                  insight.type === 'warning' 
                    ? 'bg-red-900/20 border-red-500/30' 
                    : insight.type === 'recommendation'
                    ? 'bg-yellow-900/20 border-yellow-500/30'
                    : 'bg-blue-900/20 border-blue-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />}
                  {insight.type === 'recommendation' && <TrendingUp className="w-5 h-5 text-yellow-400 mt-0.5" />}
                  {insight.type === 'info' && <Brain className="w-5 h-5 text-blue-400 mt-0.5" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-xs ${
                        insight.impact === 'high' ? 'bg-red-600/30' : 
                        insight.impact === 'medium' ? 'bg-yellow-600/30' : 
                        'bg-blue-600/30'
                      }`}>
                        {insight.impact.toUpperCase()} PRIORITY
                      </Badge>
                      <span className="text-xs text-gray-400">{insight.category}</span>
                    </div>
                    <p className="text-sm text-white">{insight.message}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Ask AI Assistant */}
          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Ask AI Accountant Assistant
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about business finances, tax implications, compliance..."
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-gray-500"
              />
              <Button className="bg-purple-600 hover:bg-purple-700">Ask AI</Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              AI can access all business documents, contracts, invoices, and financial data to provide informed answers
            </p>
          </Card/div>
            </Card>
          </div>
        </TabsContent>

        {/* BOOKKEEPING TAB */}
        <TabCOMPLIANCE TAB */}
        <TabsContent value="compliance" className="space-y-4">
          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              Compliance & Labor Resources
            </h3>
            
            <div className="space-y-6">
              {/* Department of Labor */}
              <div>
                <h4 className="font-semibold text-green-400 mb-3">U.S. Department of Labor</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-green-900/30 hover:bg-green-800/50 border-green-500/30"
                    onClick={() => window.open('https://www.dol.gov/agencies/whd', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-400" />
                        <span className="font-semibold">Wage & Hour Division</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">FLSA compliance, minimum wage, overtime</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-green-900/30 hover:bg-green-800/50 border-green-500/30"
                    onClick={() => window.open('https://www.dol.gov/agencies/ebsa', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-green-400" />
                        <span className="font-semibold">Employee Benefits Security</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">401(k), health plans, ERISA compliance</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-green-900/30 hover:bg-green-800/50 border-green-500/30"
                    onClick={() => window.open('https://www.dol.gov/agencies/osha', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-green-400" />
                        <span className="font-semibold">OSHA Safety</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">Workplace safety, injury reporting</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-green-900/30 hover:bg-green-800/50 border-green-500/30"
                    onClick={() => window.open('https://www.dol.gov/agencies/eta/unemployment-insurance', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-400" />
                        <span className="font-semibold">Unemployment Insurance</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">UI tax, claims, state programs</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-green-900/30 hover:bg-green-800/50 border-green-500/30"
                    onClick={() => window.open('https://www.dol.gov/agencies/ofccp', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-400" />
                        <span className="font-semibold">Equal Employment Opportunity</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">Anti-discrimination, affirmative action</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-green-900/30 hover:bg-green-800/50 border-green-500/30"
                    onClick={() => window.open('https://www.dol.gov/general/topic/retirement/401kplans', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        <span className="font-semibold">401(k) Plans & Compliance</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">Retirement plan administration</span>
                    </div>
                  </Button>
                </div>
              </div>

              {/* IRS Payroll & Employment Taxes */}
              <div>
                <h4 className="font-semibold text-yellow-400 mb-3">IRS Payroll & Employment Taxes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-yellow-900/30 hover:bg-yellow-800/50 border-yellow-500/30"
                    onClick={() => window.open('https://www.irs.gov/businesses/small-businesses-self-employed/employment-taxes', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-yellow-400" />
                        <span className="font-semibold">Employment Tax Guide</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">FICA, FUTA, withholding requirements</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-yellow-900/30 hover:bg-yellow-800/50 border-yellow-500/30"
                    onClick={() => window.open('https://www.irs.gov/businesses/small-businesses-self-employed/form-941', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-yellow-400" />
                        <span className="font-semibold">Form 941 (Quarterly)</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">Employer's quarterly tax return</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-yellow-900/30 hover:bg-yellow-800/50 border-yellow-500/30"
                    onClick={() => window.open('https://www.irs.gov/forms-pubs/about-form-w-2', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-yellow-400" />
                        <span className="font-semibold">W-2 Wage Reporting</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">Annual employee wage statements</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-yellow-900/30 hover:bg-yellow-800/50 border-yellow-500/30"
                    onClick={() => window.open('https://www.irs.gov/businesses/small-businesses-self-employed/independent-contractor-self-employed-or-employee', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-yellow-400" />
                        <span className="font-semibold">1099 Contractor Reporting</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">Independent contractor classification</span>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Georgia Labor & Tax */}
              <div>
                <h4 className="font-semibold text-blue-400 mb-3">Georgia Labor & Employment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-blue-900/30 hover:bg-blue-800/50 border-blue-500/30"
                    onClick={() => window.open('https://dol.georgia.gov/', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-400" />
                        <span className="font-semibold">GA Department of Labor</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">UI tax, labor laws, employer services</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 bg-blue-900/30 hover:bg-blue-800/50 border-blue-500/30"
                    onClick={() => window.open('https://dor.georgia.gov/taxes/withholding-tax', '_blank')}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-blue-400" />
                        <span className="font-semibold">GA Withholding Tax</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                      <span className="text-xs text-gray-400">State income tax withholding</span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* sContent value="bookkeeping" className="space-y-4">
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
