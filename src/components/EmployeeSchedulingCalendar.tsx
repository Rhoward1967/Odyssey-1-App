import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Edit } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SchedulePopup from './SchedulePopup';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  employmentStatus: string;
}

interface Schedule {
  id: string;
  employee: string;
  shiftStartTime: string;
  shiftEndTime: string;
  location?: string;
  notes?: string;
}

interface ScheduleData {
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
}

export default function EmployeeSchedulingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [editingShift, setEditingShift] = useState<Schedule | null>(null);

  useEffect(() => {
    fetchEmployees();
    fetchSchedules();
  }, [currentDate]);

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('employmentStatus', 'Active');
    
    if (data) setEmployees(data);
  };

  const fetchSchedules = async () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const { data, error } = await supabase
      .from('Schedules')
      .select('*')
      .gte('shiftStartTime', startOfMonth.toISOString())
      .lte('shiftStartTime', endOfMonth.toISOString());
    
    if (data) setSchedules(data);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const handleEmployeeClick = (employee: Employee, date?: Date) => {
    setSelectedEmployee(employee);
    if (date) {
      setSelectedDate(date);
      setEditingShift(null);
      setShowPopup(true);
    }
  };

  const handleDayClick = (day: number) => {
    if (selectedEmployee) {
      const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      setSelectedDate(clickedDate);
      setEditingShift(null);
      setShowPopup(true);
    }
  };

  const handleShiftEdit = (shift: Schedule) => {
    const employee = employees.find(emp => emp.id === shift.employee);
    if (employee) {
      setSelectedEmployee(employee);
      setEditingShift(shift);
      setSelectedDate(new Date(shift.shiftStartTime));
      setShowPopup(true);
    }
  };

  const handleSaveSchedule = async (data: ScheduleData) => {
    if (!selectedEmployee || !selectedDate) return;

    const shiftDate = new Date(selectedDate);
    const [startHour, startMinute] = data.startTime.split(':');
    const [endHour, endMinute] = data.endTime.split(':');
    
    const shiftStart = new Date(shiftDate);
    shiftStart.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
    
    const shiftEnd = new Date(shiftDate);
    shiftEnd.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

    if (editingShift) {
      // Update existing shift
      const { error } = await supabase
        .from('Schedules')
        .update({
          shiftStartTime: shiftStart.toISOString(),
          shiftEndTime: shiftEnd.toISOString(),
          location: data.location,
          notes: data.notes
        })
        .eq('id', editingShift.id);

      if (!error) {
        fetchSchedules();
        setShowPopup(false);
        setEditingShift(null);
      }
    } else {
      // Create new shift
      const { error } = await supabase
        .from('Schedules')
        .insert({
          employee: selectedEmployee.id,
          shiftStartTime: shiftStart.toISOString(),
          shiftEndTime: shiftEnd.toISOString(),
          location: data.location,
          notes: data.notes
        });

      if (!error) {
        fetchSchedules();
        setShowPopup(false);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Employee Sidebar */}
      <div className="w-80 bg-white shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Available Employees</h3>
        <div className="space-y-2">
          {employees.map(employee => (
            <div
              key={employee.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedEmployee?.id === employee.id
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div 
                onClick={() => setSelectedEmployee(employee)}
                className="font-medium"
              >
                {employee.firstName} {employee.lastName}
              </div>
              <div className="text-sm text-gray-600 mb-2">{employee.position}</div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEmployeeClick(employee)}
                className="w-full text-xs"
                disabled={!selectedEmployee || selectedEmployee.id !== employee.id}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add to Schedule
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar View */}
      <div className="flex-1 p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {selectedEmployee && (
              <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                Selected: {selectedEmployee.firstName} {selectedEmployee.lastName} - Click on a day to schedule
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center font-semibold text-gray-600">
                  {day}
                </div>
              ))}
              
              {getDaysInMonth().map(day => (
                <div 
                  key={day} 
                  className={`border rounded-lg p-2 min-h-[120px] bg-white cursor-pointer hover:bg-gray-50 ${
                    selectedEmployee ? 'border-blue-300' : 'border-gray-200'
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="font-semibold text-sm mb-2">{day}</div>
                  
                  {/* Assigned employees */}
                  <div className="space-y-1">
                    {schedules
                      .filter(schedule => {
                        const scheduleDate = new Date(schedule.shiftStartTime);
                        return scheduleDate.getDate() === day;
                      })
                      .map(schedule => {
                        const employee = employees.find(emp => emp.id === schedule.employee);
                        const startTime = new Date(schedule.shiftStartTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        });
                        const endTime = new Date(schedule.shiftEndTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        });
                        return (
                          <div 
                            key={schedule.id} 
                            className="text-xs bg-blue-200 p-1 rounded cursor-pointer hover:bg-blue-300 flex items-center justify-between"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShiftEdit(schedule);
                            }}
                          >
                            <span>{employee?.firstName} {startTime}-{endTime}</span>
                            <Edit className="h-3 w-3" />
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Popup */}
      {showPopup && selectedEmployee && selectedDate && (
        <SchedulePopup
          isOpen={showPopup}
          onClose={() => {
            setShowPopup(false);
            setEditingShift(null);
          }}
          date={selectedDate.toLocaleDateString()}
          employee={{
            id: selectedEmployee.id,
            name: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
            position: selectedEmployee.position,
            department: ''
          }}
          existingShift={editingShift ? {
            id: editingShift.id,
            startTime: new Date(editingShift.shiftStartTime).toTimeString().slice(0, 5),
            endTime: new Date(editingShift.shiftEndTime).toTimeString().slice(0, 5),
            location: editingShift.location || '',
            notes: editingShift.notes || ''
          } : null}
          onSave={handleSaveSchedule}
        />
      )}
    </div>
  );
}