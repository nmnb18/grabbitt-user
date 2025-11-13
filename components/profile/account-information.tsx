import api from '@/services/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/utils/theme';
import Constants from 'expo-constants';
import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, Text, TextInput } from 'react-native-paper';

const API_URL =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL ||
    process.env.EXPO_PUBLIC_BACKEND_URL;

export default function AccountInformation() {
    const { user, idToken } = useAuthStore();

    // extract existing values from auth store
    const sellerProfile = user?.user?.seller_profile?.account;

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState(sellerProfile?.name);
    const [email] = useState(sellerProfile?.email || '');
    const [phone, setPhone] = useState(sellerProfile?.phone);
    const [establishedYear, setEstablishedYear] = useState(
        sellerProfile?.established_year ? String(sellerProfile.established_year) : ''
    );

    const [initial, setInitial] = useState({
        name,
        phone,
        establishedYear,
    });

    const isDirty = useMemo(() => {
        return (
            name !== initial.name ||
            phone !== initial.phone ||
            establishedYear !== initial.establishedYear
        );
    }, [name, phone, establishedYear, initial]);

    const handleSave = async () => {
        if (!name) return Alert.alert('Validation', 'Owner name is required');
        if (!phone) return Alert.alert('Validation', 'Phone is required');

        try {
            setSaving(true);

            const payload = {
                name,
                email,
                phone,
                established_year: establishedYear ? parseInt(establishedYear) : null,
            };

            await api.put(`${API_URL}/sellers/profile`, payload);

            // update local store instantly
            // updateUserProfile?.({
            //     ...sellerProfile,
            //     name,
            //     phone,
            //     established_year: establishedYear ? parseInt(establishedYear) : null,
            // });

            setInitial({ name, phone, establishedYear });
            setIsEditing(false);
            Alert.alert('Success', 'Account information updated successfully.');
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.error || 'Failed to save account information.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card style={styles.card} elevation={3}>
            <Card.Content>
                {/* Header Row */}
                <View style={styles.sectionHeader}>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                        👤 Account Information
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
                                onPress={() => setIsEditing(false)}
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
                            <Text style={styles.infoLabel}>Full Name</Text>
                            <Text style={styles.infoValue}>{name || '—'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{email || '—'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>{phone || '—'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Established Year</Text>
                            <Text style={styles.infoValue}>{establishedYear || '—'}</Text>
                        </View>
                    </View>
                ) : (
                    // --- EDIT MODE ---
                    <View>
                        <TextInput
                            label="Full Name *"
                            value={name}
                            onChangeText={setName}
                            mode="outlined"
                            style={styles.input}
                            outlineColor={Colors.light.outline}
                            activeOutlineColor={Colors.light.accent}
                            left={<TextInput.Icon icon="account" />}
                        />
                        <TextInput
                            label="Email (read-only)"
                            value={email}
                            mode="outlined"
                            style={styles.input}
                            outlineColor={Colors.light.outline}
                            activeOutlineColor={Colors.light.accent}
                            left={<TextInput.Icon icon="email" />}
                            editable={false}
                        />
                        <TextInput
                            label="Phone *"
                            value={phone}
                            onChangeText={setPhone}
                            mode="outlined"
                            keyboardType="phone-pad"
                            outlineColor={Colors.light.outline}
                            activeOutlineColor={Colors.light.accent}
                            style={styles.input}
                            left={<TextInput.Icon icon="phone" />}
                        />
                        <TextInput
                            label="Established Year (optional)"
                            value={establishedYear}
                            onChangeText={setEstablishedYear}
                            mode="outlined"
                            keyboardType="numeric"
                            outlineColor={Colors.light.outline}
                            activeOutlineColor={Colors.light.accent}
                            style={styles.input}
                            left={<TextInput.Icon icon="calendar" />}
                        />
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
    editButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
