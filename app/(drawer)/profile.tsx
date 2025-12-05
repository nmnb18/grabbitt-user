
import AccountInformation from '@/components/profile/account-information';
import LocationInformation from '@/components/profile/location-details';
import { GradientHeader } from '@/components/shared/app-header';
import { Button as CustomButton } from '@/components/ui/paper-button';
import { useTheme } from '@/hooks/use-theme-color';
import api from '@/services/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { isValidPassword } from '@/utils/helper';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import {
    Button,
    Dialog,
    Modal,
    Portal,
    Text,
    TextInput
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserProfile() {
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const theme = useTheme();
    const surface = theme.colors.surface;
    const textColor = theme.colors.onSurface;
    const danger = theme.colors.error;

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPasswordSheet, setShowPasswordSheet] = useState(false);

    const [deleting, setDeleting] = useState(false);
    const [changing, setChanging] = useState(false);

    // Password states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    // DELETE ACCOUNT
    const handleDeleteAccount = async () => {
        try {
            setDeleting(true);

            const idToken = user?.idToken;
            const resp = await api.delete("/deleteUser");

            if (!resp.data.success) {
                Alert.alert("Delete Failed", resp.data.error || "Unable to delete account");
                return;
            }

            await logout(user?.uid ?? '');
            router.replace("/auth/login");

            Alert.alert("Account Deleted", "Your account has been permanently deleted.");
        } catch (err: any) {
            console.log("Delete Error:", err);
            Alert.alert("Error", err.response?.data?.error || "Something went wrong.");
        } finally {
            setDeleting(false);
        }
    };

    // CHANGE PASSWORD
    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return Alert.alert("Error", "All fields are required.");
        }
        if (!isValidPassword(newPassword)) {
            return Alert.alert(
                "Weak Password",
                "Password must include uppercase, lowercase, number, and special character."
            );
        }
        if (newPassword !== confirmNewPassword) {
            return Alert.alert("Error", "Passwords do not match.");
        }

        try {
            setChanging(true);

            await api.post("/reauthenticate", { currentPassword });
            await api.post("/changePassword", { newPassword });

            Alert.alert("Success", "Password updated.");

            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setShowPasswordSheet(false);
        } catch (err: any) {
            Alert.alert("Error", err?.response?.data?.message || "Failed to update password");
        } finally {
            setChanging(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <GradientHeader title="Profile" />
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Profile Sections */}
                <AccountInformation onOpenChangePassword={() => setShowPasswordSheet(true)} />
                <LocationInformation />

                {/* DELETE ACCOUNT */}
                <View
                    style={[
                        styles.deleteContainer,
                        {
                            backgroundColor: danger + "15",
                            borderColor: danger + "55"
                        }
                    ]}
                >
                    <Button
                        mode="contained"
                        onPress={() => setShowDeleteModal(true)}
                        buttonColor={danger}
                        textColor="#fff"
                    >
                        Delete My Account
                    </Button>

                    <Text style={[styles.deleteNote, { color: danger }]}>
                        This action is permanent and cannot be undone.
                    </Text>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* MODALS & DIALOGS */}
            <Portal>
                {/* DELETE CONFIRMATION */}
                <Dialog
                    visible={showDeleteModal}
                    style={{ borderRadius: 20, backgroundColor: surface }}
                    onDismiss={() => setShowDeleteModal(false)}
                >
                    <Dialog.Title style={{ color: danger }}>
                        Delete Account?
                    </Dialog.Title>

                    <Dialog.Content>
                        <Text style={{ color: textColor }}>
                            This will permanently delete your seller profile, QR data, scans,
                            and rewards. This action cannot be undone.
                        </Text>
                    </Dialog.Content>

                    <Dialog.Actions style={{ justifyContent: 'space-between', paddingBlock: 10 }}>
                        <CustomButton variant='outlined' onPress={() => setShowDeleteModal(false)}>
                            Cancel
                        </CustomButton>

                        <CustomButton
                            variant='contained'
                            onPress={handleDeleteAccount}
                            loading={deleting}
                        >
                            Delete
                        </CustomButton>
                    </Dialog.Actions>
                </Dialog>

                {/* CHANGE PASSWORD SHEET */}
                <Modal
                    visible={showPasswordSheet}
                    onDismiss={() => !changing && setShowPasswordSheet(false)}
                    contentContainerStyle={[
                        styles.sheetContainer,
                        { backgroundColor: surface }
                    ]}
                >
                    <Text style={[styles.sheetTitle, { color: textColor }]}>
                        Change Password
                    </Text>

                    {/* INPUTS */}
                    {[{
                        label: "Current Password",
                        value: currentPassword,
                        onChange: setCurrentPassword
                    }, {
                        label: "New Password",
                        value: newPassword,
                        onChange: setNewPassword,
                        secure: true
                    }, {
                        label: "Confirm New Password",
                        value: confirmNewPassword,
                        onChange: setConfirmNewPassword,
                        secure: true
                    }].map((input, i) => (
                        <TextInput
                            key={i}
                            label={input.label}
                            value={input.value}
                            secureTextEntry={input.secure}
                            onChangeText={input.onChange}
                            mode="outlined"
                            style={[styles.input, { backgroundColor: surface }]}
                            outlineColor={theme.colors.outline}
                            activeOutlineColor={theme.colors.onSurface}
                            theme={{
                                colors: {
                                    primary: theme.colors.primary,      // focused label color
                                    onSurfaceVariant: theme.colors.onSurface, // unfocused label color
                                },
                            }}
                            left={<TextInput.Icon icon="lock" color={theme.colors.onSurface} />}
                        />
                    ))}

                    <Button mode="contained" onPress={handleChangePassword} loading={changing}>
                        Update Password
                    </Button>

                    <Button mode="text" disabled={changing} onPress={() => setShowPasswordSheet(false)}>
                        Cancel
                    </Button>
                </Modal>
            </Portal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, marginTop: 24 },
    scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

    card: { marginBottom: 16, borderRadius: 16 },
    cardTitle: { fontWeight: '600', marginBottom: 12 },
    divider: { marginBottom: 16, height: 1.2 },

    subRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 8
    },

    deleteContainer: {
        marginTop: 32,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1
    },
    deleteNote: {
        marginTop: 8,
        fontSize: 13,
        textAlign: "center"
    },

    bottomSpacer: { height: 80 },

    sheetContainer: {
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 16
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 16
    },
    input: { marginBottom: 12 }
});
