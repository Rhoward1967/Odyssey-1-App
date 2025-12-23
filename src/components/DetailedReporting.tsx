import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabaseClient';
import { Download, Calendar, DollarSign } from 'lucide-react';

interface DetailedTransaction {
  id: string;
  amount: number;
  description: string;
  transaction_date: string;
  category_name: string;
  created_at: string;
}

interface CategoryReport {
  name: string;
  spent: number;
  budget: number;
  transactions: DetailedTransaction[];
  utilization: number;
}

export function DetailedReporting() {
  const [reports, setReports] = useState<CategoryReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetailedReports();
  }, []);

  const fetchDetailedReports = async () => {
    try {
      const { data: categories, error: catError } = await supabase
        .from('spending_categories')
        .select('*')
        .eq('is_active', true);

      if (catError) throw catError;

      const categoryReports: CategoryReport[] = [];

      for (const category of categories || []) {
        const { data: transactions, error: transError } = await supabase
          .from('spending_transactions')
          .select('*')
          .eq('category_id', category.id)
          .order('transaction_date', { ascending: false });

        if (transError) throw transError;

        const spent = transactions?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
        const budget = parseFloat(category.budget_limit);

        categoryReports.push({
          name: category.name,
          spent,
          budget,
          transactions: transactions?.map(t => ({
            ...t,
            category_name: category.name,
            amount: parseFloat(t.amount)
          })) || [],
          utilization: budget > 0 ? (spent / budget) * 100 : 0
        });
      }

      setReports(categoryReports);
    } catch (error) {
      console.error('Error fetching detailed reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvData = [];
    csvData.push(['Category', 'Description', 'Amount', 'Date', 'Budget', 'Utilization %']);
    
    reports.forEach(report => {
      report.transactions.forEach(transaction => {
        csvData.push([
          report.name,
          transaction.description,
          transaction.amount.toFixed(2),
          transaction.transaction_date,
          report.budget.toFixed(2),
          report.utilization.toFixed(1)
        ]);
      });
    });

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading detailed reports...</div>;
  }

  const totalSpent = reports.reduce((sum, r) => sum + r.spent, 0);
  const totalBudget = reports.reduce((sum, r) => sum + r.budget, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Detailed Expense Reports</h2>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Budget Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${(totalBudget - totalSpent).toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overall Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{((totalSpent / totalBudget) * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {reports.map((report, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{report.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    ${report.spent.toFixed(2)} of ${report.budget.toFixed(2)} used
                  </p>
                </div>
                <Badge variant={report.utilization > 90 ? "destructive" : report.utilization > 75 ? "secondary" : "default"}>
                  {report.utilization.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={report.utilization} className="mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-semibold">Recent Transactions ({report.transactions.length})</h4>
                {report.transactions.slice(0, 5).map((transaction, tIndex) => (
                  <div key={tIndex} className="flex justify-between items-center py-1 border-b last:border-b-0">
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">${transaction.amount.toFixed(2)}</p>
                  </div>
                ))}
                {report.transactions.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    ...and {report.transactions.length - 5} more transactions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default DetailedReporting;