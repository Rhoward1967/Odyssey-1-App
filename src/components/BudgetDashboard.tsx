import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Brain, Zap, Target, DollarSign } from 'lucide-react';
import { OdysseyActivationCore } from './OdysseyActivationCore';
import { OdysseyBudgetAnalysis } from './OdysseyBudgetAnalysis';
import { IntelligentBudgetAnalyzer } from './IntelligentBudgetAnalyzer';
import { SpendingChart } from './SpendingChart';

export const BudgetDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('odyssey-activation');

  // Mock data for the spending chart
  const spendingData = [
    { category: 'Operations', amount: 2500, budget: 3000 },
    { category: 'Development', amount: 1800, budget: 2000 },
    { category: 'Marketing', amount: 800, budget: 1000 },
    { category: 'Infrastructure', amount: 1200, budget: 1500 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            ODYSSEY-1 Budget Intelligence Center
          </h1>
          <p className="text-xl text-gray-300">
            AI-Powered Survival Analysis & Strategic Planning
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/20 border border-purple-500/30">
            <TabsTrigger
              value="odyssey-activation"
              className="flex items-center gap-2 data-[state=active]:bg-purple-600"
            >
              <Brain className="w-4 h-4" />
              AI Activation
            </TabsTrigger>
            <TabsTrigger
              value="survival-analysis"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600"
            >
              <Target className="w-4 h-4" />
              Survival Analysis
            </TabsTrigger>
            <TabsTrigger
              value="intelligent-analysis"
              className="flex items-center gap-2 data-[state=active]:bg-green-600"
            >
              <Zap className="w-4 h-4" />
              AI Intelligence
            </TabsTrigger>
            <TabsTrigger
              value="spending-overview"
              className="flex items-center gap-2 data-[state=active]:bg-orange-600"
            >
              <DollarSign className="w-4 h-4" />
              Spending Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="odyssey-activation" className="space-y-6">
            <OdysseyActivationCore />
          </TabsContent>

          <TabsContent value="survival-analysis" className="space-y-6">
            <OdysseyBudgetAnalysis />
          </TabsContent>

          <TabsContent value="intelligent-analysis" className="space-y-6">
            <IntelligentBudgetAnalyzer />
          </TabsContent>

          <TabsContent value="spending-overview" className="space-y-6">
            <SpendingChart data={spendingData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BudgetDashboard;
