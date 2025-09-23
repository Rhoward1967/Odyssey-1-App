import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Users, Plus, Settings, RefreshCw } from 'lucide-react';
import { AppointmentScheduler } from '@/components/AppointmentScheduler';
import { GoogleCalendarSync } from '@/components/GoogleCalendarSync';
import { CalendarSelector } from '@/components/CalendarSelector';
import { supabase } from '@/lib/supabase';

interface Appointment {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  attendees?: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  reminder_minutes: number;
  created_at: string;
}

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCalendar, setSelectedCalendar] = useState<string>('');
  const [googleAccessToken, setGoogleAccessToken] = useState<string>('');
  const [activeTab, setActiveTab] = useState('appointments');

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
    const startTime = new Date(appointment.start_time);
    const endTime = new Date(appointment.end_time);
    
    return (
      <div className="border rounded-lg p-3 md:p-4 hover:bg-muted/50 transition-colors">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            <h3 className="font-semibold text-sm md:text-base truncate">{appointment.title}</h3>
            {appointment.description && (
              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{appointment.description}</p>
            )}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4 text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {startTime.toLocaleDateString()} {startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              {appointment.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{appointment.location}</span>
                </div>
              )}
              {appointment.attendees && appointment.attendees.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 flex-shrink-0" />
                  <span>{appointment.attendees.length} attendee{appointment.attendees.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 self-start">
            <Badge variant={appointment.status === 'scheduled' ? 'default' : 
                           appointment.status === 'completed' ? 'secondary' : 'destructive'}>
              {appointment.status}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage your appointments and sync with Google Calendar
          </p>
        </div>
        <div className="flex-shrink-0">
          <AppointmentScheduler onAppointmentCreated={loadAppointments} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="appointments" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
            <Calendar className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">My Appointments</span>
            <span className="sm:hidden">My Apps</span>
          </TabsTrigger>
          <TabsTrigger value="google-calendar" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
            <RefreshCw className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Google Calendar</span>
            <span className="sm:hidden">Google</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
            <Settings className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Calendar Settings</span>
            <span className="sm:hidden">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Upcoming Appointments ({appointments.length})</span>
                <Badge variant="outline">
                  {appointments.filter(apt => apt.status === 'scheduled').length} Scheduled
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No appointments scheduled</p>
                    <p className="text-sm text-muted-foreground">
                      Create your first appointment to get started
                    </p>
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="google-calendar" className="space-y-4">
          <GoogleCalendarSync />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <CalendarSelector 
            onCalendarSelect={setSelectedCalendar}
            selectedCalendar={selectedCalendar}
            accessToken={googleAccessToken}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Appointments;