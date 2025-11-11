import { useTheme } from '@/hooks/use-theme-color';
import { Stack } from 'expo-router';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const theme = useTheme();
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="(drawer)" />

        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
