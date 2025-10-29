import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// --- INTERFACES ---
interface PositionLot {
  id: string;
  symbol: string;
  shares: number;
  purchasePrice: number;
  purchaseDate: string;
  description?: string;
}

export interface AggregatedPosition {
  symbol: string;
  totalShares: number;
  averageCost: number;
  totalCost: number;
  lots: PositionLot[];
}

interface PositionLotsContextType {
  positionLots: PositionLot[];
  addPositionLot: (symbol: string, shares: number, price: number, description?: string) => void;
  getAggregatedPositions: () => AggregatedPosition[];
  clearAllPositions: () => void;
}

// --- CONTEXT ---
const PositionLotsContext = createContext<PositionLotsContextType | undefined>(undefined);

export const usePositionLots = () => {
  const context = useContext(PositionLotsContext);
  if (!context) {
    throw new Error('usePositionLots must be used within a PositionLotsProvider');
  }
  return context;
};

// --- PROVIDER ---
export const PositionLotsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [positionLots, setPositionLots] = useState<PositionLot[]>(() => {
    try {
      // ✅ THIS IS THE PERSISTENCE YOU NEED
      const saved = localStorage.getItem('odyssey-position-lots-v1');
      return saved ? JSON.parse(saved) : [];
    } catch (error) { return []; }
  });

  useEffect(() => {
    localStorage.setItem('odyssey-position-lots-v1', JSON.stringify(positionLots));
  }, [positionLots]);

  const addPositionLot = (symbol: string, shares: number, price: number, description?: string) => {
    const newLot: PositionLot = {
      id: `lot_${Date.now()}_${Math.random()}`,
      symbol: symbol.toUpperCase(),
      shares,
      purchasePrice: price,
      purchaseDate: new Date().toISOString(),
      description,
    };
    setPositionLots(prev => [...prev, newLot]);
  };

  const getAggregatedPositions = (): AggregatedPosition[] => {
    const groups: { [key: string]: PositionLot[] } = {};
    positionLots.forEach(lot => {
      if (!groups[lot.symbol]) groups[lot.symbol] = [];
      groups[lot.symbol].push(lot);
    });

    return Object.entries(groups).map(([symbol, lots]) => {
      const totalShares = lots.reduce((sum, lot) => sum + lot.shares, 0);
      const totalCost = lots.reduce((sum, lot) => sum + (lot.shares * lot.purchasePrice), 0);
      const averageCost = totalShares !== 0 ? totalCost / totalShares : 0;

      return { symbol, totalShares, averageCost, totalCost, lots };
    }).filter(p => p.totalShares > 0.000001); // Filter out empty positions
  };
  
  const clearAllPositions = () => setPositionLots([]);

  return (
    <PositionLotsContext.Provider value={{ positionLots, addPositionLot, getAggregatedPositions, clearAllPositions }}>
      {children}
    </PositionLotsContext.Provider>
  );
};