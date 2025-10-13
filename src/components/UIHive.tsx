import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface Agent {
  task: string;
  status: 'healthy' | 'unhealthy' | 'healing';
  errorLog: string[];
  codebase: string;
}

interface UIHiveProps {
  onQuarantineAgent?: (agent: Agent) => void;
}

export const UIHive: React.FC<UIHiveProps> = ({ onQuarantineAgent }) => {
  const [activeAgents, setActiveAgents] = useState<Agent[]>([]);
  const [taskQueue, setTaskQueue] = useState<string[]>([]);
  const [systemHealth, setSystemHealth] = useState(100);
  const [isActive, setIsActive] = useState(true);
  const [simulationCycles, setSimulationCycles] = useState(0);
  const [maxSimulationCycles, setMaxSimulationCycles] = useState(50);

  useEffect(() => {
    if (!isActive) return;
    
    // Simulate agent activity with circuit breaker
    const interval = setInterval(() => {
      setSimulationCycles(prev => {
        if (prev >= maxSimulationCycles) {
          setIsActive(false); // Auto-stop when max cycles reached
          return prev;
        }
        return prev + 1;
      });
      
      if (activeAgents.length > 0) {
        setActiveAgents(prev => prev.map(agent => {
          // Simulate random health changes
          if (Math.random() < 0.1 && agent.status === 'healthy') {
            const unhealthyAgent = {
              ...agent,
              status: 'unhealthy' as const,
              errorLog: [...agent.errorLog, 'Runtime error detected']
            };
            onQuarantineAgent?.(unhealthyAgent);
            return unhealthyAgent;
          }
          return agent;
        }));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeAgents, onQuarantineAgent, isActive, maxSimulationCycles]);

  const runTask = (taskName: string) => {
    console.log(`HIVE: Running task '${taskName}'`);
    
    // Create main agent
    const mainAgent: Agent = {
      task: taskName,
      status: Math.random() < 0.8 ? 'healthy' : 'unhealthy',
      errorLog: Math.random() < 0.8 ? [] : ['Initial validation failed'],
      codebase: `code_for_${taskName}`
    };

    // Create validator agents
    const validators: Agent[] = Array.from({ length: 3 }, (_, i) => ({
      task: `validate_${taskName}_${i}`,
      status: Math.random() < 0.9 ? 'healthy' : 'unhealthy',
      errorLog: [],
      codebase: `validator_${i}_for_${taskName}`
    }));

    setActiveAgents(prev => [...prev, mainAgent, ...validators]);
    setTaskQueue(prev => prev.filter(t => t !== taskName));
  };
  const addTaskToQueue = (taskName: string) => {
    setTaskQueue(prev => [...prev, taskName]);
  };

  const healthyAgents = activeAgents.filter(a => a.status === 'healthy').length;
  const unhealthyAgents = activeAgents.filter(a => a.status === 'unhealthy').length;

  return (
    <Card className="bg-gradient-to-br from-emerald-900 to-teal-900 border-emerald-500">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          🐝 Hive Orchestrator (RNA Agents)
          <Badge variant="outline" className="text-green-400 border-green-400">
            {activeAgents.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-white">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{healthyAgents}</div>
            <div className="text-sm text-green-300">Healthy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{unhealthyAgents}</div>
            <div className="text-sm text-red-300">Unhealthy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{taskQueue.length}</div>
            <div className="text-sm text-blue-300">Queued</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-emerald-300">Active Agents</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {activeAgents.slice(0, 5).map((agent, index) => (
              <div key={index} className="flex justify-between items-center text-sm bg-black/20 p-2 rounded">
                <span className="truncate">{agent.task}</span>
                <Badge variant={agent.status === 'healthy' ? 'default' : 'destructive'}>
                  {agent.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => runTask(`analysis_${Date.now()}`)}
          >
            Run Task
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-teal-500 text-teal-300"
            onClick={() => addTaskToQueue(`queued_${Date.now()}`)}
          >
            Queue Task
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className={`border-yellow-500 ${isActive ? 'text-red-300' : 'text-green-300'}`}
            onClick={() => setIsActive(!isActive)}
          >
            {isActive ? 'Stop' : 'Start'} Simulation
          </Button>
        </div>
        
        <div className="text-xs text-emerald-300 mt-2">
          Simulation: {isActive ? 'Active' : 'Stopped'} 
          ({simulationCycles}/{maxSimulationCycles} cycles)
          {simulationCycles >= maxSimulationCycles && ' - Max cycles reached'}
        </div>
      </CardContent>
    </Card>
  );
};