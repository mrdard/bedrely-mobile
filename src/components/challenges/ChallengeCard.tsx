import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {Challenge, ChallengeStats, WeekData} from '../../models/Challenge';
import WeeklyTracker from './WeeklyTracker';

interface ChallengeCardProps {
  challenge: Challenge;
  count: number;
  today: number;
  weekData: WeekData;
  weekDates: string[];
  onPress: () => void;
  onAddEntry: () => void;
  onDelete?: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  count,
  today,
  weekData,
  weekDates,
  onPress,
  onAddEntry,
  onDelete,
}) => {
  const percentage = challenge.goal > 0 ? Math.min((today / challenge.goal) * 100, 100) : 0;

  const handleLongPress = () => {
    if (onDelete) {
      Alert.alert(
        challenge.originalName,
        'What would you like to do?',
        [
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              Alert.alert(
                'Delete Challenge',
                `Are you sure you want to delete "${challenge.originalName}"? This cannot be undone.`,
                [
                  {text: 'Cancel', style: 'cancel'},
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: onDelete,
                  },
                ]
              );
            },
          },
          {text: 'Cancel', style: 'cancel'},
        ]
      );
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.9}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{challenge.originalName}</Text>
          <Text style={styles.subtitle}>
            {challenge.frequency === 'daily' ? 'Daily' : 'Weekly'} • Goal: {challenge.goal}
          </Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
          <Text style={styles.countLabel}>This Year</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Today's Progress</Text>
          <Text style={styles.progressValue}>
            {today} / {challenge.goal}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              {width: `${percentage}%`},
              percentage >= 100 && styles.progressBarComplete,
            ]}
          />
        </View>
      </View>

      {/* Weekly Tracker */}
      <View style={styles.weeklySection}>
        <WeeklyTracker
          weekData={weekData}
          weekDates={weekDates}
          totalGoal={challenge.goal}
        />
      </View>

      {/* Add Entry Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddEntry}
        activeOpacity={0.8}>
        <Text style={styles.addButtonText}>+ Log Entry</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  countBadge: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  countText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  countLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  progressBarComplete: {
    backgroundColor: '#10b981',
  },
  weeklySection: {
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#10b981',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ChallengeCard;
