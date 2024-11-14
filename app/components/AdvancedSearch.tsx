'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent } from '../types/calendar';
 
interface AdvancedSearchProps {
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
} 

interface SearchFilters {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  types: CalendarEvent['type'][];
  searchText: string;
  location?: string;
  hasReminders?: boolean;
  isRecurring?: boolean;
  isShared?: boolean;
}

export default function AdvancedSearch({ events, onEventSelect }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<CalendarEvent[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    dateRange: {
      start: null,
      end: null,
    },
    types: ['meeting', 'task', 'reminder'],
    searchText: '',
  });

  useEffect(() => {
    const filteredEvents = events.filter(event => {
      // Text search in title and description
      const searchTextMatch = 
        !filters.searchText || 
        event.title.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        event.description?.toLowerCase().includes(filters.searchText.toLowerCase());

      // Date range filter
      const dateMatch = 
        (!filters.dateRange.start || event.start >= filters.dateRange.start) &&
        (!filters.dateRange.end || event.end <= filters.dateRange.end);

      // Event type filter
      const typeMatch = filters.types.includes(event.type);

      // Location filter
      const locationMatch = 
        !filters.location ||
        event.location?.toLowerCase().includes(filters.location.toLowerCase());

      // Reminder filter
      const reminderMatch = 
        !filters.hasReminders ||
        (event.reminders && event.reminders.length > 0);

      // Recurrence filter
      const recurrenceMatch = 
        !filters.isRecurring ||
        event.recurrence !== undefined;

      // Shared filter
      const sharedMatch = 
        !filters.isShared ||
        (event.sharedWith && event.sharedWith.length > 0);

      return searchTextMatch && dateMatch && typeMatch && 
             locationMatch && reminderMatch && recurrenceMatch && sharedMatch;
    });

    setSearchResults(filteredEvents);
  }, [events, filters]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-gray-700 dark:text-gray-300">Advanced Search</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search events..."
                value={filters.searchText}
                onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.dateRange.start?.toISOString().slice(0, 10) || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    dateRange: {
                      ...filters.dateRange,
                      start: e.target.value ? new Date(e.target.value) : null
                    }
                  })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                />
                <input
                  type="date"
                  value={filters.dateRange.end?.toISOString().slice(0, 10) || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    dateRange: {
                      ...filters.dateRange,
                      end: e.target.value ? new Date(e.target.value) : null
                    }
                  })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Event Types
              </label>
              <div className="flex flex-wrap gap-2">
                {(['meeting', 'task', 'reminder'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setFilters({
                      ...filters,
                      types: filters.types.includes(type)
                        ? filters.types.filter(t => t !== type)
                        : [...filters.types, type]
                    })}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filters.types.includes(type)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.hasReminders}
                  onChange={(e) => setFilters({ ...filters, hasReminders: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Has Reminders</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.isRecurring}
                  onChange={(e) => setFilters({ ...filters, isRecurring: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Recurring Events</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.isShared}
                  onChange={(e) => setFilters({ ...filters, isShared: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Shared Events</span>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="p-4 max-h-64 overflow-y-auto">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Results ({searchResults.length})
              </h3>
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map(event => (
                    <div
                      key={event.id}
                      onClick={() => {
                        onEventSelect(event);
                        setIsOpen(false);
                      }}
                      className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{event.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {event.start.toLocaleDateString()} {event.start.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  No events found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 