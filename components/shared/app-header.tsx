// components/ui/gradient-header.tsx
import React from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
// Import Platform
import { Platform } from 'react-native';
interface GradientHeaderProps {
    title: string;
    showBackButton?: boolean;
    rightComponent?: React.ReactNode;
    colors?: [string, string];
}

export function GradientHeader({
    title,
    showBackButton = true,
    rightComponent,
    colors
}: GradientHeaderProps) {
    const theme = useTheme();
    const router = useRouter();

    const gradientColors = colors || [theme.colors.primary, theme.colors.secondary];

    return (
        <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
        >
            <View style={styles.content}>
                {showBackButton ? (
                    <TouchableWithoutFeedback onPress={() => router.back()}>
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={22}
                            color={theme.colors.onPrimary}
                        />
                    </TouchableWithoutFeedback>
                ) : (
                    <View style={styles.backButtonPlaceholder} />
                )}

                <Text style={[styles.title, { color: theme.colors.onPrimary }]}>
                    {title}
                </Text>

                {rightComponent ? (
                    <View style={styles.rightComponent}>
                        {rightComponent}
                    </View>
                ) : (
                    <View style={styles.backButtonPlaceholder} />
                )}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    backButtonPlaceholder: {
        width: 36,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        flex: 1,
        marginHorizontal: 12,
    },
    rightComponent: {
        minWidth: 36,
        alignItems: 'flex-end',
    },
});
