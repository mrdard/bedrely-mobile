import React, {useEffect, useRef} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, Text, StyleSheet, Platform, Animated, Dimensions} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import WorkoutSessionScreen from '../screens/WorkoutSessionScreen';
import HabitsScreen from '../screens/HabitsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const {width} = Dimensions.get('window');

interface TabNavigatorProps {
  onSignOut: () => void;
}

// Custom Tab Bar with sliding indicator
const CustomTabBar: React.FC<BottomTabBarProps> = ({state, descriptors, navigation}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const tabWidth = width / state.routes.length;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      tension: 68,
      friction: 12,
    }).start();
  }, [state.index, tabWidth]);

  // Check if tab bar should be hidden (e.g., during workouts)
  const currentRoute = state.routes[state.index];
  const {options} = descriptors[currentRoute.key];
  if (options.tabBarStyle && 'display' in options.tabBarStyle && options.tabBarStyle.display === 'none') {
    return null;
  }

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBarBackground} />

      {/* Sliding rounded square indicator */}
      <Animated.View
        style={[
          styles.slidingIndicator,
          {
            transform: [{translateX: slideAnim}],
          },
        ]}
      />

      {/* Tab buttons */}
      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Get icon component
        const icon = options.tabBarIcon
          ? options.tabBarIcon({focused: isFocused, color: '', size: 24})
          : null;

        return (
          <View key={route.key} style={styles.tab} onTouchEnd={onPress}>
            <View style={styles.iconContainer}>
              {icon}
            </View>
            <Text
              style={[
                styles.tabLabel,
                isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}>
              {route.name}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const TabNavigator: React.FC<TabNavigatorProps> = ({onSignOut}) => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen
        name="Workouts"
        options={{
          tabBarIcon: ({color, focused}) => (
            <View style={[
              styles.roundIcon,
              focused && styles.roundIconActive
            ]}>
              <Text style={[styles.iconText, {opacity: focused ? 1 : 0.6}]}>🔥</Text>
            </View>
          ),
        }}>
        {props => <WorkoutSessionScreen {...props} onSignOut={onSignOut} />}
      </Tab.Screen>
      <Tab.Screen
        name="Habits"
        component={HabitsScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <View style={[
              styles.roundIcon,
              focused && styles.roundIconActive
            ]}>
              <Text style={[styles.iconText, {opacity: focused ? 1 : 0.6}]}>✦</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({color, focused}) => (
            <View style={[
              styles.roundIcon,
              focused && styles.roundIconActive
            ]}>
              <Text style={[styles.iconText, {opacity: focused ? 1 : 0.6}]}>●</Text>
            </View>
          ),
        }}>
        {props => <ProfileScreen {...props} onSignOut={onSignOut} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderTopColor: 'rgba(255, 255, 255, 0.05)', // 50% darker
    borderTopWidth: 0.5,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 12,
    height: Platform.OS === 'ios' ? 88 : 68,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    position: 'relative',
  },
  tabBarBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 10, 10, 0.85)', // Darker glass effect
    backdropFilter: 'blur(20px)', // CSS blur (won't work but good for web)
  },
  slidingIndicator: {
    position: 'absolute',
    top: 8,
    left: (width / 3 - 51) / 2, // Center the 51px circle (15% smaller than original) in each tab section
    width: 51,
    height: 51,
    borderRadius: 25.5, // Perfect circle
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#FFFFFF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  roundIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  roundIconActive: {
    backgroundColor: 'transparent', // No background, just use sliding indicator
  },
  iconText: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    zIndex: 10,
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  tabLabelInactive: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
});

export default TabNavigator;
