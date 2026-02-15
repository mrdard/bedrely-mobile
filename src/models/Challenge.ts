import {Timestamp} from '@react-native-firebase/firestore';

export interface Challenge {
  id?: string; // Document ID (web-safe name)
  originalName: string;
  frequency: 'daily' | 'weekly';
  goal: number;
  goalType?: 'count' | 'minutes'; // Type of goal: count (reps) or minutes
  userId: string;
  createdAt: string | Timestamp;
}

export interface ChallengeProgress {
  date: string; // YYYY-MM-DD
  count: number;
  total: number;
  logs: ChallengeLog[];
}

export interface ChallengeLog {
  time: string; // ISO timestamp
  value: number;
}

export interface ChallengeStats {
  totalThisYear: number;
  currentStreak: number;
  longestStreak: number;
  bestDay: {
    date: string | null;
    count: number;
  };
  averagePerDay: number;
  daysLogged: number;
}

export interface WeekData {
  [dayIndex: number]: {
    total: number;
  };
}

// Helper to generate web-safe name from challenge name
export const makeWebSafeName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
};

// Helper to format date as YYYY-MM-DD
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get today's date as YYYY-MM-DD
export const getTodayString = (): string => {
  return formatDate(new Date());
};

// Get dates for current week (Monday to Sunday)
export const getWeekDates = (): string[] => {
  const today = new Date();
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const weekDates: string[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + mondayOffset + i);
    weekDates.push(formatDate(date));
  }
  return weekDates;
};
