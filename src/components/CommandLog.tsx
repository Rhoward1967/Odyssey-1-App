import React, { useState, useRef, useEffect } from 'react';
import GlassPanel from './GlassPanel';

interface LogEntry {
  id: string;
  sender: 'user' | 'ai' | 'system' | 'hive';
  message: string;
  timestamp: Date;
}

const CommandLog: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', sender: 'system', message: 'Odyssey-1 Super AI Kernel initialized', timestamp: new Date() },
    { id: '2', sender: 'system', message: 'All systems nominal', timestamp: new Date() }
  ]);
  const [command, setCommand] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = (sender: LogEntry['sender'], message: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      sender,
      message,
      timestamp: new Date()
    };
    setLogs(prev => [...prev, newLog]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    
    addLog('user', command);
    // Simulate AI response
    setTimeout(() => {
      addLog('ai', `Processing command: "${command}"`);
    }, 1000);
    
    setCommand('');
  };

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const getSenderColor = (sender: string) => {
    const colors = {
      user: 'border-blue-500',
      ai: 'border-green-500',
      system: 'border-yellow-500',
      hive: 'border-purple-500'
    };
    return colors[sender as keyof typeof colors] || 'border-gray-500';
  };

  return (
    <GlassPanel title="Command Log" className="flex flex-col h-full">
      <div ref={logRef} className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-96">
        {logs.map(log => (
          <div key={log.id} className={`border-l-2 pl-4 ${getSenderColor(log.sender)}`}>
            <div className="font-mono text-xs text-gray-400">
              &gt; <span className="font-bold text-white">{log.sender.toUpperCase()}</span>: {log.message}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          className="w-full bg-black/50 border border-gray-600 rounded-lg p-3 font-mono text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          placeholder="Enter directive..."
        />
      </form>
    </GlassPanel>
  );
};

export default CommandLog;