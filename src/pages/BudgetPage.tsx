/**
 * BudgetPage
 * Main container for the Odyssey-1 budget system.
 * Loads budget data, manages state for categories and transactions, and controls modal dialogs.
 *
 * Props: None (rendered via routing)
 *
 * Responsibilities:
 * - Fetches budget data from Supabase on mount and after mutations.
 * - Passes category and transaction data to child components.
 * - Handles adding transactions and updating category limits via backend integration.
 * - Renders modals for transaction creation and limit management.
 */
import React, { useState, useEffect, useMemo, Suspense } from "react";
import { BudgetCategory, Transaction } from "../components/budget/types";
import BudgetHeader from "../components/budget/BudgetHeader";
import CategoryList from "../components/budget/CategoryList";
import { supabase } from "../lib/supabase";

// Lazy-load heavy components
const BudgetOverview = React.lazy(() => import("../components/budget/BudgetOverview"));
const TransactionModal = React.lazy(() => import("../components/budget/TransactionModal"));
const LimitManagerModal = React.lazy(() => import("../components/budget/LimitManagerModal"));

const BudgetPage: React.FC = () => {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
  const [isLimitManagerModalOpen, setIsLimitManagerModalOpen] = useState<boolean>(false);

  const fetchBudgetData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("budget-dashboard-loader");
      if (error) throw error;
      const { categories, transactions } = data as { categories: BudgetCategory[]; transactions: Transaction[] };
      setCategories(categories);
      setTransactions(transactions);
    } catch (err: any) {
      setError(err?.message || "An error occurred while loading budget data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const totalBudget = useMemo(() => {
    return categories.reduce((sum, cat) => sum + (cat.monthlyLimit || 0), 0);
  }, [categories]);

  const totalSpending = useMemo(() => {
    return categories.reduce((sum, cat) => sum + (cat.currentSpending || 0), 0);
  }, [categories]);

  const handleAddTransaction = async (newTrans: Omit<Transaction, "id">) => {
    // Logic to call Supabase Edge Function and then fetchBudgetData()
  };

  const handleUpdateLimits = async (updatedLimits: Record<string, number>) => {
    // Logic to call Supabase Edge Function and then fetchBudgetData()
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      <BudgetHeader
        onAddTransaction={() => setIsTransactionModalOpen(true)}
        onManageLimits={() => setIsLimitManagerModalOpen(true)}
      />

      {loading && <div className="my-8 text-center text-gray-500">Loading budget data...</div>}
      {error && <div className="my-8 text-center text-red-500">{error}</div>}

      {!loading && !error && (
        <>
          <Suspense fallback={<div>Loading summary...</div>}>
            <BudgetOverview totalBudget={totalBudget} totalSpending={totalSpending} />
          </Suspense>
          <CategoryList categories={categories} />
        </>
      )}

      <Suspense fallback={null}>
        {isTransactionModalOpen && (
          <TransactionModal
            open={isTransactionModalOpen}
            onClose={() => setIsTransactionModalOpen(false)}
            onAddTransaction={handleAddTransaction}
            categories={categories}
          />
        )}
        {isLimitManagerModalOpen && (
          <LimitManagerModal
            open={isLimitManagerModalOpen}
            onClose={() => setIsLimitManagerModalOpen(false)}
            categories={categories}
            onUpdateLimits={handleUpdateLimits}
          />
        )}
      </Suspense>
    </div>
  );
};

export default BudgetPage;