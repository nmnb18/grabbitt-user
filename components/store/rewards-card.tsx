// components/store/RewardsCard.tsx
import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Text, Surface, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme-color";
import { SellerRewards } from "@/types/seller";

interface RewardsCardProps {
    rewards: SellerRewards;
    expanded: boolean;
    onToggle: () => void;
}

export const RewardsCard: React.FC<RewardsCardProps> = ({
    rewards,
    expanded,
    onToggle,
}) => {
    const theme = useTheme();

    const getRewardDescription = () => {
        const rewardType = rewards.reward_type || 'default';
        const rewardPoints = rewards.default_points_value || 100;

        switch (rewardType) {
            case 'percentage':
                const percentage = rewards.percentage_value || 1;
                return <Text style={styles.descriptionText}>Earn {percentage}% cashback as points</Text>;

            case 'flat':
                const flatPoints = rewards.flat_points || 1;
                return <Text style={styles.descriptionText}>Earn {flatPoints} points per transaction</Text>;

            case 'slab':
                if (Array.isArray(rewards.slab_rules) && rewards.slab_rules.length > 0) {
                    return rewards.slab_rules.map((rule: any, index: number) => {
                        const isLast = index === rewards.slab_rules!.length - 1;
                        return (
                            <Text key={index} style={styles.slabRuleText}>
                                • Earn {rule.points}pts on spending ₹{rule.min} {isLast ? 'and more' : `to ₹${rule.max}`}
                            </Text>
                        );
                    });
                }
                return <Text style={styles.descriptionText}>Earn points based on amount spent</Text>;

            case 'default':
            default:
                return <Text style={styles.descriptionText}>Earn {rewardPoints} points per transaction</Text>;
        }
    };

    return (
        <Surface style={[styles.card, { backgroundColor: theme.colors.backdrop }]}>
            <TouchableOpacity style={styles.cardHeader} onPress={onToggle}>
                <View style={styles.cardTitleRow}>
                    <MaterialCommunityIcons
                        name="star"
                        size={24}
                        color={theme.colors.primary}
                    />
                    <Text style={[styles.cardTitle, { color: theme.colors.onSurface, marginLeft: 8 }]}>
                        Rewards
                    </Text>
                </View>
                <MaterialCommunityIcons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={24}
                    color={theme.colors.primary}
                />
            </TouchableOpacity>

            {expanded && (
                <>
                    <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

                    {rewards.reward_name && (
                        <View style={styles.rewardDetail}>
                            <Text style={[styles.rewardDetailLabel, { color: theme.colors.onSurfaceVariant }]}>
                                Reward Name:
                            </Text>
                            <Text style={[styles.rewardDetailValue, { color: theme.colors.onSurface }]}>
                                {rewards.reward_name}
                            </Text>
                        </View>
                    )}

                    {rewards.reward_description && (
                        <View style={styles.rewardDetail}>
                            <Text style={[styles.rewardDetailLabel, { color: theme.colors.onSurfaceVariant }]}>
                                Description:
                            </Text>
                            <Text style={[styles.rewardDetailValue, { color: theme.colors.onSurface }]}>
                                {rewards.reward_description}
                            </Text>
                        </View>
                    )}

                    <View style={styles.rewardContent}>
                        {getRewardDescription()}
                    </View>
                </>
            )}
        </Surface>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    rewardDetail: {
        marginBottom: 12,
    },
    rewardDetailLabel: {
        fontSize: 13,
        marginBottom: 2,
        fontWeight: '500',
    },
    rewardDetailValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    rewardContent: {
        marginTop: 8,
    },
    descriptionText: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    slabRuleText: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
});