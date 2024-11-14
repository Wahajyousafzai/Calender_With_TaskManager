'use client';

import { useState } from 'react';
import { CalendarEvent } from '../types/calendar';

interface ShareEventModalProps {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
  onShare: (eventId: string, emails: string[]) => void;
}
  
export default function ShareEventModal({ event, isOpen, onClose, onShare }: ShareEventModalProps) {
  const [email, setEmail] = useState('');
  const [sharedEmails, setSharedEmails] = useState<string[]>(event.sharedWith || []);
  const [error, setError] = useState('');

  const handleAddEmail = () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return;
    }

    if (sharedEmails.includes(email)) {
      setError('This email is already added');
      return;
    }

    setSharedEmails([...sharedEmails, email]);
    setEmail('');
    setError('');
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setSharedEmails(sharedEmails.filter(e => e !== emailToRemove));
  };

  const handleShare = () => {
    onShare(event.id, sharedEmails);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold dark:text-white">Share Event</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Event
          </label>
          <p className="text-gray-600 dark:text-gray-400">{event.title}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Add People
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
            <button
              onClick={handleAddEmail}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Shared With
          </label>
          <div className="space-y-2">
            {sharedEmails.map((sharedEmail) => (
              <div key={sharedEmail} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                <span className="text-sm">{sharedEmail}</span>
                <button
                  onClick={() => handleRemoveEmail(sharedEmail)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
} 