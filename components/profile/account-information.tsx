import api from '@/services/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/utils/theme';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, Text, TextInput } from 'react-native-paper';

export default function AccountInformation({ onOpenChangePassword }: { onOpenChangePassword: () => void }) {
    const { user, fetchUserDetails } = useAuthStore();
    const uid = user?.uid;
    const idToken = user?.idToken;

    const profile = user?.user?.seller_profile?.account;

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState(profile?.name || '');
    const [email] = useState(profile?.email || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [establishedYear, setEstablishedYear] = useState(
        profile?.established_year ? String(profile.established_year) : ''
    );

    const [initial, setInitial] = useState({
        name,
        phone,
        establishedYear,
    });

    const isDirty = useMemo(
        () =>
            name !== initial.name ||
            phone !== initial.phone ||
            establishedYear !== initial.establishedYear,
        [name, phone, establishedYear, initial]
    );

    const handleCancel = () => {
        setName(initial.name);
        setPhone(initial.phone);
        setEstablishedYear(initial.establishedYear);
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!name) return Alert.alert('Validation', 'Full name is required');
        if (!phone) return Alert.alert('Validation', 'Phone number is required');

        try {
            setSaving(true);

            await api.patch(
                '/seller/update-seller',
                {
                    section: 'account',
                    data: {
                        name,
                        phone,
                        established_year: establishedYear ? Number(establishedYear) : null,
                    },
                },
                { headers: { Authorization: `Bearer ${idToken}` } }
            );

            if (uid) await fetchUserDetails(uid, 'seller');
            setInitial({ name, phone, establishedYear });
            setIsEditing(false);

            Alert.alert('Success', 'Account information updated.');
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card style={styles.card} >
            <View style={{ position: 'relative' }}>
                <Card.Content>
                    {/* HEADER */}
                    <View style={styles.sectionHeader}>
                        <Text variant="titleMedium" style={styles.cardTitle}>👤 Account Information</Text>

                        {!isEditing ? (
                            <Button mode="text" onPress={() => setIsEditing(true)} icon="pencil" compact>
                                Edit
                            </Button>
                        ) : (
                            <View style={styles.editButtons}>
                                <Button mode="text" onPress={handleCancel} icon="close" disabled={saving} compact>
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

                    {/* DISPLAY MODE */}
                    {!isEditing ? (
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

                            {/* Change Password Trigger */}
                            <View style={{ marginTop: 20 }}>
                                <Button mode="text" icon="lock-reset" onPress={onOpenChangePassword}>
                                    Change Password
                                </Button>
                            </View>
                        </View>
                    ) : (
                        /* EDIT MODE */
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
                                label="Email (read only)"
                                value={email}
                                mode="outlined"
                                editable={false}
                                style={styles.input}
                                outlineColor={Colors.light.outline}
                                activeOutlineColor={Colors.light.accent}
                                left={<TextInput.Icon icon="email" />}
                            />

                            <TextInput
                                label="Phone *"
                                value={phone}
                                onChangeText={setPhone}
                                mode="outlined"
                                keyboardType="phone-pad"
                                style={styles.input}
                                outlineColor={Colors.light.outline}
                                activeOutlineColor={Colors.light.accent}
                                left={<TextInput.Icon icon="phone" />}
                            />

                            <TextInput
                                label="Established Year"
                                value={establishedYear}
                                onChangeText={setEstablishedYear}
                                mode="outlined"
                                keyboardType="numeric"
                                style={styles.input}
                                outlineColor={Colors.light.outline}
                                activeOutlineColor={Colors.light.accent}
                                left={<TextInput.Icon icon="calendar" />}
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
        alignItems: 'baseline',
    },
    editButtons: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    cardTitle: { fontWeight: '600', marginBottom: 12 },
    divider: { marginBottom: 16, backgroundColor: '#ddd', height: 1 },
    infoRow: {
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomColor: '#E5E4E2',
        borderBottomWidth: 0.5,
    },
    infoLabel: { color: '#6B7280' },
    infoValue: { fontWeight: '600', color: '#111827' },
    input: { marginBottom: 12, backgroundColor: '#FFF' },
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
    },
    overlayText: {
        marginTop: 8,
        fontSize: 14,
        color: '#444',
        fontWeight: '500',
    },
});
