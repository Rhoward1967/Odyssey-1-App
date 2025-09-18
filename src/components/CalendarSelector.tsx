import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar, RefreshCw, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  backgroundColor?: string;
  accessRole: string;
  primary?: boolean;
}

interface CalendarSelectorProps {
  onCalendarSelect?: (calendarId: string) => void;
  selectedCalendar?: string;
  accessToken?: string;
}

export const CalendarSelector: React.FC<CalendarSelectorProps> = ({
  onCalendarSelect,
  selectedCalendar,
  accessToken
}) => {
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [autoSync, setAutoSync] = useState(false);

  const loadCalendars = async () => {
    if (!accessToken) return;
    
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('google-calendar-integration', {
        body: { action: 'list_calendars', accessToken }
      });
      
      if (data?.success) {
        setCalendars(data.calendars);
        // Auto-select primary calendar if none selected
        if (!selectedCalendar) {
          const primary = data.calendars.find((cal: GoogleCalendar) => cal.primary);
          if (primary && onCalendarSelect) {
            onCalendarSelect(primary.id);
          }
        }
      }
    } catch (error) {
      console.error('Error loading calendars:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAppointmentEvent = async (appointmentData: any) => {
    if (!accessToken || !selectedCalendar || !syncEnabled) return;

    try {
      const eventData = {
        summary: `Appointment: ${appointmentData.title}`,
        description: `${appointmentData.description}\n\nCreated via Appointment System\nTimestamp: ${new Date().toISOString()}`,
        start: {
          dateTime: appointmentData.startTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: appointmentData.endTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        location: appointmentData.location,
        attendees: appointmentData.attendees?.map((email: string) => ({ email }))
      };

      const { data } = await supabase.functions.invoke('google-calendar-integration', {
        body: { 
          action: 'create_event', 
          accessToken, 
          calendarId: selectedCalendar,
          eventData 
        }
      });
      
      if (data?.success) {
        console.log('Event created in Google Calendar:', data.event);
        return data.event;
      }
    } catch (error) {
      console.error('Error creating calendar event:', error);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadCalendars();
    }
  }, [accessToken]);

  // Expose the createAppointmentEvent function globally for other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).createGoogleCalendarEvent = createAppointmentEvent;
    }
  }, [accessToken, selectedCalendar, syncEnabled]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar Sync Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Enable Calendar Sync</p>
            <p className="text-sm text-muted-foreground">
              Automatically create events in Google Calendar
            </p>
          </div>
          <Switch checked={syncEnabled} onCheckedChange={setSyncEnabled} />
        </div>

        {syncEnabled && (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Calendar for Appointments
              </label>
              <Select 
                value={selectedCalendar} 
                onValueChange={onCalendarSelect}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading calendars..." : "Select a calendar"} />
                </SelectTrigger>
                <SelectContent>
                  {calendars.map((calendar) => (
                    <SelectItem key={calendar.id} value={calendar.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: calendar.backgroundColor || '#3b82f6' }}
                        />
                        <span>{calendar.summary}</span>
                        {calendar.primary && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-sync Future Appointments</p>
                <p className="text-sm text-muted-foreground">
                  Automatically sync new appointments to calendar
                </p>
              </div>
              <Switch checked={autoSync} onCheckedChange={setAutoSync} />
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4" />
                <span>
                  {calendars.length} calendar{calendars.length !== 1 ? 's' : ''} available
                </span>
              </div>
              {selectedCalendar && (
                <div className="flex items-center gap-2 text-sm text-green-600 mt-1">
                  <Settings className="h-4 w-4" />
                  <span>
                    Syncing to: {calendars.find(c => c.id === selectedCalendar)?.summary}
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadCalendars}
          disabled={loading || !accessToken}
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Calendars
        </Button>
      </CardContent>
    </Card>
  );
};