import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, CalendarDays } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Appointment {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  status: string;
}

interface CalendarViewProps {
  onNewAppointment?: () => void;
}

export function CalendarView({ onNewAppointment }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // Fix for incorrect system date - force to correct year 2024
    const today = new Date();
    if (today.getFullYear() === 2025) {
      today.setFullYear(2024);
    }
    return today;
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [weeklyAppointments, setWeeklyAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    fetchAppointments();
    fetchWeeklyAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
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

  const fetchWeeklyAppointments = async () => {
    try {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('start_time', startOfWeek.toISOString())
        .lte('start_time', endOfWeek.toISOString())
        .order('start_time');

      if (error) throw error;
      setWeeklyAppointments(data || []);
    } catch (error) {
      console.error('Error fetching weekly appointments:', error);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (activeView === 'day') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (activeView === 'week') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return weeklyAppointments.filter(apt => 
      new Date(apt.start_time).toDateString() === dateStr
    );
  };

  const today = new Date();
  const isToday = (date: Date) => date.toDateString() === today.toDateString();
  const isSelected = (date: Date) => date.toDateString() === selectedDate.toDateString();

  return (
    <div className="space-y-6">
      {/* Enhanced Date Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Calendar</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
                <TabsList>
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button onClick={onNewAppointment}>
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Picker */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              modifiers={{
                today: today,
                hasAppointments: (date) => getAppointmentsForDate(date).length > 0
              }}
              modifiersStyles={{
                hasAppointments: { 
                  backgroundColor: '#dbeafe', 
                  color: '#1e40af',
                  fontWeight: 'bold'
                }
              }}
            />
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Has appointments</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {activeView === 'day' && (
                <>
                  <span>
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    {isToday(selectedDate) && <Badge className="ml-2" variant="secondary">Today</Badge>}
                  </span>
                  <Badge variant="outline">
                    {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
                  </Badge>
                </>
              )}
              {activeView === 'week' && (
                <>
                  <span>
                    Week of {getWeekDays()[0].toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric'
                    })} - {getWeekDays()[6].toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <Badge variant="outline">
                    {weeklyAppointments.length} total appointments
                  </Badge>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeView === 'day' && (
              <>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading appointments...</div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No appointments scheduled for this day</p>
                    <Button className="mt-4" onClick={onNewAppointment}>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule an appointment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{appointment.title}</h3>
                            {appointment.description && (
                              <p className="text-gray-600 mt-1">{appointment.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                              </div>
                              {appointment.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {appointment.location}
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeView === 'week' && (
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2">
                  {getWeekDays().map((day, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected(day) 
                          ? 'bg-blue-100 border-blue-300' 
                          : isToday(day)
                          ? 'bg-green-50 border-green-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className="text-center">
                        <div className="text-sm font-medium">
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className={`text-lg font-bold ${
                          isToday(day) ? 'text-green-600' : 
                          isSelected(day) ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {day.getDate()}
                        </div>
                        <div className="mt-1">
                          {getAppointmentsForDate(day).length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {getAppointmentsForDate(day).length}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {getAppointmentsForDate(selectedDate).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">
                      Appointments for {formatDate(selectedDate.toISOString())}:
                    </h4>
                    {getAppointmentsForDate(selectedDate).map((appointment) => (
                      <div key={appointment.id} className="border rounded p-3 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{appointment.title}</span>
                            <span className="ml-2 text-sm text-gray-500">
                              {formatTime(appointment.start_time)}
                            </span>
                          </div>
                          <Badge className={getStatusColor(appointment.status)} variant="outline">
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}