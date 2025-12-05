import BlurLoader from "@/components/ui/blur-loader";
import { GradientIcon } from "@/components/ui/gradient-icon";
import { useTheme } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useMemo } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DrawerLayout() {
  const theme = useTheme();

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: theme.colors.primary,
        drawerLabelStyle: { fontSize: 16, color: theme.colors.onBackground },
      }}
      drawerContent={() => <CustomDrawerContent />}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}

function CustomDrawerContent() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const router = useRouter();
  const { logout, user, loading } = useAuthStore();
  const version = Constants.expoConfig?.version || "1.0.0";

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          // Close drawer immediately
          // Add small delay so drawer animation finishes
          await logout(user?.uid ?? "");
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const MenuItem = ({ label, icon, onPress }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <GradientIcon name={icon} size={22} />
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      {loading && <BlurLoader />}

      <View style={styles.container}>
        <ScrollView style={styles.menuContainer}>

          <MenuItem
            label="Home"
            icon="home"
            onPress={() => router.push("/(drawer)/(tabs)/home")}
          />
          <MenuItem label="Redemption History" icon="history" onPress={() => router.push("/(drawer)/redeem/redemption-history")} />

          <MenuItem label="Pofile" icon="account" onPress={() => router.push("/(drawer)/profile")} />

          <MenuItem label="Contact Us" icon="mail" onPress={() => Linking.openURL("mailto:support@grabbitt.in")} />

          <MenuItem label="Privacy Policy" icon="lock" onPress={() => Linking.openURL("https://grabbitt.in/privacy")} />

          <MenuItem label="Terms & Conditions" icon="file" onPress={() => Linking.openURL("https://grabbitt.in/terms")} />

        </ScrollView>

        <View style={styles.logoutContainer}>
          <MenuItem label="Logout" icon="logout" onPress={handleLogout} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Version {version}
            {"\n"}
            Maintained & Developed by <Text style={styles.footerHighlight}>Grabbitt Team</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}


const createStyles = (theme: any) =>
  StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: theme.colors.background },
    container: { flex: 1, justifyContent: "space-between" },
    menuContainer: { padding: 16 },

    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      borderBottomColor: theme.colors.outline,
      borderBottomWidth: 1,
      gap: 16,
    },

    menuLabel: {
      fontSize: 16,
      color: theme.colors.onBackground,
      fontWeight: "500",
    },

    logoutContainer: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 4,
    },

    footer: {
      padding: 10,
      paddingBottom: 20,
    },

    footerText: {
      textAlign: "center",
      fontSize: 12,
      color: theme.colors.onSurfaceDisabled,
    },

    footerHighlight: {
      fontWeight: "600",
      color: theme.colors.primary,
    },
  });
