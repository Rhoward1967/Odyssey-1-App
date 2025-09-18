import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Edit3, Trash2, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { supabase } from '@/lib/supabase';

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  status: 'active' | 'clocked_in' | 'clocked_out';
  location?: { lat: number; lng: number };
}

interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  address: string;
  clientName: string;
  serviceType: string;
  shiftType: 'regular' | 'emergency' | 'overtime';
  priority: 'low' | 'medium' | 'high' | 'critical';
  hazardWarnings: string[];
  specialInstructions: string;
  equipmentNeeded: string[];
  contactNumber: string;
  notes: string;
}

export default function FullyEditableScheduler() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [view24Hour, setView24Hour] = useState(true);

  // Generate 24-hour time slots (30-minute intervals)
  const generate24HourSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generate24HourSlots();

  useEffect(() => {
    loadEmployees();
    loadShifts();
    // Set up real-time subscriptions for emergency updates
    const shiftsSubscription = supabase
      .channel('shifts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employee_shifts' }, 
        () => loadShifts())
      .subscribe();

    return () => {
      shiftsSubscription.unsubscribe();
    };
  }, []);

  const loadEmployees = async () => {
    const { data } = await supabase.from('employees').select('*').order('name');
    if (data) setEmployees(data);
  };

  const loadShifts = async () => {
    const { data } = await supabase.from('employee_shifts').select('*').order('date, startTime');
    if (data) setShifts(data);
  };

  const createShift = async (date: Date, startTime: string) => {
    if (!selectedEmployee) return;
    
    const endTime = timeSlots[timeSlots.indexOf(startTime) + 1] || '23:59';
    const shift = {
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      date: date.toISOString().split('T')[0],
      startTime,
      endTime,
      shiftType: 'regular' as const,
      priority: 'medium' as const,
      location: 'Field Assignment',
      notes: ''
    };

    const { data } = await supabase.from('employee_shifts').insert([shift]).select().single();
    if (data) {
      setShifts([...shifts, data]);
      setSelectedEmployee(null);
    }
  };

  const updateShift = async (shift: Shift) => {
    const { data } = await supabase.from('employee_shifts').update(shift).eq('id', shift.id).select().single();
    if (data) {
      setShifts(shifts.map(s => s.id === shift.id ? data : s));
      setEditingShift(null);
    }
  };

  const deleteShift = async (shiftId: string) => {
    await supabase.from('employee_shifts').delete().eq('id', shiftId);
    setShifts(shifts.filter(s => s.id !== shiftId));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getShiftsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter(shift => shift.date === dateStr);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Employee Sidebar with Time Clock Status */}
      <div className="w-80 bg-black/20 backdrop-blur-sm border-r border-white/10 p-4">
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 h-full">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Master Time Clock Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 overflow-y-auto">
            {employees.map(employee => (
              <div
                key={employee.id}
                onClick={() => setSelectedEmployee(employee)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedEmployee?.id === employee.id
                    ? 'bg-blue-500/30 border border-blue-400'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">{employee.name}</div>
                    <div className="text-sm text-gray-300">{employee.position}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`w-3 h-3 rounded-full ${
                      employee.status === 'clocked_in' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    {employee.location && (
                      <MapPin className="h-4 w-4 text-blue-400 mt-1" />
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {employee.status === 'clocked_in' ? 'ON DUTY' : 'OFF DUTY'}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 p-6">
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                24/7 Emergency Scheduling System
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={view24Hour ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView24Hour(!view24Hour)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  24-Hour View
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-auto">
            <div className="grid grid-cols-7 gap-1 p-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-white font-medium p-2">
                  {day}
                </div>
              ))}
              
              {getDaysInMonth(currentDate).map((day, index) => (
                <div key={index} className={`min-h-[200px] border border-white/10 rounded-lg p-1 ${
                  day ? 'bg-white/5' : ''
                }`}>
                  {day && (
                    <>
                      <div className="text-white text-sm font-medium mb-2 flex items-center justify-between">
                        {day.getDate()}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => selectedEmployee && createShift(day, '09:00')}
                          className="h-6 w-6 p-0 text-blue-400 hover:text-blue-300"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="space-y-1 max-h-[160px] overflow-y-auto">
                        {getShiftsForDate(day).map(shift => (
                          <div
                            key={shift.id}
                            className={`text-xs p-2 rounded border-l-2 ${
                              shift.priority === 'critical' ? 'bg-red-500/20 border-red-400' :
                              shift.priority === 'high' ? 'bg-orange-500/20 border-orange-400' :
                              shift.priority === 'medium' ? 'bg-yellow-500/20 border-yellow-400' :
                              'bg-green-500/20 border-green-400'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-white">{shift.employeeName}</div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingShift(shift)}
                                  className="h-4 w-4 p-0 text-blue-400"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteShift(shift.id)}
                                  className="h-4 w-4 p-0 text-red-400"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-gray-300">{shift.startTime} - {shift.endTime}</div>
                            <div className="text-gray-400">{shift.shiftType.toUpperCase()}</div>
                            {shift.notes && <div className="text-gray-400 text-[10px] mt-1">{shift.notes}</div>}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}