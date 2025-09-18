import React from 'react';
import VerticalNavigation from '../components/VerticalNavigation';
import ClientAppMonitor from '../components/ClientAppMonitor';

const Research: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex">
      <VerticalNavigation />
      <div className="md:ml-64 flex-1">
        <ClientAppMonitor />
      </div>
    </div>
  );
};

export default Research;