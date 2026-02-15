import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity} from 'react-native';
import {getRandomMessage} from '../constants/motivationalMessages';

interface CelebrationScreenProps {
  isActive: boolean;
  onComplete: () => void;
  color?: string;
}

const {width, height} = Dimensions.get('window');

const CelebrationScreen: React.FC<CelebrationScreenProps> = ({
  isActive,
  onComplete,
  color = '#6366f1',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const [message, setMessage] = React.useState(getRandomMessage());

  // Confetti animations - TWO separate bursts (40 particles total - optimized for performance)
  const confetti = useRef(
    Array.from({length: 40}, (_, i) => {
      const burstNumber = i < 20 ? 1 : 2; // First or second burst
      const particleIndex = i % 20; // Index within the burst (0-19)
      const isTopExplosion = particleIndex < 10; // First 10 from left, next 10 from right
      const angleIndex = particleIndex % 10;
      const angle = (angleIndex / 10) * Math.PI * 2;

      const randomShape = Math.random();
      let shape: 'circle' | 'square' | 'star' | 'diamond';
      if (randomShape < 0.25) shape = 'star';
      else if (randomShape < 0.5) shape = 'diamond';
      else if (randomShape < 0.75) shape = 'circle';
      else shape = 'square';

      // Positions: left vs right side
      const startX = isTopExplosion ? -100 : width - 200;
      const startY = isTopExplosion ? -100 : 100;

      return {
        x: useRef(new Animated.Value(startX)).current,
        y: useRef(new Animated.Value(startY)).current,
        rotation: useRef(new Animated.Value(0)).current,
        scale: useRef(new Animated.Value(0.3 + Math.random() * 0.4)).current,
        opacity: useRef(new Animated.Value(0)).current, // Start invisible
        angle,
        velocity: 300 + Math.random() * 400,
        shape,
        isTopExplosion,
        burstNumber,
        startX,
        startY,
      };
    })
  ).current;

  useEffect(() => {
    if (isActive) {
      console.log('🎊 [CelebrationScreen] isActive=true, screen visible');
      // Get new random message each time
      setMessage(getRandomMessage());

      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      confetti.forEach(item => {
        item.x.setValue(item.startX);
        item.y.setValue(item.startY);
        item.rotation.setValue(0);
        item.opacity.setValue(0); // Start invisible
      });

      // Fade in screen immediately
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Scale up message immediately
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();

      // Wait 1 second, THEN trigger confetti animation
      console.log('🎊 [CelebrationScreen] Waiting 1 second before confetti...');
      setTimeout(() => {
        console.log('🎊 [CelebrationScreen] Starting confetti animation at:', new Date().toISOString());

        // TWO separate bursts - bam => bam (1 second apart)
        confetti.forEach((item, index) => {
        const duration = 2500 + Math.random() * 1000;
        const endX = item.startX + Math.cos(item.angle) * item.velocity;
        const endY = item.startY + Math.sin(item.angle) * item.velocity;

        // Burst timing: first burst starts immediately, second burst starts 1 second later
        const burstDelay = item.burstNumber === 1 ? 0 : 1000;
        const particleIndex = index % 20;
        const staggerDelay = particleIndex * 10; // Slightly longer stagger for smoother effect
        const totalDelay = burstDelay + staggerDelay;

        Animated.parallel([
          // Fade in
          Animated.sequence([
            Animated.delay(totalDelay),
            Animated.timing(item.opacity, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          // Explode X
          Animated.sequence([
            Animated.delay(totalDelay),
            Animated.timing(item.x, {
              toValue: endX,
              duration: duration * 0.6,
              useNativeDriver: true,
            }),
          ]),
          // Explode Y
          Animated.sequence([
            Animated.delay(totalDelay),
            Animated.timing(item.y, {
              toValue: endY,
              duration: duration * 0.6,
              useNativeDriver: true,
            }),
          ]),
          // Rotate
          Animated.sequence([
            Animated.delay(totalDelay),
            Animated.timing(item.rotation, {
              toValue: (Math.random() > 0.5 ? 360 : -360) * 2,
              duration,
              useNativeDriver: true,
            }),
          ]),
          // Fade out
          Animated.sequence([
            Animated.delay(totalDelay + duration * 0.3),
            Animated.timing(item.opacity, {
              toValue: 0,
              duration: duration * 0.7,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
        });
      }, 1000); // 1 second delay before confetti
    }
  }, [isActive]);

  if (!isActive) {
    console.log('🎊 [CelebrationScreen] isActive=false, not rendering');
    return null;
  }

  console.log('🎊 [CelebrationScreen] Rendering celebration overlay');

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
      ]}>
      {/* Confetti - Explosion Effect */}
      {confetti.map((item, index) => {
        // Vibrant rainbow colors
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FF69B4', '#00CED1', '#F472B6', '#A78BFA'];
        const itemColor = colors[index % colors.length];

        // Render different shapes
        let shapeStyle = styles.confettiPiece;
        if (item.shape === 'circle') shapeStyle = styles.confettiCircle;
        else if (item.shape === 'diamond') shapeStyle = styles.confettiDiamond;
        else if (item.shape === 'star') shapeStyle = styles.confettiStar;

        return (
          <Animated.View
            key={index}
            style={[
              shapeStyle,
              {
                backgroundColor: item.shape === 'star' ? itemColor : itemColor,
                borderColor: item.shape === 'star' ? itemColor : 'transparent',
                opacity: item.opacity,
                transform: [
                  {translateX: item.x},
                  {translateY: item.y},
                  {
                    rotate: item.rotation.interpolate({
                      inputRange: [0, 720],
                      outputRange: ['0deg', '720deg'],
                    }),
                  },
                  {scale: item.scale},
                ],
              },
            ]}
          />
        );
      })}

      {/* Message */}
      <Animated.View
        style={[
          styles.messageContainer,
          {
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <Text style={styles.checkmark}>✓</Text>
        <Text style={styles.completeText}>Workout Complete!</Text>
        <Text style={[styles.motivationalText, {color}]}>{message}</Text>

        {/* Done Button */}
        <TouchableOpacity
          style={[styles.doneButton, {backgroundColor: color}]}
          onPress={onComplete}
          activeOpacity={0.8}>
          <Text style={styles.doneButtonText}>FINISH</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Solid black to prevent white flash
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 1,
  },
  confettiCircle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  confettiDiamond: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 0,
    transform: [{rotate: '45deg'}],
  },
  confettiStar: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  checkmark: {
    fontSize: 80,
    color: '#10b981',
    marginBottom: 20,
    textShadowColor: 'rgba(16, 185, 129, 0.5)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 20,
  },
  completeText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 2,
    textAlign: 'center',
  },
  motivationalText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 40,
  },
  doneButton: {
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  doneButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});

export default CelebrationScreen;
