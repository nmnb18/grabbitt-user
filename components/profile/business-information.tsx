import api from '@/services/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { BUSINESS_TYPES, CATEGORIES } from '@/utils/constant';
import { Colors } from '@/utils/theme';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, Text, TextInput } from 'react-native-paper';
import { LockedOverlay } from '../shared/locked-overlay';



export default function BusinessInformation() {
    const { user, fetchUserDetails } = useAuthStore();
    const uid = user?.uid;
    const idToken = user?.idToken;

    const profile = user?.user?.seller_profile?.business;

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const subscriptionTier = user?.user?.seller_profile?.subscription.tier || "free";
    const isFree = subscriptionTier === "free";
    const [shopName, setShopName] = useState(profile?.shop_name || '');
    const [businessType, setBusinessType] = useState(profile?.business_type || '');
    const [category, setCategory] = useState(profile?.category || '');
    const [description, setDescription] = useState(profile?.description || '');

    const initial = {
        shopName,
        businessType,
        category,
        description,
    };

    const [initialState, setInitialState] = useState(initial);

    const isDirty = useMemo(() => {
        return (
            shopName !== initialState.shopName ||
            businessType !== initialState.businessType ||
            category !== initialState.category ||
            description !== initialState.description
        );
    }, [shopName, businessType, category, description, initialState]);

    const handleCancel = () => {
        setShopName(initialState.shopName);
        setBusinessType(initialState.businessType);
        setCategory(initialState.category);
        setDescription(initialState.description);
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!shopName) return Alert.alert("Validation", "Shop name is required");
        if (!businessType) return Alert.alert("Validation", "Business type is required");
        if (!category) return Alert.alert("Validation", "Category is required");

        try {
            setSaving(true);

            await api.patch(
                "/seller/update-seller",
                {
                    section: "business",
                    data: {
                        shop_name: shopName,
                        business_type: businessType,
                        category,
                        description,
                    },
                },
                { headers: { Authorization: `Bearer ${idToken}` } }
            );

            if (uid) await fetchUserDetails(uid, "seller");

            setInitialState({
                shopName,
                businessType,
                category,
                description,
            });

            setIsEditing(false);
            Alert.alert("Success", "Business information updated.");
        } catch (err: any) {
            Alert.alert("Error", err.response?.data?.message || "Failed to update business info.");
        } finally {
            setSaving(false);
        }
    };

    // Categories based on business type
    const availableCategories = businessType
        ? CATEGORIES[businessType as keyof typeof CATEGORIES] || []
        : [];
    return (
        <Card style={styles.card} >
            <View style={{ position: "relative" }}>
                <Card.Content>
                    {/* Header */}
                    <View style={styles.sectionHeader}>
                        <Text variant="titleMedium" style={styles.cardTitle}>
                            🏪 Business Information
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

                    {/* VIEW MODE */}
                    {!isEditing ? (
                        <View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Shop Name</Text>
                                <Text style={styles.infoValue}>{shopName || "—"}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Business Type</Text>
                                <Text style={styles.infoValue}>{businessType || "—"}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Category</Text>
                                <Text style={styles.infoValue}>{category || "—"}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Description</Text>
                                <Text style={styles.infoValue}>{description || "—"}</Text>
                            </View>
                        </View>
                    ) : (
                        /* EDIT MODE */
                        <View>
                            {/* Shop Name */}
                            <TextInput
                                label="Shop Name *"
                                value={shopName}
                                onChangeText={setShopName}
                                mode="outlined"
                                style={styles.input}
                                left={<TextInput.Icon icon="store" />}
                            />

                            {/* Business Type */}
                            <Text style={styles.label}>Business Type *</Text>
                            <View style={styles.wrapRow}>
                                {BUSINESS_TYPES.map((bt) => (
                                    <Chip
                                        key={bt.value}
                                        selected={businessType === bt.value}
                                        onPress={() => {
                                            setBusinessType(bt.value);
                                            setCategory(""); // reset category
                                        }}
                                        style={[
                                            styles.chip,
                                            businessType === bt.value && styles.chipSelected,
                                        ]}
                                        textStyle={{
                                            color: businessType === bt.value ? "#FFF" : "#111",
                                        }}
                                    >
                                        {bt.label}
                                    </Chip>
                                ))}
                            </View>

                            {/* Category */}
                            <Text style={styles.label}>Category *</Text>
                            <View style={styles.wrapRow}>
                                {availableCategories.map((cat) => (
                                    <Chip
                                        key={cat}
                                        selected={category.toLowerCase() === cat.toLowerCase()}
                                        onPress={() => setCategory(cat)}
                                        style={[
                                            styles.chip,
                                            category.toLowerCase() === cat.toLowerCase() && styles.chipSelected,
                                        ]}
                                        textStyle={{
                                            color: category.toLowerCase() === cat.toLowerCase() ? "#FFF" : "#111",
                                        }}
                                    >
                                        {cat}
                                    </Chip>
                                ))}
                            </View>

                            {/* Description */}
                            <TextInput
                                label="Description"
                                value={description}
                                onChangeText={setDescription}
                                mode="outlined"
                                multiline
                                numberOfLines={3}
                                style={styles.input}
                                left={<TextInput.Icon icon="text" />}
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
                    <LockedOverlay message="Business Information cannot be edited on the Free plan." />
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
    editButtons: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    cardTitle: { fontWeight: "600", marginBottom: 12 },
    divider: { marginBottom: 16, backgroundColor: "#ddd", height: 1 },

    // View mode rows
    infoRow: {
        paddingVertical: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomColor: "#E5E4E2",
        borderBottomWidth: 0.5,
    },
    infoLabel: { color: "#6B7280" },
    infoValue: { fontWeight: "600", color: "#111827", textTransform: 'capitalize' },

    // Edit mode
    input: { marginBottom: 12, backgroundColor: "#FFF" },
    label: {
        marginBottom: 6,
        fontWeight: "500",
        color: "#444",
    },
    wrapRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 12,
    },
    chip: {
        backgroundColor: "#F3F4F6",
    },
    chipSelected: {
        backgroundColor: Colors.light.accent,
    },

    // Overlay
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255,255,255,0.7)",
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 50,
    },
    overlayText: {
        marginTop: 8,
        fontSize: 14,
        color: "#444",
        fontWeight: "500",
    },
});
