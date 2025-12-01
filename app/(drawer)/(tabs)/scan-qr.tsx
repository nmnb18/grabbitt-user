import React, { useState, useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from 'expo-location';

import { CameraView, useCameraPermissions } from "expo-camera";
import RazorpayCheckout from 'react-native-razorpay';

import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/hooks/use-theme-color";
import api from "@/services/axiosInstance";
import { isGrabbittQR, isPaymentQR, parseUPIQR, extractGrabbittQRId } from "@/utils/helper";
import { ScannerOverlay } from "@/components/scan-qr/scan-overlay";
import { PaymentModal } from "@/components/modals/payment-modal";
import { LoadingView } from "@/components/shared/loading-view";
import { PermissionView } from "@/components/shared/permission-view";
import { PaymentSeller, ScanResult } from "@/types/scan-qr";
import { useRouter } from "expo-router";

export default function UserScanQR() {
    const { user } = useAuthStore();
    const theme = useTheme();
    const router = useRouter();
    const { primary, onPrimary, surface, outline } = theme.colors;

    // State
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [scannedQRData, setScannedQRData] = useState<string | null>(null);
    const [paymentSeller, setPaymentSeller] = useState<PaymentSeller | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);
    const [processingScan, setProcessingScan] = useState(false);
    const [cameraActive, setCameraActive] = useState(true);

    // Helper Functions
    const resetScanState = () => {
        setScanned(false);
        setScannedQRData(null);
        setPaymentSeller(null);
        setPaymentAmount('');
        setShowPaymentModal(false);
        setCameraActive(true);
        setProcessingScan(false);
    };

    // Reset camera when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            // Reset camera state when screen is focused
            setCameraActive(true);
            resetScanState();

            return () => {
                // Cleanup when screen loses focus
                setCameraActive(false);
            };
        }, [])
    );

    // Permission Handlers
    if (!permission) {
        return <LoadingView color={primary} />;
    }

    if (!permission.granted) {
        return <PermissionView onRequestPermission={requestPermission} primary={primary} onPrimary={onPrimary} />;
    }

    // Show loading overlay when processing scan
    if (processingScan) {
        return (
            <LoadingView color="primary" message="Processing QR Code..." />
        );
    }

    // Core Handlers
    const handleBarcodeScanned = async ({ data }: { data: string }) => {
        if (scanned || !cameraActive || processingScan) return;

        setScanned(true);
        setScannedQRData(data);
        try {
            if (isPaymentQR(data)) {
                await handlePaymentQRScan(data);
            } else if (isGrabbittQR(data)) {
                await handleGrabbittQRScan(data);
            } else {
                showAlert("Unknown QR", "This QR code format is not supported.");
            }
        } catch (error) {
            console.error('QR Scan Error:', error);
            showAlert("Error", "Failed to process QR code");
            resetScanState();
        }
    };

    const handlePaymentQRScan = async (qrData: string) => {
        const upiData = parseUPIQR(qrData);

        if (!upiData.pa) {
            showAlert("Invalid Payment QR", "Could not extract UPI ID from this QR code.");
            resetScanState();
            return;
        }
        setProcessingScan(true);

        const sellerResponse = await api.post('/findSellerByUPI', { upiId: upiData.pa });

        if (!sellerResponse.data.success) {
            showAlert("Seller Not Found", "This UPI ID is not registered with any Grabbitt seller.");
            resetScanState();
            return;
        }

        setPaymentSeller(sellerResponse.data.seller);
        setProcessingScan(false);
        setShowPaymentModal(true);
    };

    const handleGrabbittQRScan = async (qrData: string) => {
        const qrId = extractGrabbittQRId(qrData);

        if (!qrId) {
            showAlert("Invalid QR", "This Grabbitt QR code is invalid.");
            resetScanState();
            return;
        }

        await processGrabbittQRScan(qrId);
    };

    const processGrabbittQRScan = async (qrId: string) => {
        setProcessingScan(true);

        try {
            const payload: any = {
                qr_id: qrId
            };

            // Get user location for location-based validation
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status === "granted") {
                try {
                    const location = await Location.getCurrentPositionAsync({});
                    payload.user_lat = location.coords.latitude;
                    payload.user_lng = location.coords.longitude;
                } catch (locationError) {
                    console.log('Location not available, proceeding without location data');
                }
            }

            const response = await api.post('/scanQRCode', payload);

            if (response.data.success) {
                const result = response.data.data;

                // Create scan result object
                const scanResult: ScanResult = {
                    sellerName: result.seller_name,
                    pointsEarned: result.points_earned,
                    totalPoints: result.total_points,
                    message: `You earned ${result.points_earned} points!`,
                    timestamp: new Date().toISOString(),
                    type: 'grabbitt_scan'
                };

                router.replace({
                    pathname: '/(drawer)/scan-success',
                    params: {
                        ...scanResult
                    },
                });
            } else {
                throw new Error(response.data.error || 'Scan failed');
            }

        } catch (error: any) {
            console.error('Grabbitt QR Scan Error:', error);
            showAlert(
                "Scan Failed",
                error.response?.data?.error || error.message || "Failed to scan QR code"
            );
            resetScanState();
        }
    };

    const handlePayment = async () => {
        if (!paymentSeller || !paymentAmount) return;

        setProcessingPayment(true);

        try {
            const amount = parseFloat(paymentAmount);
            const orderResponse = await api.post('/createOrderForUser', {
                sellerId: paymentSeller.id,
                amount: amount,
                reason: 'store_payment',
                payment_mode: 'upi'
            });

            if (!orderResponse.data.success) {
                throw new Error('Failed to create payment order');
            }

            await processRazorpayPayment(orderResponse.data, amount);
        } catch (error: any) {
            console.error('Payment Error:', error);
            showAlert("Payment Error", error.response?.data?.error || "Failed to process payment");
            resetScanState();
        } finally {
            setProcessingPayment(false);
            setShowPaymentModal(false);
        }
    };

    const processRazorpayPayment = async (orderData: any, amount: number) => {
        const { order_id, key_id, amount: orderAmount } = orderData;

        const options = {
            description: `Payment to ${paymentSeller!.shop_name}`,
            currency: 'INR',
            key: key_id,
            amount: orderAmount.toString(),
            name: 'Grabbitt',
            order_id: order_id,
            prefill: {
                email: user?.user.email,
                contact: user?.user.phone,
                name: user?.user.name,
            },
            theme: { color: primary },
        };

        RazorpayCheckout.open(options)
            .then(async (razorpayData) => {
                await verifyPayment(order_id, razorpayData, amount);
            })
            .catch((error: any) => {
                console.error('Razorpay Error:', error);
                showAlert("Payment Failed", error.description || "Payment was not completed");
                resetScanState();
            });
    };

    const verifyPayment = async (orderId: string, razorpayData: any, amount: number) => {
        const verifyResponse = await api.post('/verifyPaymentForUser', {
            razorpay_order_id: orderId,
            razorpay_payment_id: razorpayData.razorpay_payment_id,
            razorpay_signature: razorpayData.razorpay_signature,
            sellerId: paymentSeller!.id,
            amount: amount
        });

        if (verifyResponse.data.success) {
            const pointsEarned = verifyResponse.data.points_earned || 0;

            // Create payment success result
            const paymentResult: ScanResult = {
                sellerName: paymentSeller!.shop_name,
                pointsEarned: pointsEarned,
                totalPoints: verifyResponse.data.total_points || 0,
                message: `Payment of ₹${amount} completed successfully!`,
                amount: amount,
                timestamp: new Date().toISOString(),
                type: 'payment'
            };
            router.replace({
                pathname: '/(drawer)/scan-success',
                params: {
                    ...paymentResult
                },
            });

        } else {
            throw new Error('Payment verification failed');
        }
    };

    const showAlert = (title: string, message: string, success: boolean = false) => {
        Alert.alert(title, message, [{ text: "OK", onPress: success ? resetScanState : undefined }]);
    };

    const isValidPaymentAmount = () => {
        const amount = parseFloat(paymentAmount);
        return !isNaN(amount) && amount > 0;
    };

    return (
        <View style={styles.container}>
            {/* Camera Scanner - Only render when active */}
            {cameraActive && !scanned && !processingScan && (
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    onBarcodeScanned={handleBarcodeScanned}
                    barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                />
            )}

            {/* Scanner Overlay */}
            {!processingScan && <ScannerOverlay />}

            {/* Payment Modal */}
            <PaymentModal
                visible={showPaymentModal}
                seller={paymentSeller}
                amount={paymentAmount}
                processing={processingPayment}
                onAmountChange={setPaymentAmount}
                onPayment={handlePayment}
                onCancel={resetScanState}
                theme={{ surface, primary, outline }}
                isValidAmount={isValidPaymentAmount()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black"
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center'
    }
});