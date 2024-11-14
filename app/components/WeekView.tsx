'use client';

import { useState } from 'react';
import { CalendarEvent } from '../types/calendar';
import RecurrenceService from '../services/RecurrenceService';
import EventDetailsPopup from './EventDetailsPopup';
import RecurrenceUpdateModal from './RecurrenceUpdateModal';
import QuickEventPopup from './QuickEventPopup';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventUpdate: (event: CalendarEvent) => void;
  onEventDelete: (id: string) => void;
  onEventCreate: (event: Omit<CalendarEvent, 'id'>) => void;
}
 
export default function WeekView({ currentDate, events, onEventUpdate, onEventDelete, onEventCreate }: WeekViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - date.getDay() + i);
    return date;
  });

  const [selectedEvent, setSelectedEvent] = useState<{
    event: CalendarEvent;
    position: { x: number; y: number };
  } | null>(null);
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{
    event: CalendarEvent;
    updates: Partial<CalendarEvent>;
  } | null>(null);
  const [hoveredHour, setHoveredHour] = useState<{ day: number; hour: number } | null>(null);
  const [quickEventDetails, setQuickEventDetails] = useState<{
    date: Date;
    position: { x: number; y: number };
  } | null>(null);

  const getEventsForWeek = () => {
    const recurrenceService = RecurrenceService.getInstance();
    const weekStart = days[0];
    const weekEnd = days[6];
    
    let weekEvents: CalendarEvent[] = [];
    events.forEach(event => {
      if (event.recurrence) {
        weekEvents = [
          ...weekEvents,
          ...recurrenceService.generateRecurringEvents(event, weekStart, weekEnd)
        ];
      } else {
        const eventDate = new Date(event.start);
        if (eventDate >= weekStart && eventDate <= weekEnd) {
          weekEvents.push(event);
        }
      }
    });
    
    return weekEvents;
  };

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return getEventsForWeek().filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === day.toDateString() && 
             eventDate.getHours() === hour;
    });
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent({
      event,
      position: { x: e.clientX, y: e.clientY },
    });
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

  const isCurrentHour = (day: Date, hour: number) => {
    const now = new Date();
    return day.toDateString() === now.toDateString() && hour === now.getHours();
  };

  const handleQuickEventClick = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickEventDetails({
      date,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleCreateQuickEvent = (type: 'meeting' | 'task' | 'reminder') => {
    if (!quickEventDetails) return;

    const endDate = new Date(quickEventDetails.date);
    endDate.setHours(endDate.getHours() + 1);

    const newEvent = {
      title: '',
      start: quickEventDetails.date,
      end: endDate,
      type,
      color: type === 'meeting' ? '#2563eb' : type === 'task' ? '#16a34a' : '#9333ea',
      description: '',
      location: '',
      reminders: [],
    };

    setSelectedEvent(null);
    setQuickEventDetails(null);
  };

  return (
    <div className="h-full">
      <div className="grid grid-cols-8 border-b dark:border-gray-700">
        <div className="w-20"></div>
        {days.map((day, index) => (
          <div key={index} className="p-2 text-center border-l dark:border-gray-700">
            <div className="font-medium dark:text-gray-200">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className={`text-sm ${
              day.toDateString() === new Date().toDateString() 
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-8 h-[calc(100%-2rem)]">
        <div className="w-20">
          {hours.map((hour) => (
            <div key={hour} className="h-12 border-b dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 text-right pr-2 pt-1">
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {days.map((day, dayIndex) => (
          <div key={dayIndex} className="border-l dark:border-gray-700">
            {hours.map((hour) => {
              const dayEvents = getEventsForDayAndHour(day, hour);
              const isHovered = hoveredHour?.day === dayIndex && hoveredHour?.hour === hour;
              const isCurrent = isCurrentHour(day, hour);

              return (
                <div 
                  key={hour} 
                  className={`h-12 border-b dark:border-gray-700 relative group transition-colors duration-200
                    ${isHovered ? 'bg-gray-50 dark:bg-gray-700/50' : ''}
                    ${isCurrent ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  `}
                  onMouseEnter={() => setHoveredHour({ day: dayIndex, hour })}
                  onMouseLeave={() => setHoveredHour(null)}
                >
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => handleEventClick(event, e)}
                      className={`
                        absolute left-0 right-0 mx-1 p-1 text-xs rounded-md overflow-hidden cursor-pointer
                        transform transition-all duration-200 hover:scale-[1.02] hover:z-10
                        ${event.isRecurringInstance ? 'border-l-4' : ''}
                      `}
                      style={{
                        backgroundColor: event.color + '20',
                        color: event.color,
                        borderLeftColor: event.isRecurringInstance ? event.color : 'transparent',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs opacity-75">
                        {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                  
                  {isHovered && (
                    <button 
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 
                        transition-opacity duration-200 p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                      onClick={(e) => {
                        const newDate = new Date(day);
                        newDate.setHours(hour);
                        handleQuickEventClick(newDate, e);
                      }}
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
        ))}
      </div>

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
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setQuickEventDetails(null)}
          />
          <QuickEventPopup
            date={quickEventDetails.date}
            position={quickEventDetails.position}
            onClose={() => setQuickEventDetails(null)}
            onCreateEvent={handleCreateQuickEvent}
          />
        </>
      )}
    </div>
  );
} 