import { GradientText } from '@/components/ui/gradient-text';
import { Button } from '@/components/ui/paper-button';
import { useTheme, useThemeColor } from '@/hooks/use-theme-color';
import api from '@/services/axiosInstance';
import { AppStyles } from '@/utils/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { Surface, Text, TextInput } from 'react-native-paper';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const theme = useTheme();
    const backgroundColor = useThemeColor({}, 'background');
    const outlineColor = useThemeColor({}, 'outline');
    const accentColor = useThemeColor({}, 'accent');

    const handleSend = async () => {
        if (!email) return Alert.alert('Error', 'Please enter your email');

        try {
            setLoading(true);
            const resp = await api.post('/requestPasswordReset', { email });

            if (!resp.data.success) {
                Alert.alert('Error', resp.data.error || 'Failed to send reset link');
                return;
            }

            Alert.alert('Email Sent', 'Check your inbox for reset link.');
            router.replace('/auth/login');
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                    {/* HEADER */}
                    <View style={styles.header}>
                        <GradientText style={{ fontFamily: 'JostMedium', fontSize: 80, marginTop: 40 }}>grabbitt</GradientText>
                        <Text style={styles.subtitle}>For Business</Text>
                    </View>

                    {/* FORM CARD */}
                    <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: outlineColor }]} elevation={2}>
                        <GradientText style={styles.gradientTitle}>
                            Forgot Password
                        </GradientText>

                        <Text style={styles.infoText}>
                            Enter your email and we’ll send you a password reset link.
                        </Text>

                        <View style={styles.form}>

                            <TextInput
                                label="Email"
                                value={email}
                                onChangeText={setEmail}
                                mode="outlined"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                left={<TextInput.Icon icon="email" />}
                                outlineColor={outlineColor}
                                activeOutlineColor={accentColor}
                                theme={theme}
                            />

                            <Button
                                onPress={handleSend}
                                loading={loading}
                                disabled={loading}
                                variant="contained"
                                size="medium"
                                fullWidth
                            >
                                Send Reset Link
                            </Button>

                            <Button
                                onPress={() => router.back()}
                                variant="text"
                                size="medium"
                                fullWidth
                            >
                                Back to Login
                            </Button>

                        </View>
                    </Surface>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },

    logo: {
        width: 400,
        height: 150,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: AppStyles.spacing.lg,
        paddingTop: AppStyles.spacing.xxxl,
        paddingBottom: AppStyles.spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: AppStyles.spacing.xl
    },
    subtitle: {
        textAlign: 'center',
        fontFamily: 'Inter',
        fontSize: 16,
    },
    formCard: {
        borderRadius: 12,
        padding: AppStyles.spacing.lg,
        borderWidth: 1,
    },
    gradientTitle: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: AppStyles.spacing.lg,
    },
    infoText: {
        textAlign: 'center',
        marginBottom: AppStyles.spacing.lg,
        color: '#555',
    },
    form: {
        gap: AppStyles.spacing.md,
    },
    input: {},
});
