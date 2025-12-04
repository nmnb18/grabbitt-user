// components/wallet/empty-state.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme-color";
import { useRouter } from "expo-router";
import { Button } from "../ui/paper-button";

interface EmptyStateProps {
    icon: string;
    title: string;
    message: string;
    onAction?: () => void;
}

export function EmptyState({ icon, title, message, onAction }: EmptyStateProps) {
    const theme = useTheme();
    const router = useRouter();

    const handleAction = () => {
        if (onAction) {
            onAction();
        } else {
            router.navigate('/(drawer)/(tabs)/scan-qr')
        }
    };

    return (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <Card.Content style={styles.content}>
                {/* Icon */}
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <MaterialCommunityIcons
                        name={icon as any}
                        size={48}
                        color={theme.colors.onSurfaceVariant}
                    />
                </View>

                {/* Title */}
                <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
                    {title}
                </Text>

                {/* Message */}
                <Text style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
                    {message}
                </Text>

                {/* Action Button */}
                <Button
                    variant="contained"
                    onPress={handleAction}
                    icon="qrcode-scan"
                >
                    Scan QR to Earn
                </Button>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        marginBottom: 24,
    },
    content: {
        paddingVertical: 36,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    button: {
        borderRadius: 12,
        paddingHorizontal: 24,
    },
});