import React from 'react';
import { Button } from './ui/button';
import { Plus, Edit } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  position: string;
  team?: string;
  color: string;
}

interface Schedule {
  id: string;
  employee_id: string;
  date: string;
  jobsite: string;
  team: string;
  hours: number;
  start_time: string;
  end_time: string;
  employee?: Employee;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  schedules: Schedule[];
}

interface CalendarGridProps {
  days: CalendarDay[];
  employees: Employee[];
  onScheduleClick: (schedule: Schedule) => void;
  onDayClick: (date: Date) => void;
  viewMode: 'monthly' | 'weekly' | 'biweekly';
}

const TEAM_COLORS = {
  'Team A': 'bg-blue-100 border-blue-300 text-blue-800',
  'Team B': 'bg-green-100 border-green-300 text-green-800',
  'Team C': 'bg-purple-100 border-purple-300 text-purple-800',
  'Team D': 'bg-orange-100 border-orange-300 text-orange-800',
  'Unassigned': 'bg-gray-100 border-gray-300 text-gray-800'
};

export default function CalendarGrid({ 
  days, 
  employees, 
  onScheduleClick, 
  onDayClick, 
  viewMode 
}: CalendarGridProps) {
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unknown';
  };

  const getTeamColor = (team: string) => {
    return TEAM_COLORS[team as keyof typeof TEAM_COLORS] || TEAM_COLORS['Unassigned'];
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="grid grid-cols-7 gap-1 bg-gray-100 p-4 rounded-lg">
      {/* Header */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="p-3 text-center font-semibold text-gray-700 bg-white rounded">
          {day}
        </div>
      ))}
      
      {/* Calendar Days */}
      {days.map((day, index) => (
        <div
          key={index}
          className={`min-h-32 p-2 bg-white rounded border hover:bg-gray-50 cursor-pointer transition-colors ${
            !day.isCurrentMonth ? 'opacity-50' : ''
          } ${day.date.toDateString() === new Date().toDateString() ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => onDayClick(day.date)}
        >
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${
              day.date.toDateString() === new Date().toDateString() 
                ? 'text-blue-600' 
                : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
            }`}>
              {day.date.getDate()}
            </span>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onDayClick(day.date);
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {day.schedules.slice(0, 3).map((schedule) => (
              <div
                key={schedule.id}
                className={`text-xs p-1 rounded border cursor-pointer hover:shadow-sm ${getTeamColor(schedule.team)}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onScheduleClick(schedule);
                }}
              >
                <div className="font-medium truncate">
                  {getEmployeeName(schedule.employee_id)}
                </div>
                <div className="truncate opacity-75">
                  {schedule.jobsite}
                </div>
                <div className="flex justify-between items-center">
                  <span>{schedule.hours}h</span>
                  <span>{formatTime(schedule.start_time)}</span>
                </div>
              </div>
            ))}
            
            {day.schedules.length > 3 && (
              <div className="text-xs text-gray-500 text-center py-1">
                +{day.schedules.length - 3} more
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}