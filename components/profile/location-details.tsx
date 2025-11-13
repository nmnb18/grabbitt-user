import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/utils/theme';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, HelperText, Text, TextInput } from 'react-native-paper';

const API_URL =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL ||
    process.env.EXPO_PUBLIC_BACKEND_URL;

export default function LocationDetails() {
    const { user } = useAuthStore();
    const sellerProfile = user?.user?.seller_profile?.location;

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [locBusy, setLocBusy] = useState(false);

    // Location details
    const [street, setStreet] = useState(sellerProfile?.address?.street || '');
    const [city, setCity] = useState(sellerProfile?.address?.city || '');
    const [stateName, setStateName] = useState(sellerProfile?.address?.state || '');
    const [pincode, setPincode] = useState(sellerProfile?.address?.pincode || '');
    const [country, setCountry] = useState(sellerProfile?.address?.country || 'India');
    const [latitude, setLatitude] = useState(sellerProfile?.lat || null);
    const [longitude, setLongitude] = useState(sellerProfile?.lng || null);
    const [enableLocation, setEnableLocation] = useState(
        !!sellerProfile?.radius_meters
    );
    const [locationRadius, setLocationRadius] = useState(
        sellerProfile?.radius_meters
            ? String(sellerProfile.radius_meters)
            : '100'
    );

    const [initial, setInitial] = useState({
        street,
        city,
        stateName,
        pincode,
        country,
        latitude,
        longitude,
        enableLocation,
        locationRadius,
    });

    const isDirty = useMemo(() => {
        return (
            street !== initial.street ||
            city !== initial.city ||
            stateName !== initial.stateName ||
            pincode !== initial.pincode ||
            country !== initial.country ||
            latitude !== initial.latitude ||
            longitude !== initial.longitude ||
            enableLocation !== initial.enableLocation ||
            locationRadius !== initial.locationRadius
        );
    }, [
        street,
        city,
        stateName,
        pincode,
        country,
        latitude,
        longitude,
        enableLocation,
        locationRadius,
        initial,
    ]);

    const handleCancel = () => {
        setStreet(initial.street);
        setCity(initial.city);
        setStateName(initial.stateName);
        setPincode(initial.pincode);
        setCountry(initial.country);
        setLatitude(initial.latitude);
        setLongitude(initial.longitude);
        setEnableLocation(initial.enableLocation);
        setLocationRadius(initial.locationRadius);
        setIsEditing(false);
    };

    const onUpdateLocation = async () => {
        try {
            setLocBusy(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'Please enable location permission');
                return;
            }
            const pos = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            setLatitude(pos.coords.latitude);
            setLongitude(pos.coords.longitude);
            setEnableLocation(true);

            const res = await Location.reverseGeocodeAsync({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
            });
            if (res?.length) {
                const addr = res[0];
                setStreet(addr.street || addr.name || '');
                setCity(addr.city || addr.subregion || '');
                setStateName(addr.region || '');
                setPincode(addr.postalCode || '');
                setCountry(addr.country || 'India');
            }
        } catch (err) {
            Alert.alert('Location', 'Could not fetch location, please try again.');
        } finally {
            setLocBusy(false);
        }
    };

    const handleSave = async () => {
        if (!city || !stateName) {
            return Alert.alert('Validation', 'City and state are required.');
        }

        try {
            setSaving(true);

            const payload = {
                address: { street, city, state: stateName, pincode, country },
                location_lat: latitude,
                location_lng: longitude,
                location_radius_meters: enableLocation
                    ? parseInt(locationRadius || '0') || 100
                    : null,
            };

            // Commented out until BE is ready
            // await api.put(`${API_URL}/sellers/profile/location`, payload);

            setInitial({
                street,
                city,
                stateName,
                pincode,
                country,
                latitude,
                longitude,
                enableLocation,
                locationRadius,
            });
            setIsEditing(false);
            Alert.alert('Success', 'Location details updated successfully.');
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.error || 'Failed to save location details.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card style={styles.card} elevation={3}>
            <Card.Content>
                <View style={styles.sectionHeader}>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                        📍 Location Details
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
                                disabled={saving}
                                icon="close"
                                compact
                            >
                                Cancel
                            </Button>
                            <Button
                                mode="text"
                                onPress={handleSave}
                                disabled={saving || !isDirty}
                                icon="content-save-outline"
                                loading={saving}
                                compact
                            >
                                Save
                            </Button>
                        </View>
                    )}
                </View>

                <Divider style={styles.divider} />

                {!isEditing ? (
                    // --- VIEW MODE ---
                    <View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Street</Text>
                            <Text style={styles.infoValue}>{street || '—'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>City</Text>
                            <Text style={styles.infoValue}>{city || '—'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>State</Text>
                            <Text style={styles.infoValue}>{stateName || '—'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Pincode</Text>
                            <Text style={styles.infoValue}>{pincode || '—'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Country</Text>
                            <Text style={styles.infoValue}>{country || '—'}</Text>
                        </View>
                        {latitude && longitude && (
                            <HelperText type="info">
                                Coordinates: {latitude.toFixed(5)}, {longitude.toFixed(5)}
                            </HelperText>
                        )}
                    </View>
                ) : (
                    // --- EDIT MODE ---
                    <View>
                        <TextInput
                            label="Street"
                            value={street}
                            onChangeText={setStreet}
                            mode="outlined"
                            style={styles.input}
                            outlineColor={Colors.light.outline}
                            activeOutlineColor={Colors.light.accent}
                            left={<TextInput.Icon icon="map-marker" />}
                        />

                        <View style={styles.row}>
                            <View style={styles.half}>
                                <TextInput
                                    label="City"
                                    value={city}
                                    onChangeText={setCity}
                                    mode="outlined"
                                    style={styles.input}
                                    outlineColor={Colors.light.outline}
                                    activeOutlineColor={Colors.light.accent}
                                />
                            </View>
                            <View style={styles.half}>
                                <TextInput
                                    label="State"
                                    value={stateName}
                                    onChangeText={setStateName}
                                    mode="outlined"
                                    style={styles.input}
                                    outlineColor={Colors.light.outline}
                                    activeOutlineColor={Colors.light.accent}
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.half}>
                                <TextInput
                                    label="Pincode"
                                    value={pincode}
                                    onChangeText={setPincode}
                                    mode="outlined"
                                    keyboardType="numeric"
                                    style={styles.input}
                                    outlineColor={Colors.light.outline}
                                    activeOutlineColor={Colors.light.accent}
                                />
                            </View>
                            <View style={styles.half}>
                                <TextInput
                                    label="Country"
                                    value={country}
                                    onChangeText={setCountry}
                                    mode="outlined"
                                    style={styles.input}
                                    outlineColor={Colors.light.outline}
                                    activeOutlineColor={Colors.light.accent}
                                />
                            </View>
                        </View>

                        <View style={styles.inline}>
                            <Button
                                mode={enableLocation ? 'contained' : 'outlined'}
                                onPress={onUpdateLocation}
                                loading={locBusy}
                                icon="crosshairs-gps"
                            >
                                {enableLocation ? 'Update Location' : 'Use Current Location'}
                            </Button>
                            <View style={{ width: 12 }} />
                            <TextInput
                                label="Radius (m)"
                                value={locationRadius}
                                onChangeText={setLocationRadius}
                                mode="outlined"
                                keyboardType="numeric"
                                style={[styles.input, { flex: 1 }]}
                                outlineColor={Colors.light.outline}
                                activeOutlineColor={Colors.light.accent}
                            />
                        </View>

                        {latitude && longitude && (
                            <HelperText type="info">
                                Current coordinates: {latitude.toFixed(5)}, {longitude.toFixed(5)}
                            </HelperText>
                        )}
                    </View>
                )}
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
    },
    cardTitle: { fontWeight: '600', marginBottom: 12 },
    divider: { marginBottom: 16, height: 1.2, backgroundColor: '#0D737733' },

    infoRow: {
        paddingVertical: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E4E2',
    },
    infoLabel: { color: '#6B7280' },
    infoValue: { fontWeight: '600', color: '#111827' },

    input: { marginBottom: 12, backgroundColor: '#FFFFFF' },
    editButtons: { flexDirection: 'row', alignItems: 'center' },

    row: { flexDirection: 'row', gap: 12 },
    half: { flex: 1 },
    inline: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
});
