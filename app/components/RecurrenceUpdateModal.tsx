'use client';

import { RecurrenceUpdateType } from '../types/calendar';

interface RecurrenceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateTypeSelect: (type: RecurrenceUpdateType) => void;
}
 
export default function RecurrenceUpdateModal({
  isOpen,
  onClose,
  onUpdateTypeSelect,
}: RecurrenceUpdateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998]">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">
          Update Recurring Event
        </h2>
        
        <div className="space-y-4">
          <button
            onClick={() => onUpdateTypeSelect('single')}
            className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div className="font-medium dark:text-white">This event only</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Make changes to only this instance of the recurring event
            </div>
          </button>

          <button
            onClick={() => onUpdateTypeSelect('thisAndFuture')}
            className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div className="font-medium dark:text-white">This and future events</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Make changes to this and all future instances of the recurring event
            </div>
          </button>

          <button
            onClick={() => onUpdateTypeSelect('all')}
            className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div className="font-medium dark:text-white">All events</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Make changes to all instances of the recurring event
            </div>
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 