import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Clock, Play, Square, MapPin, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Employee {
  id: string;
  name: string;
  position: string;
  location?: string;
  clockedIn: boolean;
  clockInTime?: string;
  totalHours: number;
}

export default function ActiveTimeClock() {
  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', name: 'John Smith', position: 'Janitor', location: 'Building A', clockedIn: true, clockInTime: new Date(Date.now() - 3600000).toISOString(), totalHours: 8.5 },
    { id: '2', name: 'Maria Garcia', position: 'Supervisor', location: 'Building B', clockedIn: true, clockInTime: new Date(Date.now() - 7200000).toISOString(), totalHours: 7.2 },
    { id: '3', name: 'David Johnson', position: 'Maintenance', location: 'Building C', clockedIn: false, totalHours: 0 },
    { id: '4', name: 'Sarah Wilson', position: 'Janitor', location: 'Building A', clockedIn: true, clockInTime: new Date(Date.now() - 1800000).toISOString(), totalHours: 6.8 }
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  const handleClockAction = async (employeeId: string, action: 'in' | 'out') => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        if (action === 'in') {
          return { ...emp, clockedIn: true, clockInTime: new Date().toISOString() };
        } else {
          const clockInTime = new Date(emp.clockInTime || Date.now());
          const hoursWorked = (Date.now() - clockInTime.getTime()) / (1000 * 60 * 60);
          return { ...emp, clockedIn: false, totalHours: emp.totalHours + hoursWorked, clockInTime: undefined };
        }
      }
      return emp;
    }));

    // Store in Supabase
    try {
      await supabase.functions.invoke('time-clock-manager', {
        body: { employeeId, action, timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Error recording time:', error);
    }
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const activeEmployees = employees.filter(emp => emp.clockedIn);
  const totalActive = activeEmployees.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6 text-green-600" />
          Active Time Clock
        </h2>
        <div className="flex items-center gap-4">
          <Badge className="bg-green-600 text-white">
            {totalActive} Active
          </Badge>
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{totalActive}</p>
                <p className="text-sm text-gray-600">Currently Working</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Square className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{employees.length - totalActive}</p>
                <p className="text-sm text-gray-600">Off Duty</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{employees.reduce((sum, emp) => sum + emp.totalHours, 0).toFixed(1)}</p>
                <p className="text-sm text-gray-600">Total Hours Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-gray-600">Needs Attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Employees */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">Currently Clocked In</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {employee.location}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">
                    {employee.clockInTime && formatDuration(employee.clockInTime)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Started: {employee.clockInTime && new Date(employee.clockInTime).toLocaleTimeString()}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleClockAction(employee.id, 'out')}
                    className="mt-2"
                  >
                    <Square className="w-4 h-4 mr-1" />
                    Clock Out
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Employees */}
      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {employees.map((employee) => (
              <div key={employee.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                employee.clockedIn ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    employee.clockedIn ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-gray-600">{employee.position} • {employee.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-sm">
                    <p>Today: {employee.totalHours.toFixed(1)}h</p>
                    <p className="text-gray-500">
                      Status: {employee.clockedIn ? 'Active' : 'Off Duty'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={employee.clockedIn ? "outline" : "default"}
                    onClick={() => handleClockAction(employee.id, employee.clockedIn ? 'out' : 'in')}
                  >
                    {employee.clockedIn ? (
                      <>
                        <Square className="w-4 h-4 mr-1" />
                        Clock Out
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Clock In
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}