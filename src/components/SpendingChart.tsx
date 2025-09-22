import React from 'react';

type SpendingData = {
  category: string;
  amount: number;
  budget: number;
};

type SpendingChartProps = {
  data: SpendingData[];
};

export const SpendingChart: React.FC<SpendingChartProps> = ({ data }) => {
  // FIX 1: Add a "guard clause" to handle cases where data isn't ready yet.
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Spending Overview</h2>
        <p className="text-gray-500">No spending data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Spending Overview</h2>
      <table className="w-full table-auto mb-4">
        <thead>
          <tr>
            <th className="text-left text-gray-600 p-2">Category</th>
            <th className="text-left text-gray-600 p-2">Spent</th>
            <th className="text-left text-gray-600 p-2">Budget</th>
            <th className="text-left text-gray-600 p-2">Progress</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            // FIX 2: Safely calculate the percentage, avoiding division by zero.
            const percent =
              row.budget > 0
                ? Math.min(100, Math.round((row.amount / row.budget) * 100))
                : row.amount > 0 ? 100 : 0;

            return (
              <tr key={row.category}>
                <td className="p-2">{row.category}</td>
                <td className="p-2">${row.amount.toLocaleString()}</td>
                <td className="p-2">${row.budget.toLocaleString()}</td>
                <td className="p-2 w-1/2">
                   {/* This part combines the progress bar and the percentage text for better alignment */}
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-3 mr-2">
                      <div
                        className={`h-3 rounded-full ${percent < 80 ? 'bg-blue-500' : percent < 100 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 w-10 text-right">{percent}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-gray-500 text-sm">
        <span className="font-bold text-blue-500">Blue</span>: Under budget, <span className="font-bold text-yellow-500">Yellow</span>: Near budget, <span className="font-bold text-red-500">Red</span>: Over budget
      </p>
    </div>
  );
};

export default SpendingChart;