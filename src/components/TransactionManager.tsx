import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';
import { supabase } from '../lib/supabase';
import { Plus, DollarSign, Receipt, Zap, Check, AlertCircle } from 'lucide-react';

interface TransactionManagerProps {
  onTransactionAdded: () => void;
}

interface Category {
  id: string;
  name: string;
  description: string;
  budget_limit: number;
}

export default function TransactionManager({ onTransactionAdded }: TransactionManagerProps) {
  const [expenseName, setExpenseName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('spending_categories')
        .select('id, name, description, budget_limit')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    }
  };

  const quickExpenses = [
    { name: 'OpenAI API Usage', amount: 25, categoryName: 'API Services' },
    { name: 'Claude API Usage', amount: 20, categoryName: 'API Services' },
    { name: 'Google Workspace', amount: 12, categoryName: 'Development' },
    { name: 'Office Coffee', amount: 15, categoryName: 'Support' },
    { name: 'Parking Fee', amount: 8, categoryName: 'Support' }
  ];

  const resetForm = () => {
    setExpenseName('');
    setAmount('');
    setCategoryId('');
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expenseName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an expense name",
        variant: "destructive"
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Validation Error", 
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    if (!categoryId) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('spending_transactions')
        .insert([{
          description: expenseName.trim(),
          amount: parseFloat(amount),
          category_id: categoryId,
          transaction_date: new Date().toISOString(),
          metadata: description.trim() ? { notes: description.trim() } : {}
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Added expense: ${expenseName} ($${amount})`,
        variant: "default"
      });

      resetForm();
      onTransactionAdded();
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdd = async (expense: typeof quickExpenses[0]) => {
    const category = categories.find(c => c.name === expense.categoryName);
    if (!category) {
      toast({
        title: "Error",
        description: `Category "${expense.categoryName}" not found`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('spending_transactions')
        .insert([{
          description: expense.name,
          amount: expense.amount,
          category_id: category.id,
          transaction_date: new Date().toISOString()
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Added: ${expense.name} ($${expense.amount})`,
        variant: "default"
      });

      onTransactionAdded();
    } catch (error) {
      console.error('Error adding quick expense:', error);
      toast({
        title: "Error",
        description: "Failed to add quick expense",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Manual Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Custom Expense
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expenseName">Expense Name *</Label>
                <Input
                  id="expenseName"
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                  placeholder="Enter expense name..."
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount ($) *</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoading}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{cat.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          Budget: ${cat.budget_limit}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Notes (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional details..."
                rows={2}
                disabled={isLoading}
                className="mt-1"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || !expenseName || !amount || !categoryId} 
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding Expense...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Add Expense
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Add Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Add Common Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickExpenses.map((expense, index) => {
              const category = categories.find(c => c.name === expense.categoryName);
              return (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleQuickAdd(expense)}
                  disabled={isLoading || !category}
                  className="flex flex-col items-center p-4 h-auto hover:bg-primary/5"
                >
                  <Receipt className="h-4 w-4 mb-1" />
                  <span className="text-sm font-medium">{expense.name}</span>
                  <span className="text-xs text-gray-500">${expense.amount}</span>
                  {!category && (
                    <span className="text-xs text-red-500 mt-1">Category missing</span>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
