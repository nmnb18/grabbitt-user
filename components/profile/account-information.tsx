import api from "@/services/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Divider,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

export default function AccountInformation({
  onOpenChangePassword,
}: {
  onOpenChangePassword: () => void;
}) {
  const theme = useTheme();
  const { user, fetchUserDetails } = useAuthStore();

  const uid = user?.uid;
  const idToken = user?.idToken;

  const profile = user?.user?.customer_profile?.account;

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(profile?.name || "");
  const [email] = useState(profile?.email || "");
  const [phone, setPhone] = useState(profile?.phone || "");

  const [initial, setInitial] = useState({ name, phone });

  const isDirty = useMemo(
    () =>
      name !== initial.name ||
      phone !== initial.phone,
    [name, phone, initial]
  );

  const handleCancel = () => {
    setName(initial.name);
    setPhone(initial.phone);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!name) return Alert.alert("Validation", "Full name is required");
    if (!phone) return Alert.alert("Validation", "Phone number is required");

    try {
      setSaving(true);

      await api.patch(
        "/updateUserProfile",
        {
          section: "account",
          data: {
            name,
            phone,
          },
        }
      );

      if (uid) await fetchUserDetails(uid);
      setInitial({ name, phone });
      setIsEditing(false);

      Alert.alert("Success", "Account information updated.");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={{ position: "relative" }}>
        <Card.Content>
          {/* HEADER */}
          <View style={styles.sectionHeader}>
            <Text
              variant="titleMedium"
              style={[styles.cardTitle, { color: theme.colors.onSurface }]}
            >
              👤 Account Information
            </Text>

            {!isEditing ? (
              <Button
                mode="text"
                onPress={() => setIsEditing(true)}
                icon="pencil"
                compact
              >
                Edit
              </Button>
            ) : (
              <View style={styles.editButtons}>
                <Button
                  mode="text"
                  onPress={handleCancel}
                  icon="close"
                  disabled={saving}
                  compact
                >
                  Cancel
                </Button>
                <Button
                  mode="text"
                  onPress={handleSave}
                  icon="content-save-outline"
                  disabled={!isDirty || saving}
                  loading={saving}
                  compact
                >
                  Save
                </Button>
              </View>
            )}
          </View>

          <Divider
            style={[styles.divider, { backgroundColor: theme.colors.outline }]}
          />

          {/* DISPLAY MODE */}
          {!isEditing ? (
            <View>
              <View
                style={[
                  styles.infoRow,
                  { borderBottomColor: theme.colors.outline },
                ]}
              >
                <Text
                  style={[
                    styles.infoLabel,
                    { color: theme.colors.onSurfaceDisabled },
                  ]}
                >
                  Full Name
                </Text>
                <Text
                  style={[styles.infoValue, { color: theme.colors.onSurface }]}
                >
                  {name || "—"}
                </Text>
              </View>

              <View
                style={[
                  styles.infoRow,
                  { borderBottomColor: theme.colors.outline },
                ]}
              >
                <Text
                  style={[
                    styles.infoLabel,
                    { color: theme.colors.onSurfaceDisabled },
                  ]}
                >
                  Email
                </Text>
                <Text
                  style={[styles.infoValue, { color: theme.colors.onSurface }]}
                >
                  {email || "—"}
                </Text>
              </View>

              <View
                style={[
                  styles.infoRow,
                  { borderBottomColor: theme.colors.outline },
                ]}
              >
                <Text
                  style={[
                    styles.infoLabel,
                    { color: theme.colors.onSurfaceDisabled },
                  ]}
                >
                  Phone
                </Text>
                <Text
                  style={[styles.infoValue, { color: theme.colors.onSurface }]}
                >
                  {phone || "—"}
                </Text>
              </View>

              {/* Change Password */}
              <View style={{ marginTop: 20 }}>
                <Button
                  mode="text"
                  icon="lock-reset"
                  onPress={onOpenChangePassword}
                >
                  Change Password
                </Button>
              </View>
            </View>
          ) : (
            /* EDIT MODE */
            <View>
              <TextInput
                label="Full Name *"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.onSurface}   // focused border + label
                left={<TextInput.Icon icon="account" color={theme.colors.onSurface} />}

                theme={{
                  colors: {
                    primary: theme.colors.primary,      // focused label color
                    onSurfaceVariant: theme.colors.onSurface, // unfocused label color
                  },
                }}
              />

              <TextInput
                label="Email (read only)"
                value={email}
                mode="outlined"
                editable={false}
                style={styles.input}
                outlineColor={theme.colors.outline}
                left={<TextInput.Icon icon="email" color={theme.colors.onSurface} />}
                theme={{
                  colors: {
                    primary: theme.colors.primary,      // focused label color
                    onSurfaceVariant: theme.colors.onSurface, // unfocused label color
                  },
                }}
              />

              <TextInput
                label="Phone *"
                value={phone}
                onChangeText={setPhone}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.onSurface}
                left={<TextInput.Icon icon="phone" color={theme.colors.onSurface} />}
                theme={{
                  colors: {
                    primary: theme.colors.primary,      // focused label color
                    onSurfaceVariant: theme.colors.onSurface, // unfocused label color
                  },
                }}
              />

            </View>
          )}
        </Card.Content>

        {/* Saving Overlay */}
        {saving && (
          <View
            style={[
              styles.overlay,
              {
                backgroundColor: theme.dark
                  ? "rgba(0,0,0,0.5)"
                  : "rgba(255,255,255,0.7)",
              },
            ]}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text
              style={[styles.overlayText, { color: theme.colors.onSurface }]}
            >
              Saving…
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  editButtons: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  cardTitle: {
    fontWeight: "600",
    marginBottom: 12,
  },
  divider: {
    marginBottom: 16,
    height: 1,
  },
  infoRow: {
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontWeight: "600",
  },
  input: {
    marginBottom: 12,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },
  overlayText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
  },
});
