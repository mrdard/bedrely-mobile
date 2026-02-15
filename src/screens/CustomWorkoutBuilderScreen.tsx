import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {getCategoryById, getCategoryColors} from '../config/workoutCategories';
import {INTERVAL_DURATIONS} from '../constants/intervalDurations';
import WheelPicker from '../components/WheelPicker';

type WorkoutType = 'EMOM' | 'AMRAP' | 'For Time' | 'HIIT' | 'Tabata';

interface Exercise {
  name: string;
  targetReps?: number;
}

interface CustomWorkoutBuilderProps {
  categoryId: string;
  onBack: () => void;
  onSave: (workoutData: any) => void;
}

const CustomWorkoutBuilderScreen: React.FC<CustomWorkoutBuilderProps> = ({
  categoryId,
  onBack,
  onSave,
}) => {
  const category = getCategoryById(categoryId);
  const colors = category ? getCategoryColors(category.color) : {bg: '#6366f1', text: '#FFF'};
  const workoutType = categoryId as WorkoutType;

  // Get defaults based on workout type
  const getDefaults = () => {
    switch (workoutType) {
      case 'EMOM':
        return {
          workoutName: 'EMOM Workout',
          rounds: 10,
          intervalDuration: 60,
        };
      case 'AMRAP':
        return {
          workoutName: 'AMRAP Workout',
          duration: 1200, // 20 min
        };
      case 'For Time':
        return {
          workoutName: 'For Time Workout',
          rounds: 5,
        };
      case 'HIIT':
        return {
          workoutName: 'HIIT Workout',
          rounds: 20,
          workDuration: 30,
          restDuration: 30,
        };
      case 'Tabata':
        return {
          workoutName: 'Tabata Workout',
          rounds: 8,
          workDuration: 20,
          restDuration: 10,
        };
      default:
        return {};
    }
  };

  const defaults = getDefaults();

  // State
  const [workoutName, setWorkoutName] = useState(defaults.workoutName || '');
  const [rounds, setRounds] = useState(defaults.rounds || 10);
  const [intervalDuration, setIntervalDuration] = useState(defaults.intervalDuration || 60);
  const [duration, setDuration] = useState(defaults.duration || 1200);
  const [workDuration, setWorkDuration] = useState(defaults.workDuration || 30);
  const [restDuration, setRestDuration] = useState(defaults.restDuration || 30);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseReps, setNewExerciseReps] = useState('');

  // Rounds options (1-50)
  const roundsOptions = Array.from({length: 50}, (_, i) => ({
    label: `${i + 1}`,
    value: i + 1,
  }));

  // Duration options for AMRAP (5, 10, 15, 20, 25, 30, 40, 50, 60 min)
  const durationOptions = [5, 10, 15, 20, 25, 30, 40, 50, 60].map(mins => ({
    label: `${mins} min`,
    value: mins * 60,
  }));

  // Work/Rest options (10-60s)
  const workRestOptions = [10, 15, 20, 30, 40, 45, 60].map(secs => ({
    label: `${secs}s`,
    value: secs,
  }));

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${mins} min`;
  };

  const getTotalTime = (): string => {
    switch (workoutType) {
      case 'EMOM':
        const totalSeconds = rounds * intervalDuration;
        return formatTime(totalSeconds);
      case 'AMRAP':
        return formatTime(duration);
      case 'HIIT':
      case 'Tabata':
        const hiitTotal = rounds * (workDuration + restDuration);
        return formatTime(hiitTotal);
      default:
        return '';
    }
  };

  const handleAddExercise = () => {
    if (!newExerciseName.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }

    const exercise: Exercise = {
      name: newExerciseName.trim(),
    };

    if (newExerciseReps) {
      exercise.targetReps = parseInt(newExerciseReps, 10);
    }

    setExercises([...exercises, exercise]);
    setNewExerciseName('');
    setNewExerciseReps('');
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    // Exercises are optional - you can just use the timer

    const workoutData: any = {
      name: workoutName.trim(),
      workoutCategory: categoryId,
      exercises,
      isGlobal: false,
    };

    switch (workoutType) {
      case 'EMOM':
        workoutData.rounds = rounds;
        workoutData.intervalDuration = intervalDuration;
        workoutData.timerType = 'interval';
        break;
      case 'AMRAP':
        workoutData.duration = duration;
        workoutData.timerType = 'countdown';
        break;
      case 'For Time':
        workoutData.rounds = rounds;
        workoutData.timerType = 'stopwatch';
        break;
      case 'HIIT':
      case 'Tabata':
        workoutData.rounds = rounds;
        workoutData.workDuration = workDuration;
        workoutData.restDuration = restDuration;
        workoutData.timerType = 'tabata';
        break;
    }

    onSave(workoutData);
  };

  const renderConfiguration = () => {
    switch (workoutType) {
      case 'EMOM':
        return (
          <View style={styles.configSection}>
            <View style={styles.pickerRow}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Rounds</Text>
                <WheelPicker
                  options={roundsOptions}
                  selectedValue={rounds}
                  onValueChange={setRounds}
                  color={colors.bg}
                />
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Every</Text>
                <WheelPicker
                  options={INTERVAL_DURATIONS}
                  selectedValue={intervalDuration}
                  onValueChange={setIntervalDuration}
                  color={colors.bg}
                />
              </View>
            </View>
          </View>
        );

      case 'AMRAP':
        return (
          <View style={styles.configSection}>
            <Text style={styles.pickerLabel}>Duration</Text>
            <WheelPicker
              options={durationOptions}
              selectedValue={duration}
              onValueChange={setDuration}
              color={colors.bg}
            />
          </View>
        );

      case 'For Time':
        return (
          <View style={styles.configSection}>
            <Text style={styles.pickerLabel}>Rounds</Text>
            <WheelPicker
              options={roundsOptions}
              selectedValue={rounds}
              onValueChange={setRounds}
              color={colors.bg}
            />
          </View>
        );

      case 'HIIT':
      case 'Tabata':
        return (
          <View style={styles.configSection}>
            <View style={styles.pickerRow}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Rounds</Text>
                <WheelPicker
                  options={roundsOptions.slice(0, 40)}
                  selectedValue={rounds}
                  onValueChange={setRounds}
                  color={colors.bg}
                />
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Work</Text>
                <WheelPicker
                  options={workRestOptions}
                  selectedValue={workDuration}
                  onValueChange={setWorkDuration}
                  color={colors.bg}
                />
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Rest</Text>
                <WheelPicker
                  options={workRestOptions}
                  selectedValue={restDuration}
                  onValueChange={setRestDuration}
                  color={colors.bg}
                />
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, {backgroundColor: colors.bg}]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Create {category?.name}</Text>
          <Text style={styles.headerSubtitle}>Total Time: {getTotalTime()}</Text>
        </View>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Start</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Workout Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Workout Name</Text>
          <TextInput
            style={styles.input}
            placeholder={defaults.workoutName}
            placeholderTextColor="#6B7280"
            value={workoutName}
            onChangeText={setWorkoutName}
          />
        </View>

        {/* Configuration */}
        {renderConfiguration()}

        {/* Exercises */}
        <View style={styles.section}>
          <Text style={styles.label}>Exercises</Text>

          {exercises.length === 0 && (
            <Text style={styles.emptyText}>Add exercises below</Text>
          )}

          {exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseItem}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                {exercise.targetReps && (
                  <Text style={styles.exerciseReps}>{exercise.targetReps} reps</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => handleRemoveExercise(index)}>
                <Text style={styles.removeButton}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Exercise Form */}
          <View style={styles.addExerciseForm}>
            <TextInput
              style={[styles.input, styles.exerciseNameInput]}
              placeholder="Exercise name..."
              placeholderTextColor="#6B7280"
              value={newExerciseName}
              onChangeText={setNewExerciseName}
            />
            <TextInput
              style={[styles.input, styles.exerciseRepsInput]}
              placeholder="Reps"
              placeholderTextColor="#6B7280"
              keyboardType="number-pad"
              value={newExerciseReps}
              onChangeText={setNewExerciseReps}
            />
            <TouchableOpacity
              style={[styles.addButton, {backgroundColor: colors.bg}]}
              onPress={handleAddExercise}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  configSection: {
    marginTop: 32,
    marginBottom: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 16,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#374151',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  exerciseReps: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  removeButton: {
    fontSize: 24,
    color: '#EF4444',
    paddingHorizontal: 8,
  },
  addExerciseForm: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  exerciseNameInput: {
    flex: 2,
  },
  exerciseRepsInput: {
    flex: 1,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default CustomWorkoutBuilderScreen;
