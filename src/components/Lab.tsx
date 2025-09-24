import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { supabase } from '../lib/supabase';

interface Agent {
  id: string;
  task: string;
  status: 'healthy' | 'unhealthy' | 'healing';
  errorLog: string[];
  codebase: string;
}

export const Lab: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('agents')
        .select('*');
      if (error) {
        setAgents([]);
      } else {
        setAgents(data || []);
      }
      setLoading(false);
    };
    fetchAgents();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Self-Healing Laboratory
          <Badge variant="outline">{agents.length} Agents Monitored</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading agent status...</div>
          ) : agents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No agents currently monitored</div>
          ) : (
            agents.map((agent, index) => (
              <div key={agent.id || index} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Task: {agent.task}</h4>
                  <Badge variant={agent.status === 'healthy' ? 'default' : agent.status === 'healing' ? 'secondary' : 'destructive'}>
                    {agent.status}
                  </Badge>
                </div>
                {agent.errorLog && agent.errorLog.length > 0 && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    Errors: {agent.errorLog.join(', ')}
                  </div>
                )}
                <div className="text-xs text-gray-500">Codebase: {agent.codebase}</div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};