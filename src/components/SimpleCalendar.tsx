import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Appointment {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
}

export function SimpleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time');

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`p-1 md:p-2 text-xs md:text-sm rounded hover:bg-blue-100 transition-colors min-h-[32px] md:min-h-[40px] ${
            isSelected ? 'bg-blue-500 text-white' : 
            isToday ? 'bg-blue-100 text-blue-600 font-semibold' : 
            'text-gray-700'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span className="text-lg md:text-xl">Calendar</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold text-sm md:text-base min-w-0 text-center">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <div className="grid grid-cols-7 gap-1 mb-2 md:mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-1 md:p-2 text-center text-xs md:text-sm font-semibold text-gray-500">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-sm md:text-base">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            <Badge variant="secondary" className="self-start md:self-center">
              {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          {loading ? (
            <div className="text-center py-6 md:py-8 text-gray-500">Loading...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-6 md:py-8 text-gray-500">
              <div className="text-sm md:text-base">No appointments scheduled</div>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-sm md:text-base">{appointment.title}</h3>
                  <div className="flex items-center gap-1 md:gap-2 mt-1 text-xs md:text-sm text-gray-600">
                    <Clock className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                    <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {appointment.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SimpleCalendar;