export const eventColors = {
  meeting: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'],
  task: ['#16a34a', '#22c55e', '#4ade80', '#86efac'],
  reminder: ['#9333ea', '#a855f7', '#c084fc', '#d8b4fe'],
};

export const getRandomColor = (type: 'meeting' | 'task' | 'reminder'): string => {
  const colors = eventColors[type];
  return colors[Math.floor(Math.random() * colors.length)];
}; 