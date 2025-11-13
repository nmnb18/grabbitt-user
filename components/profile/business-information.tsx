import { useAuthStore } from '@/store/authStore';
import { BUSINESS_TYPES, CATEGORIES } from '@/utils/constant';
import { Colors } from '@/utils/theme';
import Constants from 'expo-constants';
import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, HelperText, Text, TextInput } from 'react-native-paper';

const API_URL =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL ||
    process.env.EXPO_PUBLIC_BACKEND_URL;

export default function BusinessInformation() {
    const { user } = useAuthStore();
    const sellerProfile = user?.user?.seller_profile?.business;

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Business data
    const [shopName, setShopName] = useState(sellerProfile?.shop_name || '');
    const [businessType, setBusinessType] = useState(sellerProfile?.business_type || '');
    const [category, setCategory] = useState(sellerProfile?.category || '');
    const [description, setDescription] = useState(sellerProfile?.description || '');

    const [initial, setInitial] = useState({
        shopName,
        businessType,
        category,
        description,
    });

    const availableCategories = businessType
        ? CATEGORIES[businessType as keyof typeof CATEGORIES] || []
        : [];

    const isDirty = useMemo(() => {
        return (
            shopName !== initial.shopName ||
            businessType !== initial.businessType ||
            category !== initial.category ||
            description !== initial.description
        );
    }, [shopName, businessType, category, description, initial]);

    const handleCancel = () => {
        setShopName(initial.shopName);
        setBusinessType(initial.businessType);
        setCategory(initial.category);
        setDescription(initial.description);
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!shopName) return Alert.alert('Validation', 'Shop name is required.');

        try {
            setSaving(true);

            const payload = {
                shop_name: shopName,
                business_type: businessType || null,
                category: category || null,
                description,
            };

            // Commented out for now, enable later when backend is ready
            // await api.put(`${API_URL}/sellers/profile/business`, payload);

            setInitial({ shopName, businessType, category, description });
            setIsEditing(false);
            Alert.alert('Success', 'Business information updated successfully.');
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.error || 'Failed to save business information.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card style={styles.card} elevation={3}>
            <Card.Content>
                {/* Header */}
                <View style={styles.sectionHeader}>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                        🏪 Business Information
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
                            <Text style={styles.infoLabel}>Shop Name</Text>
                            <Text style={styles.infoValue}>{shopName || '—'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Business Type</Text>
                            <Text style={styles.infoValue}>
                                {businessType ? BUSINESS_TYPES.find(bt => bt.value === businessType)?.label : '—'}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Category</Text>
                            <Text style={styles.infoValue}>{category || '—'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Description</Text>
                            <Text style={styles.infoValue}>{description || '—'}</Text>
                        </View>
                    </View>
                ) : (
                    // --- EDIT MODE ---
                    <View>
                        <TextInput
                            label="Shop Name *"
                            value={shopName}
                            onChangeText={setShopName}
                            mode="outlined"
                            style={styles.input}
                            outlineColor={Colors.light.outline}
                            activeOutlineColor={Colors.light.accent}
                            left={<TextInput.Icon icon="store" />}
                        />

                        <Text variant="labelLarge" style={styles.label}>
                            Business Type
                        </Text>
                        <View style={styles.wrapRow}>
                            {BUSINESS_TYPES.map((bt) => {
                                const selected = businessType === bt.value;
                                return (
                                    <Chip
                                        key={bt.value}
                                        selected={selected}
                                        onPress={() => setBusinessType(bt.value)}
                                        style={[
                                            styles.selectChip,
                                            selected && { backgroundColor: Colors.light.accent },
                                        ]}
                                        textStyle={{ color: selected ? '#fff' : '#111827' }}
                                    >
                                        {bt.label}
                                    </Chip>
                                );
                            })}
                        </View>

                        <Text variant="labelLarge" style={[styles.label, { marginTop: 8 }]}>
                            Category
                        </Text>
                        <View style={styles.wrapRow}>
                            {availableCategories.length > 0 ? (
                                availableCategories.map((cat) => {
                                    const selected = category === cat.toLowerCase();
                                    return (
                                        <Chip
                                            key={cat}
                                            selected={selected}
                                            onPress={() => setCategory(cat.toLowerCase())}
                                            style={[
                                                styles.selectChip,
                                                selected && { backgroundColor: Colors.light.accent },
                                            ]}
                                            textStyle={{ color: selected ? '#fff' : '#111827' }}
                                        >
                                            {cat}
                                        </Chip>
                                    );
                                })
                            ) : (
                                <HelperText type="info">Select a business type first.</HelperText>
                            )}
                        </View>

                        <TextInput
                            label="Description"
                            value={description}
                            onChangeText={setDescription}
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                            style={styles.input}
                            outlineColor={Colors.light.outline}
                            activeOutlineColor={Colors.light.accent}
                            left={<TextInput.Icon icon="text" />}
                            placeholder="Tell customers about your business..."
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
    label: { marginBottom: 8 },
    wrapRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    selectChip: { backgroundColor: '#F3F4F6' },
});
