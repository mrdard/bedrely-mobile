import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';

interface HomeScreenProps {
  onStartWorkout: () => void;
  onTrackHabit: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartWorkout,
  onTrackHabit,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>💪</Text>
          <Text style={styles.title}>BEDRELY</Text>
          <Text style={styles.subtitle}>Ready to get started?</Text>
        </View>

        {/* Main Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Start Workout Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.startWorkoutButton]}
            onPress={onStartWorkout}
            activeOpacity={0.8}>
            <View style={styles.buttonContent}>
              <Text style={styles.actionIcon}>⚡</Text>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.actionTitle}>START WORKOUT</Text>
                <Text style={styles.actionDescription}>
                  Choose from library or create your own
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Track Habit Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.trackHabitButton]}
            onPress={onTrackHabit}
            activeOpacity={0.8}>
            <View style={styles.buttonContent}>
              <Text style={styles.actionIcon}>✓</Text>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.actionTitle}>TRACK HABIT</Text>
                <Text style={styles.actionDescription}>
                  Log your daily progress
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Access Section - Coming Soon */}
        <View style={styles.quickAccessSection}>
          <View style={styles.quickAccessHeader}>
            <Text style={styles.quickAccessIcon}>⏱</Text>
            <Text style={styles.quickAccessTitle}>Quick Access</Text>
          </View>
          <Text style={styles.comingSoonText}>
            Recent workouts will appear here
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 48,
  },
  logo: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  actionButtons: {
    gap: 16,
    marginBottom: 48,
  },
  actionButton: {
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startWorkoutButton: {
    backgroundColor: '#6366f1',
  },
  trackHabitButton: {
    backgroundColor: '#10b981',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionIcon: {
    fontSize: 48,
  },
  buttonTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickAccessSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  quickAccessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  quickAccessIcon: {
    fontSize: 20,
  },
  quickAccessTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  comingSoonText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default HomeScreen;
