'use client';

interface QuickEventPopupProps {
  date: Date;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onCreateEvent: (type: 'meeting' | 'task' | 'reminder', startTime: string, endTime: string) => void;
}

export default function QuickEventPopup({ date, position, onClose, onCreateEvent }: QuickEventPopupProps) {
  if (!position) return null;

  const options = [
    { 
      type: 'meeting' as const, 
      icon: '🤝', 
      label: 'Meeting',
      description: 'Schedule a meeting with others',
      defaultDuration: 60,
      color: 'bg-blue-500'
    },
    { 
      type: 'task' as const, 
      icon: '✓', 
      label: 'Task',
      description: 'Add a task or to-do item',
      defaultDuration: 30,
      color: 'bg-green-500'
    },
    { 
      type: 'reminder' as const, 
      icon: '🔔', 
      label: 'Reminder',
      description: 'Set a quick reminder',
      defaultDuration: 15,
      color: 'bg-purple-500'
    },
  ];

  // Generate time slots from current hour to end of day
  const generateTimeSlots = () => {
    const slots = [];
    const currentHour = date.getHours();
    const currentMinute = Math.ceil(date.getMinutes() / 15) * 15;
    
    for (let hour = currentHour; hour < 24; hour++) {
      for (let minute = hour === currentHour ? currentMinute : 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleOptionClick = (type: 'meeting' | 'task' | 'reminder') => {
    const option = options.find(opt => opt.type === type);
    if (!option) return;

    const startTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    const endDate = new Date(date);
    endDate.setMinutes(date.getMinutes() + option.defaultDuration);
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

    onCreateEvent(type, startTime, endTime);
  };

  return (
    <div 
      className="fixed z-[9997] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-80"
      style={{
        top: position.y,
        left: position.x,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="p-4">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {date.toLocaleDateString([], { 
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </div>

        <div className="space-y-2">
          {options.map(({ type, icon, label, description, color }) => (
            <button
              key={type}
              onClick={() => handleOptionClick(type)}
              className="w-full group relative flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className={`${color} p-2 rounded-lg text-white shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                <span className="text-lg">{icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {label}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 