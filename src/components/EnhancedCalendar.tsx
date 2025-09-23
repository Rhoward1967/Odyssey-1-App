import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Edit, Trash2, Plus, Bell, Download, MapPin, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarViews } from './CalendarViews';
import { YearlyCalendar } from './YearlyCalendar';
import { supabase } from '@/lib/supabase';
interface Appointment {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  type: 'meeting' | 'call' | 'event' | 'reminder';
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
  created_at: string;
}

export const EnhancedCalendar: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(() => {
    // Fix for incorrect system date - force to correct year 2024
    const today = new Date();
    if (today.getFullYear() === 2025) {
      today.setFullYear(2024);
    }
    return today;
  });
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    type: 'meeting' as const,
    recurring: 'none' as const
  });

  useEffect(() => {
    fetchAppointments();
  }, [currentDate]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Set empty array on error to prevent crashes
      setAppointments([]);
    }
  };

  const handleSaveAppointment = async () => {
    try {
      if (selectedAppointment) {
        const { error } = await supabase
          .from('appointments')
          .update(formData)
          .eq('id', selectedAppointment.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('appointments')
          .insert([formData]);
        if (error) throw error;
      }
      
      fetchAppointments();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      type: 'meeting',
      recurring: 'none'
    });
    setSelectedAppointment(null);
  };

  const editAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      title: appointment.title,
      description: appointment.description || '',
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      type: appointment.type,
      recurring: appointment.recurring || 'none'
    });
    setIsDialogOpen(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'call': return 'bg-green-500';
      case 'event': return 'bg-purple-500';
      case 'reminder': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toDateString();
    const aptDate = new Date(apt.start_time).toDateString();
    return today === aptDate;
  });

  const upcomingAppointments = appointments.filter(apt => {
    const today = new Date();
    const aptDate = new Date(apt.start_time);
    return aptDate > today;
  }).slice(0, 5);

  // Holiday indicators
  const holidays = [
    { date: '2024-12-25', name: 'Christmas Day', type: 'federal' },
    { date: '2024-01-01', name: 'New Year\'s Day', type: 'federal' },
    { date: '2024-07-04', name: 'Independence Day', type: 'federal' },
    { date: '2024-11-28', name: 'Thanksgiving', type: 'federal' },
    { date: '2024-02-14', name: 'Valentine\'s Day', type: 'cultural' },
    { date: '2024-10-31', name: 'Halloween', type: 'cultural' }
  ];

  const exportCalendar = () => {
    const calendarData = {
      appointments: appointments,
      exportDate: new Date().toISOString(),
      totalAppointments: appointments.length
    };
    
    const dataStr = JSON.stringify(calendarData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `calendar-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Enhanced Calendar</h2>
        <div className="flex gap-2">
          <Button onClick={exportCalendar} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Select value={view} onValueChange={(value: 'month' | 'week' | 'day') => setView(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {selectedAppointment ? 'Edit Appointment' : 'New Appointment'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Appointment title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                <Input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                />
                <Input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                />
                <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={formData.recurring} onValueChange={(value: any) => setFormData({...formData, recurring: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Repeat</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button onClick={handleSaveAppointment} className="flex-1">
                    {selectedAppointment ? 'Update' : 'Create'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <CalendarViews
        currentDate={currentDate}
        view={view}
        onDateChange={setCurrentDate}
        appointments={appointments}
      />

      {/* 12-Month Yearly Calendar */}
      <YearlyCalendar 
        appointments={appointments}
        onDateSelect={(date) => setCurrentDate(date)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {appointments.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getTypeColor(appointment.type)}`} />
                    <div>
                      <p className="text-sm font-medium">{appointment.title}</p>
                      <p className="text-xs text-gray-600">
                        {formatDate(appointment.start_time)} • {formatTime(appointment.start_time)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => editAppointment(appointment)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteAppointment(appointment.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No appointments scheduled</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayAppointments.length > 0 ? (
                <div className="space-y-2">
                  {todayAppointments.map((apt) => (
                    <div key={apt.id} className="flex items-center gap-2 p-2 rounded border">
                      <div className={`w-2 h-2 rounded-full ${getTypeColor(apt.type)}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{apt.title}</p>
                        <p className="text-xs text-gray-600">{formatTime(apt.start_time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No appointments today</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-2">
                  {upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="flex items-center gap-2 p-2 rounded border">
                      <div className={`w-2 h-2 rounded-full ${getTypeColor(apt.type)}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{apt.title}</p>
                        <p className="text-xs text-gray-600">{formatDate(apt.start_time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No upcoming appointments</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Holiday Indicators Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Holiday Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {holidays.map((holiday, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded border">
                <div className={`w-2 h-2 rounded-full ${holiday.type === 'federal' ? 'bg-red-500' : 'bg-pink-500'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{holiday.name}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <Badge variant={holiday.type === 'federal' ? 'default' : 'secondary'} className="text-xs">
                  {holiday.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedCalendar;