import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {
  Challenge,
  ChallengeProgress,
  ChallengeLog,
  ChallengeStats,
  WeekData,
  makeWebSafeName,
  formatDate,
  getTodayString,
} from '../models/Challenge';

/**
 * Challenge service - matches web app exactly
 * Firestore structure:
 * - challenges/{userId}/tasks/{challengeId}
 * - progress/{userId}/{challengeId}/{date}
 */
export class ChallengeService {
  /**
   * Get all challenges for the current user
   */
  static async getChallenges(): Promise<Challenge[]> {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const snapshot = await firestore()
        .collection(`challenges/${userId}/tasks`)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Challenge));
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  }

  /**
   * Create a new challenge
   */
  static async createChallenge(
    name: string,
    frequency: 'daily' | 'weekly',
    goal: number
  ): Promise<string> {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const webSafeName = makeWebSafeName(name);
    const challenge: Omit<Challenge, 'id'> = {
      originalName: name,
      frequency,
      goal,
      userId,
      createdAt: new Date().toISOString(),
    };

    try {
      await firestore()
        .collection(`challenges/${userId}/tasks`)
        .doc(webSafeName)
        .set(challenge);

      return webSafeName;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }

  /**
   * Add an entry to a challenge
   */
  static async addEntry(
    challengeId: string,
    value: number,
    date?: string
  ): Promise<void> {
    const userId = auth().currentUser?.uid;
    console.log('🔥 [ChallengeService] addEntry called:', {
      userId,
      challengeId,
      value,
      date,
    });

    if (!userId) {
      console.log('❌ [ChallengeService] User not authenticated');
      throw new Error('User not authenticated');
    }

    const dateStr = date || getTodayString();
    const progressPath = `progress/${userId}/${challengeId}/${dateStr}`;
    console.log('📂 [ChallengeService] Progress path:', progressPath);

    try {
      const progressRef = firestore().doc(progressPath);
      console.log('📖 [ChallengeService] Fetching existing progress...');
      const progressDoc = await progressRef.get();

      const newLog: ChallengeLog = {
        time: new Date().toISOString(),
        value,
      };

      if (progressDoc.exists) {
        // Update existing progress
        console.log('📝 [ChallengeService] Document exists, checking data...');
        const data = progressDoc.data() as ChallengeProgress | undefined;

        if (!data) {
          console.log('⚠️ [ChallengeService] Document exists but data is undefined, creating new entry');
          // Document exists but has no data - treat as new entry
          const newProgress: ChallengeProgress = {
            date: dateStr,
            count: value,
            total: value,
            logs: [newLog],
          };

          console.log('💾 [ChallengeService] Saving new entry:', newProgress);
          await progressRef.set(newProgress);
          console.log('✅ [ChallengeService] Created successfully');
        } else {
          console.log('📝 [ChallengeService] Updating existing progress');
          const updatedTotal = (data.total || 0) + value;
          const updatedLogs = [...(data.logs || []), newLog];

          console.log('💾 [ChallengeService] Saving update:', {
            previousTotal: data.total,
            newTotal: updatedTotal,
            logsCount: updatedLogs.length,
          });

          await progressRef.update({
            count: value,
            total: updatedTotal,
            logs: updatedLogs,
          });
          console.log('✅ [ChallengeService] Updated successfully');
        }
      } else {
        // Create new progress entry
        console.log('📝 [ChallengeService] Creating new progress entry');
        const newProgress: ChallengeProgress = {
          date: dateStr,
          count: value,
          total: value,
          logs: [newLog],
        };

        console.log('💾 [ChallengeService] Saving new entry:', newProgress);
        await progressRef.set(newProgress);
        console.log('✅ [ChallengeService] Created successfully');
      }
    } catch (error) {
      console.error('❌ [ChallengeService] Error adding entry:', error);
      throw error;
    }
  }

  /**
   * Get challenge entry count (total this year + today's total)
   */
  static async getChallengeEntryCount(
    challengeId: string
  ): Promise<[number, number]> {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      return [0, 0];
    }

    try {
      const snapshot = await firestore()
        .collection(`progress/${userId}/${challengeId}`)
        .get();

      let totalEntries = 0;
      let todayEntries = 0;

      const today = getTodayString();
      const currentYear = new Date().getFullYear();
      const yearStart = `${currentYear}-01-01`;

      snapshot.forEach(doc => {
        const data = doc.data() as ChallengeProgress;

        if (doc.id >= yearStart) {
          if (doc.id === today) {
            todayEntries = data.total;
          }
          totalEntries += data.total;
        }
      });

      return [totalEntries, todayEntries];
    } catch (error) {
      console.error('Error fetching challenge entries:', error);
      return [0, 0];
    }
  }

  /**
   * Get week data for a challenge
   */
  static async getWeekData(challengeId: string): Promise<WeekData> {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      return {};
    }

    const weekDates = this.getWeekDates();

    try {
      const snapshot = await firestore()
        .collection(`progress/${userId}/${challengeId}`)
        .get();

      const weekData: WeekData = {};

      snapshot.forEach(doc => {
        const dateStr = doc.id;
        const dayIndex = weekDates.indexOf(dateStr);

        if (dayIndex !== -1) {
          const data = doc.data() as ChallengeProgress;
          weekData[dayIndex] = {total: data.total || 0};
        }
      });

      return weekData;
    } catch (error) {
      console.error('Error fetching week data:', error);
      return {};
    }
  }

  /**
   * Calculate statistics for a challenge
   */
  static async calculateStats(challengeId: string): Promise<ChallengeStats> {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      return {
        totalThisYear: 0,
        currentStreak: 0,
        longestStreak: 0,
        bestDay: {date: null, count: 0},
        averagePerDay: 0,
        daysLogged: 0,
      };
    }

    try {
      const snapshot = await firestore()
        .collection(`progress/${userId}/${challengeId}`)
        .get();

      const currentYear = new Date().getFullYear();
      const yearStart = `${currentYear}-01-01`;
      const today = getTodayString();

      const progress: {[date: string]: ChallengeProgress} = {};
      snapshot.forEach(doc => {
        if (doc.id >= yearStart) {
          progress[doc.id] = doc.data() as ChallengeProgress;
        }
      });

      // Calculate stats
      let totalThisYear = 0;
      let bestDay = {date: null as string | null, count: 0};
      let daysLogged = 0;

      Object.entries(progress).forEach(([date, data]) => {
        totalThisYear += data.total;
        daysLogged++;
        if (data.total > bestDay.count) {
          bestDay = {date, count: data.total};
        }
      });

      // Calculate streaks
      const allDates: string[] = [];
      const startDate = new Date(yearStart);
      const endDate = new Date(today);

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        allDates.push(formatDate(d));
      }

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      // Calculate longest streak
      allDates.forEach(date => {
        const hasEntry = progress[date] && progress[date].total > 0;

        if (hasEntry) {
          tempStreak++;
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
        } else {
          tempStreak = 0;
        }
      });

      // Calculate current streak (from today backwards)
      for (let i = allDates.length - 1; i >= 0; i--) {
        const date = allDates[i];
        const hasEntry = progress[date] && progress[date].total > 0;

        // Skip today if no entry yet
        if (i === allDates.length - 1 && !hasEntry) {
          continue;
        }

        if (hasEntry) {
          currentStreak++;
        } else {
          break;
        }
      }

      const averagePerDay = daysLogged > 0 ? totalThisYear / daysLogged : 0;

      return {
        totalThisYear,
        currentStreak,
        longestStreak,
        bestDay,
        averagePerDay: Math.round(averagePerDay),
        daysLogged,
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        totalThisYear: 0,
        currentStreak: 0,
        longestStreak: 0,
        bestDay: {date: null, count: 0},
        averagePerDay: 0,
        daysLogged: 0,
      };
    }
  }

  /**
   * Get week dates (Monday to Sunday)
   */
  private static getWeekDates(): string[] {
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
  }

  /**
   * Delete a challenge
   */
  static async deleteChallenge(challengeId: string): Promise<void> {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      await firestore()
        .collection(`challenges/${userId}/tasks`)
        .doc(challengeId)
        .delete();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      throw error;
    }
  }
}
