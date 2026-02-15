/**
 * EMOM Interval Duration Options
 *
 * Available durations for EMOM "vanilla" custom workouts
 * User can select interval length from 30 seconds up to 20 minutes
 */

export interface IntervalOption {
  label: string;      // Display label (e.g., "1:30", "5:00")
  value: number;      // Value in seconds
}

export const INTERVAL_DURATIONS: IntervalOption[] = [
  { label: '0:30', value: 30 },
  { label: '0:45', value: 45 },
  { label: '1:00', value: 60 },
  { label: '1:15', value: 75 },
  { label: '1:30', value: 90 },
  { label: '1:45', value: 105 },
  { label: '2:00', value: 120 },
  { label: '2:30', value: 150 },
  { label: '3:00', value: 180 },
  { label: '4:00', value: 240 },
  { label: '5:00', value: 300 },
  { label: '6:00', value: 360 },
  { label: '7:00', value: 420 },
  { label: '8:00', value: 480 },
  { label: '9:00', value: 540 },
  { label: '10:00', value: 600 },
  { label: '11:00', value: 660 },
  { label: '12:00', value: 720 },
  { label: '13:00', value: 780 },
  { label: '14:00', value: 840 },
  { label: '15:00', value: 900 },
  { label: '16:00', value: 960 },
  { label: '17:00', value: 1020 },
  { label: '18:00', value: 1080 },
  { label: '19:00', value: 1140 },
  { label: '20:00', value: 1200 },
];

/**
 * Get display label for a given duration in seconds
 */
export function formatIntervalDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Default interval duration for EMOM (60 seconds)
 */
export const DEFAULT_INTERVAL_DURATION = 60;
