// components/store/StoreHeader.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme-color";

interface StoreHeaderProps {
    shopName: string;
    category: string;
    businessType: string;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({
    shopName,
    category,
    businessType,
}) => {
    const theme = useTheme();

    return (
        <View style={styles.header}>
            <Surface style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
                <MaterialCommunityIcons
                    name="store"
                    size={36}
                    color={theme.colors.primary}
                />
            </Surface>
            <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
                {shopName}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.accent }]}>
                {category} • {businessType}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
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
        elevation: 2,
    },
    title: {
        fontWeight: '700',
        fontSize: 24,
        textAlign: 'center',
        width: '100%',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
        textAlign: 'center',
        textTransform: 'capitalize',
        width: '100%',
    },
});