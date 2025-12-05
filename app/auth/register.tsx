import React, { useEffect, useState } from "react";
import { View, Alert, StyleSheet, KeyboardTypeOptions } from "react-native";
import {
    Surface,
    TextInput,
    Button,
    HelperText,
    Checkbox,
    Text,
} from "react-native-paper";
import { GradientText } from "@/components/ui/gradient-text";
import AuthScreenWrapper from "@/components/wrappers/authScreenWrapper";
import { useRouter } from "expo-router";
import * as Location from "expo-location";

import { AppStyles } from "@/utils/theme";
import { useTheme, useThemeColor } from "@/hooks/use-theme-color";

import { validators, validateField, validateAll } from "@/utils/validation";
import { useAuthStore } from "../../store/authStore";

// ----------------------------------------------
// TYPES
// ----------------------------------------------
type FieldKeys =
    | "name"
    | "phone"
    | "email"
    | "password"
    | "cPassword"
    | "street"
    | "city"
    | "state"
    | "pincode";

type Fields = Record<FieldKeys, string>;
type Errors = Record<FieldKeys | "terms", string>;

export default function UserRegister() {
    const router = useRouter();
    const { register } = useAuthStore();

    const theme = useTheme();
    const outlineColor = useThemeColor({}, "outline");

    // ----------------------------------------------
    // FORM STATE
    // ----------------------------------------------
    const [fields, setFields] = useState<Fields>({
        name: "",
        phone: "",
        email: "",
        password: "",
        cPassword: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
    });

    const [errors, setErrors] = useState<Errors>({
        name: "",
        phone: "",
        email: "",
        password: "",
        cPassword: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        terms: "",
    });

    const [acceptTerms, setAcceptTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

    // ----------------------------------------------
    // VALIDATION SCHEMA (fully typed)
    // ----------------------------------------------
    const schema: Record<FieldKeys, ((v: string) => string)[]> = {
        name: [(v) => validators.required(v, "Full Name")],
        phone: [validators.phone],
        email: [validators.email],
        password: [validators.password],
        cPassword: [
            (v) => validators.required(v, "Confirm Password"),
            (v) => validators.matchPassword(v, fields.password),
        ],
        street: [(v) => validators.required(v, "Street")],
        city: [(v) => validators.required(v, "City")],
        state: [(v) => validators.required(v, "State")],
        pincode: [validators.pincode],
    };

    // ----------------------------------------------
    // CHANGE HANDLER (type-safe indexing)
    // ----------------------------------------------
    const handleChange = (key: FieldKeys, value: string) => {
        setFields((prev) => ({ ...prev, [key]: value }));

        if (errors[key]) {
            const err = validateField(key, value, schema[key]);
            setErrors((prev) => ({ ...prev, [key]: err }));
        }
    };

    // ----------------------------------------------
    // LOCATION
    // ----------------------------------------------
    const captureLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") return;

            const pos = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = pos.coords;

            setCoordinates({ lat: latitude, lng: longitude });

            const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (geo.length > 0) {
                const g = geo[0];
                handleChange("street", g.street || g.name || "");
                handleChange("city", g.city || g.subregion || "");
                handleChange("state", g.region || "");
                handleChange("pincode", g.postalCode || "");
            }
        } catch {
            Alert.alert("Error", "Unable to fetch location.");
        }
    };

    useEffect(() => {
        captureLocation();
    }, []);

    // ----------------------------------------------
    // REGISTER SUBMISSION
    // ----------------------------------------------
    const handleRegister = async () => {
        const { isValid, errors: newErrors } = validateAll(fields, schema);

        if (!acceptTerms) newErrors.terms = "You must accept the terms";

        if (!isValid || newErrors.terms) {
            setErrors((prev) => ({ ...prev, ...newErrors }));
            return;
        }

        setLoading(true);

        try {
            await register({
                ...fields,
                lat: coordinates?.lat,
                lng: coordinates?.lng,
            });

            Alert.alert("Success", "Please login to continue.");
            router.push("/auth/login");
        } catch (err: any) {
            Alert.alert("Registration Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------
    // UI
    // ----------------------------------------------
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
                    {/* Top Fields */}
                    {[
                        { key: "name" as FieldKeys, label: "Full Name", icon: "account" as KeyboardTypeOptions },
                        { key: "phone" as FieldKeys, label: "Phone", icon: "phone", keyboard: "phone-pad" as KeyboardTypeOptions },
                        { key: "email" as FieldKeys, label: "Email", icon: "email", keyboard: "email-address" as KeyboardTypeOptions },
                    ].map((f) => (
                        <View key={f.key}>
                            <TextInput
                                label={f.label}
                                value={fields[f.key]}
                                keyboardType={f.keyboard}
                                onBlur={() =>
                                    setErrors((prev) => ({
                                        ...prev,
                                        [f.key]: validateField(f.key, fields[f.key], schema[f.key]),
                                    }))
                                }
                                onChangeText={(t) => handleChange(f.key, t)}
                                mode="outlined"

                                left={<TextInput.Icon icon={f.icon} color={theme.colors.onSurface} />}
                                outlineColor={theme.colors.outline}
                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                activeOutlineColor={theme.colors.onSurface}
                                theme={{
                                    ...theme,
                                    colors: {
                                        ...theme.colors,
                                        onSurfaceVariant: theme.colors.onSurfaceDisabled, // 👈 placeholder color source
                                    },
                                }}
                            />
                            <HelperText type="error" visible={!!errors[f.key]}>
                                {errors[f.key]}
                            </HelperText>
                        </View>
                    ))}

                    {/* Passwords */}
                    {[
                        { key: "password" as FieldKeys, label: "Password", icon: "lock" },
                        { key: "cPassword" as FieldKeys, label: "Confirm Password", icon: "lock-check" },
                    ].map((f) => (
                        <View key={f.key}>
                            <TextInput
                                label={f.label}
                                value={fields[f.key]}
                                secureTextEntry
                                onBlur={() =>
                                    setErrors((prev) => ({
                                        ...prev,
                                        [f.key]: validateField(f.key, fields[f.key], schema[f.key]),
                                    }))
                                }
                                onChangeText={(t) => handleChange(f.key, t)}
                                mode="outlined"
                                left={<TextInput.Icon icon={f.icon} color={theme.colors.onSurface} />}
                                outlineColor={theme.colors.outline}
                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                activeOutlineColor={theme.colors.onSurface}
                                theme={{
                                    ...theme,
                                    colors: {
                                        ...theme.colors,
                                        onSurfaceVariant: theme.colors.onSurfaceDisabled, // 👈 placeholder color source
                                    },
                                }}
                            />
                            <HelperText type="error" visible={!!errors[f.key]}>
                                {errors[f.key]}
                            </HelperText>
                        </View>
                    ))}

                    {/* Street */}
                    <View>
                        <TextInput
                            label="Street"
                            value={fields.street}
                            onBlur={() =>
                                setErrors((prev) => ({
                                    ...prev,
                                    street: validateField("street", fields.street, schema.street),
                                }))
                            }
                            onChangeText={(t) => handleChange("street", t)}
                            mode="outlined"
                            left={<TextInput.Icon icon="map-marker" color={theme.colors.onSurface} />}
                            style={[styles.input, { backgroundColor: theme.colors.surface }]}
                            activeOutlineColor={theme.colors.onSurface}
                            theme={{
                                ...theme,
                                colors: {
                                    ...theme.colors,
                                    onSurfaceVariant: theme.colors.onSurfaceDisabled, // 👈 placeholder color source
                                },
                            }}
                        />
                        <HelperText type="error" visible={!!errors.street}>
                            {errors.street}
                        </HelperText>
                    </View>

                    {/* City + State */}
                    <View style={{ flexDirection: "row", gap: 10 }}>
                        {(["city", "state"] as FieldKeys[]).map((key) => (
                            <View key={key} style={{ flex: 1 }}>
                                <TextInput
                                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                                    value={fields[key]}
                                    onBlur={() =>
                                        setErrors((prev) => ({
                                            ...prev,
                                            [key]: validateField(key, fields[key], schema[key]),
                                        }))
                                    }
                                    onChangeText={(t) => handleChange(key, t)}
                                    mode="outlined"
                                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                    activeOutlineColor={theme.colors.onSurface}
                                    theme={{
                                        ...theme,
                                        colors: {
                                            ...theme.colors,
                                            onSurfaceVariant: theme.colors.onSurfaceDisabled, // 👈 placeholder color source
                                        },
                                    }}
                                />
                                <HelperText type="error" visible={!!errors[key]}>
                                    {errors[key]}
                                </HelperText>
                            </View>
                        ))}
                    </View>

                    {/* Pincode */}
                    <View>
                        <TextInput
                            label="Pincode"
                            value={fields.pincode}
                            keyboardType="numeric"
                            onBlur={() =>
                                setErrors((prev) => ({
                                    ...prev,
                                    pincode: validateField("pincode", fields.pincode, schema.pincode),
                                }))
                            }
                            onChangeText={(t) => handleChange("pincode", t)}
                            mode="outlined"
                            style={[styles.input, { backgroundColor: theme.colors.surface }]}
                            activeOutlineColor={theme.colors.onSurface}
                            theme={{
                                ...theme,
                                colors: {
                                    ...theme.colors,
                                    onSurfaceVariant: theme.colors.onSurfaceDisabled, // 👈 placeholder color source
                                },
                            }}
                        />
                        <HelperText type="error" visible={!!errors.pincode}>
                            {errors.pincode}
                        </HelperText>
                    </View>

                    {/* TERMS */}
                    <View style={styles.checkboxContainer}>
                        <Checkbox.Android
                            status={acceptTerms ? "checked" : "unchecked"}
                            onPress={() => {
                                setAcceptTerms(!acceptTerms);
                                if (errors.terms) {
                                    setErrors((prev) => ({ ...prev, terms: "" }));
                                }
                            }}
                        />
                        <Text style={styles.checkboxLabel}>
                            I agree to the Terms of Service & Privacy Policy *
                        </Text>
                    </View>
                    <HelperText type="error" visible={!!errors.terms}>
                        {errors.terms}
                    </HelperText>

                    {/* SUBMIT */}
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
        gap: AppStyles.spacing.sm,
    },
    input: {
        backgroundColor: "transparent",
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
    },
    checkboxLabel: {
        marginLeft: 8,
        flex: 1,
    },
});
