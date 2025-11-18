import { GradientText } from '@/components/ui/gradient-text';
import { Button } from '@/components/ui/paper-button';
import AuthScreenWrapper from '@/components/wrappers/authScreenWrapper';
import { useTheme, useThemeColor } from '@/hooks/use-theme-color';
import api from '@/services/axiosInstance';
import { AppStyles } from '@/utils/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    View
} from 'react-native';
import { Surface, TextInput } from 'react-native-paper';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { oobCode } = useLocalSearchParams();

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [show, setShow] = useState(false);
    const [show2, setShow2] = useState(false);
    const [loading, setLoading] = useState(false);

    const theme = useTheme();
    const backgroundColor = useThemeColor({}, 'background');
    const outlineColor = useThemeColor({}, 'outline');
    const accentColor = useThemeColor({}, 'accent');

    useEffect(() => {
        if (!oobCode) {
            Alert.alert('Invalid Link', 'This reset link is invalid or expired.', [
                { text: 'OK', onPress: () => router.replace('/auth/login') },
            ]);
        }
    }, []);

    const handleReset = async () => {
        if (!password || !confirm)
            return Alert.alert('Error', 'All fields are required.');

        if (password !== confirm)
            return Alert.alert('Error', 'Passwords do not match.');

        try {
            setLoading(true);
            const resp = await api.post('/confirmPasswordReset', { oobCode, newPassword: password });

            if (!resp.data.success) {
                Alert.alert('Error', resp.data.error);
                return;
            }

            router.replace(`/auth/reset-success`);

        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthScreenWrapper>
            <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: outlineColor }]} elevation={2}>
                <GradientText style={styles.gradientTitle}>Reset Password</GradientText>

                <View style={styles.form}>
                    <TextInput
                        label="New Password"
                        value={password}
                        onChangeText={setPassword}
                        mode="outlined"
                        secureTextEntry={!show}
                        style={[styles.input, { backgroundColor: theme.colors.surface }]}
                        left={<TextInput.Icon color={theme.colors.onSurface} icon="lock" />}
                        right={<TextInput.Icon color={theme.colors.onSurface} icon={show ? 'eye-off' : 'eye'} onPress={() => setShow(!show)} />}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.onSurface}
                        theme={{
                            ...theme,
                            colors: {
                                ...theme.colors,
                                onSurfaceVariant: theme.colors.onSurfaceDisabled, // 👈 placeholder color source
                            },
                        }}
                    />

                    <TextInput
                        label="Confirm Password"
                        value={confirm}
                        onChangeText={setConfirm}
                        mode="outlined"
                        secureTextEntry={!show2}
                        style={[styles.input, { backgroundColor: theme.colors.surface }]}
                        left={<TextInput.Icon color={theme.colors.onSurface} icon="lock-check" />}
                        right={<TextInput.Icon color={theme.colors.onSurface} icon={show2 ? 'eye-off' : 'eye'} onPress={() => setShow2(!show2)} />}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.onSurface}
                        theme={{
                            ...theme,
                            colors: {
                                ...theme.colors,
                                onSurfaceVariant: theme.colors.onSurfaceDisabled, // 👈 placeholder color source
                            },
                        }}
                    />

                    <Button
                        variant="contained"
                        fullWidth
                        loading={loading}
                        disabled={loading}
                        onPress={handleReset}
                    >
                        Update Password
                    </Button>

                    <Button
                        variant="text"
                        fullWidth
                        onPress={() => router.replace('/auth/login')}
                    >
                        Back to Login
                    </Button>

                </View>
            </Surface>
        </AuthScreenWrapper>

    );
}


const styles = StyleSheet.create({
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
    form: { gap: AppStyles.spacing.md },
    input: {},
});
