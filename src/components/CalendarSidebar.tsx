import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface CalendarSidebarProps {
  onDateSelect?: (date: Date) => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({ onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

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

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const days = getDaysInMonth(currentDate);
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();

  return (
    <div className='h-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4'>
      <div className='mb-4'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='font-semibold flex items-center gap-2'>
            <Calendar className='w-4 h-4' />
            30-Day Calendar
          </h3>
        </div>

        <div className='flex items-center justify-between mb-3'>
          <Button variant='ghost' size='sm' onClick={() => navigateMonth(-1)}>
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <span className='text-sm font-medium'>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <Button variant='ghost' size='sm' onClick={() => navigateMonth(1)}>
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>

        <div className='grid grid-cols-7 gap-1'>
          {/* Day headers */}
          {dayNames.map(day => (
            <div
              key={day}
              className='text-center text-xs font-medium text-gray-500 p-1'
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((day, index) => {
            const isToday =
              day &&
              day.getDate() === today.getDate() &&
              day.getMonth() === today.getMonth() &&
              day.getFullYear() === today.getFullYear();

            const isSelected =
              day &&
              selectedDate &&
              day.getDate() === selectedDate.getDate() &&
              day.getMonth() === selectedDate.getMonth() &&
              day.getFullYear() === selectedDate.getFullYear();

            return (
              <div
                key={index}
                className={`
                  aspect-square flex items-center justify-center text-sm rounded cursor-pointer
                  ${!day ? '' : 'hover:bg-gray-100'}
                  ${isToday ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                  ${isSelected && !isToday ? 'bg-gray-200' : ''}
                `}
                onClick={() => day && handleDateClick(day)}
              >
                {day?.getDate()}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className='mt-6 space-y-2'>
        <div className='text-sm font-medium mb-2'>Today's Schedule</div>
        <div className='space-y-1'>
          <div className='flex justify-between text-xs'>
            <span>Active Jobs</span>
            <Badge variant='default' className='h-5'>
              12
            </Badge>
          </div>
          <div className='flex justify-between text-xs'>
            <span>Employees On Duty</span>
            <Badge variant='secondary' className='h-5'>
              8
            </Badge>
          </div>
          <div className='flex justify-between text-xs'>
            <span>Emergency Calls</span>
            <Badge variant='destructive' className='h-5'>
              2
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarSidebar;
