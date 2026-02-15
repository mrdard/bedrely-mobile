import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Vibration,
  Modal,
  ScrollView,
} from 'react-native';
import CircularProgress from './CircularProgress';
import CountdownScreen from './CountdownScreen';
import {Exercise} from '../../types/workout';

type TimerType = 'EMOM' | 'AMRAP' | 'ForTime' | 'Tabata';

interface TimerConfig {
  // For EMOM
  rounds?: number;
  intervalDuration?: number; // seconds per EMOM round (default 60)
  // For AMRAP
  duration?: number;
  // For Tabata
  workDuration?: number;
  restDuration?: number;
}

interface UniversalTimerProps {
  type: TimerType;
  config: TimerConfig;
  exercises?: Exercise[];
  color?: string;
  title?: string; // Category name (e.g., "AMRAP", "For Time", etc.)
  workoutName?: string; // Actual workout name (e.g., "Burpee Hell", "Cardio Blast")
  workoutDescription?: string; // Workout description for info modal
  onComplete?: (result?: number) => void;
  onStop?: () => void;
}

/**
 * Universal Timer Component
 *
 * Single timer that adapts behavior based on type:
 * - EMOM: Interval timer, counts down 60s per round, counter-clockwise
 * - AMRAP: Countdown timer, counts down from duration, clockwise
 * - ForTime: Stopwatch, counts up from 0, clockwise
 * - Tabata: Work/rest intervals, clockwise
 */
const UniversalTimer: React.FC<UniversalTimerProps> = ({
  type,
  config,
  exercises = [],
  color = '#6366f1',
  title,
  workoutName,
  workoutDescription,
  onComplete,
  onStop,
}) => {
  // Universal state
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Type-specific state
  const [currentTime, setCurrentTime] = useState(getInitialTime());
  const [currentRound, setCurrentRound] = useState(1);
  const [isWorkPhase, setIsWorkPhase] = useState(true); // For Tabata

  // AMRAP round tracking
  const [roundTimes, setRoundTimes] = useState<number[]>([]); // Time when each round was completed
  const [lastRoundTime, setLastRoundTime] = useState(0); // Time of last round marker

  // Info modal
  const [showInfo, setShowInfo] = useState(false);

  function getInitialTime(): number {
    switch (type) {
      case 'EMOM':
        return config.intervalDuration || 60;
      case 'AMRAP':
        return config.duration || 300;
      case 'ForTime':
        return 0;
      case 'Tabata':
        return config.workDuration || 20;
    }
  }

  function getMaxRounds(): number {
    switch (type) {
      case 'EMOM':
        return config.rounds || 10;
      case 'Tabata':
        return config.rounds || 8;
      default:
        return 1;
    }
  }

  function getMaxTime(): number {
    switch (type) {
      case 'EMOM':
        return config.intervalDuration || 60;
      case 'AMRAP':
        return config.duration || 300;
      case 'ForTime':
        return 3600; // 60 min max for progress
      case 'Tabata':
        return isWorkPhase ? (config.workDuration || 20) : (config.restDuration || 10);
    }
  }

  // Calculate progress (0-100)
  function getProgress(): number {
    switch (type) {
      case 'EMOM':
        // Counter-clockwise: full -> empty as time counts down
        const intervalDuration = config.intervalDuration || 60;
        return (currentTime / intervalDuration) * 100;
      case 'AMRAP':
        // Clockwise: empty -> full as time counts down
        return ((config.duration! - currentTime) / config.duration!) * 100;
      case 'ForTime':
        // Clockwise: empty -> full as time counts up
        return Math.min((currentTime / 3600) * 100, 100);
      case 'Tabata':
        const maxTime = getMaxTime();
        return ((maxTime - currentTime) / maxTime) * 100;
    }
  }

  // Get progress direction
  function getDirection(): 'clockwise' | 'counterclockwise' {
    return type === 'EMOM' ? 'counterclockwise' : 'clockwise';
  }

  // Main timer logic
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const increment = (type === 'ForTime') ? 1 : -1;
          const newTime = prev + increment;

          // Check completion conditions
          if (type === 'EMOM' && newTime < 0) {
            handleRoundComplete();
            return config.intervalDuration || 60;
          } else if (type === 'AMRAP' && newTime <= 0) {
            handleWorkoutComplete();
            return 0;
          } else if (type === 'ForTime') {
            return newTime;
          } else if (type === 'Tabata' && newTime < 0) {
            handleTabataPhaseComplete();
            return isWorkPhase ? (config.restDuration || 10) : (config.workDuration || 20);
          }

          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isPaused, currentRound, isWorkPhase, type]);

  function handleRoundComplete() {
    setCurrentRound(prev => {
      const nextRound = prev + 1;
      const maxRounds = getMaxRounds();

      if (nextRound > maxRounds) {
        handleWorkoutComplete();
        return prev;
      }

      Vibration.vibrate([0, 100, 100, 100]);
      return nextRound;
    });
  }

  function handleTabataPhaseComplete() {
    if (isWorkPhase) {
      // Work -> Rest
      setIsWorkPhase(false);
      Vibration.vibrate(100);
    } else {
      // Rest -> Work (new round)
      setIsWorkPhase(true);
      setCurrentRound(prev => {
        const nextRound = prev + 1;
        const maxRounds = getMaxRounds();

        if (nextRound > maxRounds) {
          handleWorkoutComplete();
          return prev;
        }

        Vibration.vibrate([0, 100, 100, 100]);
        return nextRound;
      });
    }
  }

  function handleWorkoutComplete() {
    console.log('⏱️  [UniversalTimer] handleWorkoutComplete called at:', new Date().toISOString());
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsPaused(false);
    Vibration.vibrate([0, 100, 100, 100, 100, 100, 100, 100]);

    console.log('⏱️  [UniversalTimer] Calling onComplete via setTimeout');
    // Call parent's onComplete on next tick to avoid setState during render
    if (onComplete) {
      const result = type === 'ForTime' ? currentTime : currentRound;
      setTimeout(() => {
        console.log('⏱️  [UniversalTimer] setTimeout fired, calling onComplete with result:', result);
        onComplete(result);
      }, 0);
    }
  }

  function handleCountdownComplete() {
    setShowCountdown(false);
    setIsRunning(true);
  }

  function handleToggle() {
    if (showCountdown) return;

    if (!isRunning) {
      setShowCountdown(true);
    } else if (isPaused) {
      setIsPaused(false);
      Vibration.vibrate(100);
    } else {
      setIsPaused(true);
      Vibration.vibrate(100);
    }
  }

  function handleStop() {
    // Pause the timer first
    setIsPaused(true);
    Vibration.vibrate(100);

    // Show quit confirmation
    Alert.alert(
      'Quit Workout',
      'Do you want to quit this workout?',
      [
        {
          text: 'No',
          onPress: () => {
            // Resume the workout
            setIsPaused(false);
            Vibration.vibrate(100);
          },
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            // Exit the workout
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (onStop) onStop();
          },
        },
      ],
    );
  }

  // AMRAP round marker
  function handleMarkRound() {
    if (type !== 'AMRAP' || !isRunning || isPaused) return;

    const elapsedTime = config.duration! - currentTime;
    const roundTime = elapsedTime - lastRoundTime;

    setRoundTimes([...roundTimes, roundTime]);
    setLastRoundTime(elapsedTime);
    setCurrentRound(prev => prev + 1);

    Vibration.vibrate(100);
  }

  // Calculate average round time for AMRAP
  function getAverageRoundTime(): number {
    if (roundTimes.length === 0) return 0;
    const sum = roundTimes.reduce((acc, time) => acc + time, 0);
    return Math.round(sum / roundTimes.length);
  }

  // Format time display
  function formatTime(seconds: number): string {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Get display label
  function getLabel(): string {
    if (isPaused) return 'PAUSED';

    switch (type) {
      case 'EMOM':
        return 'seconds';
      case 'AMRAP':
        return 'minutes remaining';
      case 'ForTime':
        return 'elapsed';
      case 'Tabata':
        return isWorkPhase ? 'WORK' : 'REST';
    }
  }

  const showRounds = type === 'EMOM' || type === 'Tabata';
  const maxRounds = getMaxRounds();
  const progress = getProgress();
  const direction = getDirection();

  return (
    <>
      <CountdownScreen
        isActive={showCountdown}
        onComplete={handleCountdownComplete}
        color={color}
      />

      {!showCountdown && (
        <View style={styles.container}>
          {/* Back button */}
          {!isRunning && (
            <TouchableOpacity onPress={onStop} style={styles.backButtonTop}>
              <Text style={styles.backButtonText}>✕</Text>
            </TouchableOpacity>
          )}

          {/* Info button */}
          {isRunning && (
            <TouchableOpacity
              onPress={() => setShowInfo(true)}
              style={styles.infoButtonTop}>
              <Text style={styles.infoButtonText}>i</Text>
            </TouchableOpacity>
          )}

          {/* Centered content */}
          <View style={styles.centeredContent}>
            {/* Workout Name */}
            {workoutName && (
              <Text style={styles.workoutName}>{workoutName}</Text>
            )}

            {/* Category Title */}
            <Text style={styles.title}>{title || type}</Text>

            {/* Round indicator */}
            {isRunning && showRounds && (
              <Text style={styles.roundText}>
                Round {currentRound} of {maxRounds}
              </Text>
            )}

            {/* Circular Timer */}
            <View style={styles.timerContainer}>
              <CircularProgress
                progress={progress}
                size={320}
                strokeWidth={16}
                color={color}
                direction={direction}>
                <View style={styles.timerContent}>
                  {!isRunning ? (
                    <TouchableOpacity
                      onPress={handleToggle}
                      style={[styles.playButton, {backgroundColor: color}]}>
                      <Text style={styles.playIcon}>▶</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={handleToggle}
                      style={styles.timeDisplay}
                      activeOpacity={0.7}>
                      <Text style={styles.secondsText}>
                        {type === 'ForTime' || type === 'AMRAP'
                          ? formatTime(currentTime)
                          : currentTime}
                      </Text>
                      <Text style={[styles.label, isWorkPhase && type === 'Tabata' && styles.workLabel]}>
                        {getLabel()}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </CircularProgress>
            </View>

            {/* Progress Dots */}
            {isRunning && showRounds && (
              <View style={styles.dotsContainer}>
                {Array.from({length: maxRounds}).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index < currentRound - 1 && {backgroundColor: color},
                      index === currentRound - 1 && [
                        styles.dotCurrent,
                        {backgroundColor: color, opacity: 0.7},
                      ],
                    ]}
                  />
                ))}
              </View>
            )}

            {/* AMRAP Round Tracking */}
            {isRunning && type === 'AMRAP' && (
              <View style={styles.amrapStats}>
                <View style={styles.amrapHeader}>
                  <Text style={styles.amrapRounds}>Rounds: {roundTimes.length}</Text>
                  {roundTimes.length > 0 && (
                    <Text style={styles.amrapAverage}>
                      Avg: {formatTime(getAverageRoundTime())}
                    </Text>
                  )}
                </View>

                {/* Mark Round Button */}
                <TouchableOpacity
                  style={[styles.markRoundButton, {backgroundColor: color}]}
                  onPress={handleMarkRound}
                  disabled={isPaused}>
                  <Text style={styles.markRoundText}>Round Complete</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Control buttons */}
            {isRunning && (
              <View style={styles.controls}>
                <TouchableOpacity onPress={handleStop} style={styles.stopButton}>
                  <Text style={styles.controlIcon}>■</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleToggle}
                  style={[styles.pauseButton, {backgroundColor: color}]}>
                  <Text style={styles.controlIcon}>{isPaused ? '▶' : '❚❚'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Info Modal */}
      <Modal visible={showInfo} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowInfo(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{workoutName || title}</Text>
              <TouchableOpacity onPress={() => setShowInfo(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Configuration */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Configuration</Text>
                <View style={styles.modalConfigRow}>
                  <Text style={styles.modalConfigLabel}>Type:</Text>
                  <Text style={styles.modalConfigValue}>{title || type}</Text>
                </View>
                {type === 'EMOM' && (
                  <>
                    <View style={styles.modalConfigRow}>
                      <Text style={styles.modalConfigLabel}>Rounds:</Text>
                      <Text style={styles.modalConfigValue}>{config.rounds}</Text>
                    </View>
                    <View style={styles.modalConfigRow}>
                      <Text style={styles.modalConfigLabel}>Every:</Text>
                      <Text style={styles.modalConfigValue}>{formatTime(config.intervalDuration || 60)}</Text>
                    </View>
                  </>
                )}
                {type === 'AMRAP' && (
                  <View style={styles.modalConfigRow}>
                    <Text style={styles.modalConfigLabel}>Duration:</Text>
                    <Text style={styles.modalConfigValue}>{formatTime(config.duration!)}</Text>
                  </View>
                )}
                {(type === 'HIIT' || type === 'Tabata') && (
                  <>
                    <View style={styles.modalConfigRow}>
                      <Text style={styles.modalConfigLabel}>Rounds:</Text>
                      <Text style={styles.modalConfigValue}>{config.rounds}</Text>
                    </View>
                    <View style={styles.modalConfigRow}>
                      <Text style={styles.modalConfigLabel}>Work:</Text>
                      <Text style={styles.modalConfigValue}>{config.workDuration}s</Text>
                    </View>
                    <View style={styles.modalConfigRow}>
                      <Text style={styles.modalConfigLabel}>Rest:</Text>
                      <Text style={styles.modalConfigValue}>{config.restDuration}s</Text>
                    </View>
                  </>
                )}
              </View>

              {/* Exercises */}
              {exercises.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Exercises</Text>
                  {exercises.map((exercise, index) => (
                    <View key={index} style={styles.modalExerciseRow}>
                      <Text style={styles.modalExerciseName}>{exercise.name}</Text>
                      {exercise.targetReps && (
                        <Text style={styles.modalExerciseReps}>{exercise.targetReps} reps</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Description */}
              {workoutDescription && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Description</Text>
                  <Text style={styles.modalDescription}>{workoutDescription}</Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalCloseButton, {backgroundColor: color}]}
              onPress={() => setShowInfo(false)}>
              <Text style={styles.modalCloseButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  backButtonTop: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 22,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  infoButtonTop: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  infoButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    fontStyle: 'italic',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  workoutName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  roundText: {
    fontSize: 18,
    color: '#9CA3AF',
    marginBottom: 24,
    letterSpacing: 1,
  },
  timerContainer: {
    marginBottom: 32,
  },
  timerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 128,
    height: 128,
    borderRadius: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 64,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  timeDisplay: {
    alignItems: 'center',
  },
  secondsText: {
    fontSize: 96,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: 20,
    color: '#9CA3AF',
    marginTop: 8,
  },
  workLabel: {
    color: '#10b981',
    fontWeight: '700',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#374151',
  },
  dotCurrent: {
    transform: [{scale: 1.5}],
  },
  controls: {
    flexDirection: 'row',
    gap: 24,
  },
  stopButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  amrapStats: {
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  amrapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amrapRounds: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  amrapAverage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  roundHistory: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  roundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  roundNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    width: 40,
  },
  roundTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10b981',
    flex: 1,
    textAlign: 'center',
  },
  roundCumulative: {
    fontSize: 14,
    color: '#6B7280',
    width: 80,
    textAlign: 'right',
  },
  markRoundButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  markRoundText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#374151',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  modalClose: {
    fontSize: 28,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  modalConfigRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  modalConfigLabel: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  modalConfigValue: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalExerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  modalExerciseName: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
  modalExerciseReps: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  modalCloseButton: {
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default UniversalTimer;
