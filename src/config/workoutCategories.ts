/**
 * Workout Categories Configuration
 *
 * Centralized definitions for all workout types
 */

export interface WorkoutCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  timerType: 'interval' | 'countdown' | 'stopwatch' | 'tabata' | 'manual';
}

export const WORKOUT_CATEGORIES: WorkoutCategory[] = [
  {
    id: 'EMOM',
    name: 'EMOM',
    icon: '⏱️',
    color: 'indigo',
    description: 'Every Minute On the Minute',
    timerType: 'interval',
  },
  {
    id: 'AMRAP',
    name: 'AMRAP',
    icon: '🔄',
    color: 'blue',
    description: 'As Many Rounds As Possible',
    timerType: 'countdown',
  },
  {
    id: 'For Time',
    name: 'For Time',
    icon: '⏰',
    color: 'green',
    description: 'Complete work ASAP',
    timerType: 'stopwatch',
  },
  {
    id: 'HIIT',
    name: 'HIIT',
    icon: '🔥',
    color: 'red',
    description: 'High-Intensity Intervals',
    timerType: 'interval',
  },
  {
    id: 'Tabata',
    name: 'Tabata',
    icon: '⚡',
    color: 'yellow',
    description: '20s work / 10s rest',
    timerType: 'tabata',
  },
  {
    id: 'Strength',
    name: 'Strength',
    icon: '💪',
    color: 'purple',
    description: 'Resistance training',
    timerType: 'manual',
  },
  {
    id: 'Endurance',
    name: 'Endurance',
    icon: '🏃',
    color: 'cyan',
    description: 'Cardio & stamina',
    timerType: 'stopwatch',
  },
  {
    id: 'Chipper',
    name: 'Chipper',
    icon: '🪵',
    color: 'orange',
    description: 'One-time task list',
    timerType: 'stopwatch',
  },
  {
    id: 'Other',
    name: 'Other',
    icon: '⭐',
    color: 'gray',
    description: 'Miscellaneous',
    timerType: 'manual',
  },
];

// Color mappings for React Native
export const getCategoryColors = (color: string) => {
  const colorMap: Record<string, {bg: string; text: string}> = {
    indigo: {bg: '#6366f1', text: '#FFFFFF'},
    blue: {bg: '#3b82f6', text: '#FFFFFF'},
    green: {bg: '#10b981', text: '#FFFFFF'},
    red: {bg: '#dc2626', text: '#FFFFFF'},
    yellow: {bg: '#f59e0b', text: '#FFFFFF'},
    purple: {bg: '#a855f7', text: '#FFFFFF'},
    cyan: {bg: '#06b6d4', text: '#FFFFFF'},
    orange: {bg: '#f97316', text: '#FFFFFF'},
    gray: {bg: '#6b7280', text: '#FFFFFF'},
  };
  return colorMap[color] || colorMap.gray;
};

export const getCategoryById = (id: string): WorkoutCategory | undefined => {
  return WORKOUT_CATEGORIES.find(cat => cat.id === id);
};
