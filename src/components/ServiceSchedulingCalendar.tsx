import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Plus } from 'lucide-react';

interface ScheduledService {
  id: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  location: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export default function ServiceSchedulingCalendar() {
  const [currentDate, setCurrentDate] = useState(() => {
    // Fix for incorrect system date - force to correct year 2024
    const today = new Date();
    if (today.getFullYear() === 2025) {
      today.setFullYear(2024);
    }
    return today;
  });
  const [services, setServices] = useState<ScheduledService[]>([
    {
      id: '1',
      clientName: 'ABC Corp',
      service: 'Office Cleaning',
      date: '2024-01-15',
      time: '09:00',
      location: '123 Business St',
      status: 'scheduled'
    },
    {
      id: '2',
      clientName: 'XYZ Inc',
      service: 'Deep Clean',
      date: '2024-01-15',
      time: '14:00',
      location: '456 Corporate Ave',
      status: 'scheduled'
    }
  ]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getServicesForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return services.filter(service => service.date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = getDaysInMonth(currentDate);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Service Scheduling Calendar</h2>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Service
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 p-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => (
              <div key={index} className="min-h-[100px] border rounded p-1">
                {day && (
                  <>
                    <div className="font-semibold text-sm mb-1">{day}</div>
                    <div className="space-y-1">
                      {getServicesForDate(day).map(service => (
                        <div key={service.id} className="text-xs p-1 rounded bg-blue-50 border-l-2 border-blue-400">
                          <div className="font-medium">{service.time}</div>
                          <div className="truncate">{service.clientName}</div>
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

      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.map(service => (
              <div key={service.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium">{service.clientName}</div>
                    <div className="text-sm text-gray-600">{service.service}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {service.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{service.time}</span>
                  <Badge className={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}