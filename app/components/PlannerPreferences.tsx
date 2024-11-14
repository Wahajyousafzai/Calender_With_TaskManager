'use client';

import { useState } from 'react';
import AIPlannerService from '../services/AIPlannerService';

export default function PlannerPreferences() {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    workStartTime: 9,
    workEndTime: 17,
    focusHours: [9, 10, 14, 15],
    breakPreference: 'short',
    meetingPreference: 'afternoon'
  });

  const handleSave = () => {
    const planner = AIPlannerService.getInstance();
    planner.setUserPreferences(preferences);
    setIsOpen(false);
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 
          dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Planner Preferences</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">AI Planner Preferences</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Work Start Time
                  </label>
                  <input
                    type="time"
                    value={`${preferences.workStartTime.toString().padStart(2, '0')}:00`}
                    onChange={(e) => {
                      const hours = parseInt(e.target.value.split(':')[0]);
                      setPreferences(prev => ({ ...prev, workStartTime: hours }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Work End Time
                  </label>
                  <input
                    type="time"
                    value={`${preferences.workEndTime.toString().padStart(2, '0')}:00`}
                    onChange={(e) => {
                      const hours = parseInt(e.target.value.split(':')[0]);
                      setPreferences(prev => ({ ...prev, workEndTime: hours }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Break Preference
                </label>
                <select
                  value={preferences.breakPreference}
                  onChange={(e) => setPreferences(prev => ({ 
                    ...prev, 
                    breakPreference: e.target.value as 'short' | 'long'
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="short">Short Breaks (15 min)</option>
                  <option value="long">Long Breaks (30 min)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meeting Preference
                </label>
                <select
                  value={preferences.meetingPreference}
                  onChange={(e) => setPreferences(prev => ({ 
                    ...prev, 
                    meetingPreference: e.target.value as 'morning' | 'afternoon' | 'distributed'
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="morning">Morning Meetings</option>
                  <option value="afternoon">Afternoon Meetings</option>
                  <option value="distributed">Distributed Throughout Day</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 
                  dark:bg-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 