/**
 * Bedrely - Workout Timer App
 * Login Screen with Firebase & Google Auth
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import crashlytics from '@react-native-firebase/crashlytics';
import analytics from '@react-native-firebase/analytics';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import TabNavigator from './src/navigation/TabNavigator';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '532575591521-eiioslbdf1o6lrumqtjdnl187lqiq1ca.apps.googleusercontent.com',
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  // Initialize Crashlytics and Analytics
  useEffect(() => {
    // Enable crash collection
    crashlytics().setCrashlyticsCollectionEnabled(true);

    // Log app open event
    analytics().logAppOpen();

    console.log('📊 Crashlytics and Analytics initialized');
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(userState => {
      setUser(userState);
      setLoading(false);

      // Set user identifier for Crashlytics
      if (userState) {
        crashlytics().setUserId(userState.uid);
        analytics().setUserId(userState.uid);
        console.log('👤 User logged in:', userState.uid);
      }
    });
    return subscriber;
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn(true);
      console.log('Starting Google Sign-In...');

      // Check if device supports Google Play
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      // Get user info from Google
      const signInResult = await GoogleSignin.signIn();
      console.log('Google Sign-In successful:', signInResult);

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(
        signInResult.data?.idToken,
      );

      // Sign in to Firebase with the Google credential
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );
      console.log('Firebase sign-in successful:', userCredential.user.email);

      // Log sign-in event to Analytics
      await analytics().logLogin({method: 'google'});
    } catch (error) {
      console.error('Google Sign-In error:', error);

      // Log error to Crashlytics
      crashlytics().recordError(error);

      alert(`Sign-in failed: ${error.message}`);
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await GoogleSignin.signOut();
      await auth().signOut();
      console.log('Signed out successfully');

      // Log sign-out event to Analytics
      await analytics().logEvent('sign_out');
    } catch (error) {
      console.error('Sign-out error:', error);
      crashlytics().recordError(error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </SafeAreaProvider>
    );
  }

  // User is signed in - show tab navigation
  if (user) {
    return (
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <TabNavigator onSignOut={handleSignOut} />
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }

  // Login screen
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.container}>
        {/* Logo/Title */}
        <View style={styles.header}>
          <Text style={styles.logo}>💪</Text>
          <Text style={styles.title}>BEDRELY</Text>
          <Text style={styles.subtitle}>Workout Timer</Text>
        </View>

        {/* Google Sign-In Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={signingIn}
            activeOpacity={0.8}>
            {signingIn ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Track your workouts • Time your exercises • Reach your goals
        </Text>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    color: '#888888',
  },
  buttonContainer: {
    width: '100%',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  googleIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4285F4',
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  comingSoon: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  signOutButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  signOutButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  footer: {
    textAlign: 'center',
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
  },
});

export default App;
