import React, {useState, useEffect, useRef} from 'react';
import {View, StyleSheet, Vibration, Animated} from 'react-native';

interface CountdownScreenProps {
  isActive: boolean;
  onComplete: () => void;
  color?: string;
}

/**
 * Shared 3-2-1-GO countdown component
 * Used by all timer types for consistent countdown experience
 */
const CountdownScreen: React.FC<CountdownScreenProps> = ({
  isActive,
  onComplete,
  color = '#FFFFFF',
}) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Start countdown when activated
  useEffect(() => {
    if (isActive && countdown === null) {
      setCountdown(3);
      Vibration.vibrate(100);

      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev === null) return null;
          const next = prev - 1;
          if (next > 0) Vibration.vibrate(100);
          else if (next === 0) Vibration.vibrate([0, 100, 100, 100]);
          if (next < 0) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            setCountdown(null);
            onComplete();
            return null;
          }
          return next;
        });
      }, 1000);

      return () => {
        if (countdownRef.current) clearInterval(countdownRef.current);
      };
    }
  }, [isActive, onComplete]);

  // Zoom animation on each count change
  useEffect(() => {
    if (countdown !== null) {
      scaleAnim.setValue(0.5);
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [countdown]);

  if (!isActive || countdown === null) {
    return null;
  }

  const isGo = countdown === 0;

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.countdownText,
          {color},
          isGo && styles.goText,
          {transform: [{scale: scaleAnim}]},
        ]}>
        {isGo ? 'GO!' : countdown}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 200,
    fontWeight: '900',
  },
  goText: {
    fontSize: 160, // 20% smaller
  },
});

export default CountdownScreen;
