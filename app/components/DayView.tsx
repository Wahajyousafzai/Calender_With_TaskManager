'use client';

import { useState, useRef, useEffect } from 'react';
import { CalendarEvent } from '../types/calendar';
import RecurrenceService from '../services/RecurrenceService';
import EventDetailsPopup from './EventDetailsPopup';
import RecurrenceUpdateModal from './RecurrenceUpdateModal';
import QuickEventPopup from './QuickEventPopup';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventUpdate: (event: CalendarEvent) => void;
  onEventDelete: (id: string) => void;
  onEventCreate: (event: CalendarEvent) => void;
}

export default function DayView({ currentDate, events, onEventUpdate, onEventDelete, onEventCreate }: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const [selectedEvent, setSelectedEvent] = useState<{
    event: CalendarEvent;
    position: { x: number; y: number };
  } | null>(null);
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{
    event: CalendarEvent;
    updates: Partial<CalendarEvent>;
  } | null>(null);
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [quickEventDetails, setQuickEventDetails] = useState<{
    date: Date;
    position: { x: number; y: number };
  } | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [resizingEvent, setResizingEvent] = useState<{
    event: CalendarEvent;
    edge: 'top' | 'bottom';
  } | null>(null);
  const timeGridRef = useRef<HTMLDivElement>(null);

  const getEventsForDay = () => {
    const recurrenceService = RecurrenceService.getInstance();
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    return events.reduce<CalendarEvent[]>((acc, event) => {
      if (event.recurrence) {
        return [
          ...acc,
          ...recurrenceService.generateRecurringEvents(event, dayStart, dayEnd)
        ];
      } else if (event.start.toDateString() === currentDate.toDateString()) {
        acc.push(event);
      }
      return acc;
    }, []);
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent({
      event,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleEventDelete = (id: string) => {
    if (selectedEvent?.event.recurrence) {
      setPendingUpdate({ 
        event: selectedEvent.event, 
        updates: { id } 
      });
      setShowRecurrenceModal(true);
    } else {
      onEventDelete(id);
    }
    setSelectedEvent(null);
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
      id: crypto.randomUUID(),
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

  const handleQuickEventClick = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickEventDetails({
      date,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const calculateEventPosition = (event: CalendarEvent): { top: string; height: string } => {
    const startHour = event.start.getHours() + event.start.getMinutes() / 60;
    const endHour = event.end.getHours() + event.end.getMinutes() / 60;
    const duration = endHour - startHour;

    return {
      top: `${(startHour / 24) * 100}%`,
      height: `${(duration / 24) * 100}%`,
    };
  };

  const renderCurrentTimeIndicator = () => {
    const now = new Date();
    if (now.toDateString() !== currentDate.toDateString()) return null;

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const percentage = ((hours + minutes / 60) / 24) * 100;

    return (
      <div 
        className="absolute left-0 right-0 flex items-center z-20"
        style={{ top: `${percentage}%` }}
      >
        <div className="w-2 h-2 rounded-full bg-red-500"></div>
        <div className="flex-1 h-px bg-red-500"></div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="text-center py-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-semibold dark:text-white">
          {currentDate.toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </h2>
      </div>

      <div className="flex-1 grid grid-cols-[100px_1fr] overflow-hidden">
        <div className="border-r dark:border-gray-700">
          {hours.map((hour) => (
            <div 
              key={hour} 
              className="h-20 border-b dark:border-gray-700 text-sm text-right pr-4 pt-2"
            >
              <span className="text-gray-500 dark:text-gray-400">
                {hour.toString().padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>

        <div className="relative">
          {hours.map((hour) => {
            const isHovered = hoveredHour === hour;
            const isCurrent = new Date().getHours() === hour && 
                            new Date().toDateString() === currentDate.toDateString();

            return (
              <div
                key={hour}
                className={`
                  h-20 border-b dark:border-gray-700 relative group
                  ${isHovered ? 'bg-gray-50 dark:bg-gray-700/50' : ''}
                  ${isCurrent ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                `}
                onMouseEnter={() => setHoveredHour(hour)}
                onMouseLeave={() => setHoveredHour(null)}
                onClick={(e) => {
                  const date = new Date(currentDate);
                  date.setHours(hour);
                  handleQuickEventClick(date, e);
                }}
              >
                {getEventsForDay()
                  .filter(event => event.start.getHours() === hour)
                  .map((event) => (
                    <div
                      key={event.id}
                      className={`
                        absolute left-0 right-2 mx-2 p-2 rounded-lg cursor-pointer
                        transform transition-all duration-200 hover:scale-[1.02] hover:z-10
                        ${event.isRecurringInstance ? 'border-l-4' : ''}
                      `}
                      style={{
                        ...calculateEventPosition(event),
                        backgroundColor: `${event.color}20`,
                        borderLeftColor: event.isRecurringInstance ? event.color : 'transparent',
                        color: event.color,
                      }}
                      onClick={(e) => handleEventClick(event, e)}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', JSON.stringify({
                          id: event.id,
                          title: event.title,
                          start: event.start.toISOString(),
                          end: event.end.toISOString(),
                          color: event.color,
                          isRecurringInstance: event.isRecurringInstance
                        }));
                      }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs opacity-75">
                        {event.start.toLocaleTimeString([], { 
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            );
          })}

          {renderCurrentTimeIndicator()}
        </div>
      </div>

      {selectedEvent && (
        <EventDetailsPopup
          event={selectedEvent.event}
          position={selectedEvent.position}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleEventDelete}
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