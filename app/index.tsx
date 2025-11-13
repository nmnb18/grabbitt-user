import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const router = useRouter();
  const { user, loading, loadUser, refreshToken } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      await loadUser();
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      // Add a small delay to show splash before navigating
      const timer = setTimeout(() => {
        console.log(user)
        if (user && user?.user?.role === 'seller') {
          router.replace('/(drawer)');
        } else {
          router.replace('/auth/login');
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshToken();
    }, 45 * 60 * 1000); // every 45 min
    return () => clearInterval(interval);
  }, []);

  return (
    <LinearGradient
      colors={['#0D7377', '#14FFEC']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text variant="displayLarge" style={styles.logo}>
          Grabbitt
        </Text>
        <Text variant="titleMedium" style={styles.tagline}>
          for Business
        </Text>
        <ActivityIndicator
          size="large"
          color="#FFFFFF"
          style={styles.loader}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 8,
  },
  tagline: {
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});