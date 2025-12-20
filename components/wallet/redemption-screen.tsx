// screens/wallet/redemption-screen.tsx
import React from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
} from "react-native";
import { Text, Surface, TextInput } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme-color";
import { StoreBalance, Offer } from "@/types/wallet";
import { Button } from "@/components/ui/paper-button";
import { SafeAreaView } from "react-native-safe-area-context";
import { GradientHeader } from "@/components/shared/app-header";

interface RedemptionScreenProps {
    store: StoreBalance;
    selectedOffer: Offer | null;
    customPoints: string;
    pointsToRedeem: number;
    error: string;
    processing: boolean;
    canRedeem: boolean;
    onPointsChange: (text: string) => void;
    onOfferSelect: (offer: Offer) => void;
    onCreateRedemption: () => Promise<void>;
    onBack: () => void;
    loading?: boolean;
}

export default function RedemptionScreen({
    store,
    selectedOffer,
    customPoints,
    pointsToRedeem,
    error,
    processing,
    canRedeem,
    onPointsChange,
    onOfferSelect,
    onCreateRedemption,
    onBack,
}: RedemptionScreenProps) {
    const theme = useTheme();
    const availableOffers = store.offers || [];
    const hasOffers = availableOffers.length > 0;

    const getMinPoints = (): number | null => {
        if (!store.offers || store.offers.length === 0) {
            return null;
        }
        return Math.min(...store.offers.map(offer => offer.reward_points));
    };

    const getMaxPoints = (): number | null => {
        if (!store.offers || store.offers.length === 0) {
            return null;
        }
        return Math.max(...store.offers.map(offer => offer.reward_points));
    };

    const minPoints = getMinPoints();
    const maxPoints = getMaxPoints();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <GradientHeader title="Redeem Points" />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Store Header */}
                    <View style={styles.header}>
                        <Surface style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
                            <MaterialCommunityIcons
                                name="store"
                                size={36}
                                color={theme.colors.primary}
                            />
                        </Surface>
                        <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
                            {store.seller_name}
                        </Text>
                    </View>

                    {/* Available Points */}
                    <Surface style={[styles.pointsCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <View style={styles.pointsRow}>
                            <Text style={[styles.pointsLabel, { color: theme.colors.onSurface }]}>
                                Your Available Points:
                            </Text>
                            <Text style={[styles.pointsValue, { color: theme.colors.primary }]}>
                                {store.points}
                            </Text>
                        </View>
                    </Surface>

                    {/* Offers Section */}
                    {hasOffers && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                                Available Offers
                            </Text>

                            <View style={styles.offersContainer}>
                                {availableOffers.map((offer, index) => (
                                    <TouchableWithoutFeedback
                                        key={index}
                                        onPress={() => onOfferSelect(offer)}
                                    >
                                        <Surface
                                            style={[
                                                styles.offerCard,
                                                {
                                                    backgroundColor: selectedOffer?.reward_points === offer.reward_points
                                                        ? `${theme.colors.primary}15`
                                                        : theme.colors.surfaceVariant,
                                                    borderColor: selectedOffer?.reward_points === offer.reward_points
                                                        ? theme.colors.primary
                                                        : theme.colors.outline,
                                                    borderWidth: 1
                                                }
                                            ]}
                                        >
                                            <View style={styles.offerContent}>
                                                <View style={styles.offerHeader}>
                                                    <Text style={[styles.offerName, { color: theme.colors.onSurface }]}>
                                                        {offer.reward_name}
                                                    </Text>
                                                    <Text style={[styles.offerPoints, { color: theme.colors.onSurface }]}>
                                                        {offer.reward_points} pts
                                                    </Text>
                                                </View>
                                                <Text style={[styles.offerDescription, { color: theme.colors.onBackground }]}>
                                                    {offer.reward_description}
                                                </Text>
                                            </View>
                                        </Surface>
                                    </TouchableWithoutFeedback>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Custom Points Input */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                            Enter Points to Redeem
                        </Text>

                        <View style={styles.inputContainer}>
                            <TextInput
                                mode="outlined"
                                value={customPoints}
                                onChangeText={onPointsChange}
                                placeholder={`Enter points`}
                                keyboardType="numeric"
                                style={styles.input}
                                outlineColor={theme.colors.outline}
                                activeOutlineColor={theme.colors.primary}
                                maxLength={6}
                                disabled={processing}
                                right={
                                    <TextInput.Affix
                                        text="pts"
                                        textStyle={{ color: theme.colors.onSurfaceVariant }}
                                    />
                                }
                            />
                            {error ? (
                                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                                    {error}
                                </Text>
                            ) : (
                                <Text style={[styles.hintText, { color: theme.colors.accent }]}>
                                    {hasOffers
                                        ? `Choose an offer or enter ${minPoints}-${maxPoints} points`
                                        : `Enter ${minPoints} or more points`}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Points Summary */}
                    <Surface style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: theme.colors.onSurface }]}>
                                Points to Redeem
                            </Text>
                            <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                                {pointsToRedeem}
                            </Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: theme.colors.onSurface }]}>
                                Remaining Points
                            </Text>
                            <Text style={[styles.summaryValue, {
                                color: pointsToRedeem > 0 ? theme.colors.secondary : theme.colors.onSurfaceVariant
                            }]}>
                                {store.points - pointsToRedeem}
                            </Text>
                        </View>
                    </Surface>

                    {/* Important Note about QR Redemption */}
                    <Surface style={[styles.noteCard, { backgroundColor: `${theme.colors.warning}15` }]}>
                        <View style={styles.noteHeader}>
                            <MaterialCommunityIcons
                                name="information"
                                size={20}
                                color={theme.colors.warning}
                            />
                            <Text style={[styles.noteTitle, { color: theme.colors.warning }]}>
                                Important
                            </Text>
                        </View>
                        <Text style={[styles.noteText, { color: theme.colors.onSurface }]}>
                            You'll get a QR code to show at the store. The seller will scan it to complete your redemption.
                        </Text>
                    </Surface>

                    {/* Generate QR Button */}
                    <View style={{ gap: 24 }}>
                        <Button
                            variant="contained"
                            onPress={onCreateRedemption}
                            loading={processing}
                            disabled={!canRedeem || processing}
                            icon="qrcode"
                        >
                            {`Generate QR Code${pointsToRedeem > 0 ? ` for ${pointsToRedeem} Points` : ''}`}
                        </Button>

                        {/* Back Button */}
                        <Button
                            variant="outlined"
                            onPress={onBack}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontWeight: '700',
        fontSize: 24,
        textAlign: 'center',
    },
    pointsCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        elevation: 2,
    },
    pointsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pointsLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    pointsValue: {
        fontSize: 28,
        fontWeight: '700',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    offersContainer: {
        width: '100%',
        gap: 8,
        marginBottom: 20,
    },
    offerCard: {
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    offerContent: {
        flex: 1,
    },
    offerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    offerName: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
    offerPoints: {
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 12,
    },
    offerDescription: {
        fontSize: 13,
        lineHeight: 18,
    },
    inputContainer: {
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'transparent',
        fontSize: 18,
    },
    errorText: {
        fontSize: 13,
        marginTop: 8,
        marginLeft: 4,
    },
    hintText: {
        fontSize: 13,
        marginTop: 8,
        marginLeft: 4,
    },
    summaryCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        elevation: 2,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        marginVertical: 8,
    },
    noteCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        elevation: 1,
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    noteTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    noteText: {
        fontSize: 14,
        lineHeight: 20,
    },
});