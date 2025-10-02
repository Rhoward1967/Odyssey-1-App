import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertTriangle, Clock, Edit, Flag, Settings, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ActiveTimeClock from './ActiveTimeClock';

interface TimeEntry {
  id: string;
  employee_id: string;
  employee_name: string;
  clock_in: string;
  clock_out?: string;
  total_hours?: number;
  status: string;
  flags: any;
  location?: string;
}
export default function TimeClockManagement() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [flaggedEntries, setFlaggedEntries] = useState<TimeEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTimeEntries();
    loadFlaggedEntries();
  }, []);

  const loadTimeEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTimeEntries(data || []);
    } catch (error) {
      console.error('Error loading time entries:', error);
    }
  };

  const loadFlaggedEntries = async () => {
    try {
      // Mock data instead of Supabase call
      const mockFlagged = [
        { id: '1', employee_name: 'John Doe', issue: 'Long break', timestamp: new Date().toISOString(), flags: { long_break: true }, clock_in: new Date().toISOString() },
        { id: '2', employee_name: 'Jane Smith', issue: 'Missed clock out', timestamp: new Date(Date.now() - 7200000).toISOString(), flags: { missed_clock_out: true }, clock_in: new Date(Date.now() - 7200000).toISOString() }
      ];
      setFlaggedEntries(mockFlagged);
    } catch (error) {
      console.error('Error loading flagged entries:', error);
    }
  };

  const handleEditEntry = async (entry: TimeEntry, updates: any) => {
    setLoading(true);
    try {
      // Mock edit functionality
      console.log('Editing entry:', entry.id, 'with updates:', updates);
      
      await loadTimeEntries();
      setEditMode(false);
      setSelectedEntry(null);
    } catch (error) {
      console.error('Error editing entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-500',
      completed: 'bg-blue-500',
      flagged: 'bg-red-500',
      edited: 'bg-yellow-500'
    };
    return <Badge className={colors[status] || 'bg-gray-500'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold flex items-center gap-2 text-lg sm:text-2xl">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="block sm:hidden">Time Clock</span>
          <span className="hidden sm:block">Time Clock Management</span>
        </h2>
        <div className="flex gap-2">
          <Button onClick={loadTimeEntries} variant="outline">
            Refresh
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="entries" className="w-full">
        <TabsList>
          <TabsTrigger value="entries">All Entries</TabsTrigger>
          <TabsTrigger value="flagged" className="text-red-600">
            <Flag className="w-4 h-4 mr-2" />
            Flagged ({flaggedEntries.length})
          </TabsTrigger>
          <TabsTrigger value="active">Active Clocks</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="entries">
          <Card>
            <CardHeader>
              <CardTitle>Recent Time Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{entry.employee_name}</p>
                          <p className="text-sm text-gray-600">
                            In: {formatTime(entry.clock_in)}
                            {entry.clock_out && ` | Out: ${formatTime(entry.clock_out)}`}
                          </p>
                        </div>
                        {getStatusBadge(entry.status)}
                      </div>
                      {entry.total_hours && (
                        <p className="text-sm mt-2">
                          Total Hours: {entry.total_hours} | Location: {entry.location || 'Unknown'}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEntry(entry);
                          setEditMode(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {Object.keys(entry.flags || {}).length > 0 && (
                        <Badge variant="destructive">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Flagged
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flagged">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Flagged Entries Requiring Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flaggedEntries.map((entry) => (
                  <div key={entry.id} className="p-4 border-l-4 border-red-500 bg-red-50 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-red-800">{entry.employee_name}</p>
                        <p className="text-sm text-red-600">
                          Issues: {Object.keys(entry.flags || {}).join(', ')}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatTime(entry.clock_in)}
                        </p>
                      </div>
                      <Button size="sm" variant="destructive">
                        Review & Fix
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="active">
          <ActiveTimeClock />
        </TabsContent>
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Time Clock Reports & Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800">Today's Activity</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {timeEntries.filter(e => new Date(e.clock_in).toDateString() === new Date().toDateString()).length}
                  </p>
                  <p className="text-sm text-blue-600">Clock-ins today</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-medium text-yellow-800">Flagged Issues</h3>
                  <p className="text-2xl font-bold text-yellow-600">{flaggedEntries.length}</p>
                  <p className="text-sm text-yellow-600">Require attention</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800">Active Now</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {timeEntries.filter(e => e.status === 'active').length}
                  </p>
                  <p className="text-sm text-green-600">Currently working</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      {editMode && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Time Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employee</label>
                <Input value={selectedEntry.employee_name} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Clock In</label>
                <Input 
                  type="datetime-local"
                  defaultValue={new Date(selectedEntry.clock_in).toISOString().slice(0, 16)}
                />
              </div>
              {selectedEntry.clock_out && (
                <div>
                  <label className="block text-sm font-medium mb-1">Clock Out</label>
                  <Input 
                    type="datetime-local"
                    defaultValue={new Date(selectedEntry.clock_out).toISOString().slice(0, 16)}
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setEditMode(false);
                    setSelectedEntry(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleEditEntry(selectedEntry, {})}
                  className="flex-1"
                  disabled={loading}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}