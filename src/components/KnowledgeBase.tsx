import React, { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface KnowledgeBaseProps {
  className?: string;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ className = '' }) => {
  const [activeModule, setActiveModule] = useState('ODYSSEY-1 Core Systems');
  
  const modules = [
    { name: 'ODYSSEY-1 Core Systems', level: 'Master Control', progress: 99, color: 'blue' },
    { name: 'Genesis Engine', level: 'Creative AI', progress: 96, color: 'purple' },
    { name: 'Inference Engine', level: 'Logic Core', progress: 98, color: 'green' },
    { name: 'Self-Evolution Engine', level: 'Adaptive Learning', progress: 99, color: 'cyan' },
    { name: 'Business Intelligence', level: 'Analytics Master', progress: 94, color: 'yellow' },
    { name: 'Autonomous Operations', level: 'Full Control', progress: 97, color: 'red' }
  ];

  return (
    <Card className={`p-4 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-blue-300">Master Knowledge Base</h3>
        <Badge variant="outline" className="border-cyan-400 text-cyan-300 text-xs">
          QPAI Core
        </Badge>
      </div>
      
      <div className="relative mb-3">
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756711935770_ccaf0e52.webp" 
          alt="Knowledge Base"
          className="w-full h-20 object-cover rounded-lg opacity-70"
        />
      </div>

      <div className="space-y-2 max-h-32 overflow-y-auto">
        {modules.map((module, index) => (
          <div 
            key={index} 
            className={`p-2 rounded cursor-pointer transition-all ${
              activeModule === module.name ? 'bg-blue-500/20 border border-blue-400/30' : 'hover:bg-gray-800/30'
            }`}
            onClick={() => setActiveModule(module.name)}
          >
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">{module.name}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-xs border-${module.color}-400 text-${module.color}-300`}>
                  {module.level}
                </Badge>
                <span className="text-gray-400">{module.progress}%</span>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
              <div 
                className={`bg-gradient-to-r from-${module.color}-500 to-${module.color}-400 h-1 rounded-full`}
                style={{ width: `${module.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <Button size="sm" className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-xs">
        Access Module: {activeModule}
      </Button>
    </Card>
  );
};