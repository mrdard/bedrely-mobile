import firestore from '@react-native-firebase/firestore';

export interface GlobalWorkoutData {
  id: string;
  name: string;
  description?: string;
  workoutCategory: string;
  timerType: string;
  exercises?: Array<{
    name: string;
    targetReps?: number;
    weight?: number;
    distance?: number;
  }>;
  rounds?: number;
  duration?: number; // in seconds (for AMRAP)
  intervalDuration?: number; // in seconds (for EMOM - duration per round)
  workDuration?: number;
  restDuration?: number;
  popularity?: number;
  imgThumb?: string;
  isGlobal: boolean;
}

/**
 * GlobalWorkout Model
 *
 * Manages read-only global workout library
 * Firestore path: globalWorkouts/{workoutId}
 */
class GlobalWorkout {
  /**
   * Fetch all global workouts ordered by popularity
   */
  static async getAll(): Promise<GlobalWorkoutData[]> {
    try {
      const snapshot = await firestore()
        .collection('globalWorkouts')
        .orderBy('popularity', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isGlobal: true,
      })) as GlobalWorkoutData[];
    } catch (error) {
      console.error('Error fetching global workouts:', error);
      throw error;
    }
  }

  /**
   * Fetch single global workout by ID
   */
  static async getById(workoutId: string): Promise<GlobalWorkoutData | null> {
    try {
      const doc = await firestore()
        .collection('globalWorkouts')
        .doc(workoutId)
        .get();

      if (doc.exists) {
        return {
          id: doc.id,
          ...doc.data(),
          isGlobal: true,
        } as GlobalWorkoutData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching global workout:', error);
      throw error;
    }
  }

  /**
   * Filter global workouts by category
   */
  static async getByCategory(category: string): Promise<GlobalWorkoutData[]> {
    try {
      const snapshot = await firestore()
        .collection('globalWorkouts')
        .where('workoutCategory', '==', category)
        .get();

      // Sort by popularity in-memory to avoid requiring a composite index
      const workouts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isGlobal: true,
      })) as GlobalWorkoutData[];

      return workouts.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } catch (error) {
      console.error('Error fetching global workouts by category:', error);
      throw error;
    }
  }

  /**
   * Increment popularity count (called when workout is starred)
   */
  static async incrementPopularity(workoutId: string): Promise<void> {
    try {
      await firestore()
        .collection('globalWorkouts')
        .doc(workoutId)
        .update({
          popularity: firestore.FieldValue.increment(1),
        });
    } catch (error) {
      console.error('Error incrementing popularity:', error);
      throw error;
    }
  }

  /**
   * Decrement popularity count (called when workout is unstarred)
   */
  static async decrementPopularity(workoutId: string): Promise<void> {
    try {
      await firestore()
        .collection('globalWorkouts')
        .doc(workoutId)
        .update({
          popularity: firestore.FieldValue.increment(-1),
        });
    } catch (error) {
      console.error('Error decrementing popularity:', error);
      throw error;
    }
  }
}

export default GlobalWorkout;
