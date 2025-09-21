// Budget Types - Core interfaces for the budget system
export interface BudgetCategory {
  id: string;
  name: string;
  monthlyLimit: number;
  currentSpending: number;
}

export interface Transaction {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: Date;
}