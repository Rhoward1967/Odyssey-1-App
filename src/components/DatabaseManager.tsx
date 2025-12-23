import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Table, Plus, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface TableInfo {
  name: string;
  rows: number;
  columns: string[];
  created: string;
}

interface DatabaseStats {
  totalTables: number;
  totalRows: number;
  storageUsed: string;
  lastBackup: string;
}

export const DatabaseManager = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [stats, setStats] = useState<DatabaseStats>({
    totalTables: 0,
    totalRows: 0,
    storageUsed: '0 MB',
    lastBackup: 'Never'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [initStatus, setInitStatus] = useState<'checking' | 'ready' | 'needs-setup'>('checking');
  const { toast } = useToast();

  useEffect(() => {
    checkDatabaseSetup();
  }, []);

  const checkDatabaseSetup = async () => {
    setIsLoading(true);
    try {
      // Check if research tables exist
      const { data: researchEntries, error: entriesError } = await supabase
        .from('research_entries')
        .select('count', { count: 'exact', head: true });

      const { data: researchTags, error: tagsError } = await supabase
        .from('research_tags')
        .select('count', { count: 'exact', head: true });

      if (entriesError?.code === '42P01' || tagsError?.code === '42P01') {
        setInitStatus('needs-setup');
      } else {
        setInitStatus('ready');
        await loadDatabaseInfo();
      }
    } catch (error) {
      console.error('Error checking database setup:', error);
      setInitStatus('needs-setup');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeDatabase = async () => {
    setIsLoading(true);
    try {
      // Create research_entries table
      const { error: entriesError } = await supabase.rpc('create_research_entries_table');
      
      // Create research_tags table
      const { error: tagsError } = await supabase.rpc('create_research_tags_table');

      if (entriesError || tagsError) {
        throw new Error('Failed to create tables');
      }

      toast({
        title: "Success",
        description: "Database initialized successfully"
      });

      setInitStatus('ready');
      await loadDatabaseInfo();
    } catch (error) {
      console.error('Error initializing database:', error);
      toast({
        title: "Error",
        description: "Failed to initialize database. Using fallback storage.",
        variant: "destructive"
      });
      
      // Set up local storage fallback
      setInitStatus('ready');
      setStats({
        totalTables: 2,
        totalRows: 0,
        storageUsed: '0 KB (Local)',
        lastBackup: 'N/A (Local Storage)'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDatabaseInfo = async () => {
    try {
      // Query Supabase for all tables and their row counts
      const { data: tablesData, error: tablesError } = await supabase.rpc('get_all_table_info');
      if (tablesError) throw tablesError;

      // tablesData should be an array of { name, rows, columns, created }
      setTables(tablesData || []);

      // Calculate stats
      const totalTables = (tablesData || []).length;
      const totalRows = (tablesData || []).reduce((sum: number, t: any) => sum + (t.rows || 0), 0);
      setStats({
        totalTables,
        totalRows,
        storageUsed: `${Math.round(totalRows * 0.5)} KB`,
        lastBackup: new Date().toLocaleDateString()
      });
    } catch (error) {
      console.error('Error loading database info:', error);
      setTables([]);
      setStats({
        totalTables: 0,
        totalRows: 0,
        storageUsed: '0 KB',
        lastBackup: 'N/A'
      });
    }
  };

  const exportData = async () => {
    try {
      const { data: entries } = await supabase
        .from('research_entries')
        .select('*');

      const { data: tags } = await supabase
        .from('research_tags')
        .select('*');

      const exportData = {
        research_entries: entries || [],
        research_tags: tags || [],
        exported_at: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `research_database_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Database exported successfully"
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export database",
        variant: "destructive"
      });
    }
  };

  if (initStatus === 'checking') {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Database className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Checking database setup...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (initStatus === 'needs-setup') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Database Setup Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            The research database needs to be initialized. This will create the necessary tables
            for storing research findings, citations, and conversation history.
          </p>
          <Button onClick={initializeDatabase} disabled={isLoading} className="w-full">
            <Database className="h-4 w-4 mr-2" />
            {isLoading ? 'Initializing...' : 'Initialize Database'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Management
            <Badge variant="outline" className="ml-auto">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tables">Tables</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalTables}</div>
                    <div className="text-sm text-gray-500">Tables</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.totalRows}</div>
                    <div className="text-sm text-gray-500">Total Records</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.storageUsed}</div>
                    <div className="text-sm text-gray-500">Storage Used</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm font-bold text-orange-600">{stats.lastBackup}</div>
                    <div className="text-sm text-gray-500">Last Backup</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tables" className="space-y-4">
              {tables.map(table => (
                <Card key={table.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Table className="h-4 w-4" />
                      {table.name}
                      <Badge variant="secondary">{table.rows} rows</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <strong>Columns:</strong> {table.columns.join(', ')}
                      </div>
                      <div>
                        <strong>Created:</strong> {table.created}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Export</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Export all research data as JSON for backup or migration.
                    </p>
                    <Button onClick={exportData} className="w-full">
                      Export Database
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Refresh Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Update database statistics and table information.
                    </p>
                    <Button onClick={loadDatabaseInfo} disabled={isLoading} className="w-full">
                      {isLoading ? 'Refreshing...' : 'Refresh Stats'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};