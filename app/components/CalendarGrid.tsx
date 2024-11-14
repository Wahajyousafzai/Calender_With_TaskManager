'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent } from '../types/calendar';
import EventDetailsPopup from './EventDetailsPopup';
import RecurrenceService from '../services/RecurrenceService';
import RecurrenceUpdateModal from './RecurrenceUpdateModal';
import QuickEventPopup from './QuickEventPopup';

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventUpdate: (event: CalendarEvent) => void;
  onEventDelete: (id: string) => void;
  onEventCreate: (event: Omit<CalendarEvent, 'id'>) => void;
}

export default function CalendarGrid({ 
  currentDate, 
  events, 
  onEventUpdate,
  onEventDelete,
  onEventCreate
}: CalendarGridProps) {
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<{
    event: CalendarEvent;
    position: { x: number; y: number };
  } | null>(null);
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{
    event: CalendarEvent;
    updates: Partial<CalendarEvent>;
  } | null>(null);
  const [quickEventDetails, setQuickEventDetails] = useState<{
    date: Date;
    position: { x: number; y: number };
  } | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Generate calendar days for the month
  useEffect(() => {
    const generateCalendarDays = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      
      const startDate = new Date(firstDayOfMonth);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      
      const endDate = new Date(lastDayOfMonth);
      if (endDate.getDay() !== 6) {
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
      }
      
      const days: Date[] = [];
      const currentDay = new Date(startDate);
      
      while (currentDay <= endDate) {
        days.push(new Date(currentDay));
        currentDay.setDate(currentDay.getDate() + 1);
      }
      
      setCalendarDays(days);
    };

    generateCalendarDays();
  }, [currentDate]);

  // Get events for a specific day
  const getEventsForDay = useCallback((day: Date) => {
    const recurrenceService = RecurrenceService.getInstance();
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    
    return events.reduce<CalendarEvent[]>((acc, event) => {
      if (event.recurrence) {
        return [
          ...acc,
          ...recurrenceService.generateRecurringEvents(event, dayStart, dayEnd)
        ];
      } else if (event.start >= dayStart && event.start <= dayEnd) {
        acc.push(event);
      }
      return acc;
    }, []);
  }, [events]);

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent({
      event,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleQuickEventClick = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickEventDetails({
      date,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleCreateQuickEvent = (type: 'meeting' | 'task' | 'reminder', startTime: string, endTime: string) => {
    if (!quickEventDetails) return;

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const start = new Date(quickEventDetails.date);
    start.setHours(startHours, startMinutes);
    const end = new Date(quickEventDetails.date);
    end.setHours(endHours, endMinutes);

    const colors = {
      meeting: ['#2563eb', '#3b82f6', '#60a5fa'],
      task: ['#16a34a', '#22c55e', '#4ade80'],
      reminder: ['#9333ea', '#a855f7', '#c084fc'],
    };

    const randomColor = colors[type][Math.floor(Math.random() * colors[type].length)];

    onEventCreate({
      title: `New ${type}`,
      start,
      end,
      type,
      color: randomColor,
      description: '',
      location: '',
      reminders: [],
    });

    setQuickEventDetails(null);
  };

  const handleRecurrenceUpdate = (updateType: 'single' | 'thisAndFuture' | 'all') => {
    if (!pendingUpdate) return;

    const recurrenceService = RecurrenceService.getInstance();
    const updatedEvents = recurrenceService.updateRecurringEvent(
      { ...pendingUpdate.event, ...pendingUpdate.updates },
      updateType
    );

    updatedEvents.forEach(event => onEventUpdate(event));
    setShowRecurrenceModal(false);
    setPendingUpdate(null);
  };

  const isCurrentDay = (day: Date) => {
    const today = new Date();
    return day.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === currentDate.getMonth();
  };

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
          <div
            key={day}
            className="text-sm font-semibold text-gray-600 dark:text-gray-300 p-2 text-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isHovered = hoveredDate?.toDateString() === day.toDateString();

          return (
            <div
              key={index}
              className={`
                min-h-[120px] p-3 relative transition-all duration-300
                ${isCurrentMonth(day)
                  ? 'bg-white dark:bg-gray-800 '
                  : 'bg-gray-50/50 dark:bg-gray-900/50'
                }
                ${isCurrentDay(day) ? 
                  'ring-[3px] ring-offset-4 dark:ring-offset-gray-900 ' +
                  'animate-neon-pulse hover:ring-[4px] ' +
                  'border-pink-400 dark:border-pink-500 ' +
                  'hover:shadow-[0_0_30px_rgba(244,114,182,0.5)] ' +
                  'dark:shadow-[0_0_25px_rgba(59,130,246,0.4),0_0_50px_rgba(147,51,234,0.3)]'
                  : 'border border-gray-200 dark:border-gray-700'
                }
                hover:z-10 rounded-xl group
                ${dayEvents.length > 0 ? 'hover:shadow-lg dark:hover:shadow-gray-900/50' : ''}
              `}
              onMouseEnter={() => setHoveredDate(day)}
              onMouseLeave={() => setHoveredDate(null)}
              onClick={(e) => handleQuickEventClick(day, e)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className={`
                  text-sm font-medium transition-all duration-300
                  ${isCurrentMonth(day)
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-400 dark:text-gray-500'
                  }
                  ${isCurrentDay(day) ? 
                    'text-pink-500 dark:text-pink-400 font-bold text-lg ' +
                    'animate-pulse-subtle'
                    : ''
                  }
                `}>
                  {day.getDate()}
                </div>
                {dayEvents.length > 0 && (
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => handleEventClick(event, e)}
                    className={`
                      text-xs cursor-pointer rounded-lg p-1.5
                      transform transition-all duration-200 
                      hover:scale-[1.02] hover:shadow-md
                      ${event.isRecurringInstance ? 'border-l-4' : ''}
                      group-hover:translate-x-1
                    `}
                    style={{ 
                      backgroundColor: event.color + '20', 
                      color: event.color,
                      borderLeftColor: event.isRecurringInstance ? event.color : 'transparent'
                    }}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="text-xs opacity-75 truncate">
                      {event.start.toLocaleTimeString([], { 
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <button 
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mt-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle showing more events
                    }}
                  >
                    +{dayEvents.length - 3} more
                  </button>
                )}
              </div>

              {/* Add event button (visible on hover) */}
              {isHovered && (
                <button 
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 
                    transition-opacity duration-200 p-1 rounded-full 
                    hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={(e) => handleQuickEventClick(day, e)}
                >
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Popups and Modals */}
      {selectedEvent && (
        <EventDetailsPopup
          event={selectedEvent.event}
          position={selectedEvent.position}
          onClose={() => setSelectedEvent(null)}
          onDelete={(id) => {
            if (selectedEvent.event.recurrence) {
              setPendingUpdate({ 
                event: selectedEvent.event, 
                updates: { id } 
              });
              setShowRecurrenceModal(true);
            } else {
              onEventDelete(id);
            }
            setSelectedEvent(null);
          }}
        />
      )}

      {showRecurrenceModal && (
        <RecurrenceUpdateModal
          isOpen={showRecurrenceModal}
          onClose={() => {
            setShowRecurrenceModal(false);
            setPendingUpdate(null);
          }}
          onUpdateTypeSelect={handleRecurrenceUpdate}
        />
      )}

      {quickEventDetails && (
        <QuickEventPopup
          date={quickEventDetails.date}
          position={quickEventDetails.position}
          onClose={() => setQuickEventDetails(null)}
          onCreateEvent={handleCreateQuickEvent}
        />
      )}
    </div>
  );
} 