/**
 * CategoryList
 * Displays the list of budget categories and their current spending.
 *
 * Props:
 * - categories: BudgetCategory[] - Array of budget category objects to display.
 */
import React from "react";
import { BudgetCategory } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface CategoryListProps {
  categories: BudgetCategory[];
}

const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Card key={category.id}>
          <CardHeader>
            <CardTitle>{category.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div>Limit: ${category.monthlyLimit}</div>
            <div>Spent: ${category.currentSpending}</div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
};

export default CategoryList;