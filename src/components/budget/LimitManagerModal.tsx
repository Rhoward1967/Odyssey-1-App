/**
 * LimitManagerModal
 * Modal dialog for viewing and updating category monthly limits.
 *
 * Props:
 * - open: boolean - Controls whether the modal is open.
 * - onClose: () => void - Callback to close the modal.
 * - categories: BudgetCategory[] - Array of categories to display and edit limits.
 * - onUpdateLimits: (updatedLimits: Record<string, number>) => void - Callback to submit updated limits.
 */
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { BudgetCategory } from "./types";

interface LimitManagerModalProps {
  open: boolean;
  onClose: () => void;
  categories: BudgetCategory[];
  onUpdateLimits: (updatedLimits: Record<string, number>) => void;
}

const LimitManagerModal: React.FC<LimitManagerModalProps> = ({ open, onClose, categories, onUpdateLimits }) => {
  const [limits, setLimits] = useState<Record<string, number>>(() => {
    const initialLimits: Record<string, number> = {};
    categories.forEach(cat => {
      initialLimits[cat.id] = cat.monthlyLimit;
    });
    return initialLimits;
  });

  const handleLimitChange = (categoryId: string, value: string) => {
    setLimits(prev => ({
      ...prev,
      [categoryId]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateLimits(limits);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Category Limits</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between">
              <label htmlFor={`limit-${category.id}`} className="flex-1">
                {category.name}
              </label>
              <Input
                id={`limit-${category.id}`}
                type="number"
                step="0.01"
                value={limits[category.id] || ''}
                onChange={(e) => handleLimitChange(category.id, e.target.value)}
                className="w-32"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-4">
            <Button type="submit">Update Limits</Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LimitManagerModal;