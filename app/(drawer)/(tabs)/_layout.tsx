import { GradientText } from "@/components/ui/gradient-text";
import { useTheme, useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Tabs } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, Platform, useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/store/authStore";
import { AppStyles } from "@/utils/theme";

export default function UserTabsLayout() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const headerGradient =
    colorScheme === "dark"
      ? AppStyles.gradients.headerDark
      : AppStyles.gradients.headerLight;
  const navigation = useNavigation<any>();
  const backgroundColor = useThemeColor({}, "background");
  const { user } = useAuthStore();
  return (
    <Tabs
      screenOptions={{
        header: ({ }) => (
          <LinearGradient
            colors={headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingTop: Platform.OS === "ios" ? 60 : 40,
              paddingBottom: 20,
              paddingHorizontal: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* LEFT SIDE — LOGO + GREETING */}
              <View style={{ flexDirection: "column" }}>
                <GradientText
                  style={{
                    fontFamily: "JostMedium",
                    fontSize: 36,
                  }}
                >
                  grabbitt
                </GradientText>

                <Text
                  style={{
                    color: theme.colors.onSurface,
                    fontSize: 15,
                    marginTop: 2,
                    opacity: 0.9,
                  }}
                >
                  Hello, {user?.user?.name || "User"} 👋
                </Text>
              </View>

              {/* RIGHT SIDE — ICONS */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 18,
                }}
              >
                {/* Notifications */}
                <TouchableOpacity
                  onPress={() => console.log("Notifications pressed")}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={26}
                    color={theme.colors.onSurface}
                  />
                </TouchableOpacity>

                {/* Menu */}
                <TouchableOpacity
                  onPress={() =>
                    navigation.dispatch(DrawerActions.openDrawer())
                  }
                >
                  <Ionicons
                    name="menu"
                    size={28}
                    color={theme.colors.onSurface}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        ),

        tabBarStyle: {
          backgroundColor,
          borderTopColor: "transparent",
          paddingBottom: 20,
          paddingTop: 8,
          height: 80,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="scan-qr"
        options={{
          title: "Scan",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
