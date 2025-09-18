import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Target } from 'lucide-react';

interface SpendingChartProps {
  data: Array<{
    category: string;
    amount: number;
    budget: number;
  }>;
}

export const SpendingChart: React.FC<SpendingChartProps> = ({ data }) => {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="budget" fill="#e2e8f0" name="Budget" />
          <Bar dataKey="amount" fill="#3b82f6" name="Spent" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendingChart;