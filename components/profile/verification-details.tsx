import api from '@/services/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/utils/theme';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, Text, TextInput } from 'react-native-paper';

export default function VerificationInformation() {
    const { user, fetchUserDetails } = useAuthStore();
    const uid = user?.uid;
    const idToken = user?.idToken;

    const profile = user?.user?.seller_profile?.verification;

    const [gst, setGst] = useState(profile?.gst_number || '');
    const [pan, setPan] = useState(profile?.pan_number || '');
    const [regNum, setRegNum] = useState(profile?.business_registration_number || '');

    const verificationStatus = profile?.status || 'pending';

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [initialState, setInitialState] = useState({
        gst,
        pan,
        regNum,
    });

    const isDirty = useMemo(() => {
        return (
            gst !== initialState.gst ||
            pan !== initialState.pan ||
            regNum !== initialState.regNum
        );
    }, [gst, pan, regNum, initialState]);

    const handleCancel = () => {
        setGst(initialState.gst);
        setPan(initialState.pan);
        setRegNum(initialState.regNum);
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            await api.patch(
                '/updateSellerProfile',
                {
                    section: 'verification',
                    data: {
                        gst_number: gst || null,
                        pan_number: pan || null,
                        business_registration_number: regNum || null,
                    },
                },
                { headers: { Authorization: `Bearer ${idToken}` } }
            );

            if (uid) await fetchUserDetails(uid, 'seller');

            setInitialState({ gst, pan, regNum });
            setIsEditing(false);

            Alert.alert('Success', 'Verification details updated.');
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to update verification info.');
        } finally {
            setSaving(false);
        }
    };

    // status chip style
    const statusColor =
        verificationStatus === 'approved'
            ? '#10B981'
            : verificationStatus === 'rejected'
                ? '#EF4444'
                : '#F59E0B';

    return (
        <Card style={styles.card} >
            <View style={{ position: 'relative' }}>
                <Card.Content>
                    {/* Header */}
                    <View style={styles.sectionHeader}>
                        <Text variant="titleMedium" style={styles.cardTitle}>
                            ✅ Verification Details
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
                                    disabled={saving}
                                    icon="close"
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

                    {/* Verification Status Chip */}
                    <View style={{ marginBottom: 16 }}>
                        <Chip
                            style={[styles.statusChip, { backgroundColor: `${statusColor}22` }]}
                            textStyle={{ color: statusColor, fontWeight: '600' }}
                            icon={verificationStatus === 'approved' ? 'check-decagram' : 'shield-alert'}
                        >
                            {verificationStatus === 'approved'
                                ? 'Verified'
                                : verificationStatus === 'rejected'
                                    ? 'Rejected'
                                    : 'Pending Verification'}
                        </Chip>
                    </View>

                    {/* VIEW MODE */}
                    {!isEditing ? (
                        <View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>GST Number</Text>
                                <Text style={styles.infoValue}>{gst || '—'}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>PAN Number</Text>
                                <Text style={styles.infoValue}>{pan || '—'}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Business Registration No.</Text>
                                <Text style={styles.infoValue}>{regNum || '—'}</Text>
                            </View>
                        </View>
                    ) : (
                        /* EDIT MODE */
                        <View>
                            <TextInput
                                label="GST Number"
                                value={gst}
                                onChangeText={setGst}
                                mode="outlined"
                                style={styles.input}
                                left={<TextInput.Icon icon="card-account-details-outline" />}
                            />

                            <TextInput
                                label="PAN Number"
                                value={pan}
                                onChangeText={setPan}
                                mode="outlined"
                                style={styles.input}
                                left={<TextInput.Icon icon="card-bulleted" />}
                            />

                            <TextInput
                                label="Business Registration Number"
                                value={regNum}
                                onChangeText={setRegNum}
                                mode="outlined"
                                style={styles.input}
                                left={<TextInput.Icon icon="file-document-outline" />}
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
    divider: { height: 1, backgroundColor: '#ddd', marginBottom: 16 },

    infoRow: {
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomColor: '#E5E4E2',
        borderBottomWidth: 0.5,
    },

    infoLabel: { color: '#6B7280' },
    infoValue: { fontWeight: '600', color: '#111827' },

    input: { marginBottom: 12 },

    statusChip: {
        alignSelf: 'flex-start',
        borderRadius: 8,
    },

    overlay: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        zIndex: 100,
    },
    overlayText: {
        marginTop: 8,
        color: '#444',
        fontWeight: '500',
    },
});
