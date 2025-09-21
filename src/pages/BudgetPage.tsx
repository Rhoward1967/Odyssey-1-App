import React, { useState, useEffect, useMemo } from "react";
import { BudgetCategory, Transaction } from "../components/budget/types";
import BudgetHeader from "../components/budget/BudgetHeader";
import BudgetOverview from "../components/budget/BudgetOverview";
import CategoryList from "../components/budget/CategoryList";
import TransactionModal from "../components/budget/TransactionModal";
import LimitManagerModal from "../components/budget/LimitManagerModal";

// Supabase client import (assumed to be configured elsewhere in your app)
import { supabase } from "../lib/supabase";

const BudgetPage: React.FC = () => {
  // Core state variables
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal control state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
  const [isLimitManagerModalOpen, setIsLimitManagerModalOpen] = useState<boolean>(false);

  // Fetch initial budget data
  const fetchBudgetData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call the Supabase Edge Function "budget-dashboard-loader"
      const { data, error } = await supabase.functions.invoke("budget-dashboard-loader");
      if (error) throw error;

      // Destructure categories and transactions from returned data
      const { categories, transactions } = data as {
        categories: BudgetCategory[];
        transactions: Transaction[];
      };

      setCategories(categories);
      setTransactions(transactions);
    } catch (err: any) {
      setError(
        err?.message || "An error occurred while loading budget data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Memoized totals for performance
  const totalBudget = useMemo(() => {
    return categories.reduce((sum, cat) => sum + (cat.monthlyLimit || 0), 0);
  }, [categories]);

  const totalSpending = useMemo(() => {
    return categories.reduce((sum, cat) => sum + (cat.currentSpending || 0), 0);
  }, [categories]);

  // Backend-integrated handler for adding a transaction
  const handleAddTransaction = async (newTrans: Omit<Transaction, "id">) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.functions.invoke("add-transaction", {
        body: JSON.stringify(newTrans),
      });
      if (error) throw error;
      await fetchBudgetData();
    } catch (err: any) {
      setError(
        err?.message || "An error occurred while adding the transaction."
      );
    } finally {
      setLoading(false);
    }
  };

  // Backend-integrated handler for updating limits
  const handleUpdateLimits = async (updatedLimits: Record<string, number>) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.functions.invoke("update-limits", {
        body: JSON.stringify(updatedLimits),
      });
      if (error) throw error;
      await fetchBudgetData();
    } catch (err: any) {
      setError(
        err?.message || "An error occurred while updating category limits."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      <BudgetHeader
        onAddTransaction={() => setIsTransactionModalOpen(true)}
        onManageLimits={() => setIsLimitManagerModalOpen(true)}
      />

      {loading && (
        <div className="my-8 text-center text-gray-500">Loading budget data...</div>
      )}
      {error && (
        <div className="my-8 text-center text-red-500">{error}</div>
      )}

      {!loading && !error && (
        <>
          <BudgetOverview totalBudget={totalBudget} totalSpending={totalSpending} />
          <CategoryList categories={categories} />
        </>
      )}

      {/* Modals */}
      <TransactionModal
        open={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        categories={categories}
      />
      <LimitManagerModal
        open={isLimitManagerModalOpen}
        onClose={() => setIsLimitManagerModalOpen(false)}
        categories={categories}
        onUpdateLimits={handleUpdateLimits}
      />
    </div>
  );
};

export default BudgetPage;