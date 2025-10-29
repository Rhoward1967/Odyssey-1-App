import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { clockIn, clockOut, correctEmployeeTime, getEmployees, getTimeEntries, type Employee, type TimeEntry } from '@/lib/supabase/hr-actions';
import { AlertTriangle, Edit, Play, Shield, Square } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminTimeOverride() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    action: '',
    clock_in: '',
    clock_out: '',
    reason: ''
  });

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

  const getEmployeeStatus = (employeeId: string) => {
    const activeEntry = timeEntries.find(entry => 
      entry.employee_id === employeeId && entry.status === 'active'
    );
    return activeEntry ? 'CLOCKED_IN' : 'CLOCKED_OUT';
  };

  const getActiveEntry = (employeeId: string) => {
    return timeEntries.find(entry => 
      entry.employee_id === employeeId && entry.status === 'active'
    );
  };

  const handleAdminClockIn = async (employeeId: string) => {
    setLoading(true);
    try {
      const result = await clockIn(employeeId, 'Admin Override - Manual Clock In');
      if (result.success) {
        await loadData();
        alert('Employee clocked in successfully by admin');
      } else {
        alert(result.error || 'Failed to clock in employee');
      }
    } catch (error) {
      alert('Failed to clock in employee');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminClockOut = async (employeeId: string) => {
    setLoading(true);
    try {
      const result = await clockOut(employeeId);
      if (result.success) {
        await loadData();
        alert('Employee clocked out successfully by admin');
      } else {
        alert(result.error || 'Failed to clock out employee');
      }
    } catch (error) {
      alert('Failed to clock out employee');
    } finally {
      setLoading(false);
    }
  };

  const openTimeOverride = (employeeId: string, action: 'clock_in' | 'clock_out' | 'edit') => {
    const employee = employees.find(e => e.id === employeeId);
    const activeEntry = getActiveEntry(employeeId);
    
    setSelectedEmployee(employeeId);
    setOverrideForm({
      action,
      clock_in: activeEntry ? new Date(activeEntry.clock_in).toISOString().slice(0, 16) : 
                 new Date().toISOString().slice(0, 16),
      clock_out: activeEntry?.clock_out ? new Date(activeEntry.clock_out).toISOString().slice(0, 16) : 
                 new Date().toISOString().slice(0, 16),
      reason: ''
    });
    setShowOverride(true);
  };

  const handleTimeOverride = async () => {
    if (!selectedEmployee || !overrideForm.reason) return;
    
    setLoading(true);
    try {
      const activeEntry = getActiveEntry(selectedEmployee);
      
      if (overrideForm.action === 'edit' && activeEntry) {
        // Edit existing time entry
        const correction = {
          employee_id: selectedEmployee,
          original_entry_id: activeEntry.id!,
          new_clock_in: overrideForm.clock_in,
          new_clock_out: overrideForm.clock_out,
          correction_reason: `Admin Override: ${overrideForm.reason}`
        };

        const result = await correctEmployeeTime(correction);
        if (result.success) {
          alert('Time entry corrected successfully');
        } else {
          alert(result.error || 'Failed to correct time');
        }
      } else if (overrideForm.action === 'clock_in') {
        // Manual clock in with custom time
        const result = await clockIn(selectedEmployee, `Admin Override: ${overrideForm.reason}`);
        if (result.success) {
          alert('Employee manually clocked in');
        } else {
          alert(result.error || 'Failed to clock in');
        }
      } else if (overrideForm.action === 'clock_out') {
        // Manual clock out
        const result = await clockOut(selectedEmployee);
        if (result.success) {
          alert('Employee manually clocked out');
        } else {
          alert(result.error || 'Failed to clock out');
        }
      }
      
      setShowOverride(false);
      await loadData();
    } catch (error) {
      alert('Time override failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-500" />
          Admin Time Management Override
        </CardTitle>
        <div className="bg-orange-50 p-3 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>Supervisor/Admin Only:</strong> Use these controls to manually clock employees 
            in/out or correct time entries when system errors occur.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Employee List with Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {employees.map((employee) => {
              const status = getEmployeeStatus(employee.id);
              const activeEntry = getActiveEntry(employee.id);
              
              return (
                <div key={employee.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{employee.first_name} {employee.last_name}</h3>
                      <p className="text-sm text-gray-600">{employee.position}</p>
                    </div>
                    <Badge variant={status === 'CLOCKED_IN' ? 'default' : 'secondary'}>
                      {status === 'CLOCKED_IN' ? 'ACTIVE' : 'OFF'}
                    </Badge>
                  </div>
                  
                  {status === 'CLOCKED_IN' && activeEntry && (
                    <div className="mb-3 p-2 bg-green-50 rounded">
                      <p className="text-xs text-gray-600">
                        Started: {new Date(activeEntry.clock_in).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Location: {activeEntry.location || 'Unknown'}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {/* Quick Clock Actions */}
                    <div className="flex gap-2">
                      {status === 'CLOCKED_OUT' ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleAdminClockIn(employee.id)}
                          disabled={loading}
                          className="flex-1"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Clock In
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleAdminClockOut(employee.id)}
                          disabled={loading}
                          className="flex-1"
                        >
                          <Square className="w-3 h-3 mr-1" />
                          Clock Out
                        </Button>
                      )}
                    </div>
                    
                    {/* Advanced Override Button */}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openTimeOverride(employee.id, 'edit')}
                      className="w-full"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Time Override
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Override Dialog */}
          <Dialog open={showOverride} onOpenChange={setShowOverride}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Admin Time Override
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Warning:</strong> This action will create an audit trail and override 
                    normal time tracking procedures. Use only for system errors or emergencies.
                  </p>
                </div>
                
                <div>
                  <Label>Override Action</Label>
                  <Select 
                    value={overrideForm.action} 
                    onValueChange={(value) => setOverrideForm(prev => ({ ...prev, action: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clock_in">Manual Clock In</SelectItem>
                      <SelectItem value="clock_out">Manual Clock Out</SelectItem>
                      <SelectItem value="edit">Edit Existing Times</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {overrideForm.action === 'edit' && (
                  <>
                    <div>
                      <Label htmlFor="clock_in">Clock In Time</Label>
                      <Input
                        id="clock_in"
                        type="datetime-local"
                        value={overrideForm.clock_in}
                        onChange={(e) => setOverrideForm(prev => ({ ...prev, clock_in: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="clock_out">Clock Out Time</Label>
                      <Input
                        id="clock_out"
                        type="datetime-local"
                        value={overrideForm.clock_out}
                        onChange={(e) => setOverrideForm(prev => ({ ...prev, clock_out: e.target.value }))}
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <Label htmlFor="reason">Override Reason *</Label>
                  <Input
                    id="reason"
                    value={overrideForm.reason}
                    onChange={(e) => setOverrideForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="e.g., System malfunction, forgot to clock out, emergency"
                    required
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleTimeOverride}
                    disabled={loading || !overrideForm.reason || !overrideForm.action}
                    className="flex-1"
                  >
                    {loading ? 'Processing...' : 'Apply Override'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowOverride(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
