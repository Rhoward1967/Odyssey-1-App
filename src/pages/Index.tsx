import React from 'react';
// import PublicHomePage from '@/components/PublicHomePage';
import Navigation from '@/components/Navigation';
// import { AppProvider } from '@/contexts/AppContext';

const Index: React.FC = () => {
  return (
    // <AppProvider>
      <div className="min-h-screen">
        <Navigation />
        <h1 className="text-2xl p-4">Testing Navigation Component</h1>
        {/* <PublicHomePage /> */}
      </div>
    // </AppProvider>
  );
};

export default Index;