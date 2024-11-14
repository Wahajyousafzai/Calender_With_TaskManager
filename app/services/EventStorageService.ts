'use client';

import { CalendarEvent } from '../types/calendar';

class EventStorageService {
  private static instance: EventStorageService;
  private storageKey = 'calendar_events';

  private constructor() {}

  static getInstance(): EventStorageService {
    if (!EventStorageService.instance) {
      EventStorageService.instance = new EventStorageService();
    }
    return EventStorageService.instance;
  }

  getAllEvents(): CalendarEvent[] {
    if (typeof window === 'undefined') return [];
    const events = localStorage.getItem(this.storageKey);
    return events ? JSON.parse(events) : [];
  }

  saveEvent(event: CalendarEvent) {
    const events = this.getAllEvents();
    events.push(event);
    localStorage.setItem(this.storageKey, JSON.stringify(events));
    return event;
  }

  updateEvent(event: CalendarEvent) {
    const events = this.getAllEvents();
    const index = events.findIndex(e => e.id === event.id);
    if (index !== -1) {
      events[index] = event;
      localStorage.setItem(this.storageKey, JSON.stringify(events));
    }
    return event;
  }

  deleteEvent(id: string) {
    const events = this.getAllEvents();
    const filteredEvents = events.filter(e => e.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(filteredEvents));
  }
}

export default EventStorageService; 