/**
 * BudgetControls
 * Renders actionable buttons for adding transactions and managing limits.
 *
 * Props:
 * - onAddTransaction: () => void - Opens the transaction modal.
 * - onManageLimits: () => void - Opens the limit manager modal.
 */
import React from "react";
import { Button } from "../ui/button";

interface BudgetControlsProps {
  onAddTransaction: () => void;
  onManageLimits: () => void;
}

const BudgetControls: React.FC<BudgetControlsProps> = ({
  onAddTransaction,
  onManageLimits,
}) => {
  return (
    <div className="flex gap-4">
      <Button variant="default" onClick={onAddTransaction}>
        Add Transaction
      </Button>
      <Button variant="outline" onClick={onManageLimits}>
        Manage Limits
      </Button>
    </div>
  );
};

export default BudgetControls;