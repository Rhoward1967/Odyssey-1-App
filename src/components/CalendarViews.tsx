import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarViewsProps {
  currentDate: Date;
  view: 'month' | 'week' | 'day';
  onDateChange: (date: Date) => void;
  appointments: any[];
}

export const CalendarViews: React.FC<CalendarViewsProps> = ({
  currentDate,
  view,
  onDateChange,
  appointments
}) => {
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    
    onDateChange(newDate);
  };

  const getMonthView = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDateObj = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.start_time).toDateString();
        return aptDate === currentDateObj.toDateString();
      });
      
      days.push({
        date: new Date(currentDateObj),
        appointments: dayAppointments,
        isCurrentMonth: currentDateObj.getMonth() === currentDate.getMonth(),
        isToday: currentDateObj.toDateString() === new Date().toDateString()
      });
      
      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }
    
    return days;
  };

  const getWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      
      const dayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.start_time).toDateString();
        return aptDate === day.toDateString();
      });
      
      days.push({
        date: day,
        appointments: dayAppointments,
        isToday: day.toDateString() === new Date().toDateString()
      });
    }
    
    return days;
  };

  const formatHeader = () => {
    if (view === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (view === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  const renderMonthView = () => {
    const days = getMonthView();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center font-semibold text-gray-600 bg-gray-50">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div
            key={index}
            className={`p-2 min-h-[80px] border border-gray-200 ${
              day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
            } ${day.isToday ? 'bg-blue-50 border-blue-300' : ''}`}
          >
            <div className={`text-sm ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
              {day.date.getDate()}
            </div>
            <div className="mt-1 space-y-1">
              {day.appointments.slice(0, 2).map((apt, i) => (
                <div key={i} className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate">
                  {apt.title}
                </div>
              ))}
              {day.appointments.length > 2 && (
                <div className="text-xs text-gray-500">+{day.appointments.length - 2} more</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    const days = getWeekView();
    
    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div key={index} className={`p-4 border rounded-lg ${day.isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
            <div className="text-center mb-2">
              <div className="text-sm font-semibold">{day.date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="text-lg">{day.date.getDate()}</div>
            </div>
            <div className="space-y-1">
              {day.appointments.map((apt, i) => (
                <div key={i} className="text-xs p-1 bg-blue-100 text-blue-800 rounded">
                  <div className="font-medium">{apt.title}</div>
                  <div>{new Date(apt.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    const dayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.start_time).toDateString();
      return aptDate === currentDate.toDateString();
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    return (
      <div className="space-y-2">
        {dayAppointments.length > 0 ? (
          dayAppointments.map((apt, index) => (
            <div key={index} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{apt.title}</h4>
                  {apt.description && <p className="text-gray-600 text-sm mt-1">{apt.description}</p>}
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>{new Date(apt.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                  <div>to</div>
                  <div>{new Date(apt.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No appointments scheduled for this day
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{formatHeader()}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>
    </div>
  );
};