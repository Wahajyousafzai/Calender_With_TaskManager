'use client';

import { CalendarEvent } from '../types/calendar';

class GoogleCalendarService {
  private static instance: GoogleCalendarService;
  private baseUrl: string = '/api/calendar/google';

  private constructor() {}

  static getInstance(): GoogleCalendarService {
    if (!GoogleCalendarService.instance) {
      GoogleCalendarService.instance = new GoogleCalendarService();
    }
    return GoogleCalendarService.instance;
  }

  async syncEvents(): Promise<{ added: number; updated: number; deleted: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/sync`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync with Google Calendar');
      }

      return await response.json();
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

  async importEvents(): Promise<CalendarEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/import`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to import Google Calendar events');
      }

      return await response.json();
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  }

  async exportEvents(events: CalendarEvent[]): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }
}

export default GoogleCalendarService; 