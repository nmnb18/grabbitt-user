import { useTheme } from '@/hooks/use-theme-color';
import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const theme = useTheme();
  const router = useRouter();

  // 🔥 Listen for incoming deep links
  useEffect(() => {
    const subscription = Linking.addEventListener('url', (event) => {
      const parsed = Linking.parse(event.url);

      if (parsed?.queryParams?.oobCode) {
        const code = parsed.queryParams.oobCode;
        router.push(`/auth/reset-password?oobCode=${code}`);
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="auth/forgot-password" />
          <Stack.Screen name="auth/reset-password" />
          <Stack.Screen name="auth/reset-success" />
          <Stack.Screen name="(drawer)" />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
