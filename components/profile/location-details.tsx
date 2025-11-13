import api from '@/services/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/utils/theme';
import * as Location from 'expo-location';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, Text, TextInput } from 'react-native-paper';
import { LockedOverlay } from '../shared/locked-overlay';

export default function LocationInformation() {
    const { user, fetchUserDetails } = useAuthStore();
    const uid = user?.uid;
    const idToken = user?.idToken;

    const profile = user?.user?.seller_profile?.location;

    // Extract values from profile
    const [street, setStreet] = useState(profile?.address?.street || '');
    const [city, setCity] = useState(profile?.address?.city || '');
    const [stateName, setStateName] = useState(profile?.address?.state || '');
    const [pincode, setPincode] = useState(profile?.address?.pincode || '');
    const [country] = useState(profile?.address?.country || 'India');
    const subscriptionTier = user?.user?.seller_profile?.subscription.tier || "free";
    const isFree = subscriptionTier === "free";

    const [lat, setLat] = useState(profile?.lat ?? null);
    const [lng, setLng] = useState(profile?.lng ?? null);

    const [radius, setRadius] = useState(
        profile?.radius_meters ? String(profile.radius_meters) : '100'
    );

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [locBusy, setLocBusy] = useState(false);

    // Initial values for cancel
    const [initial, setInitial] = useState({
        street,
        city,
        stateName,
        pincode,
        radius,
        lat,
        lng,
    });

    const isDirty = useMemo(() => {
        return (
            street !== initial.street ||
            city !== initial.city ||
            stateName !== initial.stateName ||
            pincode !== initial.pincode ||
            radius !== initial.radius ||
            lat !== initial.lat ||
            lng !== initial.lng
        );
    }, [street, city, stateName, pincode, radius, lat, lng, initial]);

    const handleCancel = () => {
        setStreet(initial.street);
        setCity(initial.city);
        setStateName(initial.stateName);
        setPincode(initial.pincode);
        setRadius(initial.radius);
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
                setStreet(addr.street || addr.name || '');
                setCity(addr.city || addr.subregion || '');
                setStateName(addr.region || '');
                setPincode(addr.postalCode || '');
            }
        } catch (err) {
            console.error('Reverse geocode failed', err);
        }
    };

    // GPS fetch handler
    const fetchCurrentLocation = async () => {
        try {
            setLocBusy(true);

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Location access must be enabled.');
                return;
            }

            const pos = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            setLat(pos.coords.latitude);
            setLng(pos.coords.longitude);

            await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch current location.');
        } finally {
            setLocBusy(false);
        }
    };

    const handleSave = async () => {
        if (!street || !city || !stateName || !pincode) {
            return Alert.alert('Validation', 'All address fields are required.');
        }

        try {
            setSaving(true);

            await api.patch(
                '/seller/update-seller',
                {
                    section: 'location',
                    data: {
                        address: {
                            street,
                            city,
                            state: stateName,
                            pincode,
                            country,
                        },
                        lat,
                        lng,
                        radius_meters: Number(radius),
                    },
                },
                { headers: { Authorization: `Bearer ${idToken}` } }
            );

            if (uid) await fetchUserDetails(uid, 'seller');

            setInitial({
                street,
                city,
                stateName,
                pincode,
                radius,
                lat,
                lng,
            });

            setIsEditing(false);
            Alert.alert('Success', 'Location updated successfully.');
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to update location.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card style={styles.card} elevation={3}>
            <View style={{ position: 'relative' }}>
                <Card.Content>
                    {/* Header */}
                    <View style={styles.sectionHeader}>
                        <Text variant="titleMedium" style={styles.cardTitle}>
                            📍 Location Information
                        </Text>

                        {!isEditing ? (
                            <Button mode="text" onPress={() => setIsEditing(true)} icon="pencil" compact>
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

                    <Divider style={styles.divider} />

                    {/* View Mode */}
                    {!isEditing ? (
                        <View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Address</Text>
                                <Text style={styles.infoValue}>
                                    {street}, {city}, {stateName}, {pincode}
                                </Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Latitude</Text>
                                <Text style={styles.infoValue}>{lat ?? '—'}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Longitude</Text>
                                <Text style={styles.infoValue}>{lng ?? '—'}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Radius (meters)</Text>
                                <Text style={styles.infoValue}>{radius}</Text>
                            </View>
                        </View>
                    ) : (
                        /* Edit Mode */
                        <View>
                            <TextInput
                                label="Street"
                                value={street}
                                onChangeText={setStreet}
                                mode="outlined"
                                style={styles.input}
                            />

                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <TextInput
                                        label="City"
                                        value={city}
                                        onChangeText={setCity}
                                        mode="outlined"
                                        style={styles.input}
                                    />
                                </View>
                                <View style={styles.col}>
                                    <TextInput
                                        label="State"
                                        value={stateName}
                                        onChangeText={setStateName}
                                        mode="outlined"
                                        style={styles.input}
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
                                    />
                                </View>
                                <View style={styles.col}>
                                    <TextInput
                                        label="Country"
                                        value={country}
                                        mode="outlined"
                                        editable={false}
                                        style={styles.input}
                                    />
                                </View>
                            </View>

                            {/* GPS Button */}
                            <Button
                                mode="outlined"
                                icon="crosshairs-gps"
                                onPress={fetchCurrentLocation}
                                loading={locBusy}
                                style={{ marginBottom: 12 }}
                            >
                                Use Current Location
                            </Button>

                            <TextInput
                                label="Radius (meters)"
                                value={radius}
                                onChangeText={setRadius}
                                keyboardType="numeric"
                                mode="outlined"
                                style={styles.input}
                            />
                        </View>
                    )}
                </Card.Content>

                {/* Saving Overlay */}
                {saving && (
                    <View style={styles.overlay}>
                        <ActivityIndicator size="large" color={Colors.light.accent} />
                        <Text style={styles.overlayText}>Saving…</Text>
                    </View>
                )}
                {isFree && (
                    <LockedOverlay message="Location Information cannot be edited on the Free plan." />
                )}
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: '#FFF',
        paddingVertical: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline'
    },
    editButtons: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    cardTitle: { fontWeight: '600', marginBottom: 12 },
    divider: { backgroundColor: '#ddd', height: 1, marginBottom: 16 },
    infoRow: {
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomColor: '#E5E4E2',
        borderBottomWidth: 0.5,
    },
    infoLabel: { color: '#6B7280' },
    infoValue: {
        fontWeight: '600',
        color: '#111827',
        flexShrink: 1,
        textAlign: 'right',
    },
    input: { marginBottom: 12, backgroundColor: '#FFF' },
    row: { flexDirection: 'row', gap: 12 },
    col: { flex: 1 },

    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        zIndex: 100,
    },
    overlayText: { marginTop: 8, fontWeight: '500', color: '#444' },
});
