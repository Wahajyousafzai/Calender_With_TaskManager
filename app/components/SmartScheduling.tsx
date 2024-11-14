'use client';

import { useState } from 'react';
import { CalendarEvent } from '../types/calendar';
import AIPlannerService from '../services/AIPlannerService';
import PlannerPreferences from './PlannerPreferences';

interface SmartSchedulingProps {
  events: CalendarEvent[];
  onEventCreate: (event: Omit<CalendarEvent, 'id'>) => void;
}

export default function SmartScheduling({ events, onEventCreate }: SmartSchedulingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestedPlan, setSuggestedPlan] = useState<CalendarEvent[]>([]);

  const generatePlan = () => {
    const planner = AIPlannerService.getInstance();
    const plan = planner.generateDailyPlan(events);
    setSuggestedPlan(plan);
    setIsOpen(true);
  };

  const acceptSuggestion = (event: CalendarEvent) => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    
    onEventCreate({
      title: event.title,
      start: startDate,
      end: endDate,
      type: event.type,
      color: event.color,
      description: event.description,
    });
  };

  return (
    <>
      <button
        onClick={generatePlan}
        className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 
          dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span>Smart Schedule</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
          {/* Backdrop with blur effect */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg m-4
            transform transition-all duration-300 scale-100 opacity-100">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold dark:text-white">Suggested Schedule</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
                  hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto space-y-4">
              {suggestedPlan.map((event) => (
                <div 
                  key={event.id}
                  className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 
                    dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold dark:text-white group-hover:text-blue-600 
                          dark:group-hover:text-blue-400 transition-colors">
                          {event.title}
                        </h3>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {event.start.toLocaleTimeString([], { 
                            hour: 'numeric',
                            minute: '2-digit',
                          })} - {event.end.toLocaleTimeString([], { 
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                          {event.description}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          acceptSuggestion(event);
                          setIsOpen(false);
                        }}
                        className="px-4 py-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 
                          transition-all duration-200 text-sm font-medium shadow-sm 
                          hover:shadow-md active:scale-95"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  <div 
                    className="h-1 w-full transform scale-x-0 group-hover:scale-x-100 
                      transition-transform duration-300 origin-left"
                    style={{ backgroundColor: event.color }}
                  />
                </div>
              ))}

              {suggestedPlan.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium">No suggestions available</p>
                  <p className="mt-2">Try adjusting your preferences or adding more events</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 text-gray-700 dark:text-gray-300 font-medium 
                  hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 