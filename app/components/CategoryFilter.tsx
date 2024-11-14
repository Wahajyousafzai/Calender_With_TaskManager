'use client';

import { useState } from 'react';
import { CalendarEvent } from '../types/calendar';

interface Category {
  name: string;
  color: string;
  type: CalendarEvent['type'];
  enabled: boolean;
}

interface CategoryFilterProps {
  onFilterChange: (enabledTypes: CalendarEvent['type'][]) => void;
}
 
export default function CategoryFilter({ onFilterChange }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([
    { name: 'Meetings', color: '#2563eb', type: 'meeting', enabled: true },
    { name: 'Tasks', color: '#16a34a', type: 'task', enabled: true },
    { name: 'Reminders', color: '#9333ea', type: 'reminder', enabled: true },
  ]);

  const toggleCategory = (index: number) => {
    const newCategories = [...categories];
    newCategories[index].enabled = !newCategories[index].enabled;
    setCategories(newCategories);
    
    const enabledTypes = newCategories
      .filter(cat => cat.enabled)
      .map(cat => cat.type);
    onFilterChange(enabledTypes);
  };

  return (
    <div className="space-y-2">
      {categories.map((category, index) => (
        <div key={category.type} className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: category.color }}
            />
            <span className="text-sm dark:text-gray-300">{category.name}</span>
          </div>
          <button
            onClick={() => toggleCategory(index)}
            className={`w-8 h-4 rounded-full transition-colors duration-200 ease-in-out relative
              ${category.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out
                ${category.enabled ? 'transform translate-x-4' : ''}`}
            />
          </button>
        </div>
      ))}
    </div>
  );
} 