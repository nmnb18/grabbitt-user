import { GradientText } from '@/components/ui/gradient-text';
import { Button } from '@/components/ui/paper-button';
import { useTheme, useThemeColor } from '@/hooks/use-theme-color';
import { AppStyles, Colors } from '@/utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
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
        <View style={[styles.container, { backgroundColor }]}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* HEADER */}
                    <View style={styles.header}>
                        <Image
                            source={require('@/assets/images/logo.png')}
                            style={styles.logo}
                        />
                        <Text style={styles.subtitle}>For Business</Text>
                    </View>

                    {/* SUCCESS CARD */}
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

                        <Text style={styles.message}>
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
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },

    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: AppStyles.spacing.lg,
        paddingTop: AppStyles.spacing.xxxl,
        paddingBottom: AppStyles.spacing.xl,
    },

    logo: {
        width: 400,
        height: 150,
        alignSelf: 'center',
    },

    header: {
        alignItems: 'center',
        marginBottom: AppStyles.spacing.xl,
    },

    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'Inter',
    },

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
        color: '#555',
        marginBottom: AppStyles.spacing.lg,
        textAlign: 'center',
        lineHeight: 20,
    },
});
