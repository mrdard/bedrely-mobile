import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {getCategoryById} from '../config/workoutCategories';
import GlobalWorkout, {GlobalWorkoutData} from '../models/GlobalWorkout';
import WorkoutImageCard from '../components/WorkoutImageCard';

interface WorkoutListScreenProps {
  categoryId: string;
  onSelectWorkout: (workout: GlobalWorkoutData) => void;
  onBack: () => void;
}

const WorkoutListScreen: React.FC<WorkoutListScreenProps> = ({
  categoryId,
  onSelectWorkout,
  onBack,
}) => {
  const [workouts, setWorkouts] = useState<GlobalWorkoutData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<GlobalWorkoutData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'images'>('images'); // Default to image view

  const category = getCategoryById(categoryId);

  const handleShowDetails = (workout: GlobalWorkoutData) => {
    setSelectedWorkout(workout);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedWorkout(null);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${mins} min`;
  };

  const getWorkoutDetails = (workout: GlobalWorkoutData): string => {
    const details: string[] = [];

    if (workout.rounds) {
      details.push(`${workout.rounds} rounds`);
    }

    if (workout.intervalDuration) {
      details.push(`Every ${formatTime(workout.intervalDuration)}`);
    }

    if (workout.duration) {
      details.push(`${formatTime(workout.duration)} total`);
    }

    if (workout.workDuration && workout.restDuration) {
      details.push(`${workout.workDuration}s work / ${workout.restDuration}s rest`);
    }

    return details.join(' • ');
  };

  useEffect(() => {
    loadWorkouts();
  }, [categoryId]);

  const loadWorkouts = async () => {
    try {
      const categoryWorkouts = await GlobalWorkout.getByCategory(categoryId);
      setWorkouts(categoryWorkouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading workouts...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹ Back to Categories</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.categoryIcon}>{category?.icon}</Text>
            <Text style={styles.title}>{category?.name} Workouts</Text>
          </View>
          <View style={styles.headerBottom}>
            <Text style={styles.subtitle}>
              {workouts.length} {workouts.length === 1 ? 'workout' : 'workouts'}
            </Text>
            <TouchableOpacity
              onPress={() => setViewMode(viewMode === 'cards' ? 'images' : 'cards')}
              style={styles.viewToggle}>
              <Text style={styles.viewToggleText}>
                {viewMode === 'images' ? '☰ List' : '🖼 Gallery'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Workouts List */}
        {workouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>{category?.icon}</Text>
            <Text style={styles.emptyTitle}>
              No {category?.name} workouts yet
            </Text>
            <Text style={styles.emptyDescription}>
              Check back soon for new workouts
            </Text>
          </View>
        ) : viewMode === 'images' ? (
          // Image Gallery View
          <View style={styles.workoutsList}>
            {workouts.map((workout, index) => (
              <WorkoutImageCard
                key={workout.id}
                workout={workout}
                index={index}
                onPress={() => onSelectWorkout(workout)}
              />
            ))}
          </View>
        ) : (
          // List View
          <View style={styles.workoutsList}>
            {workouts.map(workout => (
              <View key={workout.id} style={styles.workoutCard}>
                {/* Workout Info */}
                <View style={styles.workoutHeader}>
                  <View style={styles.workoutTitleContainer}>
                    <Text style={styles.workoutTitle}>{workout.name}</Text>
                    <View style={styles.badges}>
                      <View style={styles.globalBadge}>
                        <Text style={styles.badgeText}>⭐ Copied</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {workout.description && (
                  <Text style={styles.workoutDescription} numberOfLines={2}>
                    {workout.description}
                  </Text>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => onSelectWorkout(workout)}>
                    <Text style={styles.startButtonIcon}>▶</Text>
                    <Text style={styles.startButtonText}>Start Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => handleShowDetails(workout)}>
                    <Text style={styles.detailsButtonText}>Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Workout Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseDetails}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseDetails}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            {selectedWorkout && (
              <>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedWorkout.name}</Text>
                  <TouchableOpacity onPress={handleCloseDetails}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Workout Configuration */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Configuration</Text>
                  <Text style={styles.modalDetails}>{getWorkoutDetails(selectedWorkout)}</Text>
                </View>

                {/* Exercises */}
                {selectedWorkout.exercises && selectedWorkout.exercises.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Exercises</Text>
                    {selectedWorkout.exercises.map((exercise, index) => (
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
                {selectedWorkout.description && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Description</Text>
                    <Text style={styles.modalDescription}>{selectedWorkout.description}</Text>
                  </View>
                )}

                {/* Start Button */}
                <TouchableOpacity
                  style={styles.modalStartButton}
                  onPress={() => {
                    handleCloseDetails();
                    onSelectWorkout(selectedWorkout);
                  }}>
                  <Text style={styles.modalStartButtonText}>Start Workout</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  viewToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  emptyState: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  workoutsList: {
    gap: 16,
  },
  workoutCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
  },
  workoutHeader: {
    marginBottom: 12,
  },
  workoutTitleContainer: {
    gap: 8,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  globalBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  workoutDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  startButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startButtonIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailsButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#374151',
    borderRadius: 12,
  },
  detailsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
    borderWidth: 1,
    borderColor: '#374151',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  modalClose: {
    fontSize: 28,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  modalDetails: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
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
    fontSize: 16,
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
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 22,
  },
  modalStartButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  modalStartButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default WorkoutListScreen;
