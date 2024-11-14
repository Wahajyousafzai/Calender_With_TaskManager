'use client';

import { CalendarEvent } from '../types/calendar';

class NotificationService {
  private static instance: NotificationService;
  private notifications: Map<string, NodeJS.Timeout>;
  private audio: HTMLAudioElement | null = null;

  private constructor() {
    this.notifications = new Map();
    if (typeof window !== 'undefined') {
      this.initAudio();
    }
  }

  private initAudio() {
    this.audio = new Audio('/sounds/notification-sound.mp3');
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  scheduleNotification(event: CalendarEvent) {
    // Clear existing notifications for this event
    this.clearNotifications(event.id);

    // Schedule start time notification
    const startTime = new Date(event.start).getTime();
    const now = new Date().getTime();

    if (startTime > now) {
      // Schedule notification for event start
      const startTimeout = setTimeout(() => {
        this.showNotification(event, 0);
        this.playNotificationSound();
      }, startTime - now);
      this.notifications.set(`${event.id}-start`, startTimeout);
    }

    // Schedule reminder notifications
    if (event.reminders?.length) {
      event.reminders.forEach(minutes => {
        const notificationTime = startTime - minutes * 60000;
        if (notificationTime > now) {
          const timeout = setTimeout(() => {
            this.showNotification(event, minutes);
            this.playNotificationSound();
          }, notificationTime - now);
          this.notifications.set(`${event.id}-${minutes}`, timeout);
        }
      });
    }
  }

  private async playNotificationSound() {
    if (this.audio) {
      try {
        await this.audio.play();
      } catch (error) {
        console.warn('Failed to play notification sound:', error);
      }
    }
  }

  private showNotification(event: CalendarEvent, minutes: number) {
    if (Notification.permission === 'granted') {
      let title, body;
      const notificationTag = `${event.id}-${minutes}`;

      if (minutes === 0) {
        title = `Event Starting: ${event.title}`;
        body = `Your event is starting now!\nLocation: ${event.location || 'Not specified'}`;
      } else {
        const timeFormat = minutes >= 60 
          ? `${minutes / 60} hour${minutes / 60 > 1 ? 's' : ''}`
          : `${minutes} minute${minutes > 1 ? 's' : ''}`;
        title = `Upcoming: ${event.title}`;
        body = `Starting in ${timeFormat}\nLocation: ${event.location || 'Not specified'}`;
      }

      const notification = new Notification(title, {
        body,
        icon: '/calendar-icon.png',
        badge: '/calendar-icon.png',
        tag: notificationTag,
        renotify: true,
        vibrate: [200, 100, 200],
        timestamp: event.start.getTime(),
        data: {
          eventId: event.id,
          eventType: event.type,
          reminderMinutes: minutes
        }
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        // You can add navigation to the event details here
      };
    }
  }

  clearNotifications(eventId: string) {
    this.notifications.forEach((timeout, key) => {
      if (key.startsWith(eventId)) {
        clearTimeout(timeout);
        this.notifications.delete(key);
      }
    });
  }

  scheduleRecurringNotifications(event: CalendarEvent) {
    if (!event.recurrence) return;

    const generateNextOccurrence = (date: Date): Date | null => {
      const next = new Date(date);
      
      switch (event.recurrence?.type) {
        case 'daily':
          next.setDate(next.getDate() + (event.recurrence.interval || 1));
          break;
        case 'weekly':
          next.setDate(next.getDate() + 7 * (event.recurrence.interval || 1));
          break;
        case 'monthly':
          next.setMonth(next.getMonth() + (event.recurrence.interval || 1));
          break;
        case 'yearly':
          next.setFullYear(next.getFullYear() + (event.recurrence.interval || 1));
          break;
      }

      return event.recurrence.endDate && next > event.recurrence.endDate ? null : next;
    };

    let nextDate = new Date(event.start);
    while (nextDate) {
      const recurringEvent = {
        ...event,
        start: nextDate,
        end: new Date(nextDate.getTime() + (event.end.getTime() - event.start.getTime())),
      };
      
      this.scheduleNotification(recurringEvent);
      nextDate = generateNextOccurrence(nextDate);
    }
  }
}

export default NotificationService; 