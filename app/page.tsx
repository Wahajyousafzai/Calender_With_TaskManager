'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import MiniCalendar from './components/MiniCalendar';
import CalendarGrid from './components/CalendarGrid';
import EventModal from './components/EventModal';
import { CalendarEvent } from './types/calendar';
import DayView from './components/DayView';
import WeekView from './components/WeekView';
import SearchEvents from './components/SearchEvents';
import CategoryFilter from './components/CategoryFilter';
import AdvancedSearch from './components/AdvancedSearch';
import CalendarImportExport from './components/CalendarImportExport';
import NotificationCenter from './components/NotificationCenter';
import CalendarSettings from './components/CalendarSettings';
import EventStorageService from './services/EventStorageService';
import NotificationService from './services/NotificationService';
import { getRandomColor } from './utils/eventColors';
import SmartScheduling from './components/SmartScheduling';

interface CalendarSettings {
  defaultView: 'day' | 'week' | 'month';
  weekStartsOn: 0 | 1 | 6;
  showWeekNumbers: boolean;
  workingHours: {
    start: number;
    end: number;
  };
  timeZone: string;
}

export default function CalendarDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [view, setView] = useState<'day' | 'week' | 'month'>('month');
  const [enabledTypes, setEnabledTypes] = useState<CalendarEvent['type'][]>(['meeting', 'task', 'reminder']);
  
  const [settings, setSettings] = useState<CalendarSettings>({
    defaultView: 'month',
    weekStartsOn: 0,
    showWeekNumbers: false,
    workingHours: {
      start: 9,
      end: 17,
    },
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const handleSettingsChange = (newSettings: CalendarSettings) => {
    setSettings(newSettings);
    localStorage.setItem('calendar_settings', JSON.stringify(newSettings));
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
  };

  useEffect(() => {
    const storageService = EventStorageService.getInstance();
    setEvents(storageService.getAllEvents());
  }, []);

  const handleCreateEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: uuidv4(),
      color: getRandomColor(eventData.type),
    };

    const storageService = EventStorageService.getInstance();
    storageService.saveEvent(newEvent);
    setEvents(prev => [...prev, newEvent]);

    // Schedule notifications if enabled
    const notificationService = NotificationService.getInstance();
    if (Notification.permission === 'granted' && newEvent.reminders?.length) {
      notificationService.scheduleNotification(newEvent);
    }
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    const storageService = EventStorageService.getInstance();
    storageService.updateEvent(updatedEvent);
    setEvents(prev => prev.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
  };

  const handleEventDelete = (id: string) => {
    const storageService = EventStorageService.getInstance();
    storageService.deleteEvent(id);
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const handleMonthNavigation = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleEventSelect = (event: CalendarEvent) => {
    setCurrentDate(event.start);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const filteredEvents = events.filter(event => enabledTypes.includes(event.type));

  return (
    <div className="flex min-h-screen -z-50">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 sticky top-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="mx-4 text-2xl font-bold dark:text-white">Calendar</h1>
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + New Event
            </button>
          </div>
          
          <div className="mb-6">
            <SearchEvents events={events} onEventSelect={handleEventSelect} />
          </div>
          
          {/* Mini Calendar */}
          <div className="mb-8">
            <MiniCalendar
              selectedDate={currentDate}
              onDateSelect={handleDateSelect}
            />
          </div>
          
          {/* Categories */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Categories</h2>
            <CategoryFilter onFilterChange={setEnabledTypes} />
          </div>
          
          <div className="mt-8">
            <SmartScheduling 
              events={events}
              onEventCreate={handleCreateEvent}
            />
          </div>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 -z-10">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleMonthNavigation('prev')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <svg className="w-5 h-5 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold dark:text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button 
                onClick={() => handleMonthNavigation('next')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <svg className="w-5 h-5 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <AdvancedSearch 
                events={events}
                onEventSelect={handleEventSelect}
              />
              <CalendarImportExport
                events={events}
                onImport={(importedEvents) => setEvents([...events, ...importedEvents])}
              />
              <NotificationCenter
                events={events}
                onEventSelect={handleEventSelect}
              />
              <CalendarSettings
                settings={settings}
                onSettingsChange={handleSettingsChange}
              />
            </div>
          </div>

          <div className="flex space-x-2 mb-4">
            <button 
              onClick={() => setView('day')}
              className={`px-4 py-2 rounded-lg ${
                view === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Day
            </button>
            <button 
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-lg ${
                view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Week
            </button>
            <button 
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-lg ${
                view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Month
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4">
              {view === 'month' && (
                <CalendarGrid
                  currentDate={currentDate}
                  events={filteredEvents}
                  onEventUpdate={handleEventUpdate}
                  onEventDelete={handleEventDelete}
                  onEventCreate={handleCreateEvent}
                />
              )}
              {view === 'week' && (
                <WeekView
                  currentDate={currentDate}
                  events={filteredEvents}
                  onEventUpdate={handleEventUpdate}
                  onEventDelete={handleEventDelete}
                  onEventCreate={handleCreateEvent}
                />
              )}
              {view === 'day' && (
                <DayView
                  currentDate={currentDate}
                  events={filteredEvents}
                  onEventUpdate={handleEventUpdate}
                  onEventDelete={handleEventDelete}
                  onEventCreate={handleCreateEvent}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleCreateEvent}
        initialDate={currentDate}
      />
    </div>
  );
}
