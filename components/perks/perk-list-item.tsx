import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Surface, Text, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme-color";
import { PERK_STATUS_META } from "@/utils/constant";
import { UserPerkItem } from "@/types/perks";
import { GradientText } from "../ui/gradient-text";

type Props = {
    perk: UserPerkItem
}

export default function PerkListItem({ perk }: Props) {
    const theme = useTheme();

    const meta = PERK_STATUS_META[perk.status];
    const statusColor = theme.colors[meta.colorKey]

    return (
        <TouchableOpacity>
            <Surface style={[styles.card, { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.accent }]}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.shopRow}>
                        {perk.shop_logo_url ? (
                            <Image source={{ uri: perk.shop_logo_url }} style={styles.logo} />
                        ) : (
                            <MaterialCommunityIcons name="store" size={22} color={theme.colors.onBackground} />
                        )}
                        <Text style={styles.shopName} numberOfLines={1}>
                            {perk.shop_name}
                        </Text>
                    </View>

                    <Chip
                        style={{ borderColor: statusColor, borderWidth: 1, backgroundColor: 'transparent' }}
                        textStyle={{ color: theme.colors.text, fontSize: 12 }}
                    >
                        {perk.status}
                    </Chip>
                </View>

                {/* Body */}
                <View style={styles.body}>


                    {perk.redeem_code && (
                        <Text style={styles.code}>Code: {perk.redeem_code}</Text>
                    )}
                </View>

                {/* Footer */}
                {perk.status === 'CLAIMED' &&
                    <View style={styles.footer}>
                        <Text style={styles.offer}>{perk.terms}</Text>
                        <Text style={styles.expiry}>
                            Expires Today
                        </Text>

                    </View>}
            </Surface>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    shopRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flex: 1,
    },
    logo: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    shopName: {
        fontSize: 18,
        fontWeight: "600",
        flex: 1,
    },
    body: {
        gap: 6,
        marginBottom: 10,
    },
    offer: {
        fontSize: 14,
        fontWeight: "500",
    },
    code: {
        fontSize: 16,
        letterSpacing: 1,
    },
    footer: {
        justifyContent: "space-between",
        marginTop: 10,
        gap: 10
    },
    expiry: {
        fontSize: 12,
        opacity: 0.8,
    },
});
