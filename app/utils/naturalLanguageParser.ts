interface ParsedEvent {
  title?: string;
  start?: Date;
  end?: Date;
  location?: string;
  description?: string;
}

export function parseNaturalLanguage(input: string): ParsedEvent | null {
  // Basic patterns
  const timePattern = /at (\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i;
  const durationPattern = /for (\d+)\s*(hour|hr|minute|min)/i;
  const datePattern = /(today|tomorrow|next|this)\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)?/i;
  const locationPattern = /(?:at|in)\s+([^,]+)(?:,|$)/i;

  try {
    const result: ParsedEvent = {};
    
    // Extract title (everything before temporal expressions)
    const titleMatch = input.split(/(?:today|tomorrow|at|next|this)/i)[0].trim();
    if (titleMatch) {
      result.title = titleMatch;
    }

    // Extract date
    const dateMatch = input.match(datePattern);
    if (dateMatch) {
      result.start = parseDateExpression(dateMatch[0]);
    }

    // Extract time
    const timeMatch = input.match(timePattern);
    if (timeMatch && result.start) {
      const time = parseTimeExpression(timeMatch[1]);
      result.start.setHours(time.hours);
      result.start.setMinutes(time.minutes);
    }

    // Extract duration
    const durationMatch = input.match(durationPattern);
    if (durationMatch && result.start) {
      const duration = parseDuration(durationMatch[1], durationMatch[2]);
      result.end = new Date(result.start.getTime() + duration);
    }

    // Extract location
    const locationMatch = input.match(locationPattern);
    if (locationMatch) {
      result.location = locationMatch[1].trim();
    }

    return Object.keys(result).length > 0 ? result : null;
  } catch (error) {
    console.error('Error parsing natural language input:', error);
    return null;
  }
}

function parseDateExpression(expr: string): Date {
  const date = new Date();
  
  if (expr.toLowerCase().includes('tomorrow')) {
    date.setDate(date.getDate() + 1);
  } else if (expr.toLowerCase().includes('next')) {
    // Handle "next week", "next monday", etc.
    const dayMatch = expr.match(/next\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    if (dayMatch) {
      const targetDay = getDayNumber(dayMatch[1]);
      const currentDay = date.getDay();
      const daysToAdd = (targetDay - currentDay + 7) % 7 + 7;
      date.setDate(date.getDate() + daysToAdd);
    }
  }
  
  return date;
}

function parseTimeExpression(expr: string): { hours: number; minutes: number } {
  const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
  const match = expr.match(timeRegex);
  
  if (!match) {
    throw new Error('Invalid time format');
  }

  let hours = parseInt(match[1]);
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const meridiem = match[3]?.toLowerCase();

  if (meridiem === 'pm' && hours < 12) {
    hours += 12;
  } else if (meridiem === 'am' && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

function parseDuration(amount: string, unit: string): number {
  const value = parseInt(amount);
  const multiplier = unit.startsWith('hour') || unit.startsWith('hr') ? 60 * 60 * 1000 : 60 * 1000;
  return value * multiplier;
}

function getDayNumber(day: string): number {
  const days = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  };
  return days[day.toLowerCase() as keyof typeof days];
} 