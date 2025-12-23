import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  backgroundColor?: string;
  accessRole: string;
  primary?: boolean;
}

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  attendees?: Array<{ email: string; displayName?: string }>;
  htmlLink: string;
}

export const GoogleCalendarSync: React.FC = () => {
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string>('');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [accessToken, setAccessToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const initiateGoogleAuth = () => {
    const clientId = 'your-google-client-id'; // This should come from your backend
    const redirectUri = window.location.origin + '/appointments';
    const scope = 'https://www.googleapis.com/auth/calendar';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline`;
    
    window.location.href = authUrl;
  };

  const loadCalendars = async () => {
    if (!accessToken) return;
    
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('google-calendar-integration', {
        body: { action: 'list_calendars', accessToken }
      });
      
      if (data?.success) {
        setCalendars(data.calendars);
        // Auto-select primary calendar
        const primary = data.calendars.find((cal: GoogleCalendar) => cal.primary);
        if (primary) setSelectedCalendar(primary.id);
      }
    } catch (error) {
      console.error('Error loading calendars:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    if (!accessToken || !selectedCalendar) return;
    
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('google-calendar-integration', {
        body: { 
          action: 'list_events', 
          accessToken, 
          calendarId: selectedCalendar,
          timeMin: new Date().toISOString(),
          timeMax: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      });
      
      if (data?.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEventTime = (event: CalendarEvent) => {
    const start = event.start.dateTime || event.start.date;
    const end = event.end.dateTime || event.end.date;
    
    if (!start) return 'No time specified';
    
    const startDate = new Date(start);
    const endDate = new Date(end || start);
    
    if (event.start.date) {
      return `All day - ${startDate.toLocaleDateString()}`;
    }
    
    return `${startDate.toLocaleString()} - ${endDate.toLocaleTimeString()}`;
  };

  useEffect(() => {
    if (accessToken) {
      loadCalendars();
    }
  }, [accessToken]);

  useEffect(() => {
    if (selectedCalendar) {
      loadEvents();
    }
  }, [selectedCalendar]);

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your Google Calendar to sync appointments and access all your calendars.
          </p>
          <Button onClick={initiateGoogleAuth} className="w-full">
            Connect Google Calendar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Your Google Calendars ({calendars.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCalendar} onValueChange={setSelectedCalendar}>
            <SelectTrigger>
              <SelectValue placeholder="Select a calendar" />
            </SelectTrigger>
            <SelectContent>
              {calendars.map((calendar) => (
                <SelectItem key={calendar.id} value={calendar.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: calendar.backgroundColor || '#3b82f6' }}
                    />
                    {calendar.summary}
                    {calendar.primary && <Badge variant="secondary">Primary</Badge>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCalendar && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Events ({events.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div key={event.id} className="border rounded-lg p-3 hover:bg-muted/50">
                  <h4 className="font-medium">{event.summary}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    {formatEventTime(event)}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  )}
                  {event.attendees && event.attendees.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Users className="h-3 w-3" />
                      {event.attendees.length} attendee{event.attendees.length > 1 ? 's' : ''}
                    </div>
                  )}
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              ))}
              {events.length === 0 && !loading && (
                <p className="text-center text-muted-foreground py-8">
                  No upcoming events in this calendar
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};