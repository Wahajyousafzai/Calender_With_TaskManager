'use client';

import { useState } from 'react';
import { CalendarEvent } from '../types/calendar';
import CalendarSharingService from '../services/CalendarSharingService';

interface CalendarImportExportProps {
  events: CalendarEvent[];
  onImport: (events: CalendarEvent[]) => void;
}
 
export default function CalendarImportExport({ events, onImport }: CalendarImportExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (format: 'ics' | 'json') => {
    try {
      const sharingService = CalendarSharingService.getInstance();
      const blob = await sharingService.exportCalendar(events, format);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calendar-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError('Failed to export calendar');
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    setError(null);

    try {
      const text = await file.text();
      let importedEvents: CalendarEvent[] = [];

      if (file.name.endsWith('.json')) {
        importedEvents = JSON.parse(text);
      } else if (file.name.endsWith('.ics')) {
        // Basic ICS parsing (you might want to use a library for more robust parsing)
        const events = text.split('BEGIN:VEVENT').slice(1);
        importedEvents = events.map(eventText => {
          const getProperty = (prop: string) => {
            const match = eventText.match(new RegExp(`${prop}:([^\r\n]+)`));
            return match ? match[1] : '';
          };

          return {
            id: getProperty('UID') || Math.random().toString(36).substr(2, 9),
            title: getProperty('SUMMARY'),
            start: new Date(getProperty('DTSTART')),
            end: new Date(getProperty('DTEND')),
            description: getProperty('DESCRIPTION'),
            location: getProperty('LOCATION'),
            type: 'meeting',
            color: '#2563eb',
          };
        });
      }

      onImport(importedEvents);
      setIsOpen(false);
    } catch (error) {
      setError('Failed to import calendar');
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold dark:text-white">Import/Export Calendar</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium dark:text-white mb-2">Export</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleExport('ics')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Export as ICS
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Export as JSON
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium dark:text-white mb-2">Import</h3>
                <input
                  type="file"
                  accept=".ics,.json"
                  onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    dark:file:bg-gray-700 dark:file:text-gray-300"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Supported formats: ICS, JSON
                </p>
              </div>
            </div>

            {importing && (
              <div className="mt-4 text-center text-gray-600 dark:text-gray-400">
                Importing...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
} 