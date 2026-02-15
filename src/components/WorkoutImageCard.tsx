import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {GlobalWorkoutData} from '../models/GlobalWorkout';
import {getCategoryById} from '../config/workoutCategories';
import {getFallbackImage} from '../services/unsplashService';

interface WorkoutImageCardProps {
  workout: GlobalWorkoutData;
  onPress: () => void;
  imageUrl?: string;
  index?: number; // For variation selection
}

const {width} = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = CARD_WIDTH * 0.875; // Shortened by 30% from original 1.25 ratio

// Card style variations
type CardVariation = 'classic' | 'minimal' | 'bold' | 'split';

const WorkoutImageCard: React.FC<WorkoutImageCardProps> = ({
  workout,
  onPress,
  imageUrl,
  index = 0,
}) => {
  const category = getCategoryById(workout.workoutCategory);
  const backgroundImage = imageUrl || getFallbackImage(workout.workoutCategory, index);

  // Cycle through variations based on index
  const variations: CardVariation[] = ['classic', 'minimal', 'bold', 'split'];
  const variation = variations[index % variations.length];

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${mins} MIN`;
  };

  const getWorkoutTypeLabel = (): string => {
    const timerType = workout.timerType?.toUpperCase() || category?.timerType?.toUpperCase() || 'WORKOUT';
    return timerType;
  };

  const getWorkoutDetails = (): string[] => {
    const details: string[] = [];

    if (workout.rounds) {
      details.push(`${workout.rounds} ROUNDS`);
    }

    if (workout.intervalDuration) {
      details.push(`EVERY ${formatTime(workout.intervalDuration)}`);
    }

    if (workout.duration && workout.timerType?.toLowerCase() === 'countdown') {
      details.push(`${formatTime(workout.duration)} CAP`);
    }

    if (workout.workDuration && workout.restDuration) {
      details.push(`${workout.workDuration}S ON / ${workout.restDuration}S OFF`);
    }

    return details;
  };

  const getExerciseSummary = (): string[] => {
    if (!workout.exercises || workout.exercises.length === 0) {
      return [];
    }

    return workout.exercises.map(ex => {
      const reps = ex.targetReps ? `${ex.targetReps} ` : '';
      return `${reps}${ex.name.toUpperCase()}`;
    });
  };

  const details = getWorkoutDetails();
  const exercises = getExerciseSummary();

  // Render different card variations
  const renderClassicVariation = () => (
    <View style={styles.frame}>
      <View style={styles.topSection}>
        <Text style={[styles.categoryText, {fontFamily: 'System', fontWeight: '800'}]}>
          {category?.name?.toUpperCase() || 'WORKOUT'}
        </Text>
      </View>

      <View style={styles.middleSection}>
        <Text style={[styles.workoutName, {fontFamily: 'System', fontSize: 28}]}>
          {workout.name.toUpperCase()}
        </Text>
        <View style={styles.divider} />
        <Text style={styles.workoutType}>{getWorkoutTypeLabel()}</Text>

        {details.length > 0 && (
          <View style={styles.detailsContainer}>
            {details.map((detail, idx) => (
              <Text key={idx} style={styles.detailText}>{detail}</Text>
            ))}
          </View>
        )}
      </View>

      {exercises.length > 0 && (
        <View style={styles.bottomSection}>
          {exercises.map((exercise, idx) => (
            <Text key={idx} style={styles.exerciseText}>{exercise}</Text>
          ))}
        </View>
      )}
    </View>
  );

  const renderMinimalVariation = () => (
    <View style={[styles.frame, {borderWidth: 2}]}>
      <View style={[styles.topSection, {marginBottom: 40}]}>
        <Text style={[styles.categoryText, {fontSize: 11, letterSpacing: 4}]}>
          {category?.name?.toUpperCase() || 'WORKOUT'}
        </Text>
        <Text style={[styles.workoutType, {fontSize: 13, marginTop: 8}]}>
          {getWorkoutTypeLabel()}
        </Text>
      </View>

      <View style={[styles.middleSection, {alignItems: 'flex-start', paddingHorizontal: 8}]}>
        <Text style={[styles.workoutName, {fontSize: 36, fontWeight: '300', textAlign: 'left', letterSpacing: -1}]}>
          {workout.name.toUpperCase()}
        </Text>

        {details.length > 0 && (
          <View style={[styles.detailsContainer, {alignItems: 'flex-start', marginTop: 20}]}>
            {details.map((detail, idx) => (
              <Text key={idx} style={[styles.detailText, {fontSize: 12, fontWeight: '400'}]}>
                {detail}
              </Text>
            ))}
          </View>
        )}

        {exercises.length > 0 && (
          <View style={[styles.bottomSection, {alignItems: 'flex-start', marginTop: 24}]}>
            {exercises.map((exercise, idx) => (
              <Text key={idx} style={[styles.exerciseText, {fontSize: 14, fontWeight: '500', textAlign: 'left'}]}>
                • {exercise}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderBoldVariation = () => (
    <View style={[styles.frame, {borderWidth: 4, padding: 16}]}>
      <View style={styles.topSection}>
        <View style={{backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 16, paddingVertical: 6}}>
          <Text style={[styles.categoryText, {color: '#000', fontSize: 16, fontWeight: '900'}]}>
            {category?.name?.toUpperCase() || 'WORKOUT'}
          </Text>
        </View>
      </View>

      <View style={[styles.middleSection, {gap: 16}]}>
        <Text style={[styles.workoutName, {fontSize: 40, fontWeight: '900', lineHeight: 44}]}>
          {workout.name.toUpperCase()}
        </Text>

        <View style={{backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 8}}>
          <Text style={[styles.workoutType, {fontSize: 16}]}>
            {getWorkoutTypeLabel()}
          </Text>
          {details.length > 0 && details.map((detail, idx) => (
            <Text key={idx} style={[styles.detailText, {fontSize: 14, marginTop: 4}]}>
              {detail}
            </Text>
          ))}
        </View>

        {exercises.length > 0 && (
          <View style={{gap: 8}}>
            {exercises.map((exercise, idx) => (
              <View key={idx} style={{backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 6}}>
                <Text style={[styles.exerciseText, {fontSize: 15, fontWeight: '700'}]}>
                  {exercise}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderSplitVariation = () => (
    <View style={[styles.frame, {borderWidth: 3, padding: 20, flexDirection: 'column'}]}>
      <View style={{flex: 1, justifyContent: 'flex-start'}}>
        <View style={{borderBottomWidth: 2, borderBottomColor: '#fff', paddingBottom: 12, marginBottom: 16}}>
          <Text style={[styles.categoryText, {fontSize: 12, letterSpacing: 3, textAlign: 'left'}]}>
            {category?.name?.toUpperCase() || 'WORKOUT'}
          </Text>
          <Text style={[styles.workoutName, {fontSize: 32, fontWeight: '700', textAlign: 'left', marginTop: 8, letterSpacing: 0}]}>
            {workout.name.toUpperCase()}
          </Text>
        </View>

        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20}}>
          <View>
            <Text style={[styles.workoutType, {fontSize: 14, textAlign: 'left'}]}>
              {getWorkoutTypeLabel()}
            </Text>
          </View>
          {details.length > 0 && (
            <View style={{alignItems: 'flex-end'}}>
              {details.map((detail, idx) => (
                <Text key={idx} style={[styles.detailText, {fontSize: 11, fontWeight: '600', textAlign: 'right'}]}>
                  {detail}
                </Text>
              ))}
            </View>
          )}
        </View>

        {exercises.length > 0 && (
          <View style={{gap: 10}}>
            {exercises.map((exercise, idx) => (
              <View key={idx} style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={{width: 6, height: 6, backgroundColor: '#fff', marginRight: 10}} />
                <Text style={[styles.exerciseText, {fontSize: 15, fontWeight: '600', textAlign: 'left', letterSpacing: 1}]}>
                  {exercise}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}>
      <ImageBackground
        source={{uri: backgroundImage}}
        style={styles.imageBackground}
        imageStyle={styles.image}>
        {/* Dark overlay for text readability */}
        <View style={styles.overlay} />

        {/* Render variation */}
        {variation === 'classic' && renderClassicVariation()}
        {variation === 'minimal' && renderMinimalVariation()}
        {variation === 'bold' && renderBoldVariation()}
        {variation === 'split' && renderSplitVariation()}
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  imageBackground: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  image: {
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  frame: {
    flex: 1,
    margin: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 24,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 16,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  workoutType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 3,
    marginBottom: 20,
  },
  detailsContainer: {
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  bottomSection: {
    alignItems: 'center',
    gap: 10,
  },
  exerciseText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
  },
});

export default WorkoutImageCard;
