'use client';

import { CalendarEvent } from '../types/calendar';

interface ShareResponse {
  success: boolean;
  shareId?: string;
  error?: string;
}

class CalendarSharingService {
  private static instance: CalendarSharingService;
  private baseUrl: string = '/api/calendar'; // Update with your API endpoint

  private constructor() {}

  static getInstance(): CalendarSharingService {
    if (!CalendarSharingService.instance) {
      CalendarSharingService.instance = new CalendarSharingService();
    }
    return CalendarSharingService.instance;
  }

  async shareCalendar(events: CalendarEvent[], emails: string[]): Promise<ShareResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events, emails }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to share calendar',
      };
    }
  }

  async getSharedCalendar(shareId: string): Promise<CalendarEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/shared/${shareId}`);
      const data = await response.json();
      return data.events;
    } catch (error) {
      console.error('Failed to fetch shared calendar:', error);
      return [];
    }
  }

  async exportCalendar(events: CalendarEvent[], format: 'ics' | 'json'): Promise<Blob> {
    if (format === 'ics') {
      return this.generateICSFile(events);
    }
    return new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
  }

  private generateICSFile(events: CalendarEvent[]): Blob {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Modern Calendar//EN',
    ];

    events.forEach(event => {
      icsContent = icsContent.concat([
        'BEGIN:VEVENT',
        `UID:${event.id}`,
        `DTSTAMP:${this.formatDateToICS(new Date())}`,
        `DTSTART:${this.formatDateToICS(event.start)}`,
        `DTEND:${this.formatDateToICS(event.end)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description || ''}`,
        `LOCATION:${event.location || ''}`,
        'END:VEVENT'
      ]);
    });

    icsContent.push('END:VCALENDAR');
    return new Blob([icsContent.join('\r\n')], { type: 'text/calendar' });
  }

  private formatDateToICS(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
}

export default CalendarSharingService; 