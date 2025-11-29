import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Button } from "../ui/paper-button";

export const PermissionView = ({ onRequestPermission, primary, onPrimary }: any) => (
    <View style={styles.center}>
        <MaterialCommunityIcons name="camera-off" size={80} color={onPrimary} />
        <Text variant="headlineSmall" style={[styles.permissionTitle, { color: onPrimary }]}>
            Camera Access Needed
        </Text>
        <Text variant="bodyMedium" style={[styles.permissionText, { color: onPrimary }]}>
            Enable camera to scan QR codes
        </Text>
        <Button
            variant="contained"
            onPress={onRequestPermission}
        >
            Enable Camera
        </Button>
    </View>
);

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    permissionTitle: { marginTop: 18, marginBottom: 6, fontWeight: "700", textAlign: "center" },
    permissionText: { textAlign: "center", opacity: 0.9, marginBottom: 20 },
})