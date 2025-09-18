import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface YearlyCalendarProps {
  appointments?: any[];
  onDateSelect?: (date: Date) => void;
}

export const YearlyCalendar: React.FC<YearlyCalendarProps> = ({ 
  appointments = [], 
  onDateSelect 
}) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const today = new Date();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const hasAppointment = (date: Date) => {
    return appointments.some(apt => {
      const aptDate = new Date(apt.start_time);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const renderMonth = (monthIndex: number) => {
    const daysInMonth = getDaysInMonth(monthIndex, currentYear);
    const firstDay = getFirstDayOfMonth(monthIndex, currentYear);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-6 w-6" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, monthIndex, day);
      const hasApt = hasAppointment(date);
      const todayClass = isToday(date) ? 'bg-blue-500 text-white' : '';
      const aptClass = hasApt ? 'bg-green-100 border-green-300' : '';
      
      days.push(
        <button
          key={day}
          onClick={() => onDateSelect?.(date)}
          className={`h-6 w-6 text-xs rounded hover:bg-gray-100 border ${todayClass} ${aptClass} 
                     transition-colors duration-150`}
        >
          {day}
        </button>
      );
    }

    return (
      <Card key={monthIndex} className="p-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-center">
            {monthNames[monthIndex]}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
              <div key={day} className="text-center font-medium">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          {currentYear} Calendar
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentYear(currentYear - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold px-4">{currentYear}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentYear(currentYear + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }, (_, i) => renderMonth(i))}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span>Has Appointments</span>
        </div>
      </div>
    </div>
  );
};

export default YearlyCalendar;