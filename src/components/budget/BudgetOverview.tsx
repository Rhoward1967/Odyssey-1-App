/**
 * BudgetOverview
 * Displays a summary of total budget and spending.
 *
 * Props:
 * - totalBudget: number - The total monthly budget limit.
 * - totalSpending: number - The total spending across all categories.
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface BudgetOverviewProps {
  totalBudget: number;
  totalSpending: number;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  totalBudget,
  totalSpending,
}) => {
  return (
    <section className="mb-8 grid gap-4 grid-cols-1 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Total Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">${totalBudget.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Spending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">${totalSpending.toLocaleString()}</div>
        </CardContent>
      </Card>
    </section>
  );
};

export default BudgetOverview;