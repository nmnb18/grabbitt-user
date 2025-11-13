import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/utils/theme';
import Constants from 'expo-constants';
import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, HelperText, Text, TextInput } from 'react-native-paper';

const API_URL =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL ||
    process.env.EXPO_PUBLIC_BACKEND_URL;

export default function VerificationDetails() {
    const { user } = useAuthStore();
    const sellerProfile = user?.user?.seller_profile?.verification;

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [gstNumber, setGstNumber] = useState(sellerProfile?.gst_number || '');
    const [panNumber, setPanNumber] = useState(sellerProfile?.pan_number || '');
    const [businessRegNumber, setBusinessRegNumber] = useState(
        sellerProfile?.business_registration_number || ''
    );
    const [verificationStatus, setVerificationStatus] = useState(
        sellerProfile?.status || 'pending'
    );

    const [initial, setInitial] = useState({
        gstNumber,
        panNumber,
        businessRegNumber,
    });

    const isDirty = useMemo(() => {
        return (
            gstNumber !== initial.gstNumber ||
            panNumber !== initial.panNumber ||
            businessRegNumber !== initial.businessRegNumber
        );
    }, [gstNumber, panNumber, businessRegNumber, initial]);

    const handleCancel = () => {
        setGstNumber(initial.gstNumber);
        setPanNumber(initial.panNumber);
        setBusinessRegNumber(initial.businessRegNumber);
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!gstNumber && !panNumber && !businessRegNumber) {
            return Alert.alert('Validation', 'Please fill at least one verification field.');
        }

        try {
            setSaving(true);

            const payload = {
                gst_number: gstNumber || null,
                pan_number: panNumber || null,
                business_registration_number: businessRegNumber || null,
            };

            // Commented out until BE integration
            // await api.put(`${API_URL}/sellers/profile/verification`, payload);

            setInitial({ gstNumber, panNumber, businessRegNumber });
            setIsEditing(false);
            Alert.alert('Success', 'Verification details updated successfully.');
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.error || 'Failed to save verification details.');
        } finally {
            setSaving(false);
        }
    };

    const getVerificationColor = () => {
        switch (verificationStatus) {
            case 'approved':
                return '#10B981';
            case 'rejected':
                return '#EF4444';
            default:
                return '#F59E0B';
        }
    };

    return (
        <Card style={styles.card} elevation={3}>
            <Card.Content>
                <View style={styles.sectionHeader}>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                        ✅ Verification
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

                <View style={styles.statusRow}>
                    <Chip
                        icon={
                            verificationStatus === 'approved'
                                ? 'check-decagram'
                                : verificationStatus === 'rejected'
                                    ? 'close-octagon'
                                    : 'shield-alert'
                        }
                        style={[styles.statusChip, { backgroundColor: `${getVerificationColor()}22` }]}
                        textStyle={{ color: getVerificationColor() }}
                    >
                        {verificationStatus === 'approved'
                            ? 'Verified'
                            : verificationStatus === 'rejected'
                                ? 'Rejected'
                                : 'Pending Verification'}
                    </Chip>
                </View>

                {!isEditing ? (
                    // --- VIEW MODE ---
                    <View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>GST Number</Text>
                            <Text style={styles.infoValue}>{gstNumber || '—'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>PAN Number</Text>
                            <Text style={styles.infoValue}>{panNumber || '—'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Business Registration Number</Text>
                            <Text style={styles.infoValue}>{businessRegNumber || '—'}</Text>
                        </View>

                        <HelperText type="info">
                            Complete these details to speed up your verification and unlock advanced features.
                        </HelperText>
                    </View>
                ) : (
                    // --- EDIT MODE ---
                    <View>
                        <TextInput
                            label="GST Number"
                            value={gstNumber}
                            onChangeText={setGstNumber}
                            mode="outlined"
                            style={styles.input}
                            outlineColor={Colors.light.outline}
                            activeOutlineColor={Colors.light.accent}
                            left={<TextInput.Icon icon="card-account-details-outline" />}
                        />
                        <TextInput
                            label="PAN Number"
                            value={panNumber}
                            onChangeText={setPanNumber}
                            mode="outlined"
                            style={styles.input}
                            outlineColor={Colors.light.outline}
                            activeOutlineColor={Colors.light.accent}
                            left={<TextInput.Icon icon="card-bulleted" />}
                        />
                        <TextInput
                            label="Business Registration Number"
                            value={businessRegNumber}
                            onChangeText={setBusinessRegNumber}
                            mode="outlined"
                            style={styles.input}
                            outlineColor={Colors.light.outline}
                            activeOutlineColor={Colors.light.accent}
                            left={<TextInput.Icon icon="file-document-outline" />}
                        />

                        {/* Placeholder for future document uploads */}
                        {/* <Button
              mode="outlined"
              icon="file-upload"
              style={{ marginTop: 8 }}
              onPress={() => Alert.alert('Coming Soon', 'Document upload will be available soon.')}
            >
              Upload Verification Documents
            </Button> */}
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
    editButtons: {
        flexDirection: 'row',
        alignItems: 'center',
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
    statusRow: {
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    statusChip: {
        borderRadius: 20,
        marginBottom: 8,
    },
});
