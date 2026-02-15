import React from 'react';
import {Text, StyleSheet} from 'react-native';

interface TimerDisplayProps {
  seconds: number;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  color?: string;
}

/**
 * TimerDisplay Component
 *
 * Large, prominent display of time in MM:SS format
 * Used by all timer types
 */
const TimerDisplay: React.FC<TimerDisplayProps> = ({
  seconds,
  size = 'large',
  color = '#FFFFFF',
}) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(
    remainingSeconds,
  ).padStart(2, '0')}`;

  const sizeMap = {
    small: 48,
    medium: 64,
    large: 96,
    xlarge: 128,
  };

  const fontSize = sizeMap[size];

  return (
    <Text style={[styles.timer, {fontSize, color}]}>{formattedTime}</Text>
  );
};

const styles = StyleSheet.create({
  timer: {
    fontFamily: 'System',
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
});

export default TimerDisplay;
