// components/store/OffersList.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Surface } from "react-native-paper";
import { useTheme } from "@/hooks/use-theme-color";

interface Offer {
    reward_name: string;
    reward_points: number;
    reward_description: string;
}

interface OffersListProps {
    offers?: Offer[];
}

export const OffersList: React.FC<OffersListProps> = ({ offers = [] }) => {
    const theme = useTheme();

    if (offers.length === 0) {
        return null;
    }

    return (
        <View style={styles.offersContainer}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                Available Offers
            </Text>
            {offers.map((offer, index) => (
                <Surface
                    key={index}
                    style={[
                        styles.offerCard,
                        {
                            backgroundColor: theme.colors.background,
                            borderColor: theme.colors.outline,
                            borderWidth: 1,
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
                        <Text style={[styles.offerDescription, { color: theme.colors.accent }]}>
                            {offer.reward_description}
                        </Text>
                    </View>
                </Surface>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    offersContainer: {
        width: '100%',
        gap: 8,
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    offerCard: {
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
});