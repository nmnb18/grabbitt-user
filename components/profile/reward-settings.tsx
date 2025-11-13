import api from '@/services/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { QR_CODE_TYPES } from '@/utils/constant';
import { Colors } from '@/utils/theme';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, HelperText, Text, TextInput } from 'react-native-paper';
import { LockedOverlay } from '../shared/locked-overlay';
type QrType = "dynamic" | "static" | "static_hidden";
export default function RewardsSettings() {
    const { user, fetchUserDetails } = useAuthStore();
    const uid = user?.uid;
    const idToken = user?.idToken;

    const rewards = user?.user?.seller_profile?.rewards;
    const qr = user?.user?.seller_profile?.qr_settings;
    const subscriptionTier = user?.user?.seller_profile?.subscription.tier || "free";
    const canEditQR = subscriptionTier !== "free";

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Rewards
    const [pointsPerVisit, setPointsPerVisit] = useState(
        rewards?.default_points_value ? String(rewards.default_points_value) : "5"
    );
    const [rewardPoints, setRewardPoints] = useState(
        rewards?.reward_points ? String(rewards.reward_points) : "50"
    );
    const [rewardDescription, setRewardDescription] = useState(
        rewards?.reward_description || ""
    );
    const [rewardName, setRewardName] = useState(rewards?.reward_name || "");

    // QR Settings
    const [qrType, setQrType] = useState<QrType>(qr?.qr_code_type || "dynamic");

    const [initial, setInitial] = useState({
        pointsPerVisit,
        rewardPoints,
        rewardDescription,
        rewardName,
        qrType,
    });

    const isDirty = useMemo(() => {
        return (
            pointsPerVisit !== initial.pointsPerVisit ||
            rewardPoints !== initial.rewardPoints ||
            rewardDescription !== initial.rewardDescription ||
            rewardName !== initial.rewardName ||
            qrType !== initial.qrType
        );
    }, [pointsPerVisit, rewardPoints, rewardDescription, rewardName, qrType, initial]);

    const handleCancel = () => {
        setPointsPerVisit(initial.pointsPerVisit);
        setRewardPoints(initial.rewardPoints);
        setRewardDescription(initial.rewardDescription);
        setRewardName(initial.rewardName);
        setQrType(initial.qrType);
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!pointsPerVisit || !rewardPoints) {
            return Alert.alert("Validation", "Please enter valid points values.");
        }

        try {
            setSaving(true);

            await api.patch(
                "/seller/update-seller",
                {
                    section: "rewards",
                    data: {
                        rewards: {
                            default_points_value: Number(pointsPerVisit),
                            reward_points: Number(rewardPoints),
                            reward_description: rewardDescription,
                            reward_name: rewardName
                        },
                        qr_settings: {
                            qr_code_type: qrType
                        }
                    }
                },
                { headers: { Authorization: `Bearer ${idToken}` } }
            );

            if (uid) await fetchUserDetails(uid, "seller");

            setInitial({
                pointsPerVisit,
                rewardPoints,
                rewardDescription,
                rewardName,
                qrType,
            });

            setIsEditing(false);
            Alert.alert("Success", "Reward settings updated.");
        } catch (err: any) {
            Alert.alert(
                "Error",
                err.response?.data?.message || "Failed to save rewards settings."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card style={styles.card} elevation={3}>
            <View style={{ position: "relative" }}>
                <Card.Content>
                    {/* Header */}
                    <View style={styles.sectionHeader}>
                        <Text variant="titleMedium" style={styles.cardTitle}>
                            🎁 Rewards & QR Settings
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
                                    disabled={!isDirty || saving}
                                    loading={saving}
                                    icon="content-save-outline"
                                    compact
                                >
                                    Save
                                </Button>
                            </View>
                        )}
                    </View>

                    <Divider style={styles.divider} />

                    {/* VIEW MODE */}
                    {!isEditing ? (
                        <View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Points Per Visit</Text>
                                <Text style={styles.infoValue}>{pointsPerVisit}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Points for Reward</Text>
                                <Text style={styles.infoValue}>{rewardPoints}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Reward Name</Text>
                                <Text style={styles.infoValue}>{rewardName || "—"}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Reward Description</Text>
                                <Text style={styles.infoValue}>{rewardDescription || "—"}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>QR Type</Text>
                                <Text style={styles.infoValue}>{qrType}</Text>
                            </View>

                            {subscriptionTier === "free" && (
                                <HelperText type="error">
                                    QR type changes are locked for Free plan.
                                </HelperText>
                            )}

                            <HelperText type="info">
                                Customize how customers earn and redeem rewards.
                            </HelperText>
                        </View>
                    ) : (
                        /* EDIT MODE */
                        <View>
                            {/* Rewards */}
                            <View style={styles.row}>
                                <View style={styles.half}>
                                    <TextInput
                                        label="Points per Visit *"
                                        value={pointsPerVisit}
                                        onChangeText={setPointsPerVisit}
                                        keyboardType="numeric"
                                        mode="outlined"
                                        left={<TextInput.Icon icon="star" />}
                                        style={styles.input}
                                    />
                                </View>

                                <View style={styles.half}>
                                    <TextInput
                                        label="Points for Reward *"
                                        value={rewardPoints}
                                        onChangeText={setRewardPoints}
                                        keyboardType="numeric"
                                        mode="outlined"
                                        left={<TextInput.Icon icon="gift" />}
                                        style={styles.input}
                                    />
                                </View>
                            </View>

                            <TextInput
                                label="Reward Name"
                                value={rewardName}
                                onChangeText={setRewardName}
                                mode="outlined"
                                style={styles.input}
                                left={<TextInput.Icon icon="gift-outline" />}
                            />

                            <TextInput
                                label="Reward Description"
                                value={rewardDescription}
                                onChangeText={setRewardDescription}
                                mode="outlined"
                                multiline
                                numberOfLines={3}
                                style={styles.input}
                                left={<TextInput.Icon icon="gift-outline" />}
                            />

                            {/* QR TYPE */}
                            <Text style={{ marginTop: 12, marginBottom: 6 }}>QR Code Type</Text>

                            <View style={styles.chipRow}>
                                {QR_CODE_TYPES.map((item) => {
                                    const selected = qrType === item.value;
                                    return (
                                        <Chip
                                            key={item.value}
                                            selected={selected}
                                            disabled={!canEditQR}
                                            onPress={() => canEditQR && setQrType(item.value as QrType)}
                                            style={[
                                                styles.chip,
                                                selected && { backgroundColor: Colors.light.accent },
                                                !canEditQR && styles.disabledChip,
                                            ]}
                                            textStyle={{
                                                color: selected ? "#FFF" : "#444",
                                                fontWeight: selected ? "600" : "400",
                                            }}
                                        >
                                            {item.label}
                                        </Chip>
                                    );
                                })}
                            </View>

                            {!canEditQR && (
                                <HelperText type="error">
                                    Upgrade your plan to change QR type.
                                </HelperText>
                            )}
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
                {!canEditQR && (
                    <LockedOverlay message="Reward & QR Settings cannot be edited on the Free plan." />
                )}
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: "#FFF",
        paddingVertical: 12,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
    },
    cardTitle: { fontWeight: "600", marginBottom: 12 },
    divider: { height: 1, backgroundColor: "#ddd", marginBottom: 16 },
    infoRow: {
        paddingVertical: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomColor: "#E5E4E2",
        borderBottomWidth: 0.5,
    },
    infoLabel: { color: "#6B7280" },
    infoValue: { fontWeight: "600", color: "#111827", textTransform: 'capitalize' },
    editButtons: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    row: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },
    half: { flex: 1 },
    input: {
        marginBottom: 12,
        backgroundColor: "#FFF",
    },
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 8,
    },
    chip: {
        backgroundColor: "#EEE",
    },
    disabledChip: {
        opacity: 0.4,
    },
    overlay: {
        position: "absolute",
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: "rgba(255,255,255,0.7)",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 16,
        zIndex: 100,
    },
    overlayText: {
        marginTop: 8,
        color: "#444",
        fontWeight: "500",
    },
});
