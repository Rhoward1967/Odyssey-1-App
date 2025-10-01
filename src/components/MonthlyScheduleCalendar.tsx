import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Plus, UserPlus, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { supabase } from '@/lib/supabase';
import SchedulePopup from './SchedulePopup';
import AddEmployeePopup from './AddEmployeePopup';
import { useIsMobile } from '@/hooks/use-mobile';

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
}

interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  department: string;
  position: string;
  location?: string;
  notes?: string;
}

export default function MonthlyScheduleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDateForPopup, setSelectedDateForPopup] = useState<string>('');
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    loadEmployees();
    loadShifts();
  }, []);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');
      
      if (!error && data) {
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_shifts')
        .select('*')
        .order('date');
      
      if (!error && data) {
        setShifts(data);
      }
    } catch (error) {
      console.error('Error loading shifts:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const assignShift = async (date: Date, timeSlot: string) => {
    if (!selectedEmployee) return;

    const dateStr = date.toISOString().split('T')[0];
    const [startTime, endTime] = timeSlot.split('-');

    try {
      const shiftData = {
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        date: dateStr,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        department: selectedEmployee.department,
        position: selectedEmployee.position,
        status: 'scheduled'
      };

      const { data, error } = await supabase
        .from('employee_shifts')
        .insert([shiftData])
        .select()
        .single();

      if (!error && data) {
        setShifts([...shifts, data]);
        setSelectedEmployee(null);
      }
    } catch (error) {
      console.error('Error assigning shift:', error);
    }
  };

  const getShiftsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter(shift => shift.date === dateStr);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Remove automatic time slots - user will assign manually

  const days = getDaysInMonth(currentDate);

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className={`${isMobile ? 'flex flex-col' : 'flex'} h-full`}>
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm border-b border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-white" />
              <h1 className="text-white font-semibold">Schedule</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="bg-black/20 border-white/20 text-white hover:bg-white/10"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddEmployee(true)}
                className="bg-green-500/20 border-green-400/30 text-green-200 hover:bg-green-500/30"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && showMobileSidebar && (
          <div className="absolute inset-0 z-50 bg-black/50" onClick={() => setShowMobileSidebar(false)}>
            <div className="w-80 h-full bg-black/90 backdrop-blur-sm border-r border-white/10 p-4" onClick={(e) => e.stopPropagation()}>
              <Card className="bg-black/20 backdrop-blur-sm border-white/10 h-full">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Employees
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMobileSidebar(false)}
                      className="bg-gray-500/20 border-gray-400/30 text-gray-200 hover:bg-gray-500/30"
                    >
                      ×
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 overflow-y-auto">
                  {employees.map(employee => (
                    <div key={employee.id} className="space-y-2">
                      <div className="p-3 rounded-lg bg-white/5">
                        <div className="text-white font-medium">{employee.name}</div>
                        <div className="text-sm text-gray-300">{employee.position}</div>
                        <div className="text-xs text-gray-400">{employee.department}</div>
                        <Button
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setShowPopup(true);
                            setShowMobileSidebar(false);
                          }}
                          size="sm"
                          className="mt-2 w-full bg-blue-500/20 border-blue-400/30 text-blue-200 hover:bg-blue-500/30"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add to Schedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Desktop Employee Sidebar */}
        {!isMobile && (
      <div className="w-80 bg-black/20 backdrop-blur-sm border-r border-white/10 p-4">
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 h-full">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Employees
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddEmployee(true)}
                className="bg-green-500/20 border-green-400/30 text-green-200 hover:bg-green-500/30"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 overflow-y-auto">
            {employees.map(employee => (
              <div key={employee.id} className="space-y-2">
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="text-white font-medium">{employee.name}</div>
                  <div className="text-sm text-gray-300">{employee.position}</div>
                  <div className="text-xs text-gray-400">{employee.department}</div>
                  <Button
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setShowPopup(true);
                    }}
                    size="sm"
                    className="mt-2 w-full bg-blue-500/20 border-blue-400/30 text-blue-200 hover:bg-blue-500/30"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add to Schedule
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
        )}

      {/* Calendar Main Area */}
      <div className={`flex-1 ${isMobile ? 'p-3' : 'p-6'}`}>
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 h-full">
          <CardHeader className={isMobile ? 'pb-2' : ''}>
            <div className="flex items-center justify-between">
              <CardTitle className={`text-white flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
                <Calendar className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
                {isMobile ? 'Calendar' : '30-Day Schedule Calendar'}
              </CardTitle>
              <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-4'}`}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth(-1)}
                  className="bg-black/20 border-white/20 text-white hover:bg-white/10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className={`${isMobile ? 'text-sm min-w-[120px] text-center' : 'text-xl'} font-semibold text-white`}>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth(1)}
                  className="bg-black/20 border-white/20 text-white hover:bg-white/10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className={`grid grid-cols-7 gap-1 ${isMobile ? 'p-3' : 'p-4'}`}>
              {/* Day headers */}
              {dayNames.map(day => (
                <div key={day} className={`text-center text-white font-medium ${isMobile ? 'p-1 text-xs' : 'p-2'}`}>
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {days.map((day, index) => (
                <div
                  key={index}
                  className={`${isMobile ? 'min-h-[60px]' : 'min-h-[120px]'} border border-white/10 rounded-lg p-1 ${
                    day ? 'bg-white/5' : ''
                  }`}
                >
                  {day && (
                    <>
                      <div className={`text-white ${isMobile ? 'text-xs' : 'text-sm'} font-medium mb-1`}>
                        {day.getDate()}
                      </div>
                       <div className="space-y-1">
                        {(isMobile ? getShiftsForDate(day).slice(0, 1) : getShiftsForDate(day)).map(shift => (
                          <div 
                            key={shift.id} 
                            onClick={() => {
                              const employee = employees.find(emp => emp.id === shift.employeeId);
                              setSelectedEmployee(employee || null);
                              setSelectedShift(shift);
                              setSelectedDateForPopup(day.toISOString().split('T')[0]);
                              setShowPopup(true);
                            }}
                            className="text-xs p-1 rounded bg-green-500/30 text-green-200 cursor-pointer hover:bg-green-500/40"
                          >
                            <div className={`font-medium ${isMobile ? 'truncate' : ''}`}>{shift.employeeName}</div>
                            <div className={isMobile ? 'truncate' : ''}>{shift.startTime} - {shift.endTime}</div>
                          </div>
                        ))}
                        {isMobile && getShiftsForDate(day).length > 1 && (
                          <div className="text-xs text-gray-400">+{getShiftsForDate(day).length - 1} more</div>
                        )}
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

      {/* Schedule Popup */}
      {showPopup && (
        <SchedulePopup
          isOpen={showPopup}
          onClose={() => {
            setShowPopup(false);
            setSelectedShift(null);
          }}
          date={selectedDateForPopup}
          employee={selectedEmployee}
          existingShift={selectedShift}
          onSave={(data) => {
            if (selectedEmployee) {
              if (selectedShift) {
                // Update existing shift
                const updatedShiftData = {
                  startTime: data.startTime,
                  endTime: data.endTime,
                  location: data.location,
                  notes: data.notes
                };
                
                supabase
                  .from('employee_shifts')
                  .update(updatedShiftData)
                  .eq('id', selectedShift.id)
                  .select()
                  .single()
                  .then(({ data: updatedShift, error }) => {
                    if (!error && updatedShift) {
                      setShifts(shifts.map(s => s.id === selectedShift.id ? updatedShift : s));
                    }
                  });
              } else {
                // Create new shift
                const shiftData = {
                  employeeId: selectedEmployee.id,
                  employeeName: selectedEmployee.name,
                  date: selectedDateForPopup,
                  startTime: data.startTime,
                  endTime: data.endTime,
                  department: selectedEmployee.department,
                  position: selectedEmployee.position,
                  location: data.location,
                  notes: data.notes,
                  status: 'scheduled'
                };
                
                supabase
                  .from('employee_shifts')
                  .insert([shiftData])
                  .select()
                  .single()
                  .then(({ data: newShift, error }) => {
                    if (!error && newShift) {
                      setShifts([...shifts, newShift]);
                    }
                  });
              }
            }
          }}
        />
      )}

      {/* Add Employee Popup */}
      {showAddEmployee && (
        <AddEmployeePopup
          isOpen={showAddEmployee}
          onClose={() => setShowAddEmployee(false)}
          onSave={async (data) => {
            try {
              const { data: newEmployee, error } = await supabase
                .from('employees')
                .insert([data])
                .select()
                .single();
              
              if (!error && newEmployee) {
                setEmployees([...employees, newEmployee]);
              }
            } catch (error) {
              console.error('Error adding employee:', error);
            }
          }}
        />
      )}
    </div>
  );
}