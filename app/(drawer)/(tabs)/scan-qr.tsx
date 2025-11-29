import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";

import { CameraView, useCameraPermissions } from "expo-camera";
import RazorpayCheckout from 'react-native-razorpay';

import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/hooks/use-theme-color";
import api from "@/services/axiosInstance";
import { isGrabbittQR, isPaymentQR, parseUPIQR } from "@/utils/helper";
import { ScannerOverlay } from "@/components/scan-qr/scan-overlay";
import { PaymentModal } from "@/components/modals/payment-modal";
import { LoadingView } from "@/components/shared/loading-view";
import { PermissionView } from "@/components/shared/permission-view";
import { PaymentSeller } from "@/types/scan-qr";



export default function UserScanQR() {
    const { user } = useAuthStore();
    const theme = useTheme();
    const { primary, onPrimary, surface, outline } = theme.colors;

    // State
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [scannedQRData, setScannedQRData] = useState<string | null>(null);
    const [paymentSeller, setPaymentSeller] = useState<PaymentSeller | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);

    // Permission Handlers
    if (!permission) {
        return <LoadingView color={primary} />;
    }

    if (!permission.granted) {
        return <PermissionView onRequestPermission={requestPermission} primary={primary} onPrimary={onPrimary} />;
    }

    // Core Handlers
    const handleBarcodeScanned = async ({ data }: { data: string }) => {
        if (scanned) return;

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
        }
    };

    const handlePaymentQRScan = async (qrData: string) => {
        const upiData = parseUPIQR(qrData);

        if (!upiData.pa) {
            showAlert("Invalid Payment QR", "Could not extract UPI ID from this QR code.");
            return;
        }

        const sellerResponse = await api.post('/findSellerByUPI', { upiId: upiData.pa });

        if (!sellerResponse.data.success) {
            showAlert("Seller Not Found", "This UPI ID is not registered with any Grabbitt seller.");
            return;
        }

        setPaymentSeller(sellerResponse.data.seller);
        setShowPaymentModal(true);
    };

    const handleGrabbittQRScan = async (qrData: string) => {
        // TODO: Implement Grabbitt QR scanning logic
        Alert.alert("Grabbitt QR", "Grabbitt QR scanning will be implemented soon!");
        resetScanState();
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
            const pointsMessage = verifyResponse.data.points_earned > 0
                ? `\n\nYou earned ${verifyResponse.data.points_earned} points!`
                : '';

            showAlert(
                "🎉 Payment Successful!",
                `Payment of ₹${amount} completed successfully!${pointsMessage}`,
                true
            );
        } else {
            throw new Error('Payment verification failed');
        }
    };

    // Helper Functions
    const resetScanState = () => {
        setScanned(false);
        setScannedQRData(null);
        setPaymentSeller(null);
        setPaymentAmount('');
        setShowPaymentModal(false);
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
            {/* Camera Scanner */}
            {!scanned && (
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    onBarcodeScanned={handleBarcodeScanned}
                    barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                />
            )}

            {/* Scanner Overlay */}
            <ScannerOverlay />

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



// Styles
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "black" }

});