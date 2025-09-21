import React from "react";
import { BudgetDashboard } from "../components/BudgetDashboard";

/**
 * BudgetPage Component
 *
 * Main container for the budget management system.
 * Simple, direct import to avoid lazy loading issues that caused deployment failures.
 *
 * @returns {JSX.Element} The complete budget management interface
 */
const BudgetPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <BudgetDashboard />
    </div>
  );
};

export default BudgetPage;
