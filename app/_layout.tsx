import { useTheme } from "@/hooks/use-theme-color";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
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

  // 🔥 Listen for incoming deep links
  useEffect(() => {
    const subscription = Linking.addEventListener("url", (event) => {
      const parsed = Linking.parse(event.url);

      if (parsed?.queryParams?.oobCode) {
        const code = parsed.queryParams.oobCode;
        router.push(`/auth/reset-password?oobCode=${code}`);
      }
    });

    return () => subscription.remove();
  }, []);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <Stack
          screenOptions={{ headerShown: false, statusBarHidden: false }}
        ></Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
