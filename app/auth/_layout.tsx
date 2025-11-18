import { GradientText } from "@/components/ui/gradient-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { AppStyles } from "@/utils/theme";
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export default function AuthLayout() {

  const backgroundColor = useThemeColor({}, 'background');
  return (
    <View style={{ flex: 1, backgroundColor }}>
      {/* Status bar FOR ALL AUTH SCREENS */}
      {/* <StatusBar style="light" /> */}
      <View style={styles.header}>
        <GradientText
          style={{ fontFamily: "JostMedium", fontSize: 80, marginTop: 80 }}
        >
          grabbitt
        </GradientText>
        <Text style={[styles.subtitle]}>For Business</Text>
      </View>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: AppStyles.spacing.lg
  },
  gradientTitle: {
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: AppStyles.spacing.lg,
  },
  subtitle: {
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 16,
    marginTop: AppStyles.spacing.sm,
  },
})