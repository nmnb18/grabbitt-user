import { useTheme } from "@/hooks/use-theme-color";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import React, { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const [loaded] = useFonts({
    JostRegular: require("../assets/fonts/Jost-Regular.ttf"),
    JostMedium: require("../assets/fonts/Jost-Medium.ttf"),
    JostBold: require("../assets/fonts/Jost-Bold.ttf"),
  });

  const theme = useTheme();
  const router = useRouter();

  // deep link handler
  useEffect(() => {
    const subscription = Linking.addEventListener("url", (event) => {
      const parsed = Linking.parse(event.url);

      if (parsed?.queryParams?.oobCode) {
        router.push(
          `/auth/reset-password?oobCode=${parsed.queryParams.oobCode}`
        );
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    // enables transparent status bar on Android
    SystemUI.setBackgroundColorAsync("transparent");
  }, []);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        {/* FIXED STATUS BAR */}
        <StatusBar
          style={theme.dark ? "light" : "dark"}
          translucent
          backgroundColor={"transparent"}
        />

        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
