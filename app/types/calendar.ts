export type RecurrencePattern = {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // e.g., every 2 weeks
  endDate?: Date;
  daysOfWeek?: number[]; // 0-6 for weekly recurrence
  dayOfMonth?: number; // for monthly recurrence
};

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'meeting' | 'task' | 'reminder';
  color: string;
  description?: string;
  location?: string;
  recurrence?: RecurrencePattern;
  reminders?: number[]; // minutes before event
  sharedWith?: string[]; // email addresses
  isRecurringInstance?: boolean;
  originalEventId?: string;
  lastSyncedAt?: Date;
  googleEventId?: string;
}

export type ViewType = 'day' | 'week' | 'month';

export type RecurrenceUpdateType = 'single' | 'thisAndFuture' | 'all';

export interface SharedCalendar {
  id: string;
  name: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  permission: 'read' | 'write';
}