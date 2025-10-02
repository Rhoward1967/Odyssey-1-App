// src/types/calendar.ts

export interface Calendar {
  id: string;
  name: string;
  color?: string;
  type: 'employee' | 'admin' | 'personal' | 'holidays' | 'custom';
  description?: string;
}

export type CalendarType = Calendar['type'];

export interface CalendarEvent {
  id: string;
  calendarId: string;
  title: string;
  description?: string;
  start: string; // ISO string
  end: string; // ISO string
  type: 'work' | 'personal' | 'holiday' | 'birthday' | 'other';
  location?: string;
  attendees?: string[];
  allDay?: boolean;
}
