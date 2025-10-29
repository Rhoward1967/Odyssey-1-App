import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Clock, MapPin, Play, Square, Users, Edit, AlertTriangle, CheckCircle } from 'lucide-react';
import { getEmployees, getTimeEntries, clockIn, clockOut, correctEmployeeTime, type Employee, type TimeEntry } from '@/lib/supabase/hr-actions';

export default function TimeTrackingSystem() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [editForm, setEditForm] = useState({
    clock_in: '',
    clock_out: '',
    reason: ''
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [employeesResult, timeEntriesResult] = await Promise.all([
        getEmployees(),
        getTimeEntries()
      ]);

      if (employeesResult.success && employeesResult.employees) {
        setEmployees(employeesResult.employees);
      }
      
      if (timeEntriesResult.success && timeEntriesResult.entries) {
        setTimeEntries(timeEntriesResult.entries);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async (employeeId: string) => {
    setLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = `${position.coords.latitude}, ${position.coords.longitude}`;
          const result = await clockIn(employeeId, location);
          
          if (result.success) {
            await loadData();
          } else {
            alert(result.error || 'Failed to clock in');
          }
          setLoading(false);
        },
        async () => {
          const result = await clockIn(employeeId, 'Location unavailable');
          if (result.success) {
            await loadData();
          } else {
            alert(result.error || 'Failed to clock in');
          }
          setLoading(false);
        }
      );
    }
  };

  const handleClockOut = async (employeeId: string) => {
    setLoading(true);
    const result = await clockOut(employeeId);
    
    if (result.success) {
      await loadData();
    } else {
      alert(result.error || 'Failed to clock out');
    }
    setLoading(false);
  };

  const openEditDialog = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setEditForm({
      clock_in: new Date(entry.clock_in).toISOString().slice(0, 16),
      clock_out: entry.clock_out ? new Date(entry.clock_out).toISOString().slice(0, 16) : '',
      reason: ''
    });
  };

  const handleTimeEdit = async () => {
    if (!editingEntry) return;
    
    setLoading(true);
    try {
      const correction = {
        employee_id: editingEntry.employee_id,
        original_entry_id: editingEntry.id!,
        new_clock_in: editForm.clock_in,
        new_clock_out: editForm.clock_out || undefined,
        correction_reason: editForm.reason
      };

      const result = await correctEmployeeTime(correction);
      
      if (result.success) {
        alert('Time corrected successfully!');
        setEditingEntry(null);
        await loadData();
      } else {
        alert(result.error || 'Failed to correct time');
      }
    } catch (error) {
      console.error('Time correction error:', error);
      alert('Failed to correct time');
    } finally {
      setLoading(false);
    }
  };

  // Get active time entries for sidebar
  const activeEmployees = timeEntries.filter(entry => entry.status === 'active');
  const getEmployeeName = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    return emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown Employee';
  };

  const getElapsedTime = (clockInTime: string) => {
    const diff = currentTime.getTime() - new Date(clockInTime).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Time Tracking & Management</h1>
        <div className="text-right">
          <p className="text-sm text-gray-600">Current Time</p>
          <p className="text-xl font-mono">{currentTime.toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Time Clock Interface */}
        <div className="lg:col-span-3 space-y-6">
          {/* Employee Quick Clock In/Out */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Employee Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {employees.map((employee) => {
                  const activeEntry = activeEmployees.find(entry => entry.employee_id === employee.id);
                  const isActive = !!activeEntry;
                  
                  return (
                    <div key={employee.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{employee.first_name} {employee.last_name}</h3>
                          <p className="text-sm text-gray-600">{employee.position}</p>
                        </div>
                        <Badge variant={isActive ? 'default' : 'secondary'}>
                          {isActive ? 'ACTIVE' : 'OFF'}
                        </Badge>
                      </div>
                      
                      {isActive && activeEntry && (
                        <div className="mb-3 p-2 bg-green-50 rounded">
                          <p className="text-sm font-mono text-green-700">
                            {getElapsedTime(activeEntry.clock_in)}
                          </p>
                          <p className="text-xs text-gray-600">
                            Started: {new Date(activeEntry.clock_in).toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        {!isActive ? (
                          <Button 
                            size="sm" 
                            onClick={() => handleClockIn(employee.id)}
                            disabled={loading}
                            className="flex-1"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Clock In
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleClockOut(employee.id)}
                            disabled={loading}
                            className="flex-1"
                          >
                            <Square className="w-4 h-4 mr-1" />
                            Clock Out
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Time Entries with Edit Capability */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Time Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timeEntries.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        entry.status === 'active' ? 'bg-green-500' :
                        entry.status === 'pending' ? 'bg-orange-500' :
                        entry.status === 'approved' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{getEmployeeName(entry.employee_id)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(entry.clock_in).toLocaleString()}
                          {entry.clock_out && ` - ${new Date(entry.clock_out).toLocaleString()}`}
                        </p>
                        {entry.total_hours && (
                          <p className="text-xs text-gray-500">{entry.total_hours} hours</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        entry.status === 'active' ? 'default' :
                        entry.status === 'pending' ? 'secondary' :
                        entry.status === 'approved' ? 'default' : 'outline'
                      }>
                        {entry.status.toUpperCase()}
                      </Badge>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openEditDialog(entry)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-orange-500" />
                              Edit Time Entry - {getEmployeeName(entry.employee_id)}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="bg-orange-50 p-3 rounded-lg">
                              <p className="text-sm text-orange-800">
                                <strong>Manager Override:</strong> This action will create an audit trail 
                                and flag the original entry as corrected.
                              </p>
                            </div>
                            
                            <div>
                              <Label htmlFor="clock_in">Clock In Time</Label>
                              <Input
                                id="clock_in"
                                type="datetime-local"
                                value={editForm.clock_in}
                                onChange={(e) => setEditForm(prev => ({ ...prev, clock_in: e.target.value }))}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="clock_out">Clock Out Time</Label>
                              <Input
                                id="clock_out"
                                type="datetime-local"
                                value={editForm.clock_out}
                                onChange={(e) => setEditForm(prev => ({ ...prev, clock_out: e.target.value }))}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="reason">Correction Reason *</Label>
                              <Input
                                id="reason"
                                value={editForm.reason}
                                onChange={(e) => setEditForm(prev => ({ ...prev, reason: e.target.value }))}
                                placeholder="e.g., System malfunction, forgot to clock out"
                                required
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                onClick={handleTimeEdit}
                                disabled={loading || !editForm.reason}
                                className="flex-1"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {loading ? 'Correcting...' : 'Apply Correction'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Employee Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Currently Active
                <Badge variant="secondary">{activeEmployees.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeEmployees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No employees clocked in</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeEmployees.map((entry) => (
                    <div key={entry.id} className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{getEmployeeName(entry.employee_id)}</h4>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">
                          Started: {new Date(entry.clock_in).toLocaleTimeString()}
                        </p>
                        <p className="text-sm font-mono text-green-700">
                          {getElapsedTime(entry.clock_in)}
                        </p>
                        {entry.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            GPS Verified
                          </div>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleClockOut(entry.employee_id)}
                        disabled={loading}
                        className="w-full mt-2"
                      >
                        <Square className="w-3 h-3 mr-1" />
                        Clock Out
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}