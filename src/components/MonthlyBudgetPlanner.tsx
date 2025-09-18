import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Calendar, DollarSign, TrendingUp, Target } from 'lucide-react';

interface BudgetCategory {
  id: string;
  name: string;
  monthly_budget: number;
  annual_budget: number;
  spent: number;
}

export function MonthlyBudgetPlanner() {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMonthlyBudget, setTotalMonthlyBudget] = useState(0);
  const [totalAnnualBudget, setTotalAnnualBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      const { data, error } = await supabase
        .from('spending_categories')
        .select(`
          id,
          name,
          monthly_budget,
          annual_budget,
          spending_transactions(amount)
        `)
        .eq('is_active', true);

      if (error) throw error;

      const processedCategories = data?.map(cat => ({
        ...cat,
        spent: cat.spending_transactions?.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0) || 0
      })) || [];

      setCategories(processedCategories);
      
      const monthlyTotal = processedCategories.reduce((sum, cat) => sum + (cat.monthly_budget || 0), 0);
      const annualTotal = processedCategories.reduce((sum, cat) => sum + (cat.annual_budget || 0), 0);
      const spentTotal = processedCategories.reduce((sum, cat) => sum + cat.spent, 0);
      
      setTotalMonthlyBudget(monthlyTotal);
      setTotalAnnualBudget(annualTotal);
      setTotalSpent(spentTotal);

    } catch (error) {
      console.error('Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading budget planner...</div>;
  }

  const monthlyUtilization = totalMonthlyBudget > 0 ? (totalSpent / totalMonthlyBudget) * 100 : 0;
  const remainingMonthly = totalMonthlyBudget - totalSpent;
  const remainingAnnual = totalAnnualBudget - totalSpent;

  return (
    <div className="space-y-6">
      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMonthlyBudget.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ${remainingMonthly.toFixed(2)} remaining this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAnnualBudget.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ${remainingAnnual.toFixed(2)} remaining this year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyUtilization.toFixed(1)}% of monthly budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyUtilization > 90 ? 'Over' : monthlyUtilization > 75 ? 'High' : 'On Track'}
            </div>
            <p className="text-xs text-muted-foreground">Monthly utilization</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Budget Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Budget Allocation ($833.33/month from $10,000 annual)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => {
              const monthlyUtilization = category.monthly_budget > 0 
                ? (category.spent / category.monthly_budget) * 100 
                : 0;
              const remaining = category.monthly_budget - category.spent;
              
              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{category.name}</span>
                      <div className="text-sm text-muted-foreground">
                        ${category.spent.toFixed(2)} spent / ${category.monthly_budget.toFixed(2)} budgeted
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={monthlyUtilization > 90 ? "destructive" : monthlyUtilization > 75 ? "secondary" : "default"}>
                        {monthlyUtilization.toFixed(0)}%
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        ${remaining.toFixed(2)} left
                      </div>
                    </div>
                  </div>
                  <Progress value={monthlyUtilization} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Annual Projection */}
      <Card>
        <CardHeader>
          <CardTitle>Annual Budget Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-4">Current Pace Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>3-Month Actual:</span>
                  <span className="font-medium">${totalSpent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Projected Annual:</span>
                  <span className="font-medium">${(totalSpent * 4).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Budget Variance:</span>
                  <span className={`font-medium ${(totalSpent * 4) > totalAnnualBudget ? 'text-red-600' : 'text-green-600'}`}>
                    ${((totalSpent * 4) - totalAnnualBudget).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Remaining Budget Distribution</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Remaining Annual:</span>
                  <span className="font-medium">${remainingAnnual.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Per Month (9 months):</span>
                  <span className="font-medium">${(remainingAnnual / 9).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Budget Health:</span>
                  <span className={`font-medium ${remainingAnnual < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {remainingAnnual < 0 ? 'Over Budget' : 'On Track'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}