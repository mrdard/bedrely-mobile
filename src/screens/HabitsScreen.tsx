import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Challenge, getWeekDates} from '../models/Challenge';
import {ChallengeService} from '../services/challengeService';
import ChallengeCard from '../components/challenges/ChallengeCard';
import AddChallengeModal from '../components/challenges/AddChallengeModal';
import LogEntryModal from '../components/challenges/LogEntryModal';
import WeeklyTracker from '../components/challenges/WeeklyTracker';

interface ChallengeWithData extends Challenge {
  count: number;
  today: number;
  weekData: any;
}

const HabitsScreen: React.FC = () => {
  const [user, setUser] = useState(auth().currentUser);
  const [challenges, setChallenges] = useState<ChallengeWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [weekDates, setWeekDates] = useState<string[]>([]);
  const [weekData, setWeekData] = useState<any>({});
  const [totalGoal, setTotalGoal] = useState(0);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(currentUser => {
      setUser(currentUser);
      if (currentUser) {
        loadChallenges();
      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const loadChallenges = async () => {
    try {
      const challengeList = await ChallengeService.getChallenges();
      const dates = getWeekDates();
      setWeekDates(dates);

      // Load data for each challenge
      const challengesWithData = await Promise.all(
        challengeList.map(async challenge => {
          const [count, today] = await ChallengeService.getChallengeEntryCount(
            challenge.id!
          );
          const weekData = await ChallengeService.getWeekData(challenge.id!);

          return {
            ...challenge,
            count,
            today,
            weekData,
          };
        })
      );

      // Calculate aggregate week data and total goal
      const aggregateWeekData: any = {};
      let combinedGoal = 0;

      challengesWithData.forEach(challenge => {
        combinedGoal += challenge.goal;
        Object.entries(challenge.weekData).forEach(([dayIndex, data]: [string, any]) => {
          const index = parseInt(dayIndex, 10);
          if (!aggregateWeekData[index]) {
            aggregateWeekData[index] = {total: 0};
          }
          aggregateWeekData[index].total += data.total;
        });
      });

      setChallenges(challengesWithData);
      setWeekData(aggregateWeekData);
      setTotalGoal(combinedGoal);
    } catch (error) {
      console.error('Error loading challenges:', error);
      Alert.alert('Error', 'Failed to load challenges');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadChallenges();
  };

  const handleAddChallenge = async (
    name: string,
    frequency: 'daily' | 'weekly',
    goal: number
  ) => {
    try {
      await ChallengeService.createChallenge(name, frequency, goal);
      await loadChallenges();
    } catch (error) {
      console.error('Error adding challenge:', error);
      Alert.alert('Error', 'Failed to create challenge');
    }
  };

  const handleAddEntry = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowLogModal(true);
  };

  const handleSaveEntry = async (value: number, date: string) => {
    console.log('📝 [HabitsScreen] handleSaveEntry called:', {
      challengeId: selectedChallenge?.id,
      challengeName: selectedChallenge?.originalName,
      value,
      date,
    });

    if (!selectedChallenge?.id) {
      console.log('❌ [HabitsScreen] No challenge selected');
      Alert.alert('Error', 'No challenge selected. Please try again.');
      return;
    }

    try {
      console.log('🔥 [HabitsScreen] Calling ChallengeService.addEntry...');
      await ChallengeService.addEntry(selectedChallenge.id, value, date);
      console.log('✅ [HabitsScreen] Entry saved successfully');
      await loadChallenges();
    } catch (error: any) {
      console.error('❌ [HabitsScreen] Error saving entry:', error);

      // Get detailed error message
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      const errorCode = error?.code || '';

      let displayMessage = `Failed to save entry to Firebase.\n\n`;
      displayMessage += `Error: ${errorMessage}\n`;
      if (errorCode) {
        displayMessage += `Code: ${errorCode}\n`;
      }
      displayMessage += `\nChallenge: ${selectedChallenge.originalName}\n`;
      displayMessage += `Value: ${value}\n`;
      displayMessage += `Date: ${date}`;

      Alert.alert(
        'Firebase Error',
        displayMessage,
        [
          {text: 'Copy Error', onPress: () => console.log('Full error:', JSON.stringify(error, null, 2))},
          {text: 'OK', style: 'cancel'},
        ]
      );
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    try {
      await ChallengeService.deleteChallenge(challengeId);
      await loadChallenges();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      Alert.alert('Error', 'Failed to delete challenge');
    }
  };

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
  };

  // Show login prompt for non-authenticated users
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginPrompt}>
          <Text style={styles.loginIcon}>🔒</Text>
          <Text style={styles.loginTitle}>Sign in Required</Text>
          <Text style={styles.loginText}>
            Sign in to track your challenges and view your progress across devices.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => {
              // Navigate to profile/login
              Alert.alert('Coming Soon', 'Please sign in from the Profile tab');
            }}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#10b981"
          />
        }>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.date}>{formatDate()}</Text>
        </View>

        {/* Weekly Progress Tracker */}
        {challenges.length > 0 && (
          <View style={styles.weeklyTrackerCard}>
            <Text style={styles.weeklyTitle}>This Week's Progress</Text>
            <WeeklyTracker
              weekData={weekData}
              weekDates={weekDates}
              totalGoal={totalGoal}
            />
          </View>
        )}

        {/* Challenges List */}
        {challenges.length > 0 ? (
          <View style={styles.challengesSection}>
            <Text style={styles.sectionTitle}>Your Challenges</Text>
            {challenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                count={challenge.count}
                today={challenge.today}
                weekData={challenge.weekData}
                weekDates={weekDates}
                onPress={() => {
                  // TODO: Navigate to challenge detail
                  console.log('Challenge pressed:', challenge.id);
                }}
                onAddEntry={() => handleAddEntry(challenge)}
                onDelete={() => handleDeleteChallenge(challenge.id!)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>No Challenges Yet</Text>
            <Text style={styles.emptyText}>
              Create your first challenge to start tracking your progress
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modals */}
      <AddChallengeModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddChallenge}
      />

      <LogEntryModal
        visible={showLogModal}
        challenge={selectedChallenge}
        onClose={() => {
          setShowLogModal(false);
          setSelectedChallenge(null);
        }}
        onSave={handleSaveEntry}
        currentDayTotal={
          challenges.find(c => c.id === selectedChallenge?.id)?.today || 0
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  weeklyTrackerCard: {
    backgroundColor: '#6366f1',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  weeklyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  challengesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    maxWidth: 280,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loginIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  loginText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});

export default HabitsScreen;
