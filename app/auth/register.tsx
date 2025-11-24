import React, { useEffect, useState } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { Surface, TextInput, Button, HelperText, Checkbox, Text } from "react-native-paper";
import { GradientText } from "@/components/ui/gradient-text";
import AuthScreenWrapper from "@/components/wrappers/authScreenWrapper";
import { useRouter } from "expo-router";
import * as Location from "expo-location";

import { AppStyles } from "@/utils/theme";
import { useTheme, useThemeColor } from "@/hooks/use-theme-color";

import { useAuthStore } from '../../store/authStore';
export default function UserRegister() {
    const router = useRouter();
    const { register } = useAuthStore();

    const theme = useTheme();
    const outlineColor = useThemeColor({}, "outline");

    // Form fields
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [cPassword, setCPassword] = useState("");

    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [pincode, setPincode] = useState("");

    const [acceptTerms, setAcceptTerms] = useState(false);

    const [loading, setLoading] = useState(false);
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

    //--------------------------------------------------------------------
    // LOCATION ACCESS (MANDATORY)
    //--------------------------------------------------------------------
    const captureLocation = async () => {
        try {
            console.log('pos')
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Location Required",
                    "Location access is mandatory for app features.\n\nPlease enable location to continue.",
                    [
                        {
                            text: "Open Settings",
                            onPress: () => Location.requestForegroundPermissionsAsync()
                        }
                    ]
                );
                return;
            }

            const pos = await Location.getCurrentPositionAsync({});
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setCoordinates({
                lat,
                lng,
            });
            const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (geo && geo.length > 0) {
                const g = geo[0];

                setStreet(
                    g.street ||
                    `${g.name || ""} ${g.streetNumber || ""}`.trim()
                );
                setCity(g.city || g.subregion || "");
                setState(g.region || "");
                setPincode(g.postalCode || "");
            } else {
                Alert.alert("Notice", "Couldn't auto-fill address. Please enter manually.");
            }
        } catch (err) {
            console.log(err);
            Alert.alert("Location Error", "Unable to fetch your location.");
            return null;
        }
    };

    //--------------------------------------------------------------------
    // HANDLE REGISTER
    //--------------------------------------------------------------------
    const handleRegister = async () => {
        if (!name || !email || !phone || !password || !cPassword) {
            Alert.alert("Error", "Please fill all fields.");
            return;
        }
        if (password !== cPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }
        if (!street || !city || !state || !pincode) {
            Alert.alert("Error", "Complete address is required.");
            return;
        }

        setLoading(true);
        try {

            //-------------------------------------------------------------
            // 1️⃣ Register over backend (create Firebase user + Firestore)
            //-------------------------------------------------------------
            await register({
                name,
                email,
                phone,
                password,
                street,
                city,
                state,
                pincode,
                lat: coordinates?.lat,
                lng: coordinates?.lng,
            });
            Alert.alert('Registration Success', 'Please login with resgitered email id and password to continue.');
            router.push('/auth/login');

        } catch (err: any) {
            Alert.alert("Registration Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        (async () => {
            await captureLocation();
        })();
    }, [])

    //--------------------------------------------------------------------
    // UI
    //--------------------------------------------------------------------
    return (
        <AuthScreenWrapper>
            <Surface
                style={[
                    styles.formCard,
                    { backgroundColor: theme.colors.surface, borderColor: outlineColor },
                ]}
                elevation={2}
            >
                <GradientText style={styles.gradientTitle}>Create Account</GradientText>

                <View style={styles.form}>
                    <TextInput
                        label="Full Name"
                        value={name}
                        onChangeText={setName}
                        mode="outlined"
                        left={<TextInput.Icon icon="account" color={theme.colors.onSurface} />}
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
                        label="Phone"
                        value={phone}
                        onChangeText={setPhone}
                        mode="outlined"
                        keyboardType="phone-pad"
                        left={<TextInput.Icon icon="phone" color={theme.colors.onSurface} />}
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
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        mode="outlined"
                        keyboardType="email-address"
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
                        secureTextEntry
                        mode="outlined"
                        left={<TextInput.Icon icon="lock" color={theme.colors.onSurface} />}
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
                        label="Confirm Password"
                        value={cPassword}
                        onChangeText={setCPassword}
                        secureTextEntry
                        mode="outlined"
                        left={<TextInput.Icon icon="lock-check" color={theme.colors.onSurface} />}
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

                    {/* Address Section */}
                    <TextInput
                        label="Street"
                        value={street}
                        onChangeText={setStreet}
                        mode="outlined"
                        left={<TextInput.Icon icon="map-marker" color={theme.colors.onSurface} />}
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

                    <View style={{ flexDirection: "row", gap: 10 }}>
                        <TextInput
                            label="City"
                            value={city}
                            onChangeText={setCity}
                            mode="outlined"
                            style={[styles.input, { flex: 1, backgroundColor: theme.colors.surface }]}
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
                            label="State"
                            value={state}
                            onChangeText={setState}
                            mode="outlined"
                            style={[styles.input, { flex: 1, backgroundColor: theme.colors.surface }]}
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
                    </View>

                    <TextInput
                        label="Pincode"
                        value={pincode}
                        onChangeText={setPincode}
                        mode="outlined"
                        keyboardType="numeric"
                        style={[styles.input, { flex: 1, backgroundColor: theme.colors.surface }]}
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

                    <View style={styles.checkboxContainer}>
                        <Checkbox.Android
                            status={acceptTerms ? 'checked' : 'unchecked'}
                            onPress={() => setAcceptTerms(!acceptTerms)}
                            color={theme.colors.accent}
                        />
                        <Text variant="bodyMedium" style={styles.checkboxLabel}>
                            I agree to the Terms of Service and Privacy Policy *
                        </Text>
                    </View>

                    <Button mode="contained" loading={loading} onPress={handleRegister}>
                        Create Account
                    </Button>

                    <Button mode="text" onPress={() => router.push("/auth/login")}>
                        Already have an account? Login
                    </Button>
                </View>
            </Surface>
        </AuthScreenWrapper>
    );
}

const styles = StyleSheet.create({
    gradientTitle: {
        fontFamily: "Poppins",
        fontSize: 22,
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
    input: {
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: AppStyles.spacing.md,
        marginTop: AppStyles.spacing.sm,

    },
    checkboxLabel: {
        marginLeft: 8,
        flex: 1,
    },
});
