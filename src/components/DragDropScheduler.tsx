import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Users, GripVertical } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: string;
  team: string;
  color: string;
}

interface ScheduleEvent {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  jobsite: string;
  team: string;
  hours: number;
}

const DragDropScheduler: React.FC = () => {
  const [employees] = useState<Employee[]>([
    { id: '1', name: 'John Smith', role: 'Supervisor', team: 'Team A', color: 'bg-blue-500' },
    { id: '2', name: 'Sarah Johnson', role: 'Cleaner', team: 'Team A', color: 'bg-green-500' },
    { id: '3', name: 'Mike Davis', role: 'Cleaner', team: 'Team B', color: 'bg-purple-500' },
    { id: '4', name: 'Lisa Wilson', role: 'Supervisor', team: 'Team B', color: 'bg-orange-500' }
  ]);

  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [draggedEmployee, setDraggedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [jobsite, setJobsite] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (employee: Employee) => {
    setDraggedEmployee(employee);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    if (draggedEmployee && jobsite) {
      const hours = calculateHours(startTime, endTime);
      const newEvent: ScheduleEvent = {
        id: Date.now().toString(),
        employeeId: draggedEmployee.id,
        date,
        startTime,
        endTime,
        jobsite,
        team: draggedEmployee.team,
        hours
      };
      setScheduleEvents([...scheduleEvents, newEvent]);
      setDraggedEmployee(null);
    }
  };

  const calculateHours = (start: string, end: string): number => {
    const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
    const endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);
    return (endMinutes - startMinutes) / 60;
  };

  const getDaysInMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      return date.toISOString().split('T')[0];
    });
  };

  const getEventsForDate = (date: string) => {
    return scheduleEvents.filter(event => event.date === date);
  };

  const removeEvent = (eventId: string) => {
    setScheduleEvents(scheduleEvents.filter(event => event.id !== eventId));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Drag & Drop Scheduler</h2>
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Jobsite"
            value={jobsite}
            onChange={(e) => setJobsite(e.target.value)}
            className="w-40"
          />
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-32"
          />
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-32"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Employee Sidebar */}
        <div className="col-span-3">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Available Employees</h3>
              <div className="space-y-2">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    draggable
                    onDragStart={() => handleDragStart(employee)}
                    className="p-3 border rounded-lg cursor-move hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <div className={`w-3 h-3 rounded-full ${employee.color}`} />
                      <div>
                        <div className="font-medium text-sm">{employee.name}</div>
                        <div className="text-xs text-gray-500">{employee.role} - {employee.team}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Grid */}
        <div className="col-span-9">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 font-semibold text-center bg-gray-100 rounded">
                    {day}
                  </div>
                ))}
                
                {getDaysInMonth().map((date) => {
                  const dayEvents = getEventsForDate(date);
                  const dayNumber = new Date(date).getDate();
                  
                  return (
                    <div
                      key={date}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, date)}
                      className="min-h-32 p-2 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-sm mb-2">{dayNumber}</div>
                      <div className="space-y-1">
                        {dayEvents.map((event) => {
                          const employee = employees.find(emp => emp.id === event.employeeId);
                          return (
                            <div
                              key={event.id}
                              className={`p-1 rounded text-xs text-white ${employee?.color} cursor-pointer`}
                              onClick={() => removeEvent(event.id)}
                            >
                              <div className="font-medium">{employee?.name}</div>
                              <div className="flex items-center gap-1 text-xs">
                                <Clock className="w-3 h-3" />
                                {event.hours}h
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <MapPin className="w-3 h-3" />
                                {event.jobsite}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DragDropScheduler;