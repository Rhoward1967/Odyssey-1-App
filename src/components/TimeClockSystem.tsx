import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Clock, Users, CheckCircle, XCircle, Edit, Save } from 'lucide-react';

interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  clockIn: string;
  clockOut?: string;
  totalHours?: number;
  status: 'clocked-in' | 'clocked-out';
  date: string;
  location: string;
  adminAdjusted?: boolean;
}

const TimeClockSystem: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    {
      id: '1',
      employeeId: 'emp001',
      employeeName: 'John Smith',
      clockIn: '06:00',
      status: 'clocked-in',
      date: '2025-01-15',
      location: 'Federal Building A'
    },
    {
      id: '2',
      employeeId: 'emp002',
      employeeName: 'Sarah Johnson',
      clockIn: '07:30',
      clockOut: '15:30',
      totalHours: 8,
      status: 'clocked-out',
      date: '2025-01-15',
      location: 'State Office Complex'
    }
  ]);
  
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editTimes, setEditTimes] = useState({ clockIn: '', clockOut: '' });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const clockInEmployee = (employeeId: string, employeeName: string) => {
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      employeeId,
      employeeName,
      clockIn: currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      status: 'clocked-in',
      date: currentTime.toISOString().split('T')[0],
      location: 'Admin Override'
    };
    setTimeEntries([...timeEntries, newEntry]);
  };

  const clockOutEmployee = (entryId: string) => {
    setTimeEntries(timeEntries.map(entry => {
      if (entry.id === entryId && entry.status === 'clocked-in') {
        const clockOutTime = currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        const clockInDate = new Date(`${entry.date} ${entry.clockIn}`);
        const clockOutDate = new Date(`${entry.date} ${clockOutTime}`);
        const totalHours = Math.round((clockOutDate.getTime() - clockInDate.getTime()) / (1000 * 60 * 60) * 100) / 100;
        
        return {
          ...entry,
          clockOut: clockOutTime,
          totalHours,
          status: 'clocked-out' as const
        };
      }
      return entry;
    }));
  };

  const startEditing = (entry: TimeEntry) => {
    setEditingEntry(entry.id);
    setEditTimes({ clockIn: entry.clockIn, clockOut: entry.clockOut || '' });
  };

  const saveEdits = (entryId: string) => {
    setTimeEntries(timeEntries.map(entry => {
      if (entry.id === entryId) {
        const clockInDate = new Date(`${entry.date} ${editTimes.clockIn}`);
        const clockOutDate = editTimes.clockOut ? new Date(`${entry.date} ${editTimes.clockOut}`) : null;
        const totalHours = clockOutDate ? 
          Math.round((clockOutDate.getTime() - clockInDate.getTime()) / (1000 * 60 * 60) * 100) / 100 : undefined;
        
        return {
          ...entry,
          clockIn: editTimes.clockIn,
          clockOut: editTimes.clockOut || undefined,
          totalHours,
          status: editTimes.clockOut ? 'clocked-out' as const : 'clocked-in' as const,
          adminAdjusted: true
        };
      }
      return entry;
    }));
    setEditingEntry(null);
  };

  const currentlyWorking = timeEntries.filter(entry => entry.status === 'clocked-in');
  const todaysEntries = timeEntries.filter(entry => entry.date === currentTime.toISOString().split('T')[0]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Time Clock */}
      <div className="flex-1 p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              ODYSSEY-1 Time Clock System
            </CardTitle>
            <div className="text-2xl font-mono">
              {currentTime.toLocaleString()}
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Time Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{entry.employeeName}</h3>
                    <p className="text-sm text-gray-600">{entry.location}</p>
                    
                    {editingEntry === entry.id ? (
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="time"
                          value={editTimes.clockIn}
                          onChange={(e) => setEditTimes({...editTimes, clockIn: e.target.value})}
                          className="w-32"
                        />
                        <span className="self-center">to</span>
                        <Input
                          type="time"
                          value={editTimes.clockOut}
                          onChange={(e) => setEditTimes({...editTimes, clockOut: e.target.value})}
                          className="w-32"
                          placeholder="Clock out"
                        />
                        <Button size="sm" onClick={() => saveEdits(entry.id)}>
                          <Save className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm">
                          {entry.clockIn} - {entry.clockOut || 'Working'}
                        </span>
                        {entry.totalHours && (
                          <span className="text-sm text-gray-600">
                            ({entry.totalHours}h)
                          </span>
                        )}
                        {entry.adminAdjusted && (
                          <Badge variant="outline" className="text-xs">Adjusted</Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={entry.status === 'clocked-in' ? 'default' : 'secondary'}>
                      {entry.status === 'clocked-in' ? 'Working' : 'Complete'}
                    </Badge>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing(entry)}
                      disabled={editingEntry === entry.id}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    {entry.status === 'clocked-in' && (
                      <Button
                        size="sm"
                        onClick={() => clockOutEmployee(entry.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Clock Out
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Currently Working Sidebar */}
      <div className="w-80 bg-white border-l p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Currently Working ({currentlyWorking.length})
        </h2>
        
        <div className="space-y-3 mb-6">
          {currentlyWorking.map((entry) => (
            <div key={entry.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800">{entry.employeeName}</h3>
              <p className="text-sm text-green-600">{entry.location}</p>
              <p className="text-sm text-green-600">Since {entry.clockIn}</p>
              <Button
                size="sm"
                onClick={() => clockOutEmployee(entry.id)}
                className="mt-2 w-full bg-red-600 hover:bg-red-700"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Clock Out
              </Button>
            </div>
          ))}
          
          {currentlyWorking.length === 0 && (
            <p className="text-gray-500 text-center py-4">No employees currently clocked in</p>
          )}
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Admin Quick Actions</h3>
          <div className="space-y-2">
            <Button
              onClick={() => clockInEmployee('emp003', 'Mike Wilson')}
              className="w-full"
              variant="outline"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Clock In Employee
            </Button>
            <Button
              className="w-full"
              variant="outline"
            >
              Prepare Payroll
            </Button>
            <Button
              className="w-full"
              variant="outline"
            >
              Export Timesheets
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeClockSystem;