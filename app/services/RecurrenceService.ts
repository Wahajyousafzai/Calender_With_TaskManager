'use client';

import { CalendarEvent, RecurrencePattern } from '../types/calendar';

class RecurrenceService {
  private static instance: RecurrenceService;

  private constructor() {}

  static getInstance(): RecurrenceService {
    if (!RecurrenceService.instance) {
      RecurrenceService.instance = new RecurrenceService();
    }
    return RecurrenceService.instance;
  }

  generateRecurringEvents(event: CalendarEvent, startDate: Date, endDate: Date): CalendarEvent[] {
    if (!event.recurrence) return [event];

    const events: CalendarEvent[] = [];
    const { type, interval, endDate: recurrenceEndDate } = event.recurrence;
    let currentDate = new Date(event.start);
    const duration = event.end.getTime() - event.start.getTime();

    while (currentDate <= endDate) {
      if (recurrenceEndDate && currentDate > recurrenceEndDate) break;

      if (currentDate >= startDate) {
        events.push({
          ...event,
          id: `${event.id}-${currentDate.getTime()}`,
          start: new Date(currentDate),
          end: new Date(currentDate.getTime() + duration),
          isRecurringInstance: true,
          originalEventId: event.id,
        });
      }

      currentDate = this.getNextOccurrence(currentDate, type, interval);
    }

    return events;
  }

  private getNextOccurrence(date: Date, type: RecurrencePattern['type'], interval: number): Date {
    const next = new Date(date);

    switch (type) {
      case 'daily':
        next.setDate(next.getDate() + interval);
        break;
      case 'weekly':
        next.setDate(next.getDate() + (7 * interval));
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + interval);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + interval);
        break;
    }

    return next;
  }

  updateRecurringEvent(
    event: CalendarEvent,
    updateType: 'single' | 'thisAndFuture' | 'all'
  ): CalendarEvent[] {
    if (!event.recurrence) return [event];

    switch (updateType) {
      case 'single':
        // Create a new non-recurring event for this instance
        return [{
          ...event,
          id: `${event.id}-exception-${event.start.getTime()}`,
          recurrence: undefined,
          originalEventId: event.id,
        }];

      case 'thisAndFuture':
        // Update the end date of the original recurrence
        const updatedRecurrence = {
          ...event.recurrence,
          endDate: new Date(event.start),
        };
        
        // Create a new recurring event series from this point
        const newEvent = {
          ...event,
          id: `${event.id}-series-${event.start.getTime()}`,
        };

        return [
          { ...event, recurrence: updatedRecurrence },
          newEvent,
        ];

      case 'all':
        // Update all instances
        return [event];

      default:
        return [event];
    }
  }

  isEventOccurringOn(event: CalendarEvent, date: Date): boolean {
    if (!event.recurrence) {
      return event.start.toDateString() === date.toDateString();
    }

    const events = this.generateRecurringEvents(
      event,
      date,
      new Date(date.getTime() + 24 * 60 * 60 * 1000)
    );

    return events.length > 0;
  }
}

export default RecurrenceService; 