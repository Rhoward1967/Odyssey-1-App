import React from 'react';
import { BudgetDashboard } from '../components/BudgetDashboard';
import RealTimeCostMonitor from '../components/RealTimeCostMonitor';
import { BudgetOptimizer } from '../components/BudgetOptimizer';
import { CostAnalytics } from '../components/CostAnalytics';
import ServiceCostAnalyzer from '../components/ServiceCostAnalyzer';

const Budget: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Budget & Financial Analytics
          </h1>
          <p className="text-gray-300 text-lg">
            Comprehensive financial monitoring and optimization dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <BudgetDashboard />
            <BudgetOptimizer />
          </div>
          
          <div className="space-y-6">
            <RealTimeCostMonitor />
            <CostAnalytics />
          </div>
        </div>

        <div className="mt-8">
          <ServiceCostAnalyzer />
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">Financial Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-green-400 font-medium">Monthly Savings</h4>
              <p className="text-2xl font-bold text-white">$2,847</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-blue-400 font-medium">Cost Efficiency</h4>
              <p className="text-2xl font-bold text-white">94.2%</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-purple-400 font-medium">ROI</h4>
              <p className="text-2xl font-bold text-white">347%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budget;