import React, { useState, useEffect } from 'react';
import GlassPanel from './GlassPanel';
import StatusLight from './StatusLight';

const SystemStatus: React.FC = () => {
  const [kernelStatus, setKernelStatus] = useState<'amber' | 'green' | 'red'>('amber');
  const [dbStatus, setDbStatus] = useState<'amber' | 'green' | 'red'>('amber');
  const [keyStatus, setKeyStatus] = useState<'amber' | 'green' | 'red'>('amber');

  useEffect(() => {
    // Simulate system initialization
    const timer1 = setTimeout(() => setKernelStatus('green'), 2000);
    const timer2 = setTimeout(() => setDbStatus('green'), 3000);
    const timer3 = setTimeout(() => setKeyStatus('green'), 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <GlassPanel title="System Status" className="h-fit">
      <div className="space-y-3">
        <StatusLight status={kernelStatus} label="Kernel" />
        <StatusLight status={dbStatus} label="Database" />
        <StatusLight status={keyStatus} label="Auth Key" />
        
        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <div className="text-xs text-gray-500 font-mono overflow-hidden">
            User ID: user_7x9k2m1p8q
          </div>
        </div>
      </div>
    </GlassPanel>
  );
};

export default SystemStatus;