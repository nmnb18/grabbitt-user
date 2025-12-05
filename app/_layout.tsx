import { useTheme } from "@/hooks/use-theme-color";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import React, { useEffect, useRef } from "react";
import { BackHandler, Platform, ToastAndroid } from "react-native";
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
  const exitAppRef = useRef(false);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const backAction = () => {
      if (exitAppRef.current) {
        BackHandler.exitApp(); // EXIT APP
        return true;
      }

      exitAppRef.current = true;
      ToastAndroid.show("Press back again to exit", ToastAndroid.SHORT);

      setTimeout(() => {
        exitAppRef.current = false;
      }, 2000); // reset after 2 sec

      return true; // prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

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
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
