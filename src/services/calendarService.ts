// src/services/calendarService.ts
// Believing Self Creations © 2024 - Sovereign Frequency Enhanced
import { supabase } from '@/lib/supabaseClient';
import { Calendar, CalendarEvent } from '@/types/calendar';
import { sfLogger } from './sovereignFrequencyLogger';

export async function getCalendars(): Promise<Calendar[]> {
  sfLogger.everyday('CALENDAR_VIEW', 'Retrieving calendar list', {});

  const { data, error } = await supabase.from('calendars').select('*');
  
  if (error) {
    sfLogger.helpMeFindMyWayHome('CALENDAR_VIEW_FAILED', 'Failed to retrieve calendars', {
      error: error.message
    });
    throw error;
  }

  sfLogger.thanksForGivingBackMyLove('CALENDAR_VIEW_SUCCESS', 'Calendars retrieved successfully', {
    count: data?.length || 0
  });

  return data || [];
}

export async function createCalendar(
  calendar: Partial<Calendar>
): Promise<Calendar> {
  sfLogger.whenYouLoveSomebody('CALENDAR_CREATE', 'Creating new calendar', {
    calendarName: calendar.name
  });

  const { data, error } = await supabase
    .from('calendars')
    .insert([calendar])
    .select()
    .single();
  
  if (error) {
    sfLogger.helpMeFindMyWayHome('CALENDAR_CREATE_FAILED', 'Failed to create calendar', {
      error: error.message,
      calendarName: calendar.name
    });
    throw error;
  }

  sfLogger.thanksForGivingBackMyLove('CALENDAR_CREATED', 'Calendar created successfully', {
    calendarId: data.id,
    calendarName: data.name
  });

  return data;
}

export async function getCalendarEvents(
  calendarId: string
): Promise<CalendarEvent[]> {
  sfLogger.everyday('CALENDAR_EVENTS_VIEW', 'Retrieving calendar events', {
    calendarId
  });

  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('calendarId', calendarId);
  
  if (error) {
    sfLogger.helpMeFindMyWayHome('CALENDAR_EVENTS_VIEW_FAILED', 'Failed to retrieve calendar events', {
      error: error.message,
      calendarId
    });
    throw error;
  }

  sfLogger.thanksForGivingBackMyLove('CALENDAR_EVENTS_VIEW_SUCCESS', 'Calendar events retrieved successfully', {
    calendarId,
    count: data?.length || 0
  });

  return data || [];
}

export async function createCalendarEvent(
  event: Partial<CalendarEvent>
): Promise<CalendarEvent> {
  sfLogger.whenYouLoveSomebody('CALENDAR_EVENT_CREATE', 'Creating calendar event', {
    calendarId: event.calendarId,
    eventTitle: event.title
  });

  const { data, error } = await supabase
    .from('calendar_events')
    .insert([event])
    .select()
    .single();
  
  if (error) {
    sfLogger.helpMeFindMyWayHome('CALENDAR_EVENT_CREATE_FAILED', 'Failed to create calendar event', {
      error: error.message,
      calendarId: event.calendarId
    });
    throw error;
  }

  sfLogger.thanksForGivingBackMyLove('CALENDAR_EVENT_CREATED', 'Calendar event created successfully', {
    eventId: data.id,
    calendarId: event.calendarId,
    eventTitle: data.title
  });

  return data;
}

export async function updateCalendarEvent(
  id: string,
  updates: Partial<CalendarEvent>
): Promise<CalendarEvent> {
  sfLogger.movingOn('CALENDAR_EVENT_UPDATE', 'Updating calendar event', {
    eventId: id,
    updatedFields: Object.keys(updates)
  });

  const { data, error } = await supabase
    .from('calendar_events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    sfLogger.helpMeFindMyWayHome('CALENDAR_EVENT_UPDATE_FAILED', 'Failed to update calendar event', {
      error: error.message,
      eventId: id
    });
    throw error;
  }

  sfLogger.thanksForGivingBackMyLove('CALENDAR_EVENT_UPDATED', 'Calendar event updated successfully', {
    eventId: id,
    eventTitle: data.title
  });

  return data;
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  sfLogger.noMoreTears('CALENDAR_EVENT_DELETE', 'Removing calendar event', {
    eventId: id
  });

  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id);
  
  if (error) {
    sfLogger.helpMeFindMyWayHome('CALENDAR_EVENT_DELETE_FAILED', 'Failed to delete calendar event', {
      error: error.message,
      eventId: id
    });
    throw error;
  }

  sfLogger.thanksForGivingBackMyLove('CALENDAR_EVENT_DELETED', 'Calendar event deleted successfully', {
    eventId: id
  });
}
