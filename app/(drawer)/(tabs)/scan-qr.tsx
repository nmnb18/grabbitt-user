import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";

import { useAuthStore } from "@/store/authStore";
import {
    Text,
    Button,
    TextInput,
    Card,
    ActivityIndicator,
    Portal,
    Modal,
} from "react-native-paper";

import { LinearGradient } from "expo-linear-gradient";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme-color";

import axios from "axios";
import Constants from "expo-constants";
import api from "@/services/axiosInstance";

const API_URL =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL ||
    process.env.EXPO_PUBLIC_BACKEND_URL;

export default function UserScanQR() {
    const { user } = useAuthStore();
    const theme = useTheme();

    const primary = theme.colors.primary;
    const onPrimary = theme.colors.onPrimary;
    const surface = theme.colors.surface;

    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [hiddenCode, setHiddenCode] = useState("");
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [scannedQRData, setScannedQRData] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    // CAMERA PERMISSION BLOCK
    if (!permission) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={primary} />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <LinearGradient
                    colors={[primary, theme.colors.secondary]}
                    style={styles.permissionWrapper}
                >
                    <MaterialCommunityIcons name="camera-off" size={80} color={onPrimary} />

                    <Text variant="headlineSmall" style={[styles.permissionTitle, { color: onPrimary }]}>
                        Camera Access Needed
                    </Text>

                    <Text variant="bodyMedium" style={[styles.permissionText, { color: onPrimary }]}>
                        Enable camera to scan QR codes
                    </Text>

                    <Button
                        mode="contained"
                        onPress={requestPermission}
                        style={styles.permissionBtn}
                        buttonColor={onPrimary}
                        textColor={primary}
                    >
                        Enable Camera
                    </Button>
                </LinearGradient>
            </View>
        );
    }

    // ON QR SCANNED
    const handleBarcodeScanned = async ({ data }: { data: string }) => {
        if (scanned) return;

        setScanned(true);
        setScannedQRData(data);

        try {
            const checkResponse = await api.get(`${API_URL}/api/qr/check/${data}`);

            if (checkResponse.data.requires_code) {
                setShowCodeModal(true);
            } else {
                await processQRScan(data);
            }
        } catch {
            await processQRScan(data);
        }
    };

    const processQRScan = async (qrData: string, code?: string) => {
        setProcessing(true);

        try {
            const payload: any = { qr_code_data: qrData };
            if (code) payload.hidden_code = code;

            const response = await api.post(
                `${API_URL}/api/qr/scan`,
                payload,
            );

            Alert.alert(
                "🎉 Success!",
                `You earned ${response.data.points_earned} points!\n\nTotal points: ${response.data.total_points}`,
                [{ text: "Great!", onPress: resetScanState }]
            );
        } catch (error: any) {
            Alert.alert(
                "Error",
                error?.response?.data?.detail || "Failed to scan QR code",
                [{ text: "Try Again", onPress: resetScanState }]
            );
        } finally {
            setProcessing(false);
        }
    };

    const resetScanState = () => {
        setScanned(false);
        setShowCodeModal(false);
        setHiddenCode("");
        setScannedQRData(null);
    };

    return (
        <View style={{ flex: 1, backgroundColor: "black" }}>

            {/* CAMERA SCANNER */}
            {!scanned && (
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    onBarcodeScanned={handleBarcodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                />
            )}

            {/* OVERLAY UI */}
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

            {/* HIDDEN CODE MODAL */}
            <Portal>
                <Modal visible={showCodeModal} onDismiss={resetScanState} contentContainerStyle={{ paddingHorizontal: 20 }}>
                    <Card style={[styles.modalCard, { backgroundColor: surface }]}>
                        <Card.Content>
                            <View style={styles.modalHeader}>
                                <MaterialCommunityIcons name="key" size={42} color={primary} />
                                <Text variant="headlineSmall" style={{ fontWeight: "700" }}>
                                    Enter Hidden Code
                                </Text>
                                <Text style={{ opacity: 0.7, marginTop: 4, textAlign: "center" }}>
                                    This QR requires a secret code
                                </Text>
                            </View>

                            <TextInput
                                label="Hidden Code"
                                mode="outlined"
                                value={hiddenCode}
                                onChangeText={setHiddenCode}
                                left={<TextInput.Icon icon="key" />}
                                style={{ marginBottom: 16 }}
                            />

                            <View style={styles.modalActions}>
                                <Button mode="outlined" onPress={resetScanState} style={{ flex: 1 }}>
                                    Cancel
                                </Button>
                                <Button
                                    mode="contained"
                                    loading={processing}
                                    disabled={processing}
                                    onPress={() => processQRScan(scannedQRData!, hiddenCode)}
                                    style={{ flex: 1 }}
                                >
                                    Submit
                                </Button>
                            </View>
                        </Card.Content>
                    </Card>
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    permissionWrapper: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
    permissionTitle: { marginTop: 18, marginBottom: 6, fontWeight: "700", textAlign: "center" },
    permissionText: { textAlign: "center", opacity: 0.9, marginBottom: 20 },
    permissionBtn: { borderRadius: 12 },

    overlay: { ...StyleSheet.absoluteFillObject, justifyContent: "space-between" },

    topOverlay: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 40 },
    topTitle: { color: "#FFF", fontWeight: "700", marginBottom: 8, fontSize: 22 },
    topSubtitle: { color: "#EEE" },

    frame: { width: 260, height: 260, alignSelf: "center" },

    corner: { position: "absolute", width: 48, height: 48, borderColor: "#FFF" },
    cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
    cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
    cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
    cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },

    bottomOverlay: { paddingTop: 30, paddingBottom: 100, alignItems: "center" },
    bottomText: { marginTop: 10, color: "#FFF", opacity: 0.9 },

    modalCard: { borderRadius: 20 },
    modalHeader: { alignItems: "center", marginBottom: 20 },
    modalActions: { flexDirection: "row", gap: 10 },
});
