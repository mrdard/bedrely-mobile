import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';

interface ProfileScreenProps {
  onSignOut: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({onSignOut}) => {
  const [user, setUser] = useState(auth().currentUser);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(setUser);
    return subscriber;
  }, []);

  const displayName = user?.displayName || 'User';
  const photoURL = user?.photoURL;
  const email = user?.email;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          {/* Profile Picture */}
          {photoURL ? (
            <Image source={{uri: photoURL}} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImagePlaceholderText}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Display Name */}
          <Text style={styles.title}>{displayName}</Text>

          {/* Email */}
          {email && <Text style={styles.email}>{email}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Display Name</Text>
              <Text style={styles.cardValue}>{displayName}</Text>
            </View>
            {email && (
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Email</Text>
                <Text style={styles.cardValue}>{email}</Text>
              </View>
            )}
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Provider</Text>
              <Text style={styles.cardValue}>
                {user?.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Unknown'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>Your workout statistics will appear here</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={onSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#6366f1',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImagePlaceholderText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  cardLabel: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  cardValue: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cardText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  signOutButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ProfileScreen;
