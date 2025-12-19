import React, { useState } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { Surface, TextInput } from "react-native-paper";
import * as Location from "expo-location";
import axios from "axios";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/hooks/use-theme-color";
import { Button } from "@/components/ui/paper-button";
import { GradientText } from "@/components/ui/gradient-text";
import AuthScreenWrapper from "@/components/wrappers/authScreenWrapper";
import { AppStyles } from "@/utils/theme";
import { useAuthStore } from "@/store/authStore";

export default function UserVerifyOtp() {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const { phoneConfirmation, clearPhoneConfirmation } = useAuthStore();
    const theme = useTheme();

    const router = useRouter();

    const submitOTP = async () => {
        try {
            setLoading(true);

            if (!otp) {
                Alert.alert("Error", "Enter OTP");
                return;
            }

            if (!phoneConfirmation) {
                Alert.alert("Error", "OTP session expired. Please retry.");
                router.replace("/auth/login");
                return;
            }

            // 1️⃣ Convert OTP to Firebase Credential
            const result = await phoneConfirmation.confirm(otp);

            clearPhoneConfirmation();

            // 2️⃣ Get Firebase ID token
            const firebaseIdToken = await result.user.getIdToken();

            // 2️⃣ Get Location (Mandatory)
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Error", "Location required");
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});

            // 3️⃣ Send to backend to ensure user exists
            await axios.post(
                "/phoneLogin",
                {
                    firebaseIdToken,
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                }
            );
            router.replace("/(drawer)");
        } catch (err: any) {
            Alert.alert("OTP Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthScreenWrapper>
            <Surface
                style={[
                    styles.formCard,
                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
                ]}
                elevation={2}
            >
                <GradientText style={styles.gradientTitle}>Verify OTP</GradientText>
                <View style={{ gap: 20 }}>
                    <TextInput
                        label="Enter OTP"
                        value={otp}
                        onChangeText={setOtp}
                        mode="outlined"
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                        style={[{ backgroundColor: theme.colors.surface }]}
                        left={<TextInput.Icon icon="eye" color={theme.colors.onSurface} />}
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
                    <Button variant="contained" loading={loading} onPress={submitOTP}>
                        Verify & Login
                    </Button>
                </View>
            </Surface></AuthScreenWrapper>
    );
}

const styles = StyleSheet.create({
    formCard: {
        borderRadius: 12,
        padding: AppStyles.spacing.lg,
        borderWidth: 1,
    },
    gradientTitle: {
        fontFamily: "Poppins",
        fontSize: 24,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: AppStyles.spacing.lg,
    },
})