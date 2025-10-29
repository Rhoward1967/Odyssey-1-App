import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

// Define the shape of the context
interface FundingContextType {
  balance: number;
  isLoading: boolean;
  adjustBalance: (amount: number) => void; // For logging paper trades
  // Add simplified, placeholder functions
  deposit: (amount: number, description: string) => Promise<void>;
  withdraw: (amount: number, description: string) => Promise<void>;
  pendingDeposits: number;
  pendingWithdrawals: number;
  transactions: any[]; // Placeholder
}

// Create the context
const FundingContext = createContext<FundingContextType | undefined>(undefined);

export const useFunding = () => {
  const context = useContext(FundingContext);
  if (!context) {
    throw new Error('useFunding must be used within a FundingProvider');
  }
  return context;
};

// Create the provider component
export const FundingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(200); // Start with $200
  const [isLoading, setIsLoading] = useState(false);

  // This function allows the trading simulator to adjust the paper balance
  const adjustBalance = useCallback((amount: number) => {
    setBalance(prev => prev + amount);
  }, []);
  
  const value = {
    balance,
    isLoading,
    adjustBalance,
    // --- Placeholders for full implementation ---
    pendingDeposits: 0, 
    pendingWithdrawals: 0,
    transactions: [],
    deposit: async (amount, desc) => { console.log('Simulating deposit', amount, desc); },
    withdraw: async (amount, desc) => { console.log('Simulating withdraw', amount, desc); },
  };

  return (
    <FundingContext.Provider value={value}>
      {children}
    </FundingContext.Provider>
  );
};

