import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, Alert, Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";

import { CameraView, useCameraPermissions } from "expo-camera";
//import RazorpayCheckout from "react-native-razorpay";

import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/hooks/use-theme-color";
import api from "@/services/axiosInstance";
import {
  isGrabbittQR,
  isPaymentQR,
  parseUPIQR,
  extractGrabbittQRId,
} from "@/utils/helper";
import { ScannerOverlay } from "@/components/scan-qr/scan-overlay";
import { PaymentModal } from "@/components/modals/payment-modal";
import { LoadingView } from "@/components/shared/loading-view";
import { PermissionView } from "@/components/shared/permission-view";
import { PaymentSeller, ScanResult } from "@/types/scan-qr";
import { useRouter } from "expo-router";
import { LocationPermissionView } from "@/components/shared/location-permission-view";

export default function UserScanQR() {
  const { user } = useAuthStore();
  const theme = useTheme();
  const router = useRouter();
  const { primary, onPrimary, surface, outline } = theme.colors;

  // State
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedQRData, setScannedQRData] = useState<string | null>(null);
  const [paymentSeller, setPaymentSeller] = useState<PaymentSeller | null>(
    null
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingScan, setProcessingScan] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);

  // Location Permission State
  const [locationPermissionStatus, setLocationPermissionStatus] =
    useState<Location.PermissionStatus | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [checkingLocation, setCheckingLocation] = useState(true);

  // Helper Functions
  const resetScanState = () => {
    setScanned(false);
    setScannedQRData(null);
    setPaymentSeller(null);
    setPaymentAmount("");
    setShowPaymentModal(false);
    setCameraActive(true);
    setProcessingScan(false);
  };

  // Check location permission
  const checkAndRequestLocationPermission = useCallback(async () => {
    try {
      setCheckingLocation(true);
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermissionStatus(status);

      if (status === "granted") {
        // Permission already granted
        return true;
      } else if (status === "denied") {
        // User has denied permission
        setShowLocationPrompt(true);
        return false;
      } else {
        // Permission not determined yet - ask for it
        const { status: newStatus } =
          await Location.requestForegroundPermissionsAsync();
        setLocationPermissionStatus(newStatus);

        if (newStatus !== "granted") {
          setShowLocationPrompt(true);
          return false;
        }
        return true;
      }
    } catch (error) {
      console.error("Error checking location permission:", error);
      setShowLocationPrompt(true);
      return false;
    } finally {
      setCheckingLocation(false);
    }
  }, []);

  // Check permissions when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const setupPermissions = async () => {
        // Reset scan state
        setCameraActive(true);
        resetScanState();

        // Check and request location permission
        await checkAndRequestLocationPermission();
      };

      setupPermissions();

      return () => {
        setCameraActive(false);
      };
    }, [checkAndRequestLocationPermission])
  );

  // Handle location permission request
  const handleRequestLocationPermission = async () => {
    try {
      setCheckingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionStatus(status);

      if (status === "granted") {
        setShowLocationPrompt(false);
      } else if (status === "denied") {
        Alert.alert(
          "Location Permission Denied",
          "You can still scan QR codes, but stores with location restrictions may not work. You can enable location in device settings.",
          [{ text: "OK", onPress: () => setShowLocationPrompt(false) }]
        );
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
    } finally {
      setCheckingLocation(false);
    }
  };

  const handleSkipLocation = () => {
    Alert.alert(
      "Location Not Enabled",
      "You can scan QR codes, but stores with location restrictions will not work. You can enable location later in settings.",
      [
        {
          text: "Enable Later",
          style: "cancel",
          onPress: () => setShowLocationPrompt(false),
        },
        {
          text: "Open Settings",
          onPress: () => {
            if (Platform.OS === "ios") {
              Linking.openURL("app-settings:");
            } else {
              Linking.openSettings();
            }
            setShowLocationPrompt(false);
          },
        },
      ]
    );
  };

  // Import Linking for settings
  const Linking = require("expo-linking");

  // Permission Handlers
  if (!cameraPermission) {
    return <LoadingView color={primary} />;
  }

  if (!cameraPermission.granted) {
    return (
      <PermissionView
        onRequestPermission={requestCameraPermission}
        primary={primary}
        onPrimary={onPrimary}
      />
    );
  }

  // Show location permission prompt if needed
  if (showLocationPrompt && !checkingLocation) {
    return (
      <LocationPermissionView
        onGrantPermission={handleRequestLocationPermission}
        onSkip={handleSkipLocation}
        primary={primary}
        onPrimary={onPrimary}
        checking={checkingLocation}
      />
    );
  }

  // Show loading while checking permissions
  if (checkingLocation) {
    return <LoadingView color={primary} message="Checking permissions..." />;
  }

  // Show loading overlay when processing scan
  if (processingScan) {
    return <LoadingView color="primary" message="Processing QR Code..." />;
  }

  // Core Handlers
  const handleBarcodeScanned = async ({
    data,
    type,
  }: {
    data: string;
    type: string;
  }) => {
    if (scanned || !cameraActive || processingScan || type != "qr") return;

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
      console.error("QR Scan Error:", error);
      showAlert("Error", "Failed to process QR code");
      resetScanState();
    }
  };

  const handlePaymentQRScan = async (qrData: string) => {
    const upiData = parseUPIQR(qrData);

    if (!upiData.pa) {
      showAlert(
        "Invalid Payment QR",
        "Could not extract UPI ID from this QR code."
      );
      resetScanState();
      return;
    }
    setProcessingScan(true);

    const sellerResponse = await api.post("/findSellerByUPI", {
      upiId: upiData.pa,
    });

    if (!sellerResponse.data.success) {
      showAlert(
        "Seller Not Found",
        "This UPI ID is not registered with any Grabbitt seller."
      );
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
        qr_id: qrId,
      };

      // Get user location if permission granted
      if (locationPermissionStatus === "granted") {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
          });
          payload.user_lat = location.coords.latitude;
          payload.user_lng = location.coords.longitude;
        } catch (locationError) {
          console.log(
            "Location not available or timed out, proceeding without location data"
          );
        }
      }

      const response = await api.post("/scanQRCode", payload);

      if (response.data.success) {
        const result = response.data.data;

        // Create scan result object
        const scanResult: ScanResult = {
          sellerName: result.seller_name,
          pointsEarned: result.points_earned,
          totalPoints: result.total_points,
          message: `You earned ${result.points_earned} points!`,
          timestamp: new Date().toISOString(),
          type: "grabbitt_scan",
        };

        router.replace({
          pathname: "/(drawer)/scan-success",
          params: {
            ...scanResult,
          },
        });
      } else {
        // Check if error is due to location requirement
        const errorMsg = response.data.error || "Scan failed";
        if (errorMsg.includes("location") || errorMsg.includes("Location")) {
          // Show location error with option to enable
          Alert.alert("Location Required", errorMsg, [
            {
              text: "Cancel",
              style: "cancel",
              onPress: resetScanState,
            },
            {
              text: "Enable Location",
              onPress: async () => {
                const granted = await checkAndRequestLocationPermission();
                if (granted && scannedQRData) {
                  await handleGrabbittQRScan(scannedQRData);
                }
              },
            },
          ]);
        } else {
          throw new Error(errorMsg);
        }
      }
    } catch (error: any) {
      console.error("Grabbitt QR Scan Error:", error);

      // Check if error is location-related
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to scan QR code";
      if (
        errorMessage.includes("location") ||
        errorMessage.includes("Location")
      ) {
        Alert.alert("Location Required", errorMessage, [
          {
            text: "Cancel",
            style: "cancel",
            onPress: resetScanState,
          },
          {
            text: "Enable Location",
            onPress: async () => {
              const granted = await checkAndRequestLocationPermission();
              if (granted && scannedQRData) {
                await handleGrabbittQRScan(scannedQRData);
              }
            },
          },
        ]);
      } else {
        showAlert("Scan Failed", errorMessage);
      }
      resetScanState();
    } finally {
      setProcessingScan(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentSeller || !paymentAmount) return;

    setProcessingPayment(true);

    try {
      const amount = parseFloat(paymentAmount);
      const orderResponse = await api.post("/createOrderForUser", {
        sellerId: paymentSeller.id,
        amount: amount,
        reason: "store_payment",
        payment_mode: "upi",
      });

      if (!orderResponse.data.success) {
        throw new Error("Failed to create payment order");
      }

      await processRazorpayPayment(orderResponse.data, amount);
    } catch (error: any) {
      console.error("Payment Error:", error);
      showAlert(
        "Payment Error",
        error.response?.data?.error || "Failed to process payment"
      );
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
      currency: "INR",
      key: key_id,
      amount: orderAmount.toString(),
      name: "Grabbitt",
      order_id: order_id,
      prefill: {
        email: user?.user.email,
        contact: user?.user.phone,
        name: user?.user.name,
      },
      theme: { color: primary },
    };
    setProcessingScan(true);

    // RazorpayCheckout.open(options)
    //   .then(async (razorpayData) => {
    //     await verifyPayment(order_id, razorpayData, amount);
    //   })
    //   .catch((error: any) => {
    //     console.error("Razorpay Error:", error);
    //     showAlert(
    //       "Payment Failed",
    //       error.description?.description || "Payment was not completed"
    //     );
    //     resetScanState();
    //   });
  };

  const verifyPayment = async (
    orderId: string,
    razorpayData: any,
    amount: number
  ) => {
    setProcessingScan(true);
    const payload: any = {
      razorpay_order_id: orderId,
      razorpay_payment_id: razorpayData.razorpay_payment_id,
      razorpay_signature: razorpayData.razorpay_signature,
      sellerId: paymentSeller!.id,
      amount: amount,
    };

    // Get location if permission is granted
    if (locationPermissionStatus === "granted") {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
        });
        payload.user_lat = location.coords.latitude;
        payload.user_lng = location.coords.longitude;
      } catch (locationError) {
        console.log("Location not available, proceeding without location data");
      }
    }

    const verifyResponse = await api.post("/verifyPaymentForUser", payload);
    setProcessingScan(false);
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
        type: "payment",
      };
      router.replace({
        pathname: "/(drawer)/scan-success",
        params: {
          ...paymentResult,
        },
      });
    } else {
      throw new Error(
        "Payment verification failed. Amount deducted(any) will refund back to you in 24-48hrs."
      );
    }
  };

  const showAlert = (
    title: string,
    message: string,
    success: boolean = false
  ) => {
    Alert.alert(title, message, [
      { text: "OK", onPress: success ? resetScanState : undefined },
    ]);
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
    backgroundColor: "black",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
});
