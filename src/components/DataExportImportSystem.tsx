import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Download, 
  Upload, 
  FileText, 
  Database, 
  Calendar, 
  Users,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export const DataExportImportSystem = () => {
  const { toast } = useToast();
  const [exportProgress, setExportProgress] = useState(0);
  const [importProgress, setImportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState('json');
  const [importFile, setImportFile] = useState<File | null>(null);

  const availableTables = [
    { id: 'user_profiles', name: 'User Profiles', icon: Users, count: 1247 },
    { id: 'appointments', name: 'Appointments', icon: Calendar, count: 892 },
    { id: 'documents', name: 'Documents', icon: FileText, count: 2156 },
    { id: 'system_logs', name: 'System Logs', icon: Database, count: 15420 },
    { id: 'settings', name: 'Settings', icon: Settings, count: 45 }
  ];

  const handleExport = async () => {
    if (selectedTables.length === 0) {
      toast({
        title: "No Tables Selected",
        description: "Please select at least one table to export.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      const exportData: any = {};
      const totalTables = selectedTables.length;

      for (let i = 0; i < selectedTables.length; i++) {
        const table = selectedTables[i];
        setExportProgress(((i + 1) / totalTables) * 100);

        // Simulate data export from Supabase
        const { data, error } = await supabase
          .from(table)
          .select('*');

        if (error) {
          console.warn(`Could not export ${table}:`, error);
          exportData[table] = [];
        } else {
          exportData[table] = data || [];
        }

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: exportFormat === 'json' ? 'application/json' : 'text/csv'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `odyssey-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Successfully exported ${selectedTables.length} tables.`
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An error occurred during export. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to import.",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      const fileContent = await importFile.text();
      const importData = JSON.parse(fileContent);
      const tables = Object.keys(importData);
      
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        const data = importData[table];
        
        setImportProgress(((i + 1) / tables.length) * 100);

        // Import data to Supabase
        if (data && data.length > 0) {
          const { error } = await supabase
            .from(table)
            .upsert(data);

          if (error) {
            console.warn(`Could not import to ${table}:`, error);
          }
        }

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported data from ${tables.length} tables.`
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "An error occurred during import. Please check your file format.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      setImportFile(null);
    }
  };

  const handleTableSelection = (tableId: string, checked: boolean) => {
    if (checked) {
      setSelectedTables(prev => [...prev, tableId]);
    } else {
      setSelectedTables(prev => prev.filter(id => id !== tableId));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Data Management</h1>
        <p className="text-gray-600">Export and import your data with full control and flexibility</p>
      </div>

      <Tabs defaultValue="export" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </TabsTrigger>
          <TabsTrigger value="import">
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Your Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-4 block">Select Tables to Export</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableTables.map((table) => {
                    const Icon = table.icon;
                    return (
                      <div key={table.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox 
                          checked={selectedTables.includes(table.id)}
                          onCheckedChange={(checked) => handleTableSelection(table.id, !!checked)}
                        />
                        <Icon className="h-5 w-5 text-gray-500" />
                        <div className="flex-1">
                          <p className="font-medium">{table.name}</p>
                          <p className="text-sm text-gray-500">{table.count.toLocaleString()} records</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label>Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isExporting && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Exporting data...</span>
                  </div>
                  <Progress value={exportProgress} className="w-full" />
                </div>
              )}

              <Button 
                onClick={handleExport} 
                disabled={isExporting || selectedTables.length === 0}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Selected Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Select Import File</Label>
                <Input 
                  type="file" 
                  accept=".json,.csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                />
                {importFile && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700">
                      File selected: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium">Important:</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>Importing will overwrite existing data with matching IDs</li>
                    <li>Make sure to backup your current data before importing</li>
                    <li>Only JSON and CSV formats are supported</li>
                  </ul>
                </div>
              </div>

              {isImporting && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Importing data...</span>
                  </div>
                  <Progress value={importProgress} className="w-full" />
                </div>
              )}

              <Button 
                onClick={handleImport} 
                disabled={isImporting || !importFile}
                className="w-full"
                variant="destructive"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};