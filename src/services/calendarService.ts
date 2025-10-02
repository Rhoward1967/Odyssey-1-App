// src/services/calendarService.ts
import { supabase } from '@/lib/supabase';
import { Calendar, CalendarEvent } from '@/types/calendar';

export async function getCalendars(): Promise<Calendar[]> {
  const { data, error } = await supabase.from('calendars').select('*');
  if (error) throw error;
  return data || [];
}

export async function createCalendar(
  calendar: Partial<Calendar>
): Promise<Calendar> {
  const { data, error } = await supabase
    .from('calendars')
    .insert([calendar])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getCalendarEvents(
  calendarId: string
): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('calendarId', calendarId);
  if (error) throw error;
  return data || [];
}

export async function createCalendarEvent(
  event: Partial<CalendarEvent>
): Promise<CalendarEvent> {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert([event])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCalendarEvent(
  id: string,
  updates: Partial<CalendarEvent>
): Promise<CalendarEvent> {
  const { data, error } = await supabase
    .from('calendar_events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
