import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {
  WORKOUT_CATEGORIES,
  getCategoryColors,
} from '../config/workoutCategories';
import GlobalWorkout from '../models/GlobalWorkout';

interface WorkoutCategoriesScreenProps {
  onSelectCategory: (categoryId: string) => void;
  onCreateCustom: (categoryId: string) => void;
  onBack: () => void;
}

const WorkoutCategoriesScreen: React.FC<WorkoutCategoriesScreenProps> = ({
  onSelectCategory,
  onCreateCustom,
  onBack,
}) => {
  const [workoutCounts, setWorkoutCounts] = useState<Record<string, number>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkoutCounts();
  }, []);

  const loadWorkoutCounts = async () => {
    try {
      const allWorkouts = await GlobalWorkout.getAll();

      // Count workouts by category
      const counts: Record<string, number> = {};
      allWorkouts.forEach(workout => {
        const category = workout.workoutCategory;
        counts[category] = (counts[category] || 0) + 1;
      });

      setWorkoutCounts(counts);
    } catch (error) {
      console.error('Error loading workout counts:', error);
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
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Choose Your Workout Type</Text>
          <Text style={styles.subtitle}>
            Select a category to see available workouts
          </Text>
        </View>

        {/* Category Grid */}
        <View style={styles.categoriesGrid}>
          {WORKOUT_CATEGORIES.map(category => {
            const count = workoutCounts[category.id] || 0;
            const colors = getCategoryColors(category.color);

            // Only show custom builder for workout types that support timers
            const supportsCustom = ['EMOM', 'AMRAP', 'For Time', 'HIIT', 'Tabata'].includes(category.id);

            return (
              <View key={category.id} style={styles.categoryWrapper}>
                <TouchableOpacity
                  style={[
                    styles.categoryCard,
                    {backgroundColor: colors.bg},
                  ]}
                  onPress={() => onSelectCategory(category.id)}
                  activeOpacity={0.8}>
                  {/* Workout count badge */}
                  {count > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>
                        {count} {count === 1 ? 'workout' : 'workouts'}
                      </Text>
                    </View>
                  )}

                  {/* Icon */}
                  <Text style={styles.categoryIcon}>{category.icon}</Text>

                  {/* Name */}
                  <Text style={styles.categoryName}>{category.name}</Text>

                  {/* Description */}
                  <Text style={styles.categoryDescription}>
                    {category.description}
                  </Text>
                </TouchableOpacity>

                {/* Create Custom Button */}
                {supportsCustom && (
                  <TouchableOpacity
                    style={styles.customButton}
                    onPress={() => onCreateCustom(category.id)}
                    activeOpacity={0.7}>
                    <Text style={styles.customButtonText}>+ Custom</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Info Text */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            💡 Tap "+ Custom" on any category to create your own workout
          </Text>
        </View>
      </ScrollView>
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
    marginBottom: 32,
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
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  categoryWrapper: {
    width: '47%',
  },
  categoryCard: {
    minHeight: 180,
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 8,
  },
  countBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  categoryIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  categoryDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  customButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
    borderStyle: 'dashed',
  },
  customButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default WorkoutCategoriesScreen;
