import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Activity
} from 'lucide-react';

interface DailySummary {
  transaction_date: string;
  subscription_income_usd: number;
  invoice_income_usd: number;
  total_income_usd: number;
  contractor_expenses_usd: number;
  total_expenses_usd: number;
  stripe_fees_usd: number;
  net_revenue_usd: number;
  income_transaction_count: number;
  expense_transaction_count: number;
  paying_subscribers: number;
  paid_contractors: number;
}

interface MTDSummary {
  month: string;
  subscription_income_usd: number;
  invoice_income_usd: number;
  total_income_usd: number;
  contractor_expenses_usd: number;
  total_expenses_usd: number;
  gross_profit_usd: number;
  stripe_fees_usd: number;
  net_revenue_usd: number;
  unique_subscribers: number;
  contractors_paid: number;
}

export default function StripeGrowthMonitor() {
  const [dailyData, setDailyData] = useState<DailySummary[]>([]);
  const [mtdData, setMTDData] = useState<MTDSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const loadFinancialData = useCallback(async () => {
    try {
      setLoading(true);
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Load daily summary
      const { data: daily } = await supabase
        .from('stripe_daily_summary')
        .select('*')
        .gte('transaction_date', startDate.toISOString().split('T')[0])
        .order('transaction_date', { ascending: false });

      // Load month-to-date summary
      const { data: mtd } = await supabase
        .from('stripe_mtd_summary')
        .select('*')
        .order('month', { ascending: false })
        .limit(3);

      setDailyData(daily || []);
      setMTDData(mtd || []);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate totals for selected period
  const totalIncome = dailyData.reduce((sum, day) => sum + Number(day.total_income_usd || 0), 0);
  const totalExpenses = dailyData.reduce((sum, day) => sum + Number(day.total_expenses_usd || 0), 0);
  const totalFees = dailyData.reduce((sum, day) => sum + Number(day.stripe_fees_usd || 0), 0);
  const netRevenue = totalIncome - totalExpenses - totalFees;
  const grossProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((grossProfit / totalIncome) * 100) : 0;

  // Current month MTD
  const currentMTD = mtdData[0] || {
    subscription_income_usd: 0,
    invoice_income_usd: 0,
    total_income_usd: 0,
    contractor_expenses_usd: 0,
    total_expenses_usd: 0,
    gross_profit_usd: 0,
    stripe_fees_usd: 0,
    net_revenue_usd: 0,
    unique_subscribers: 0,
    contractors_paid: 0
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Stripe Growth Monitor
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time tracking of income & expenses through Stripe
          </p>
        </div>
        <div className="flex gap-2">
          {[
            { key: '7d', label: 'Last 7 Days' },
            { key: '30d', label: 'Last 30 Days' },
            { key: '90d', label: 'Last 90 Days' }
          ].map(range => (
            <Button
              key={range.key}
              variant={timeRange === range.key ? 'default' : 'outline'}
              onClick={() => setTimeRange(range.key as any)}
              size="sm"
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Income */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Subscriptions + Invoices
            </p>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Contractor Payouts
            </p>
          </CardContent>
        </Card>

        {/* Gross Profit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(grossProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {profitMargin.toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>

        {/* Net Revenue (after fees) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(netRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              After ${totalFees.toFixed(2)} in fees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Month-to-Date Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Month-to-Date: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardTitle>
          <CardDescription>Current month performance snapshot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Subscription Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(Number(currentMTD.subscription_income_usd))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {currentMTD.unique_subscribers} subscribers
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Invoice Revenue</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(Number(currentMTD.invoice_income_usd))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Janitorial contracts
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contractor Payouts</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(Number(currentMTD.contractor_expenses_usd))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {currentMTD.contractors_paid} contractors paid
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Income Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Income Sources ({timeRange})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Subscriptions</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {formatCurrency(dailyData.reduce((sum, d) => sum + Number(d.subscription_income_usd || 0), 0))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((dailyData.reduce((sum, d) => sum + Number(d.subscription_income_usd || 0), 0) / totalIncome) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Invoice Payments</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">
                    {formatCurrency(dailyData.reduce((sum, d) => sum + Number(d.invoice_income_usd || 0), 0))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((dailyData.reduce((sum, d) => sum + Number(d.invoice_income_usd || 0), 0) / totalIncome) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Expenses ({timeRange})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Contractor Payouts</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">
                    {formatCurrency(totalExpenses)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((totalExpenses / totalIncome) * 100).toFixed(1)}% of income
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Stripe Fees</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-600">
                    {formatCurrency(totalFees)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((totalFees / totalIncome) * 100).toFixed(2)}% of income
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Daily Activity</CardTitle>
          <CardDescription>Last 7 days of Stripe transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dailyData.slice(0, 7).map((day) => (
              <div key={day.transaction_date} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    <p className="font-medium">{formatDate(day.transaction_date)}</p>
                    <p className="text-xs text-muted-foreground">
                      {day.income_transaction_count} income • {day.expense_transaction_count} expenses
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    +{formatCurrency(Number(day.total_income_usd))}
                  </p>
                  {Number(day.total_expenses_usd) > 0 && (
                    <p className="text-sm text-red-600">
                      -{formatCurrency(Number(day.total_expenses_usd))}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Net: {formatCurrency(Number(day.net_revenue_usd))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
