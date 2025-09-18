import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface DreamTheoryCodingProps {
  className?: string;
}

export const DreamTheoryCoding: React.FC<DreamTheoryCodingProps> = ({ className = '' }) => {
  const [dreamState, setDreamState] = useState('SYNTHESIS');
  const [processes, setProcesses] = useState([
    { name: 'Non-Linear Synthesis', active: true, progress: 78 },
    { name: 'Symbolic Processing', active: true, progress: 92 },
    { name: 'Subconscious Prototyping', active: false, progress: 45 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProcesses(prev => prev.map(p => ({
        ...p,
        progress: p.active ? Math.max(0, Math.min(100, p.progress + (Math.random() - 0.4) * 8)) : p.progress
      })));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className={`p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-purple-300">Dream Theory Coding</h3>
        <Badge variant="outline" className="border-pink-400 text-pink-300">
          {dreamState}
        </Badge>
      </div>
      
      <div className="relative mb-4">
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756711934961_0313b692.webp" 
          alt="Dream Theory Coding"
          className="w-full h-24 object-cover rounded-lg opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent rounded-lg" />
      </div>

      <div className="space-y-3">
        {processes.map((process, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className={`${process.active ? 'text-purple-300' : 'text-gray-500'}`}>
                {process.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{process.progress}%</span>
                <div className={`w-2 h-2 rounded-full ${process.active ? 'bg-purple-400 animate-pulse' : 'bg-gray-600'}`} />
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-1000 ${
                  process.active ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-600'
                }`}
                style={{ width: `${process.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <Button 
          size="sm" 
          className="bg-purple-600 hover:bg-purple-700 text-xs"
          onClick={() => setDreamState(dreamState === 'SYNTHESIS' ? 'ARCHETYPAL' : 'SYNTHESIS')}
        >
          Switch Mode
        </Button>
      </div>
    </Card>
  );
};