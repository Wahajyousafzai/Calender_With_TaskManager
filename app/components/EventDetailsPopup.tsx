'use client';

import { CalendarEvent } from '../types/calendar';

interface EventDetailsPopupProps {
  event: CalendarEvent;
  position: { x: number; y: number };
  onClose: () => void;
  onDelete: (id: string) => void;
}
 
export default function EventDetailsPopup({ event, position, onClose, onDelete }: EventDetailsPopupProps) {
  return (
    <>
      <div 
        className="fixed inset-0 z-[9996]" 
        onClick={onClose}
      />
      <div 
        className="fixed z-[9997] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 
          dark:border-gray-700 p-4 w-80"
        style={{
          top: position.y + 10,
          left: position.x,
          transform: 'translateX(-50%)',
        }}
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {event.title || 'Untitled Event'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {event.start.toLocaleTimeString([], { 
                hour: 'numeric',
                minute: '2-digit',
                hour12: true 
              })} - {event.end.toLocaleTimeString([], { 
                hour: 'numeric',
                minute: '2-digit',
                hour12: true 
              })}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{event.location}</span>
            </div>
          )}

          {event.description && (
            <div className="text-gray-600 dark:text-gray-300 text-sm mt-2">
              {event.description}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onDelete(event.id)}
            className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 dark:text-red-400 
              dark:hover:text-red-300"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
} 