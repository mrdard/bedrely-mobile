import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {TimerType} from '../types/workout';

interface TimerSelectionScreenProps {
  onSelectTimer: (timerType: TimerType) => void;
  onSignOut: () => void;
}

interface TimerOption {
  type: TimerType;
  title: string;
  description: string;
  color: string;
  icon: string;
}

const timerOptions: TimerOption[] = [
  {
    type: 'forTime',
    title: 'For Time',
    description: 'Complete your workout as fast as possible',
    color: '#10b981',
    icon: '⏱',
  },
  {
    type: 'amrap',
    title: 'AMRAP',
    description: 'As Many Rounds As Possible in set time',
    color: '#3b82f6',
    icon: '🔄',
  },
  {
    type: 'emom',
    title: 'EMOM',
    description: 'Every Minute On the Minute intervals',
    color: '#6366f1',
    icon: '⏰',
  },
  {
    type: 'tabata',
    title: 'Tabata',
    description: '20s work / 10s rest high-intensity intervals',
    color: '#dc2626',
    icon: '⚡',
  },
];

const TimerSelectionScreen: React.FC<TimerSelectionScreenProps> = ({
  onSelectTimer,
  onSignOut,
}) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>💪</Text>
        <Text style={styles.title}>BEDRELY</Text>
        <Text style={styles.subtitle}>Choose Your Timer</Text>
      </View>

      {/* Timer Options */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.timerList}
        showsVerticalScrollIndicator={false}>
        {timerOptions.map(option => (
          <TouchableOpacity
            key={option.type}
            style={[styles.timerCard, {borderLeftColor: option.color}]}
            onPress={() => onSelectTimer(option.type)}
            activeOpacity={0.7}>
            <View style={styles.timerCardContent}>
              <Text style={styles.timerIcon}>{option.icon}</Text>
              <View style={styles.timerInfo}>
                <Text style={styles.timerTitle}>{option.title}</Text>
                <Text style={styles.timerDescription}>{option.description}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sign Out Button */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={onSignOut}
        activeOpacity={0.7}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  logo: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  timerList: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  timerCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  timerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  timerIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  timerInfo: {
    flex: 1,
  },
  timerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  timerDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  arrow: {
    fontSize: 36,
    color: '#4B5563',
    marginLeft: 8,
  },
  signOutButton: {
    marginHorizontal: 24,
    marginBottom: 40,
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default TimerSelectionScreen;
