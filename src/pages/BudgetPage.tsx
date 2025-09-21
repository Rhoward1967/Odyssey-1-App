/**
 * BudgetPage Component
 * 
 * Stable placeholder to resolve production hydration errors.
 * This simple implementation prevents deployment crashes.
 */
import React from "react";

const BudgetPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Budget Management
        </h1>
        <p className="text-gray-600 mb-6">
          Budget dashboard is temporarily unavailable while we resolve technical issues.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            Our team is working to restore full functionality. Thank you for your patience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;
