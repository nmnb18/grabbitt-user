// components/shared/location-permission-view.tsx
import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface LocationPermissionViewProps {
  onGrantPermission: () => void;
  onSkip: () => void;
  primary: string;
  onPrimary: string;
  checking: boolean;
}

export function LocationPermissionView({
  onGrantPermission,
  onSkip,
  primary,
  onPrimary,
  checking,
}: LocationPermissionViewProps) {
  return (
    <View style={[styles.container, { backgroundColor: onPrimary }]}>
      <View style={styles.content}>
        {/* Location Icon */}
        <View style={[styles.iconContainer, { backgroundColor: primary }]}>
          <MaterialCommunityIcons
            name="map-marker-radius"
            size={60}
            color={onPrimary}
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: primary }]}>Enable Location</Text>

        {/* Description */}
        <Text style={styles.description}>
          Location access helps us verify you're at the store when scanning QR
          codes.
          {"\n\n"}• Required for stores with location restrictions
          {"\n"}• Better reward experience
          {"\n"}• Faster scanning process
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={onGrantPermission}
            loading={checking}
            disabled={checking}
            style={[styles.grantButton, { backgroundColor: primary }]}
            labelStyle={{ color: onPrimary }}
          >
            {checking ? "Checking..." : "Allow Location Access"}
          </Button>

          <Button
            mode="outlined"
            onPress={onSkip}
            disabled={checking}
            style={[styles.skipButton, { borderColor: primary }]}
            labelStyle={{ color: primary }}
          >
            Skip for Now
          </Button>

          <Text style={styles.note}>
            You can enable location later in settings
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 32,
    color: "#666",
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  grantButton: {
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 4,
  },
  skipButton: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  note: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
});
