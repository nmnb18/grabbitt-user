import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/paper-button";
import AuthScreenWrapper from "@/components/wrappers/authScreenWrapper";
import { useTheme, useThemeColor } from "@/hooks/use-theme-color";
import { AppStyles } from "@/utils/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  View
} from "react-native";
import { Surface, TextInput, SegmentedButtons } from "react-native-paper";
import { useAuthStore } from "@/store/authStore";
import auth from "@react-native-firebase/auth";

export default function UserLogin() {
  const [mode, setMode] = useState<"email" | "phone">("email");

  // Email fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Phone fields
  const [phone, setPhone] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuthStore();

  const theme = useTheme();
  const outlineColor = useThemeColor({}, "outline");

  //---------------------------------------------------------
  // EMAIL LOGIN HANDLER
  //---------------------------------------------------------
  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace("/(drawer)/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  //---------------------------------------------------------
  // PHONE LOGIN HANDLER
  //---------------------------------------------------------
  const handleSendOTP = async () => {
    if (!phone || phone?.length !== 10) {
      Alert.alert("Error", "Please enter valid 10 digit phone number.");
      return;
    }

    try {
      setLoading(true);

      const phoneWithCountyCode = `+91${phone}`

      const confirmation = await auth().signInWithPhoneNumber(phoneWithCountyCode);

      router.push({
        pathname: "/auth/verify-otp",
        params: { confirmation: JSON.stringify(confirmation) },
      });

    } catch (error: any) {
      Alert.alert("OTP Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  //---------------------------------------------------------
  // MAIN RENDER
  //---------------------------------------------------------
  return (
    <AuthScreenWrapper>
      <Surface
        style={[
          styles.formCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: outlineColor,
          },
        ]}
        elevation={2}
      >
        <GradientText style={styles.gradientTitle}>Login</GradientText>

        {/* Mode Toggle */}
        <SegmentedButtons
          value={mode}
          onValueChange={(value) => setMode(value as "email" | "phone")}
          buttons={[
            { value: "email", label: "Email", icon: "email" },
            { value: "phone", label: "Phone OTP", icon: "phone" },
          ]}
          style={{ marginBottom: 20 }}
          theme={{ colors: { secondaryContainer: theme.colors.primary, onSecondaryContainer: '#fff' } }}
        />

        <View style={styles.form}>
          {mode === "email" ? (
            <>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                left={<TextInput.Icon icon="email" color={theme.colors.onSurface} />}
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.onSurface}
                theme={{
                  ...theme,
                  colors: {
                    ...theme.colors,
                    onSurfaceVariant: theme.colors.onSurfaceDisabled, // 👈 placeholder color source
                  },
                }}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                mode="outlined"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                left={<TextInput.Icon icon="lock" color={theme.colors.onSurface} />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.onSurface}
                theme={{
                  ...theme,
                  colors: {
                    ...theme.colors,
                    onSurfaceVariant: theme.colors.onSurfaceDisabled, // 👈 placeholder color source
                  },
                }}
              />

              <Button
                onPress={handleEmailLogin}
                loading={loading}
                variant="contained"
                size="medium"
                fullWidth
              >
                Login
              </Button>

              <Button
                onPress={() => router.push("/auth/register")}
                variant="text"
                size="medium"
                fullWidth
              >
                Don’t have an account? Register
              </Button>

              <Button
                onPress={() => router.push("/auth/forgot-password")}
                variant="text"
                size="medium"
                fullWidth
              >
                Forgot Password?
              </Button>
            </>
          ) : (
            <>
              <TextInput
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                mode="outlined"
                keyboardType="phone-pad"
                autoCapitalize="none"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                left={<TextInput.Icon icon="phone" color={theme.colors.onSurface} />}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.onSurface}
                theme={{
                  ...theme,
                  colors: {
                    ...theme.colors,
                    onSurfaceVariant: theme.colors.onSurfaceDisabled, // 👈 placeholder color source
                  },
                }}
              />

              <Button
                onPress={handleSendOTP}
                loading={loading}
                variant="contained"
                size="medium"
                fullWidth
              >
                Send OTP
              </Button>

              <Button
                onPress={() => router.push("/auth/register")}
                variant="text"
                size="medium"
                fullWidth
              >
                Don’t have an account? Register
              </Button>
            </>
          )}
        </View>
      </Surface>
    </AuthScreenWrapper>
  );
}

const styles = StyleSheet.create({
  gradientTitle: {
    fontFamily: "Poppins",
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: AppStyles.spacing.lg,
  },
  formCard: {
    borderRadius: 12,
    padding: AppStyles.spacing.lg,
    borderWidth: 1,
  },
  form: {
    gap: AppStyles.spacing.md,
  },
  input: {},
});
