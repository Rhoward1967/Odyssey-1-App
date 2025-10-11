import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Settings,
  RefreshCw,
  Home,
} from 'lucide-react';
import { Link } from 'react-router-dom';
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

  const AppointmentCard: React.FC<{ appointment: Appointment }> = ({
    appointment,
  }) => {
    const startTime = new Date(appointment.start_time);
    const endTime = new Date(appointment.end_time);

    return (
      <div className='border rounded-lg p-4 hover:bg-muted/50 transition-colors'>
        <div className='flex items-start justify-between'>
          <div className='space-y-2'>
            <h3 className='font-semibold'>{appointment.title}</h3>
            {appointment.description && (
              <p className='text-sm text-muted-foreground'>
                {appointment.description}
              </p>
            )}
            <div className='flex items-center gap-4 text-sm text-muted-foreground'>
              <div className='flex items-center gap-1'>
                <Clock className='h-3 w-3' />
                {startTime.toLocaleDateString()}{' '}
                {startTime.toLocaleTimeString()} -{' '}
                {endTime.toLocaleTimeString()}
              </div>
              {appointment.location && (
                <div className='flex items-center gap-1'>
                  <MapPin className='h-3 w-3' />
                  {appointment.location}
                </div>
              )}
              {appointment.attendees && appointment.attendees.length > 0 && (
                <div className='flex items-center gap-1'>
                  <Users className='h-3 w-3' />
                  {appointment.attendees.length} attendee
                  {appointment.attendees.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
          <Badge
            variant={
              appointment.status === 'scheduled'
                ? 'default'
                : appointment.status === 'completed'
                  ? 'secondary'
                  : 'destructive'
            }
          >
            {appointment.status}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Appointments</h1>
          <p className='text-muted-foreground'>
            Manage your appointments and sync with Google Calendar
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <AppointmentScheduler onAppointmentCreated={loadAppointments} />
          <Link to='/' className='ml-2'>
            <Button variant='outline' className='flex items-center gap-1'>
              <Home className='w-4 h-4' />
              Return Home
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='appointments' className='flex items-center gap-2'>
            <Calendar className='h-4 w-4' />
            My Appointments
          </TabsTrigger>
          <TabsTrigger
            value='google-calendar'
            className='flex items-center gap-2'
          >
            <RefreshCw className='h-4 w-4' />
            Google Calendar
          </TabsTrigger>
          <TabsTrigger value='settings' className='flex items-center gap-2'>
            <Settings className='h-4 w-4' />
            Calendar Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value='appointments' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <span>Upcoming Appointments ({appointments.length})</span>
                <Badge variant='outline'>
                  {
                    appointments.filter(apt => apt.status === 'scheduled')
                      .length
                  }{' '}
                  Scheduled
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {appointments.length === 0 ? (
                  <div className='text-center py-8'>
                    <Calendar className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                    <p className='text-muted-foreground'>
                      No appointments scheduled
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Create your first appointment to get started
                    </p>
                  </div>
                ) : (
                  appointments.map(appointment => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='google-calendar' className='space-y-4'>
          <GoogleCalendarSync />
        </TabsContent>

        <TabsContent value='settings' className='space-y-4'>
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
