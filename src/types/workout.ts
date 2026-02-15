import {Timestamp} from '@react-native-firebase/firestore';

export interface Exercise {
  name: string;
  targetReps?: number;
  notes?: string;
}

export type DurationType = 'timed' | 'rounds' | 'reps';
export type MeasurementType = 'reps' | 'rounds' | 'time' | 'weight';

export interface Workout {
  id?: string;
  name: string;
  description?: string;
  durationType: DurationType;
  duration?: number; // minutes for timed workouts
  exercises: Exercise[];
  measurementType: MeasurementType;
  measurementUnit: string;
  img?: string | null;
  imgThumb?: string | null;
  imgCredit?: string | null;
  workoutCategory?: string;
  source?: string;
  originalGlobalId?: string | null;
  createdAt: Timestamp;
  lastPerformedAt?: Timestamp | null;
}

export interface WorkoutSession {
  id?: string;
  userId: string;
  workoutId: string;
  workoutName: string;
  result: number;
  resultType: MeasurementType;
  duration?: number; // actual duration in seconds
  notes?: string;
  performedAt: Timestamp;
}

export type TimerType = 'forTime' | 'amrap' | 'emom' | 'tabata';
