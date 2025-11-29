import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export const ScannerOverlay = () => (
    <View style={styles.overlay}>
        <LinearGradient colors={["rgba(0,0,0,0.7)", "transparent"]} style={styles.topOverlay}>
            <Text style={styles.topTitle}>Scan QR Code</Text>
            <Text style={styles.topSubtitle}>Align QR inside the frame</Text>
        </LinearGradient>

        <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
        </View>

        <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.bottomOverlay}>
            <MaterialCommunityIcons name="qrcode-scan" size={42} color="#FFF" />
            <Text style={styles.bottomText}>Scan to earn rewards</Text>
        </LinearGradient>
    </View>
);

const styles = StyleSheet.create({

    frame: { width: 260, height: 260, alignSelf: "center" },
    corner: { position: "absolute", width: 48, height: 48, borderColor: "#FFF" },
    cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
    cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
    cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
    cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
    overlay: { ...StyleSheet.absoluteFillObject, justifyContent: "space-between" },
    topOverlay: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 40 },
    topTitle: { color: "#FFF", fontWeight: "700", marginBottom: 8, fontSize: 22 },
    topSubtitle: { color: "#EEE" },
    bottomOverlay: { paddingTop: 30, paddingBottom: 100, alignItems: "center" },
    bottomText: { marginTop: 10, color: "#FFF", opacity: 0.9 },
})