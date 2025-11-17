import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function AuthLayout() {
  return (
    <View style={{ flex: 1 }}>
      {/* Status bar FOR ALL AUTH SCREENS */}
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </View>
  );
}
