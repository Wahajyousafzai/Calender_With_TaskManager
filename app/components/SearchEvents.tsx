'use client';

import { useState } from 'react';
import { CalendarEvent } from '../types/calendar';

interface SearchEventsProps {
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
}
 
export default function SearchEvents({ events, onEventSelect }: SearchEventsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <svg
          className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {isOpen && searchTerm && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-auto">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <div
                key={event.id}
                onClick={() => {
                  onEventSelect(event);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              >
                <div className="font-medium">{event.title}</div>
                <div className="text-sm text-gray-500">
                  {event.start.toLocaleDateString()} at {event.start.toLocaleTimeString()}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-gray-500 text-center">No events found</div>
          )}
        </div>
      )}
    </div>
  );
} 