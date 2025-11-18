import { GradientText } from '@/components/ui/gradient-text';
import { Button } from '@/components/ui/paper-button';
import AuthScreenWrapper from '@/components/wrappers/authScreenWrapper';
import { useTheme, useThemeColor } from '@/hooks/use-theme-color';
import { AppStyles, Colors } from '@/utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    View
} from 'react-native';
import { Surface, Text } from 'react-native-paper';

export default function ResetSuccessScreen() {
    const router = useRouter();
    const theme = useTheme();
    const backgroundColor = useThemeColor({}, 'background');
    const outlineColor = useThemeColor({}, 'outline');

    return (
        <AuthScreenWrapper>
            <Surface
                style={[
                    styles.card,
                    { backgroundColor: theme.colors.surface, borderColor: outlineColor },
                ]}
                elevation={2}
            >
                <GradientText style={styles.gradientTitle}>
                    Password Updated
                </GradientText>

                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                        name="check-circle"
                        size={80}
                        color={Colors.light.primary}
                    />
                </View>

                <Text style={[styles.message, { color: theme.colors.accent }]}>
                    Your password has been successfully reset.
                    You can now log in using your new password.
                </Text>

                <Button
                    variant="contained"
                    size="medium"
                    fullWidth
                    onPress={() => router.replace('/auth/login')}
                >
                    Login Now
                </Button>
            </Surface>
        </AuthScreenWrapper>
    );
}

const styles = StyleSheet.create({



    card: {
        borderRadius: 12,
        padding: AppStyles.spacing.lg,
        borderWidth: 1,
        alignItems: 'center',
    },

    gradientTitle: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: AppStyles.spacing.lg,
    },

    iconContainer: {
        marginBottom: AppStyles.spacing.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },

    message: {
        fontSize: 15,
        marginBottom: AppStyles.spacing.lg,
        textAlign: 'center',
        lineHeight: 20,
    },
});
