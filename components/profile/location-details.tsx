import { useTheme } from '@/hooks/use-theme-color';
import api from '@/services/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import * as Location from 'expo-location';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Divider,
    Text,
    TextInput,
} from 'react-native-paper';

export default function LocationInformation() {
    const theme = useTheme();
    const { user, fetchUserDetails } = useAuthStore();

    const uid = user?.uid;
    const profile = user?.user?.customer_profile?.location;

    // Address values
    const [street, setStreet] = useState(profile?.address?.street || "");
    const [city, setCity] = useState(profile?.address?.city || "");
    const [stateName, setStateName] = useState(profile?.address?.state || "");
    const [pincode, setPincode] = useState(profile?.address?.pincode || "");
    const [country] = useState(profile?.address?.country || "India");

    const [lat, setLat] = useState(profile?.lat ?? null);
    const [lng, setLng] = useState(profile?.lat ?? null);

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [locBusy, setLocBusy] = useState(false);

    // Initial state for cancel
    const [initial, setInitial] = useState({
        street,
        city,
        stateName,
        pincode,
        lat,
        lng,
    });

    const isDirty = useMemo(() => {
        return (
            street !== initial.street ||
            city !== initial.city ||
            stateName !== initial.stateName ||
            pincode !== initial.pincode ||
            lat !== initial.lat ||
            lng !== initial.lng
        );
    }, [street, city, stateName, pincode, lat, lng, initial]);

    const handleCancel = () => {
        setStreet(initial.street);
        setCity(initial.city);
        setStateName(initial.stateName);
        setPincode(initial.pincode);
        setLat(initial.lat);
        setLng(initial.lng);
        setIsEditing(false);
    };

    // Reverse geocode helper
    const reverseGeocode = async (latitude: number, longitude: number) => {
        try {
            const res = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (res.length > 0) {
                const addr = res[0];
                setStreet(addr.street || addr.name || "");
                setCity(addr.city || addr.subregion || "");
                setStateName(addr.region || "");
                setPincode(addr.postalCode || "");
            }
        } catch (err) {
            console.error("Reverse geocode failed", err);
        }
    };

    // Fetch GPS location
    const fetchCurrentLocation = async () => {
        try {
            setLocBusy(true);

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission Required", "Location access must be enabled.");
                return;
            }

            const pos = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            setLat(pos.coords.latitude);
            setLng(pos.coords.longitude);

            await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        } catch (error) {
            Alert.alert("Error", "Failed to fetch current location.");
        } finally {
            setLocBusy(false);
        }
    };

    const handleSave = async () => {
        if (!street || !city || !stateName || !pincode) {
            return Alert.alert("Validation", "All address fields are required.");
        }

        try {
            setSaving(true);

            await api.patch(
                "/updateUserProfile",
                {
                    section: "location",
                    data: {
                        address: {
                            street,
                            city,
                            state: stateName,
                            pincode,
                            country,
                        },
                        lat,
                        lng
                    },
                }
            );

            if (uid) await fetchUserDetails(uid);

            setInitial({
                street,
                city,
                stateName,
                pincode,
                lat,
                lng,
            });

            setIsEditing(false);
            Alert.alert("Success", "Location updated successfully.");
        } catch (err: any) {
            Alert.alert(
                "Error",
                err.response?.data?.message || "Failed to update location."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={{ position: "relative" }}>
                <Card.Content>
                    {/* Header */}
                    <View style={styles.sectionHeader}>
                        <Text
                            variant="titleMedium"
                            style={[styles.cardTitle, { color: theme.colors.onSurface }]}
                        >
                            📍 Location Information
                        </Text>

                        {!isEditing ? (
                            <Button
                                mode="text"
                                onPress={() => setIsEditing(true)}
                                icon="pencil"
                                compact
                            >
                                Edit
                            </Button>
                        ) : (
                            <View style={styles.editButtons}>
                                <Button
                                    mode="text"
                                    onPress={handleCancel}
                                    icon="close"
                                    disabled={saving}
                                    compact
                                >
                                    Cancel
                                </Button>

                                <Button
                                    mode="text"
                                    onPress={handleSave}
                                    icon="content-save-outline"
                                    disabled={!isDirty || saving}
                                    loading={saving}
                                    compact
                                >
                                    Save
                                </Button>
                            </View>
                        )}
                    </View>

                    <Divider
                        style={[
                            styles.divider,
                            { backgroundColor: theme.colors.outline },
                        ]}
                    />

                    {/* VIEW MODE */}
                    {!isEditing ? (
                        <View>
                            {[
                                {
                                    label: "Address",
                                    value: `${street}, ${city}, ${stateName}, ${pincode}`,
                                }
                            ].map((item) => (
                                <View
                                    key={item.label}
                                    style={[
                                        styles.infoRow,
                                        { borderBottomColor: theme.colors.outline },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.infoLabel,
                                            { color: theme.colors.onSurfaceDisabled },
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.infoValue,
                                            { color: theme.colors.onSurface },
                                        ]}
                                    >
                                        {item.value}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        /* EDIT MODE */
                        <View>
                            <TextInput
                                label="Street"
                                value={street}
                                onChangeText={setStreet}
                                mode="outlined"
                                style={styles.input}
                                outlineColor={theme.colors.outline}
                                activeOutlineColor={theme.colors.onSurface}
                                theme={{
                                    colors: {
                                        primary: theme.colors.primary,      // focused label color
                                        onSurfaceVariant: theme.colors.onSurface, // unfocused label color
                                    },
                                }}
                            />

                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <TextInput
                                        label="City"
                                        value={city}
                                        onChangeText={setCity}
                                        mode="outlined"
                                        style={styles.input}
                                        outlineColor={theme.colors.outline}
                                        activeOutlineColor={theme.colors.onSurface}
                                        theme={{
                                            colors: {
                                                primary: theme.colors.primary,      // focused label color
                                                onSurfaceVariant: theme.colors.onSurface, // unfocused label color
                                            },
                                        }}
                                    />
                                </View>

                                <View style={styles.col}>
                                    <TextInput
                                        label="State"
                                        value={stateName}
                                        onChangeText={setStateName}
                                        mode="outlined"
                                        style={styles.input}
                                        outlineColor={theme.colors.outline}
                                        activeOutlineColor={theme.colors.onSurface}
                                        theme={{
                                            colors: {
                                                primary: theme.colors.primary,      // focused label color
                                                onSurfaceVariant: theme.colors.onSurface, // unfocused label color
                                            },
                                        }}
                                    />
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <TextInput
                                        label="Pincode"
                                        value={pincode}
                                        onChangeText={setPincode}
                                        mode="outlined"
                                        keyboardType="numeric"
                                        style={styles.input}
                                        outlineColor={theme.colors.outline}
                                        activeOutlineColor={theme.colors.onSurface}
                                        theme={{
                                            colors: {
                                                primary: theme.colors.primary,      // focused label color
                                                onSurfaceVariant: theme.colors.onSurface, // unfocused label color
                                            },
                                        }}
                                    />
                                </View>

                                <View style={styles.col}>
                                    <TextInput
                                        label="Country"
                                        value={country}
                                        editable={false}
                                        mode="outlined"
                                        style={styles.input}
                                        outlineColor={theme.colors.outline}
                                        activeOutlineColor={theme.colors.onSurface}
                                        theme={{
                                            colors: {
                                                primary: theme.colors.primary,      // focused label color
                                                onSurfaceVariant: theme.colors.onSurface, // unfocused label color
                                            },
                                        }}
                                    />
                                </View>
                            </View>

                            <Button
                                mode="outlined"
                                icon="crosshairs-gps"
                                onPress={fetchCurrentLocation}
                                loading={locBusy}
                                style={{ marginBottom: 12 }}
                            >
                                Use Current Location
                            </Button>
                        </View>
                    )}
                </Card.Content>

                {/* Saving Overlay */}
                {saving && (
                    <View
                        style={[
                            styles.overlay,
                            {
                                backgroundColor: theme.dark
                                    ? "rgba(0,0,0,0.5)"
                                    : "rgba(255,255,255,0.7)",
                            },
                        ]}
                    >
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text
                            style={[
                                styles.overlayText,
                                { color: theme.colors.onSurface },
                            ]}
                        >
                            Saving…
                        </Text>
                    </View>
                )}
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 16,
        paddingVertical: 12,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
    },
    editButtons: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    cardTitle: {
        fontWeight: "600",
        marginBottom: 12,
    },
    divider: {
        height: 1,
        marginBottom: 16,
    },
    infoRow: {
        paddingVertical: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomWidth: 0.5,
    },
    infoLabel: {
        fontSize: 14,
    },
    infoValue: {
        fontWeight: "600",
        flexShrink: 1,
        textAlign: "right",
    },
    input: {
        marginBottom: 12,
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    col: {
        flex: 1,
    },
    overlay: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 16,
        zIndex: 100,
    },
    overlayText: {
        marginTop: 8,
        fontWeight: "500",
    },
});
