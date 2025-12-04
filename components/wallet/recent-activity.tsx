// components/wallet/recent-activity.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text, Surface, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme-color";
import { Transaction } from "@/types/wallet";

interface RecentActivityProps {
    transactions: Transaction[];
    onRefresh?: () => void;
}

export function RecentActivity({ transactions, onRefresh }: RecentActivityProps) {
    const theme = useTheme();

    if (transactions.length === 0) return null;

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'earn':
                return 'plus-circle';
            case 'redeem':
                return 'gift';
            case 'payment':
                return 'credit-card';
            default:
                return 'swap-horizontal';
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'earn':
                return theme.colors.success;
            case 'redeem':
                return theme.colors.secondary;
            case 'payment':
                return theme.colors.primary;
            default:
                return theme.colors.outline;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else {
            return date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
            });
        }
    };

    return (
        <View style={styles.container}>


            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                {transactions.map((transaction, index) => {
                    const icon = getTransactionIcon(transaction.type);
                    const iconColor = getTransactionColor(transaction.type);
                    const isPositive = transaction.type === 'earn' || transaction.type === 'payment';

                    return (
                        <View key={transaction.id}>
                            <View style={styles.transactionRow}>
                                {/* Icon */}
                                <Surface style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                                    <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
                                </Surface>

                                {/* Info */}
                                <View style={styles.infoContainer}>
                                    <Text
                                        style={[styles.storeName, { color: theme.colors.onSurface }]}
                                        numberOfLines={1}
                                    >
                                        {transaction.seller_name}
                                    </Text>
                                    <View style={styles.infoRow}>
                                        <Text
                                            style={[styles.description, { color: theme.colors.accent }]}
                                            numberOfLines={1}
                                        >
                                            {transaction.description}
                                        </Text>
                                        <Text style={[styles.date, { color: theme.colors.accent }]}>
                                            {formatDate(transaction.created_at)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Points */}
                                <Text
                                    style={[
                                        styles.points,
                                        {
                                            color: isPositive ? theme.colors.success : theme.colors.secondary,
                                            fontWeight: '600'
                                        }
                                    ]}
                                >
                                    {isPositive ? '+' : '-'}{transaction.points}
                                </Text>
                            </View>

                            {/* Divider (except last item) */}
                            {index < transactions.length - 1 && (
                                <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
                            )}
                        </View>
                    );
                })}
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontWeight: "700",
        marginBottom: 16,
        fontSize: 18,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    transactionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 60,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoContainer: {
        flex: 1,
        marginRight: 12,
    },
    storeName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    description: {
        fontSize: 12,
        flex: 1,
        marginRight: 8,
    },
    date: {
        fontSize: 11,
        fontWeight: '500',
    },
    points: {
        fontSize: 16,
        minWidth: 50,
        textAlign: 'right',
    },
    divider: {
        marginLeft: 72, // Align with icon + padding
    },
});