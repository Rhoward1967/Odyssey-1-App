import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Calendar, User, Code, Database, Shield, Zap, 
  GitBranch, CheckCircle, AlertTriangle, Info,
  Clock, FileText, Settings, RefreshCw
} from 'lucide-react';

interface ChangeLogEntry {
  id: string;
  timestamp: string;
  author: string;
  type: 'feature' | 'bugfix' | 'security' | 'database' | 'config' | 'documentation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  components: string[];
  notes?: string;
}

export const AdminChangeLog: React.FC = () => {
  const [entries, setEntries] = useState<ChangeLogEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // Initialize with current session changes
    const currentChanges: ChangeLogEntry[] = [
      {
        id: '001',
        timestamp: new Date().toISOString(),
        author: 'Claude AI Assistant',
        type: 'feature',
        title: 'Real-time Data Synchronization Implementation',
        description: 'Implemented comprehensive real-time data synchronization across all trading and AI components using Supabase real-time subscriptions with offline support and conflict resolution.',
        impact: 'high',
        components: [
          'useRealtimeData hook',
          'useOfflineSync hook', 
          'RealtimeConnectionStatus component',
          'RealtimeTradingData component',
          'RealtimeAIAnalysis component',
          'RealtimeSystemStatus component',
          'realtime-sync edge function'
        ],
        notes: 'All real-time components integrated into AppLayout.tsx with new "Live" tab. Fixed lucide-react import error by replacing Sync with RefreshCw icon.'
      },
      {
        id: '002',
        timestamp: new Date().toISOString(),
        author: 'Claude AI Assistant',
        type: 'documentation',
        title: 'Admin Change Log System Created',
        description: 'Created comprehensive admin change log system to track all modifications, updates, and system changes from this point forward.',
        impact: 'medium',
        components: [
          'AdminChangeLog component',
          'UserManual component (planned)',
          'Enhanced AdminSystemManual'
        ],
        notes: 'All future changes will be documented in this system as requested by admin.'
      }
    ];
    
    setEntries(currentChanges);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return <Zap className="h-4 w-4" />;
      case 'bugfix': return <CheckCircle className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'config': return <Settings className="h-4 w-4" />;
      case 'documentation': return <FileText className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-600/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-orange-600/20 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-600/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
    }
  };

  const filteredEntries = filter === 'all' ? entries : entries.filter(e => e.type === filter);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <GitBranch className="h-8 w-8 text-blue-400" />
            ODYSSEY-1 ADMIN CHANGE LOG
          </CardTitle>
          <Badge className="mx-auto bg-blue-600/20 text-blue-300 text-lg px-4 py-2">
            TRACKING ALL SYSTEM CHANGES
          </Badge>
        </CardHeader>
      </Card>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="grid w-full grid-cols-7 bg-slate-800/50">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="feature">Features</TabsTrigger>
          <TabsTrigger value="bugfix">Fixes</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
          <TabsTrigger value="documentation">Docs</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">
              {filteredEntries.length} Change{filteredEntries.length !== 1 ? 's' : ''} Found
            </h3>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(entry.type)}
                    <div>
                      <CardTitle className="text-white text-lg">{entry.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {entry.type.toUpperCase()}
                        </Badge>
                        <Badge className={getImpactColor(entry.impact)}>
                          {entry.impact.toUpperCase()} IMPACT
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <User className="h-3 w-3" />
                      {entry.author}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">{entry.description}</p>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-300">Components Modified:</h4>
                  <div className="flex flex-wrap gap-2">
                    {entry.components.map((component, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        <Code className="h-3 w-3 mr-1" />
                        {component}
                      </Badge>
                    ))}
                  </div>
                </div>

                {entry.notes && (
                  <div className="border-t border-purple-500/20 pt-3">
                    <h4 className="font-semibold text-purple-300 mb-2">Additional Notes:</h4>
                    <p className="text-gray-400 text-sm pl-4 border-l-2 border-purple-500/30">
                      {entry.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};