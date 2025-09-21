/**
 * TransactionModal
 * Modal dialog for entering a new transaction.
 *
 * Props:
 * - open: boolean - Controls whether the modal is open.
 * - onClose: () => void - Callback to close the modal.
 * - onAddTransaction: (newTransaction: Omit<Transaction, "id">) => void - Callback to submit a new transaction.
 * - categories: BudgetCategory[] - Array of categories for the transaction category selector.
 */
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { BudgetCategory, Transaction } from "./types";

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onAddTransaction: (newTransaction: Omit<Transaction, "id">) => void;
  categories: BudgetCategory[];
}

const TransactionModal: React.FC<TransactionModalProps> = ({ open, onClose, onAddTransaction, categories }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && description && categoryId) {
      onAddTransaction({
        categoryId,
        amount: parseFloat(amount),
        description,
        date: new Date()
      });
      setAmount('');
      setDescription('');
      setCategoryId('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount">Amount</label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label htmlFor="description">Description</label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Transaction description"
              required
            />
          </div>
          <div>
            <label htmlFor="category">Category</label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Add Transaction</Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;