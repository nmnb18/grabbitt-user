// components/skeletons/wallet.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/hooks/use-theme-color";
import { Skeleton } from "../ui/skeleton";

export default function WalletSkeleton() {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

            {/* Total Points Card Skeleton */}
            <View style={styles.totalCard}>
                <Skeleton style={styles.totalCardContent} />
            </View>

            {/* Section Title: Points by Store */}
            <Skeleton style={styles.sectionTitle} />

            {/* Store Cards Skeleton */}
            <View style={styles.storesList}>
                {[1, 2].map((item) => (
                    <View key={item} style={styles.storeCard}>
                        <View style={styles.storeCardInner}>
                            <Skeleton style={styles.storeIcon} />
                            <View style={styles.storeInfo}>
                                <Skeleton style={styles.storeName} />
                                <Skeleton style={styles.storeDescription} />
                                <Skeleton style={styles.progressBar} />
                                <View style={styles.progressLabels}>
                                    <Skeleton style={styles.progressLabel} />
                                    <Skeleton style={styles.progressPercentage} />
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </View>


        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 15,
    },
    header: {
        height: 160,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    totalCard: {
        marginHorizontal: 16,
        marginTop: 24,
        borderRadius: 22,
        overflow: 'hidden',
    },
    totalCardContent: {
        height: 180,
    },
    sectionTitle: {
        height: 24,
        width: 150,
        borderRadius: 4,
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 16,
    },
    storesList: {
        paddingHorizontal: 16,
        gap: 12,
    },
    storeCard: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    storeCardInner: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    storeIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    storeInfo: {
        flex: 1,
        gap: 8,
    },
    storeName: {
        height: 20,
        width: '70%',
        borderRadius: 4,
    },
    storeDescription: {
        height: 14,
        width: '90%',
        borderRadius: 4,
    },
    progressBar: {
        height: 8,
        width: '100%',
        borderRadius: 4,
        marginTop: 4,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressLabel: {
        height: 14,
        width: 100,
        borderRadius: 4,
    },
    progressPercentage: {
        height: 14,
        width: 40,
        borderRadius: 4,
    },
    transactionsList: {
        paddingHorizontal: 16,
        gap: 1,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
    },
    txIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    txInfo: {
        flex: 1,
        gap: 6,
    },
    txStore: {
        height: 18,
        width: '60%',
        borderRadius: 4,
    },
    txDate: {
        height: 14,
        width: '40%',
        borderRadius: 4,
    },
    txPoints: {
        height: 24,
        width: 60,
        borderRadius: 4,
    },
});