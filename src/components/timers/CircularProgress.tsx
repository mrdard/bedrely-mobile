import React from 'react';
import {View, StyleSheet} from 'react-native';
import Svg, {Circle} from 'react-native-svg';

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  direction?: 'clockwise' | 'counterclockwise';
  children?: React.ReactNode;
}

/**
 * CircularProgress Component
 *
 * SVG-based circular progress for smooth, accurate rendering
 */
const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 320,
  strokeWidth = 16,
  color = '#10b981',
  direction = 'clockwise',
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate stroke dash offset for progress
  // Clockwise: fills as progress increases (0% = empty, 100% = full)
  // Counterclockwise: empties as progress increases (0% = full, 100% = empty)
  const strokeDashoffset = direction === 'clockwise'
    ? circumference - (progress / 100) * circumference
    : (progress / 100) * circumference;

  const center = size / 2;

  // For counterclockwise, we flip the circle horizontally
  const scaleX = direction === 'counterclockwise' ? -1 : 1;

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <Svg
        width={size}
        height={size}
        style={[styles.svg, {transform: [{scaleX}]}]}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#374151"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default CircularProgress;
