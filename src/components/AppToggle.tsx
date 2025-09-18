import React, { useState } from 'react';
import { User, DollarSign, Wallet } from 'lucide-react';
import { Button } from './ui/button';
import MobileBidderApp from './MobileBidderApp';
import BudgetDashboard from './BudgetDashboard';
import Web3Demo from './Web3Demo';

export default function AppToggle() {
  const [viewMode, setViewMode] = useState<'bidder' | 'budget' | 'web3'>('bidder');

  return (
    <div className="min-h-screen">
      {/* Toggle Button - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 flex space-x-2">
          <Button
            variant={viewMode === 'bidder' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('bidder')}
            className={`flex items-center space-x-2 ${
              viewMode === 'bidder' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Bidder</span>
          </Button>

          <Button
            variant={viewMode === 'budget' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('budget')}
            className={`flex items-center space-x-2 ${
              viewMode === 'budget' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Budget</span>
          </Button>

          <Button
            variant={viewMode === 'web3' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('web3')}
            className={`flex items-center space-x-2 ${
              viewMode === 'web3' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span className="hidden sm:inline">Web3</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'bidder' && <MobileBidderApp />}
      {viewMode === 'budget' && <BudgetDashboard />}
      {viewMode === 'web3' && <Web3Demo />}
    </div>
  );
}