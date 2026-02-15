import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {TimerType} from '../types/workout';

interface WorkoutConfigScreenProps {
  timerType: TimerType;
  onStart: (config: WorkoutConfig) => void;
  onBack: () => void;
}

export interface WorkoutConfig {
  duration?: number; // in seconds
  rounds?: number;
  workDuration?: number;
  restDuration?: number;
}

// EMOM intervals: 15s, 30s, 45s, 1min, 1:30, 2min, 2:30... up to 10min
const emomIntervals = [
  {label: '15s', value: 15},
  {label: '30s', value: 30},
  {label: '45s', value: 45},
  {label: '1:00', value: 60},
  {label: '1:30', value: 90},
  {label: '2:00', value: 120},
  {label: '2:30', value: 150},
  {label: '3:00', value: 180},
  {label: '3:30', value: 210},
  {label: '4:00', value: 240},
  {label: '4:30', value: 270},
  {label: '5:00', value: 300},
  {label: '5:30', value: 330},
  {label: '6:00', value: 360},
  {label: '6:30', value: 390},
  {label: '7:00', value: 420},
  {label: '7:30', value: 450},
  {label: '8:00', value: 480},
  {label: '8:30', value: 510},
  {label: '9:00', value: 540},
  {label: '9:30', value: 570},
  {label: '10:00', value: 600},
];

// AMRAP durations: 1min, 2min, 3min... up to 60min
const amrapDurations = Array.from({length: 60}, (_, i) => ({
  label: `${i + 1} min`,
  value: (i + 1) * 60,
}));

// EMOM rounds: 1-30
const emomRounds = Array.from({length: 30}, (_, i) => ({
  label: `${i + 1}`,
  value: i + 1,
}));

// Tabata rounds: 1-20
const tabataRounds = Array.from({length: 20}, (_, i) => ({
  label: `${i + 1}`,
  value: i + 1,
}));

// Default/Preset Workouts
const amrapPresets = [
  {name: 'Quick AMRAP', duration: 300}, // 5 min
  {name: 'Standard', duration: 600}, // 10 min
  {name: 'Long AMRAP', duration: 900}, // 15 min
  {name: 'Cindy', duration: 1200}, // 20 min
];

const emomPresets = [
  {name: 'Quick 5', rounds: 5},
  {name: 'Standard 10', rounds: 10},
  {name: 'Challenge 15', rounds: 15},
  {name: 'Endurance 20', rounds: 20},
];

const tabataPresets = [
  {name: 'Quick Tabata', rounds: 4, work: 20, rest: 10},
  {name: 'Classic Tabata', rounds: 8, work: 20, rest: 10},
  {name: 'Extended', rounds: 12, work: 20, rest: 10},
  {name: 'Long Work', rounds: 8, work: 30, rest: 15},
];

const WorkoutConfigScreen: React.FC<WorkoutConfigScreenProps> = ({
  timerType,
  onStart,
  onBack,
}) => {
  // AMRAP config
  const [amrapDuration, setAmrapDuration] = useState(300); // 5 minutes default

  // EMOM config
  const [emomRounds, setEmomRounds] = useState(10); // 10 rounds default

  // Tabata config
  const [tabataRounds, setTabataRounds] = useState(8); // 8 rounds default
  const [tabataWork, setTabataWork] = useState(20); // 20s work
  const [tabataRest, setTabataRest] = useState(10); // 10s rest

  const handleStart = () => {
    let config: WorkoutConfig = {};

    switch (timerType) {
      case 'forTime':
        config = {}; // No config needed for ForTime
        break;
      case 'amrap':
        config = {duration: amrapDuration};
        break;
      case 'emom':
        config = {rounds: emomRounds};
        break;
      case 'tabata':
        config = {
          rounds: tabataRounds,
          workDuration: tabataWork,
          restDuration: tabataRest,
        };
        break;
    }

    onStart(config);
  };

  const getTitle = () => {
    switch (timerType) {
      case 'forTime':
        return 'For Time';
      case 'amrap':
        return 'AMRAP';
      case 'emom':
        return 'EMOM';
      case 'tabata':
        return 'Tabata';
      default:
        return 'Workout';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{getTitle()}</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* For Time - No configuration needed */}
        {timerType === 'forTime' && (
          <View style={styles.section}>
            <Text style={styles.description}>
              Complete your workout as fast as possible.{'\n\n'}
              Timer starts at 0 and counts up until you finish.
            </Text>
          </View>
        )}

        {/* AMRAP Configuration */}
        {timerType === 'amrap' && (
          <>
            {/* Presets */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Start</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.presetsScroll}>
                {amrapPresets.map((preset, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.presetCard}
                    onPress={() => setAmrapDuration(preset.duration)}>
                    <Text style={styles.presetName}>{preset.name}</Text>
                    <Text style={styles.presetDuration}>
                      {preset.duration / 60} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Custom Duration */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Custom Duration</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.optionsScroll}>
                {amrapDurations.slice(0, 30).map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.option,
                      amrapDuration === option.value && styles.optionSelected,
                    ]}
                    onPress={() => setAmrapDuration(option.value)}>
                    <Text
                      style={[
                        styles.optionText,
                        amrapDuration === option.value && styles.optionTextSelected,
                      ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.description}>
                Complete as many rounds as possible in {amrapDuration / 60} minutes.
              </Text>
            </View>
          </>
        )}

        {/* EMOM Configuration */}
        {timerType === 'emom' && (
          <>
            {/* Presets */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Start</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.presetsScroll}>
                {emomPresets.map((preset, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.presetCard}
                    onPress={() => setEmomRounds(preset.rounds)}>
                    <Text style={styles.presetName}>{preset.name}</Text>
                    <Text style={styles.presetDuration}>
                      {preset.rounds} rounds
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Custom Rounds */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Custom Rounds</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.optionsScroll}>
                {Array.from({length: 30}, (_, i) => i + 1).map(num => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.option,
                      emomRounds === num && styles.optionSelected,
                    ]}
                    onPress={() => setEmomRounds(num)}>
                    <Text
                      style={[
                        styles.optionText,
                        emomRounds === num && styles.optionTextSelected,
                      ]}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.description}>
                Complete your workout every minute on the minute for {emomRounds}{' '}
                rounds.
              </Text>
            </View>
          </>
        )}

        {/* Tabata Configuration */}
        {timerType === 'tabata' && (
          <>
            {/* Presets */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Start</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.presetsScroll}>
                {tabataPresets.map((preset, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.presetCard}
                    onPress={() => {
                      setTabataRounds(preset.rounds);
                      setTabataWork(preset.work);
                      setTabataRest(preset.rest);
                    }}>
                    <Text style={styles.presetName}>{preset.name}</Text>
                    <Text style={styles.presetDuration}>
                      {preset.rounds}x {preset.work}s/{preset.rest}s
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Custom Configuration */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rounds</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.optionsScroll}>
                {Array.from({length: 20}, (_, i) => i + 1).map(num => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.option,
                      tabataRounds === num && styles.optionSelected,
                    ]}
                    onPress={() => setTabataRounds(num)}>
                    <Text
                      style={[
                        styles.optionText,
                        tabataRounds === num && styles.optionTextSelected,
                      ]}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Work Duration</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.optionsScroll}>
                {[10, 15, 20, 25, 30, 40, 45, 50, 60].map(seconds => (
                  <TouchableOpacity
                    key={seconds}
                    style={[
                      styles.option,
                      tabataWork === seconds && styles.optionSelected,
                    ]}
                    onPress={() => setTabataWork(seconds)}>
                    <Text
                      style={[
                        styles.optionText,
                        tabataWork === seconds && styles.optionTextSelected,
                      ]}>
                      {seconds}s
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rest Duration</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.optionsScroll}>
                {[5, 10, 15, 20, 30].map(seconds => (
                  <TouchableOpacity
                    key={seconds}
                    style={[
                      styles.option,
                      tabataRest === seconds && styles.optionSelected,
                    ]}
                    onPress={() => setTabataRest(seconds)}>
                    <Text
                      style={[
                        styles.optionText,
                        tabataRest === seconds && styles.optionTextSelected,
                      ]}>
                      {seconds}s
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.description}>
              {tabataRounds} rounds of {tabataWork}s work / {tabataRest}s rest
              {'\n'}
              Total time: {((tabataWork + tabataRest) * tabataRounds) / 60} minutes
            </Text>
          </>
        )}
      </ScrollView>

      {/* Start Button */}
      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startButtonText}>Start Workout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  optionsScroll: {
    marginBottom: 16,
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  optionSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  presetsScroll: {
    marginBottom: 16,
  },
  presetCard: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#10b981',
    minWidth: 140,
  },
  presetName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  presetDuration: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  startButton: {
    marginHorizontal: 24,
    marginBottom: 40,
    backgroundColor: '#10b981',
    paddingVertical: 18,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
  },
});

export default WorkoutConfigScreen;
