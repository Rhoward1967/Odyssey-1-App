import React from 'react';
import VerticalNavigation from '../components/VerticalNavigation';
import Web3Demo from '../components/Web3Demo';

const Web3: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex">
      <VerticalNavigation />
      <div className="md:ml-64 flex-1">
        <Web3Demo />
      </div>
    </div>
  );
};

export default Web3;