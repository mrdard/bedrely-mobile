import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {TimerType} from '../types/workout';
import HomeScreen from './HomeScreen';
import WorkoutCategoriesScreen from './WorkoutCategoriesScreen';
import WorkoutListScreen from './WorkoutListScreen';
import CustomWorkoutBuilderScreen from './CustomWorkoutBuilderScreen';
import UniversalTimer from '../components/timers/UniversalTimer';
import CelebrationScreen from '../components/CelebrationScreen';
import {GlobalWorkoutData} from '../models/GlobalWorkout';
import {getCategoryById, getCategoryColors} from '../config/workoutCategories';

type Screen =
  | 'home'
  | 'categories'
  | 'workoutList'
  | 'customBuilder'
  | 'timer'
  | 'celebration';

const WorkoutSessionScreen: React.FC = () => {
  const navigation = useNavigation();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<GlobalWorkoutData | null>(null);
  const [customBuilderCategory, setCustomBuilderCategory] = useState<string | null>(null);

  // Debug: Track all state changes
  useEffect(() => {
    console.log('🔄 [WorkoutSession] STATE CHANGED:', {
      currentScreen,
      selectedWorkout: selectedWorkout?.name || null,
      selectedCategory,
    });
  }, [currentScreen, selectedWorkout, selectedCategory]);

  // Hide tab bar when in timer mode, custom builder, or celebration
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: (currentScreen === 'timer' || currentScreen === 'customBuilder' || currentScreen === 'celebration') ? {display: 'none'} : undefined,
    });
  }, [currentScreen, navigation]);

  const handleStartWorkout = () => {
    setCurrentScreen('categories');
  };

  const handleTrackHabit = () => {
    // Navigate to Habits tab
    navigation.navigate('Habits' as never);
  };

  const handleCloseCelebration = () => {
    console.log('🎊 [WorkoutSession] Closing celebration - go to HOME (workouts screen)');

    // Go to the first screen (home/workouts screen)
    setCurrentScreen('home');
    setSelectedCategory(null);
    setSelectedWorkout(null);

    console.log('🎊 [WorkoutSession] State updates queued');
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentScreen('workoutList');
  };

  const handleSelectWorkout = (workout: GlobalWorkoutData) => {
    setSelectedWorkout(workout);
    setCurrentScreen('timer');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
    setSelectedCategory(null);
    setSelectedWorkout(null);
  };

  const handleBackToCategories = () => {
    setCurrentScreen('categories');
    setSelectedCategory(null);
  };

  const handleCreateCustom = (categoryId: string) => {
    setCustomBuilderCategory(categoryId);
    setCurrentScreen('customBuilder');
  };

  const handleSaveCustomWorkout = (workoutData: any) => {
    console.log('Custom workout created:', workoutData);

    // Convert to GlobalWorkoutData format and start immediately
    const customWorkout: GlobalWorkoutData = {
      ...workoutData,
      id: `custom-${Date.now()}`, // Temporary ID
    };

    setSelectedWorkout(customWorkout);
    setCurrentScreen('timer');

    // TODO: Save to Firestore user's custom workouts collection
  };

  const handleBackFromCustomBuilder = () => {
    setCurrentScreen('categories');
    setCustomBuilderCategory(null);
  };

  const handleComplete = (result?: number) => {
    console.log('🎉 [WorkoutSession] handleComplete called at:', new Date().toISOString());
    console.log('🎉 [WorkoutSession] Result:', result);

    // Navigate to celebration screen
    console.log('🎉 [WorkoutSession] Navigating to celebration screen');
    setCurrentScreen('celebration');

    // TODO: Save workout session to Firestore
  };

  const handleStop = () => {
    console.log('Workout stopped');
    handleBackToHome();
  };

  // Render current screen without celebration (celebration at root level)
  let currentScreenComponent;

  console.log('🖼️ [WorkoutSession] RENDERING with currentScreen:', currentScreen);

  // Home Screen
  if (currentScreen === 'home') {
    currentScreenComponent = (
      <HomeScreen
        onStartWorkout={handleStartWorkout}
        onTrackHabit={handleTrackHabit}
      />
    );
  }

  // Categories Screen
  else if (currentScreen === 'categories') {
    currentScreenComponent = (
      <WorkoutCategoriesScreen
        onSelectCategory={handleSelectCategory}
        onCreateCustom={handleCreateCustom}
        onBack={handleBackToHome}
      />
    );
  }

  // Custom Workout Builder Screen
  else if (currentScreen === 'customBuilder' && customBuilderCategory) {
    currentScreenComponent = (
      <CustomWorkoutBuilderScreen
        categoryId={customBuilderCategory}
        onSave={handleSaveCustomWorkout}
        onBack={handleBackFromCustomBuilder}
      />
    );
  }

  // Workout List Screen
  else if (currentScreen === 'workoutList' && selectedCategory) {
    currentScreenComponent = (
      <WorkoutListScreen
        categoryId={selectedCategory}
        onSelectWorkout={handleSelectWorkout}
        onBack={handleBackToCategories}
      />
    );
  }

  // Timer Screen
  else if (currentScreen === 'timer' && selectedWorkout) {
    console.log('⏱️ [WorkoutSession] RENDERING TIMER SCREEN for:', selectedWorkout.name);
    const category = getCategoryById(selectedWorkout.workoutCategory);
    const categoryColor = category ? getCategoryColors(category.color).bg : '#6366f1';

    // Map timer type to UniversalTimer type
    const timerTypeMap: Record<string, 'EMOM' | 'AMRAP' | 'ForTime' | 'Tabata'> = {
      'interval': 'EMOM',
      'countdown': 'AMRAP',
      'stopwatch': 'ForTime',
      'tabata': 'Tabata',
    };

    const baseTimerType = selectedWorkout.timerType?.toLowerCase() || category?.timerType || 'interval';

    // Special case: HIIT category should use Tabata-style intervals
    let timerType: 'EMOM' | 'AMRAP' | 'ForTime' | 'Tabata';
    if (selectedWorkout.workoutCategory === 'HIIT') {
      timerType = 'Tabata'; // HIIT uses work/rest intervals like Tabata
    } else {
      timerType = timerTypeMap[baseTimerType] || 'EMOM';
    }

    const exercises = selectedWorkout.exercises || [{name: 'Push-ups', targetReps: 10}];

    // DEBUG: Override duration for quick testing (5 seconds)
    const testDuration = 5;
    const isTestMode = false; // Set to true for 5-second test workouts

    console.log('========== WORKOUT DATA ==========');
    console.log('Name:', selectedWorkout.name);
    console.log('Category:', selectedWorkout.workoutCategory);
    console.log('Timer Type:', timerType);
    console.log('Rounds:', selectedWorkout.rounds);
    console.log('Interval Duration:', selectedWorkout.intervalDuration, 'seconds (EMOM only)');
    console.log('Duration:', isTestMode ? testDuration : selectedWorkout.duration, 'seconds (AMRAP only) - TEST MODE:', isTestMode);
    console.log('Work Duration:', selectedWorkout.workDuration, 'seconds (HIIT/Tabata)');
    console.log('Rest Duration:', selectedWorkout.restDuration, 'seconds (HIIT/Tabata)');
    console.log('Color:', categoryColor);
    console.log('==================================');

    currentScreenComponent = (
      <View style={styles.container}>
        <UniversalTimer
          type={timerType}
          title={category?.name || selectedWorkout.workoutCategory}
          workoutName={selectedWorkout.name}
          workoutDescription={selectedWorkout.description}
          config={{
            rounds: isTestMode ? 1 : (selectedWorkout.rounds || 10),
            intervalDuration: isTestMode ? testDuration : (selectedWorkout.intervalDuration || 60),
            duration: isTestMode ? testDuration : (selectedWorkout.duration || 300),
            workDuration: isTestMode ? testDuration : (selectedWorkout.workDuration || 20),
            restDuration: isTestMode ? 2 : (selectedWorkout.restDuration || 10),
          }}
          exercises={exercises}
          color={categoryColor}
          onComplete={handleComplete}
          onStop={handleStop}
        />
      </View>
    );
  }

  // Celebration Screen
  else if (currentScreen === 'celebration') {
    console.log('🎉 [WorkoutSession] RENDERING CELEBRATION SCREEN');
    currentScreenComponent = (
      <CelebrationScreen
        isActive={true}
        onComplete={handleCloseCelebration}
        color="#6366f1"
      />
    );
  }

  // Fallback to home
  else {
    currentScreenComponent = (
      <HomeScreen onStartWorkout={handleStartWorkout} onTrackHabit={handleTrackHabit} />
    );
  }

  // Return current screen (celebration is now a separate screen, not an overlay)
  console.log('🎬 [WorkoutSession] FINAL RENDER - Current screen:', currentScreen);
  return (
    <View style={styles.container}>
      {currentScreenComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Black background to prevent white flash during transitions
  },
});

export default WorkoutSessionScreen;
