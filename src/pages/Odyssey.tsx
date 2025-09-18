import React from 'react';
import AppLayout from '@/components/AppLayout';
import Navigation from '@/components/Navigation';
import { AppProvider } from '@/contexts/AppContext';

const Odyssey: React.FC = () => {
  return (
    <AppProvider>
      <div className="min-h-screen">
        <Navigation />
        <AppLayout />
      </div>
    </AppProvider>
  );
};

export default Odyssey;