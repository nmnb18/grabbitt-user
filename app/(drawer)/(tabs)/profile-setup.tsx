import AccountInformation from '@/components/profile/account-information';
import BusinessInformation from '@/components/profile/business-information';
import LocationDetails from '@/components/profile/location-details';
import RewardsSettings from '@/components/profile/reward-settings';
import VerificationDetails from '@/components/profile/verification-details';
import { Button as CustomButton } from '@/components/ui/paper-button';
import { useTheme, useThemeColor } from '@/hooks/use-theme-color';
import api from '@/services/axiosInstance';
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
  Card,
  Chip,
  Dialog,
  Divider,
  HelperText,
  Modal,
  Portal,
  Text,
  TextInput
} from 'react-native-paper';
import { useAuthStore } from '../../../store/authStore';

export default function SellerProfileSetup() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const subscription = user?.user.seller_profile?.subscription;
  const expiryText = subscription?.expires_at
    ? `Expires on ${new Date(subscription?.expires_at?._seconds * 1000).toLocaleDateString()}`
    : 'No expiry set';

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordSheet, setShowPasswordSheet] = useState(false);

  const [deleting, setDeleting] = useState(false);

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changing, setChanging] = useState(false);
  const theme = useTheme();
  const outlineColor = useThemeColor({}, 'outline');
  const accentColor = useThemeColor({}, 'accent');

  // DELETE ACCOUNT
  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);

      const idToken = user?.idToken;

      const resp = await api.delete("/deleteSellerAccount", {
        headers: { Authorization: `Bearer ${idToken}` }
      });

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

      const idToken = user?.idToken;

      await api.post(
        "/reauthenticate",
        { currentPassword }
      );

      await api.post(
        "/changePassword",
        { newPassword }
      );

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
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ACCOUNT INFORMATION */}
        <AccountInformation onOpenChangePassword={() => setShowPasswordSheet(true)} />

        {/* BUSINESS INFORMATION */}
        <BusinessInformation />

        {/* LOCATION DETAILS */}
        <LocationDetails />

        {/* VERIFICATION */}
        <VerificationDetails />

        {/* REWARDS SETTINGS */}
        <RewardsSettings />

        {/* SUBSCRIPTION */}
        <Card style={styles.card} elevation={3}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>💎 Subscription</Text>
            <Divider style={styles.divider} />
            <View style={styles.subRow}>
              <Chip style={styles.planChip} icon="crown">
                {subscription?.tier?.toUpperCase()}
              </Chip>
              <Chip style={styles.expChip} icon="calendar">
                {expiryText}
              </Chip>
            </View>

            <HelperText type="info">
              Plan changes are handled on the Subscription page.
            </HelperText>

            <CustomButton
              variant="outlined"
              icon="arrow-right-bold-circle"
              onPress={() => router.push('/(drawer)/subscription')}
            >
              Go to Plans
            </CustomButton>
          </Card.Content>
        </Card>

        {/* DELETE ACCOUNT */}
        <View style={styles.deleteContainer}>
          <Button
            mode="contained"
            onPress={() => setShowDeleteModal(true)}
            buttonColor="#DC2626"
            textColor="#fff"
          >
            Delete My Account
          </Button>

          <Text style={styles.deleteNote}>
            This action is permanent and cannot be undone.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
      {/* PORTAL SECTION (Always on top!) */}
      <Portal>
        {/* DELETE ACCOUNT DIALOG */}
        <Dialog
          visible={showDeleteModal}
          style={{ borderRadius: 20 }}
          onDismiss={() => setShowDeleteModal(false)}
        >
          <Dialog.Title style={{ color: "#DC2626" }}>Delete Account?</Dialog.Title>
          <Dialog.Content>
            <Text>
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
          contentContainerStyle={styles.sheetContainer}
        >
          <Text style={styles.sheetTitle}>Change Password</Text>

          <TextInput
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            mode="outlined"
            style={[styles.input, { backgroundColor: theme.colors.surface }]}
            left={<TextInput.Icon icon="lock" />}
            outlineColor={outlineColor}
            activeOutlineColor={accentColor}
            theme={theme}
          />

          <TextInput
            label="New Password"
            value={newPassword}
            secureTextEntry
            onChangeText={setNewPassword}
            mode="outlined"
            style={[styles.input, { backgroundColor: theme.colors.surface }]}
            left={<TextInput.Icon icon="lock" />}
            outlineColor={outlineColor}
            activeOutlineColor={accentColor}
            theme={theme}
          />

          <TextInput
            label="Confirm New Password"
            value={confirmNewPassword}
            secureTextEntry
            onChangeText={setConfirmNewPassword}
            mode="outlined"
            style={[styles.input, { backgroundColor: theme.colors.surface }]} outlineColor={outlineColor}
            activeOutlineColor={accentColor}
            theme={theme}
            left={<TextInput.Icon icon="lock-check" />}
          />

          <Button mode="contained" onPress={handleChangePassword} loading={changing}>
            Update Password
          </Button>

          <Button mode="text" disabled={changing} onPress={() => setShowPasswordSheet(false)}>
            Cancel
          </Button>
        </Modal>
      </Portal>
    </View>


  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', },
  keyboardView: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 3,
  },
  cardTitle: { fontWeight: '600', marginBottom: 12 },
  divider: { marginBottom: 16, height: 1.2, backgroundColor: '#0D737733' },

  subRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  planChip: { backgroundColor: '#EEF2FF' },
  expChip: { backgroundColor: '#ECFDF5' },

  deleteContainer: {
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteNote: {
    marginTop: 8,
    fontSize: 13,
    color: '#B91C1C',
    textAlign: 'center',
  },
  bottomSpacer: { height: 80 },

  sheetContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: { marginBottom: 12, backgroundColor: '#FFF' },
});
