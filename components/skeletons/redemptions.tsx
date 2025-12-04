// components/skeletons/RedemptionSkeleton.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Surface } from "react-native-paper";
import { useTheme } from "@/hooks/use-theme-color";
import { Skeleton } from "../ui/skeleton";

const RedemptionSkeleton = () => {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header Skeleton */}
            <View style={styles.header}>
                <Skeleton style={styles.iconSkeleton} />
                <Skeleton style={styles.titleSkeleton} />
            </View>

            {/* Points Card Skeleton */}
            <Surface style={[styles.pointsCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View style={styles.pointsRow}>
                    <Skeleton style={styles.pointsLabelSkeleton} />
                    <Skeleton style={styles.pointsValueSkeleton} />
                </View>
            </Surface>

            {/* Offers Section Skeleton */}
            <View style={styles.section}>
                <Skeleton style={styles.sectionTitleSkeleton} />
                <View style={styles.offersContainer}>
                    {[1, 2, 3].map((item) => (
                        <Surface
                            key={item}
                            style={[
                                styles.offerCardSkeleton,
                                { backgroundColor: theme.colors.surfaceVariant }
                            ]}
                        >
                            <View style={styles.offerContent}>
                                <View style={styles.offerHeader}>
                                    <Skeleton style={styles.offerNameSkeleton} />
                                    <Skeleton style={styles.offerPointsSkeleton} />
                                </View>
                                <Skeleton style={styles.offerDescriptionSkeleton} />
                            </View>
                        </Surface>
                    ))}
                </View>
            </View>

            {/* Points Input Skeleton */}
            <View style={styles.section}>
                <Skeleton style={styles.sectionTitleSkeleton} />
                <Skeleton style={styles.inputSkeleton} />
                <Skeleton style={styles.hintSkeleton} />
            </View>

            {/* Summary Card Skeleton */}
            <Surface style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.summaryRow}>
                    <Skeleton style={styles.summaryLabelSkeleton} />
                    <Skeleton style={styles.summaryValueSkeleton} />
                </View>
                <Skeleton style={styles.dividerSkeleton} />
                <View style={styles.summaryRow}>
                    <Skeleton style={styles.summaryLabelSkeleton} />
                    <Skeleton style={styles.summaryValueSkeleton} />
                </View>
            </Surface>

            {/* Button Skeleton */}
            <Skeleton style={styles.buttonSkeleton} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
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
        width: '60%',
        height: 28,
        borderRadius: 8,
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
    pointsLabelSkeleton: {
        width: '50%',
        height: 20,
        borderRadius: 6,
    },
    pointsValueSkeleton: {
        width: '30%',
        height: 32,
        borderRadius: 8,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitleSkeleton: {
        width: '40%',
        height: 20,
        borderRadius: 8,
        marginBottom: 16,
    },
    offersContainer: {
        width: '100%',
        gap: 8,
        marginBottom: 20,
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
    inputSkeleton: {
        width: '100%',
        height: 56,
        borderRadius: 8,
        marginBottom: 8,
    },
    hintSkeleton: {
        width: '70%',
        height: 14,
        borderRadius: 6,
        marginTop: 8,
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
    summaryLabelSkeleton: {
        width: '40%',
        height: 18,
        borderRadius: 6,
    },
    summaryValueSkeleton: {
        width: '30%',
        height: 24,
        borderRadius: 8,
    },
    dividerSkeleton: {
        height: 1,
        marginVertical: 8,
        borderRadius: 0,
    },
    buttonSkeleton: {
        width: '100%',
        height: 52,
        borderRadius: 12,
    },
});

export default RedemptionSkeleton;