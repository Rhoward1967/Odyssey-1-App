import React from 'react';

interface StatusLightProps {
  status: 'green' | 'amber' | 'red';
  label: string;
}

const StatusLight: React.FC<StatusLightProps> = ({ status, label }) => {
  const colorClasses = {
    green: 'bg-green-500 shadow-green-500',
    amber: 'bg-yellow-500 shadow-yellow-500',
    red: 'bg-red-500 shadow-red-500'
  };

  return (
    <div className="flex items-center justify-between mb-2">
      <span className="font-mono text-sm text-gray-300">{label}</span>
      <div 
        className={`w-3 h-3 rounded-full ${colorClasses[status]} shadow-lg animate-pulse`}
        style={{ 
          boxShadow: `0 0 10px ${status === 'green' ? '#22c55e' : status === 'amber' ? '#f59e0b' : '#ef4444'}`
        }}
      />
    </div>
  );
};

export default StatusLight;