/**
 * BudgetHeader
 * Displays the header and controls for the budget dashboard.
 *
 * Props:
 * - onAddTransaction: () => void - Callback to open the transaction modal.
 * - onManageLimits: () => void - Callback to open the limit manager modal.
 */
import React from "react";
import BudgetControls from "./BudgetControls";

interface BudgetHeaderProps {
  onAddTransaction: () => void;
  onManageLimits: () => void;
}

const BudgetHeader: React.FC<BudgetHeaderProps> = ({
  onAddTransaction,
  onManageLimits,
}) => {
  return (
    <header className="mb-6 flex flex-col gap-2">
      <h1 className="text-2xl font-bold">Financial Overview & Budget</h1>
      <BudgetControls
        onAddTransaction={onAddTransaction}
        onManageLimits={onManageLimits}
      />
    </header>
  );
};

export default BudgetHeader;