'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent, RecurrencePattern } from '../types/calendar';
import NotificationService from '../services/NotificationService';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  initialDate?: Date;
  event?: CalendarEvent;
}

export default function EventModal({ isOpen, onClose, onSave, initialDate, event }: EventModalProps) {
  const [eventData, setEventData] = useState({
    title: '',
    start: initialDate || new Date(),
    end: initialDate ? new Date(initialDate.getTime() + 60 * 60 * 1000) : new Date(),
    type: 'meeting' as const,
    color: '#2563eb',
    description: '',
    location: '',
    reminders: [] as number[],
    recurrence: undefined as RecurrencePattern | undefined,
  });

  const [showRecurrence, setShowRecurrence] = useState(false);

  useEffect(() => {
    if (event) {
      setEventData({
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        type: event.type as 'meeting',
        color: event.color,
        description: event.description || '',
        location: event.location || '',
        reminders: event.reminders || [],
        recurrence: event.recurrence
      });
      if (event.recurrence) {
        setShowRecurrence(true);
      }
    } else if (initialDate) {
      const startDate = new Date(initialDate);
      startDate.setSeconds(0);
      startDate.setMilliseconds(0);
      
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1);

      setEventData(prev => ({
        ...prev,
        start: startDate,
        end: endDate,
      }));
    }
  }, [event, initialDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const notificationService = NotificationService.getInstance();
    const hasPermission = await notificationService.requestPermission();

    if (hasPermission && eventData.reminders?.length) {
      notificationService.scheduleNotification({
        ...eventData,
        id: 'temp-id', // Will be replaced with actual ID after save
      });
    }

    onSave(eventData);
    onClose();
  };

  const reminderOptions = [
    { label: '5 minutes', value: 5 },
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '1 day', value: 1440 },
  ];

  const eventTypes = [
    { type: 'meeting', label: 'Meeting', color: '#2563eb' },
    { type: 'task', label: 'Task', color: '#16a34a' },
    { type: 'reminder', label: 'Reminder', color: '#9333ea' },
  ];

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const parseInputDate = (dateString: string) => {
    return new Date(dateString);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998]">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold dark:text-white">
              {event ? 'Edit Event' : 'Create Event'}
            </h2>
            <button 
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Event Type
            </label>
            <div className="flex space-x-2">
              {eventTypes.map(({ type, label, color }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setEventData(prev => ({ ...prev, type: type as any, color }))}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    eventData.type === type 
                      ? 'bg-gray-100 dark:bg-gray-700 ring-2 ring-blue-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={eventData.title}
              onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start
              </label>
              <input
                type="datetime-local"
                value={formatDateForInput(eventData.start)}
                onChange={(e) => setEventData({
                  ...eventData,
                  start: parseInputDate(e.target.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End
              </label>
              <input
                type="datetime-local"
                value={formatDateForInput(eventData.end)}
                onChange={(e) => setEventData({
                  ...eventData,
                  end: parseInputDate(e.target.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location (optional)
            </label>
            <input
              type="text"
              value={eventData.location}
              onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="Add location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
              rows={3}
              placeholder="Add description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reminders
            </label>
            <div className="flex flex-wrap gap-2">
              {reminderOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setEventData(prev => ({
                    ...prev,
                    reminders: prev.reminders.includes(option.value)
                      ? prev.reminders.filter(r => r !== option.value)
                      : [...prev.reminders, option.value].sort((a, b) => b - a)
                  }))}
                  className={`px-3 py-1 rounded-full text-sm ${
                    eventData.reminders.includes(option.value)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {event ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 