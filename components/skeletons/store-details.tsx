// components/skeletons/StoreDetailsSkeleton.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Surface } from "react-native-paper";
import { useTheme } from "@/hooks/use-theme-color";
import { Skeleton } from "../ui/skeleton";

const StoreDetailsSkeleton = () => {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header Skeleton */}
            <View style={styles.header}>
                <Skeleton style={styles.iconSkeleton} />
                <Skeleton style={styles.titleSkeleton} />
                <Skeleton style={styles.subtitleSkeleton} />
            </View>

            {/* Contact Buttons Skeleton */}
            <View style={styles.contactRow}>
                <Skeleton style={styles.buttonSkeleton} />
                <Skeleton style={styles.buttonSkeleton} />
            </View>

            {/* Offers Section Skeleton */}
            <View style={styles.offersSection}>
                <Skeleton style={styles.sectionTitleSkeleton} />
                <View style={styles.offerList}>
                    {[1, 2, 3].map((item) => (
                        <Surface key={item} style={[styles.offerCardSkeleton, { backgroundColor: theme.colors.background }]}>
                            <View style={styles.offerContent}>
                                <View style={styles.offerHeader}>
                                    <Skeleton style={styles.offerNameSkeleton} />
                                    <Skeleton style={styles.offerPointsSkeleton} />
                                </View>
                            </View>
                        </Surface>
                    ))}
                </View>
            </View>

            {/* Rewards Card Skeleton */}
            <Surface style={[styles.cardSkeleton, { backgroundColor: theme.colors.background }]}>
                <View style={styles.cardHeader}>
                    <Skeleton style={styles.cardTitleSkeleton} />
                    <Skeleton style={styles.cardIconSkeleton} />
                </View>
                <Skeleton style={styles.cardDivider} />
                <View style={styles.cardContent}>
                    <Skeleton style={styles.cardDetailSkeleton} />
                    <Skeleton style={styles.cardDetailSkeleton} />
                    <Skeleton style={styles.cardDescriptionSkeleton} />
                </View>
            </Surface>

            {/* Action Buttons Skeleton */}
            <View style={styles.actionButtons}>
                <Skeleton style={styles.actionButtonSkeleton} />
                <Skeleton style={styles.actionButtonSkeleton} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 120,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconSkeleton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 12,
    },
    titleSkeleton: {
        width: '70%',
        height: 28,
        borderRadius: 8,
        marginBottom: 8,
    },
    subtitleSkeleton: {
        width: '50%',
        height: 16,
        borderRadius: 8,
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        gap: 12,
    },
    buttonSkeleton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
    },
    offersSection: {
        marginBottom: 20,
    },
    sectionTitleSkeleton: {
        width: '40%',
        height: 20,
        borderRadius: 8,
        marginBottom: 16,
    },
    offerList: {
        gap: 8,
    },
    offerCardSkeleton: {
        borderRadius: 12,
        padding: 16,
    },
    offerContent: {
        flex: 1,
    },
    offerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    offerNameSkeleton: {
        flex: 1,
        height: 18,
        borderRadius: 6,
        marginRight: 12,
    },
    offerPointsSkeleton: {
        width: 60,
        height: 20,
        borderRadius: 6,
    },
    offerDescriptionSkeleton: {
        width: '80%',
        height: 14,
        borderRadius: 6,
    },
    cardSkeleton: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    cardTitleSkeleton: {
        width: '40%',
        height: 20,
        borderRadius: 8,
    },
    cardIconSkeleton: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    cardDivider: {
        height: 1,
        marginVertical: 12,
        borderRadius: 0,
    },
    cardContent: {
        marginTop: 8,
    },
    cardDetailSkeleton: {
        width: '60%',
        height: 16,
        borderRadius: 6,
        marginBottom: 8,
    },
    cardDescriptionSkeleton: {
        width: '90%',
        height: 14,
        borderRadius: 6,
        marginTop: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 12,
    },
    actionButtonSkeleton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
    },
});

export default StoreDetailsSkeleton;