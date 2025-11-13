import { Colors } from '@/utils/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
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
        if (user && user?.user?.role === 'seller') {
          router.replace('/(drawer)');
        } else {
          router.replace('/auth/login');
        }
      }, 1500);

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
      colors={['#ffffff', '#ff6b35']}
      style={styles.content}
    >
      <Image
        source={require('@/assets/images/logo.png')}
        style={styles.logo}
      />
      <ActivityIndicator
        size="large"
        color={Colors.light.primary}
        style={styles.loader}
      /></LinearGradient>

  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 80,
    alignItems: 'center',
    paddingTop: 100
  },

  loader: {
    marginTop: 20,
  },


  logo: {
    width: 280,
    height: 120,
  },
})