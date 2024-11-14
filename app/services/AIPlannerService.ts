'use client';

import { CalendarEvent } from '../types/calendar';

interface TimeBlock {
  start: Date;
  end: Date;
  type: 'focus' | 'break' | 'meeting' | 'deep-work';
  priority: number;
  energyLevel: 'high' | 'medium' | 'low';
}

interface UserPreferences {
  workStartTime: number;
  workEndTime: number;
  focusHours: number[];
  breakPreference: 'short' | 'long';
  meetingPreference: 'morning' | 'afternoon' | 'distributed';
}

class AIPlannerService {
  private static instance: AIPlannerService;
  private userPreferences: UserPreferences = {
    workStartTime: 9,
    workEndTime: 17,
    focusHours: [9, 10, 14, 15],
    breakPreference: 'short',
    meetingPreference: 'afternoon'
  };

  private constructor() {}

  static getInstance(): AIPlannerService {
    if (!AIPlannerService.instance) {
      AIPlannerService.instance = new AIPlannerService();
    }
    return AIPlannerService.instance;
  }

  setUserPreferences(preferences: Partial<UserPreferences>) {
    this.userPreferences = { ...this.userPreferences, ...preferences };
  }

  analyzeBestTimes(events: CalendarEvent[]): TimeBlock[] {
    const timeBlocks: TimeBlock[] = [];
    const today = new Date();
    today.setHours(this.userPreferences.workStartTime, 0, 0, 0);

    const normalizedEvents = events.map(event => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end)
    }));

    while (today.getHours() < this.userPreferences.workEndTime) {
      const blockStart = new Date(today);
      const blockEnd = new Date(today);
      blockEnd.setMinutes(blockEnd.getMinutes() + this.getOptimalBlockDuration(blockStart));

      if (!this.hasConflict(normalizedEvents, blockStart, blockEnd)) {
        timeBlocks.push({
          start: new Date(blockStart),
          end: new Date(blockEnd),
          ...this.analyzeTimeBlockCharacteristics(blockStart)
        });
      }

      today.setMinutes(today.getMinutes() + 30);
    }

    return this.optimizeSchedule(timeBlocks);
  }

  private hasConflict(events: CalendarEvent[], start: Date, end: Date): boolean {
    return events.some(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (eventStart < end && eventEnd > start) ||
             (start.getTime() === eventStart.getTime());
    });
  }

  private getOptimalBlockDuration(time: Date): number {
    const hour = time.getHours();
    if (this.userPreferences.focusHours.includes(hour)) {
      return 90;
    }
    return 60;
  }

  private analyzeTimeBlockCharacteristics(time: Date): {
    type: TimeBlock['type'];
    priority: number;
    energyLevel: TimeBlock['energyLevel'];
  } {
    const hour = time.getHours();
    
    if (hour >= 9 && hour <= 11) {
      return {
        type: 'deep-work',
        priority: 1,
        energyLevel: 'high'
      };
    }
    
    if (hour >= 14 && hour <= 16) {
      return {
        type: this.userPreferences.meetingPreference === 'afternoon' ? 'meeting' : 'focus',
        priority: 2,
        energyLevel: 'medium'
      };
    }
    
    if (hour >= 12 && hour <= 13) {
      return {
        type: 'break',
        priority: 3,
        energyLevel: 'low'
      };
    }

    return {
      type: 'focus',
      priority: 2,
      energyLevel: 'medium'
    };
  }

  private optimizeSchedule(blocks: TimeBlock[]): TimeBlock[] {
    return blocks.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return this.energyLevelValue(b.energyLevel) - this.energyLevelValue(a.energyLevel);
    });
  }

  private energyLevelValue(level: TimeBlock['energyLevel']): number {
    const values = { high: 3, medium: 2, low: 1 };
    return values[level];
  }

  generateDailyPlan(events: CalendarEvent[]): CalendarEvent[] {
    const bestTimes = this.analyzeBestTimes(events);
    const plannedEvents: CalendarEvent[] = [];

    bestTimes.forEach((block, index) => {
      const eventBase = {
        id: `planned-${index}`,
        start: block.start,
        end: block.end,
      };

      switch (block.type) {
        case 'deep-work':
          plannedEvents.push({
            ...eventBase,
            title: 'Deep Work Session',
            type: 'task',
            color: '#2563eb',
            description: 'High-priority focused work block - protect from interruptions',
          } as CalendarEvent);
          break;

        case 'focus':
          plannedEvents.push({
            ...eventBase,
            title: 'Focus Time',
            type: 'task',
            color: '#16a34a',
            description: `Recommended focus time (${block.energyLevel} energy period)`,
          } as CalendarEvent);
          break;

        case 'break':
          plannedEvents.push({
            ...eventBase,
            title: this.userPreferences.breakPreference === 'short' ? 'Quick Break' : 'Long Break',
            type: 'reminder',
            color: '#9333ea',
            description: 'Scheduled break to maintain productivity',
          } as CalendarEvent);
          break;

        case 'meeting':
          plannedEvents.push({
            ...eventBase,
            title: 'Meeting Block',
            type: 'meeting',
            color: '#dc2626',
            description: 'Optimal time for scheduling meetings',
          } as CalendarEvent);
          break;
      }
    });

    return plannedEvents;
  }
}

export default AIPlannerService; 