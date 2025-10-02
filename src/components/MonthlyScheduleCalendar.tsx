import React, { useState, useEffect } from 'react';
import { Dialog } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { getCalendars, createCalendar, getCalendarEvents } from '@/services/calendarService';
import { CalendarEvent, Calendar as CustomCalendar } from '@/types/calendar';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Plus, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { supabase } from '@/lib/supabase';
import SchedulePopup from './SchedulePopup';
import AddEmployeePopup from './AddEmployeePopup';

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
  // All state declarations at the top, before any usage
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [showAddCalendar, setShowAddCalendar] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState('');
  const [newCalendarColor, setNewCalendarColor] = useState('#3b82f6');
  const [addingCalendar, setAddingCalendar] = useState(false);
  const [calendars, setCalendars] = useState<CustomCalendar[]>([]);
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Load events for selected calendars
  useEffect(() => {
    if (selectedCalendars.length === 0) {
      setCalendarEvents([]);
      return;
    }
    setEventsLoading(true);
    Promise.all(selectedCalendars.map(id => getCalendarEvents(id)))
      .then(results => {
        // Flatten and merge all events
        setCalendarEvents(results.flat());
      })
      .catch(e => {
        setCalendarEvents([]);
        console.error('Error loading calendar events', e);
      })
      .finally(() => setEventsLoading(false));
  }, [selectedCalendars]);

  const handleAddCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCalendarName.trim()) return;
    setAddingCalendar(true);
    try {
      const cal = await createCalendar({ name: newCalendarName, color: newCalendarColor, type: 'custom' });
      setCalendars([...calendars, cal]);
      setSelectedCalendars([...selectedCalendars, cal.id]);
      setShowAddCalendar(false);
      setNewCalendarName('');
      setNewCalendarColor('#3b82f6');
    } catch (e) {
      alert('Failed to add calendar');
    } finally {
      setAddingCalendar(false);
    }
  };

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDateForPopup, setSelectedDateForPopup] = useState<string>('');
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);


  // Place loadAllCalendars above useEffect to avoid dependency warning
  useEffect(() => {
    loadEmployees();
    loadShifts();
    loadAllCalendars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAllCalendars = async () => {
    setCalendarLoading(true);
    try {
      const cals = await getCalendars();
      setCalendars(cals);
      // Auto-select first calendar if none selected
      if (cals.length && selectedCalendars.length === 0) {
        setSelectedCalendars([cals[0].id]);
      }
    } catch (e) {
      console.error('Error loading calendars', e);
    } finally {
      setCalendarLoading(false);
    }
  };

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

  // Combine legacy shifts and new calendar events for now, tagging type
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    // Calendar events (from selected calendars)
    const events = calendarEvents.filter(ev => ev.start.split('T')[0] === dateStr).map(ev => ({ ...ev, _type: 'calendar' as const }));
    // Legacy shifts (for backward compatibility)
    const legacy = shifts.filter(shift => shift.date === dateStr).map(shift => ({ ...shift, _type: 'shift' as const }));
    return [...events, ...legacy];
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

  // Calendar selection UI (simple dropdown for now)
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Calendar Selection */}
      <div className="w-full md:w-80 bg-black/30 border-b md:border-b-0 md:border-r border-white/10 p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-white font-semibold">Select Calendars</label>
            <button
              className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setShowAddCalendar(true)}
              type="button"
            >
              + Add New
            </button>
          </div>
          <select
            multiple
            className="w-full rounded p-2 bg-slate-800 text-white border border-white/20"
            value={selectedCalendars}
            onChange={e => {
              const options = Array.from(e.target.selectedOptions).map(o => o.value);
              setSelectedCalendars(options);
            }}
            disabled={calendarLoading}
          >
            {calendars.map(cal => (
              <option key={cal.id} value={cal.id} style={{ color: cal.color || undefined }}>
                {cal.name}
              </option>
            ))}
          </select>
          {calendarLoading && <div className="text-xs text-gray-300 mt-1">Loading calendars...</div>}
        </div>

        {/* Add Calendar Modal */}
        <Dialog open={showAddCalendar} onOpenChange={setShowAddCalendar}>
          <form onSubmit={handleAddCalendar} className="bg-white p-6 rounded shadow max-w-xs mx-auto">
            <h2 className="font-bold mb-4">Add New Calendar</h2>
            <div className="mb-3">
              <Label htmlFor="calendar-name">Name</Label>
              <Input
                id="calendar-name"
                value={newCalendarName}
                onChange={e => setNewCalendarName(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div className="mb-3">
              <Label htmlFor="calendar-color">Color</Label>
              <Input
                id="calendar-color"
                type="color"
                value={newCalendarColor}
                onChange={e => setNewCalendarColor(e.target.value)}
                className="w-12 h-8 p-0 border-none bg-transparent"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                className="flex-1 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowAddCalendar(false)}
                disabled={addingCalendar}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                disabled={addingCalendar}
              >
                {addingCalendar ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        </Dialog>
      </div>
      {/* Employee Sidebar */}
      <div className="w-full md:w-80 bg-black/20 backdrop-blur-sm border-b md:border-b-0 md:border-r border-white/10 p-4">
  <Card className="bg-transparent backdrop-blur-sm border-white/10 h-full">
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

      {/* Calendar Main Area */}
      <div className="flex-1 p-6">
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                30-Day Schedule Calendar
              </CardTitle>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth(-1)}
                  className="bg-black/20 border-white/20 text-white hover:bg-white/10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold text-white">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
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
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 p-2 sm:p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-lg">
              {/* Day headers */}
              {dayNames.map(day => (
                <div key={day} className="text-center text-white font-medium p-2">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {days.map((day, index) => (
                <div
                  key={index}
                  className={`aspect-square border border-white/10 rounded-lg p-1 flex flex-col ${
                    day ? 'bg-white/5' : ''
                  }`}
                >
                  {day && (
                    <>
                      <div className="text-white text-sm font-medium mb-1">
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {eventsLoading ? (
                          <div className="text-xs text-gray-400">Loading...</div>
                        ) : getEventsForDate(day).length === 0 ? null : (
                          getEventsForDate(day).map(ev => {
                            if (ev._type === 'calendar') {
                              return (
                                <div
                                  key={ev.id}
                                  className="text-xs p-1 rounded bg-blue-500/30 text-blue-100 cursor-pointer hover:bg-blue-500/40"
                                >
                                  <div className="font-medium">{ev.title}</div>
                                  <div>
                                    {new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(ev.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              );
                            } else {
                              // shift
                              return (
                                <div
                                  key={ev.id}
                                  className="text-xs p-1 rounded bg-green-500/30 text-green-200 cursor-pointer hover:bg-green-500/40"
                                >
                                  <div className="font-medium">{ev.employeeName}</div>
                                  <div>{ev.startTime} - {ev.endTime}</div>
                                </div>
                              );
                            }
                          })
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