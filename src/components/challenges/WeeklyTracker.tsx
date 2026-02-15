import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {WeekData} from '../../models/Challenge';
import Svg, {Circle} from 'react-native-svg';

interface WeeklyTrackerProps {
  weekData: WeekData;
  weekDates: string[];
  totalGoal: number;
  onDayClick?: (date: string) => void;
}

const WeeklyTracker: React.FC<WeeklyTrackerProps> = ({
  weekData,
  weekDates,
  totalGoal,
  onDayClick,
}) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = (new Date().getDay() + 6) % 7; // Convert Sunday=0 to Monday=0

  return (
    <View style={styles.container}>
      {days.map((day, index) => {
        const dayData = weekData[index] || {total: 0};
        const isToday = index === todayIndex;
        const hasProgress = dayData.total > 0;
        const percentage = totalGoal > 0 ? Math.min((dayData.total / totalGoal) * 100, 100) : 0;
        const dateStr = weekDates[index];

        return (
          <TouchableOpacity
            key={day}
            onPress={() => onDayClick?.(dateStr)}
            style={styles.dayContainer}
            activeOpacity={0.7}>
            <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
              {day}
            </Text>

            <View
              style={[
                styles.circle,
                isToday && styles.circleToday,
                hasProgress && styles.circleWithProgress,
              ]}>
              {/* Progress ring */}
              <Svg width={48} height={48} style={styles.progressRing}>
                {/* Background circle */}
                <Circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="4"
                  fill="none"
                />
                {/* Progress circle */}
                {hasProgress && (
                  <Circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#10b981"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${percentage * 1.256} 125.6`}
                    strokeDashoffset="0"
                    rotation="-90"
                    origin="24, 24"
                  />
                )}
              </Svg>

              {/* Checkmark or dash */}
              <View style={styles.iconContainer}>
                {hasProgress ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : (
                  <Text style={styles.dash}>-</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  dayContainer: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  dayLabelToday: {
    color: '#FFFFFF',
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleToday: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  circleWithProgress: {
    backgroundColor: 'rgba(16,185,129,0.2)',
  },
  progressRing: {
    position: 'absolute',
  },
  iconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10b981',
  },
  dash: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
});

export default WeeklyTracker;
