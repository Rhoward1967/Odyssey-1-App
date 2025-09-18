import React from 'react';
import PublicHomePage from '@/components/PublicHomePage';
import Navigation from '@/components/Navigation';
import { AppProvider } from '@/contexts/AppContext';

const Index: React.FC = () => {
  return (
    <AppProvider>
      <div className="min-h-screen">
        <Navigation />
        <PublicHomePage />
      </div>
    </AppProvider>
  );
};

export default Index;
