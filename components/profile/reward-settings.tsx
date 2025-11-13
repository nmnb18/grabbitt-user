import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/utils/theme';
import Constants from 'expo-constants';
import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, HelperText, Text, TextInput } from 'react-native-paper';

const API_URL =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL ||
    process.env.EXPO_PUBLIC_BACKEND_URL;

export default function RewardsSettings() {
    const { user } = useAuthStore();
    const sellerProfile = user?.user?.seller_profile?.rewards;

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [pointsPerVisit, setPointsPerVisit] = useState(
        sellerProfile?.default_points_value
            ? String(sellerProfile.default_points_value)
            : '5'
    );
    const [rewardPoints, setRewardPoints] = useState(
        sellerProfile?.reward_points ? String(sellerProfile.reward_points) : '50'
    );
    const [rewardDescription, setRewardDescription] = useState(
        sellerProfile?.reward_description || ''
    );
    const [rewardName, setRewardName] = useState(
        sellerProfile?.reward_name || ''
    );

    const [initial, setInitial] = useState({
        pointsPerVisit,
        rewardPoints,
        rewardDescription,
    });

    const isDirty = useMemo(() => {
        return (
            pointsPerVisit !== initial.pointsPerVisit ||
            rewardPoints !== initial.rewardPoints ||
            rewardDescription !== initial.rewardDescription
        );
    }, [pointsPerVisit, rewardPoints, rewardDescription, initial]);

    const handleCancel = () => {
        setPointsPerVisit(initial.pointsPerVisit);
        setRewardPoints(initial.rewardPoints);
        setRewardDescription(initial.rewardDescription);
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!pointsPerVisit || !rewardPoints) {
            return Alert.alert('Validation', 'Please enter valid points values.');
        }

        try {
            setSaving(true);

            const payload = {
                default_points_value: parseInt(pointsPerVisit) || 0,
                reward_points: parseInt(rewardPoints) || 0,
                reward_description: rewardDescription || null,
            };

            // Commented out until backend is ready
            // await api.put(`${API_URL}/sellers/profile/rewards`, payload);

            setInitial({
                pointsPerVisit,
                rewardPoints,
                rewardDescription,
            });

            setIsEditing(false);
            Alert.alert('Success', 'Rewards settings updated successfully.');
        } catch (err: any) {
            Alert.alert(
                'Error',
                err.response?.data?.error || 'Failed to save rewards settings.'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card style={styles.card} elevation={3}>
            <Card.Content>
                <View style={styles.sectionHeader}>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                        🎁 Rewards Settings
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
                            <Text style={styles.infoLabel}>Points Per Visit</Text>
                            <Text style={styles.infoValue}>{pointsPerVisit || '—'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Points for Reward</Text>
                            <Text style={styles.infoValue}>{rewardPoints || '—'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Reward Name</Text>
                            <Text style={styles.infoValue}>{rewardName || '—'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Reward Description</Text>
                            <Text style={styles.infoValue}>{rewardDescription || '—'}</Text>
                        </View>


                        <HelperText type="info">
                            Customize how customers earn and redeem rewards.
                        </HelperText>
                    </View>
                ) : (
                    // --- EDIT MODE ---
                    <View>
                        <View style={styles.row}>
                            <View style={styles.half}>
                                <TextInput
                                    label="Points per Visit *"
                                    value={pointsPerVisit}
                                    onChangeText={setPointsPerVisit}
                                    mode="outlined"
                                    keyboardType="numeric"
                                    outlineColor={Colors.light.outline}
                                    activeOutlineColor={Colors.light.accent}
                                    style={styles.input}
                                    left={<TextInput.Icon icon="star" />}
                                />
                                <HelperText type="info">
                                    Points customers earn each visit.
                                </HelperText>
                            </View>
                            <View style={styles.half}>
                                <TextInput
                                    label="Points for Reward *"
                                    value={rewardPoints}
                                    onChangeText={setRewardPoints}
                                    mode="outlined"
                                    keyboardType="numeric"
                                    outlineColor={Colors.light.outline}
                                    activeOutlineColor={Colors.light.accent}
                                    style={styles.input}
                                    left={<TextInput.Icon icon="gift" />}
                                />
                                <HelperText type="info">
                                    Points required to redeem a reward.
                                </HelperText>
                            </View>
                        </View>
                        <TextInput
                            label="Reward Name"
                            value={rewardName}
                            onChangeText={setRewardName}
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                            style={styles.input}
                            outlineColor={Colors.light.outline}
                            activeOutlineColor={Colors.light.accent}
                            left={<TextInput.Icon icon="gift-outline" />}
                            placeholder="e.g., Beans, Cups, etc."
                        />
                        <HelperText type="info">
                            Fancy name you want to give to your reward.
                        </HelperText>
                        <TextInput
                            label="Reward Description"
                            value={rewardDescription}
                            onChangeText={setRewardDescription}
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                            style={styles.input}
                            outlineColor={Colors.light.outline}
                            activeOutlineColor={Colors.light.accent}
                            left={<TextInput.Icon icon="gift-outline" />}
                            placeholder="e.g., Free coffee, 20% off next visit, etc."
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
    row: { flexDirection: 'row', gap: 12 },
    half: { flex: 1 },
});
