import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabaseClient';
import { AlertTriangle, DollarSign, Calendar } from 'lucide-react';

interface BudgetLimit {
  id: string;
  category: string;
  monthly_limit: number;
  current_spending: number;
  alert_threshold: number;
}

export default function BudgetLimitManager() {
  const [budgetLimits, setBudgetLimits] = useState<BudgetLimit[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(1000);
  const [totalSpending, setTotalSpending] = useState<number>(0);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      // Get current month spending
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: transactions } = await supabase
        .from('spending_transactions')
        .select('amount, category')
        .gte('created_at', startOfMonth.toISOString());

      // Calculate spending by category
      const spendingByCategory =
        transactions?.reduce(
          (acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
          },
          {} as Record<string, number>
        ) || {};

      const total = Object.values(spendingByCategory).reduce(
        (sum, amount) => sum + amount,
        0
      );
      setTotalSpending(total);

      // Get budget categories
      const { data: categories } = await supabase
        .from('spending_categories')
        .select('*');

      const limits =
        categories?.map(cat => ({
          id: cat.id,
          category: cat.name,
          monthly_limit: cat.budget_limit || 200,
          current_spending: spendingByCategory[cat.name] || 0,
          alert_threshold: 80,
        })) || [];

      setBudgetLimits(limits);
    } catch (error) {
      console.error('Error fetching budget data:', error);
    }
  };

  const addBudgetLimit = async () => {
    if (!newCategory || !newLimit) return;

    try {
      await supabase.from('spending_categories').insert([
        {
          name: newCategory,
          budget_limit: parseFloat(newLimit),
          color: '#3B82F6',
        },
      ]);

      setNewCategory('');
      setNewLimit('');
      fetchBudgetData();
    } catch (error) {
      console.error('Error adding budget limit:', error);
    }
  };

  const safeTotalSpending =
    typeof totalSpending === 'number' && isFinite(totalSpending)
      ? totalSpending
      : 0;
  const safeMonthlyBudget =
    typeof monthlyBudget === 'number' &&
    isFinite(monthlyBudget) &&
    monthlyBudget > 0
      ? monthlyBudget
      : 1;
  const budgetUsedPercentage = (safeTotalSpending / safeMonthlyBudget) * 100;
  const isOverBudget = budgetUsedPercentage > 100;
  const isNearLimit = budgetUsedPercentage > 80;

  return (
    <div className='space-y-6'>
      {/* Monthly Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='h-5 w-5' />
            Monthly Budget Limit: $1,000.00
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex justify-between text-sm'>
              <span>
                Spent:{' '}
                {isFinite(safeTotalSpending)
                  ? safeTotalSpending.toFixed(2)
                  : '0.00'}
              </span>
              <span>
                Remaining:{' '}
                {isFinite(safeMonthlyBudget - safeTotalSpending)
                  ? (safeMonthlyBudget - safeTotalSpending).toFixed(2)
                  : '0.00'}
              </span>
            </div>
            <Progress
              value={Math.min(budgetUsedPercentage, 100)}
              className={`h-3 ${isOverBudget ? 'bg-red-100' : isNearLimit ? 'bg-yellow-100' : 'bg-green-100'}`}
            />
            {isOverBudget && (
              <Alert className='border-red-200 bg-red-50'>
                <AlertTriangle className='h-4 w-4 text-red-600' />
                <AlertDescription className='text-red-800'>
                  Budget exceeded by{' '}
                  {isFinite(safeTotalSpending - safeMonthlyBudget)
                    ? (safeTotalSpending - safeMonthlyBudget).toFixed(2)
                    : '0.00'}
                </AlertDescription>
              </Alert>
            )}
            {isNearLimit && !isOverBudget && (
              <Alert className='border-yellow-200 bg-yellow-50'>
                <AlertTriangle className='h-4 w-4 text-yellow-600' />
                <AlertDescription className='text-yellow-800'>
                  Approaching budget limit (
                  {isFinite(budgetUsedPercentage)
                    ? budgetUsedPercentage.toFixed(1)
                    : '0.0'}
                  % used)
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Review Reminder */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            Weekly Budget Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-gray-600 mb-4'>
            Next review scheduled for every Monday at 9:00 AM to assess spending
            and adjust limits.
          </p>
          <Button variant='outline' size='sm'>
            Schedule Review Meeting
          </Button>
        </CardContent>
      </Card>

      {/* Add New Budget Category */}
      <Card>
        <CardHeader>
          <CardTitle>Add Budget Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='category'>Category Name</Label>
              <Input
                id='category'
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder='e.g., AI Development, Marketing'
              />
            </div>
            <div>
              <Label htmlFor='limit'>Monthly Limit ($)</Label>
              <Input
                id='limit'
                type='number'
                value={newLimit}
                onChange={e => setNewLimit(e.target.value)}
                placeholder='200'
              />
            </div>
          </div>
          <Button onClick={addBudgetLimit} className='mt-4'>
            Add Budget Limit
          </Button>
        </CardContent>
      </Card>

      {/* Category Budget Status */}
      <div className='grid gap-4'>
        {budgetLimits.map(limit => {
          const currentSpending =
            typeof limit.current_spending === 'number' &&
            isFinite(limit.current_spending)
              ? limit.current_spending
              : 0;
          const monthlyLimit =
            typeof limit.monthly_limit === 'number' &&
            isFinite(limit.monthly_limit) &&
            limit.monthly_limit > 0
              ? limit.monthly_limit
              : 1;
          const percentage = (currentSpending / monthlyLimit) * 100;
          const isOverLimit = percentage > 100;
          const isNearThreshold = percentage > limit.alert_threshold;

          return (
            <Card key={limit.id}>
              <CardContent className='pt-4'>
                <div className='flex justify-between items-center mb-2'>
                  <h4 className='font-medium'>{limit.category}</h4>
                  <span className='text-sm text-gray-600'>
                    {isFinite(currentSpending)
                      ? currentSpending.toFixed(2)
                      : '0.00'}{' '}
                    /{' '}
                    {isFinite(monthlyLimit) ? monthlyLimit.toFixed(2) : '0.00'}
                  </span>
                </div>
                <Progress
                  value={Math.min(percentage, 100)}
                  className={`h-2 ${isOverLimit ? 'bg-red-100' : isNearThreshold ? 'bg-yellow-100' : 'bg-green-100'}`}
                />
                {isOverLimit && (
                  <p className='text-xs text-red-600 mt-1'>
                    Over budget by{' '}
                    {isFinite(currentSpending - monthlyLimit)
                      ? (currentSpending - monthlyLimit).toFixed(2)
                      : '0.00'}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
