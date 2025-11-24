import React, { useState } from "react";
import { View, Alert } from "react-native";
import { TextInput, Button } from "react-native-paper";
import * as Location from "expo-location";
import axios from "axios";
import { useRouter, useLocalSearchParams } from "expo-router";
import { auth, PhoneAuthProvider, signInWithCredential } from "@/config/firebase";

export default function UserVerifyOtp() {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const { verificationId, phone } = useLocalSearchParams();
    const router = useRouter();

    const submitOTP = async () => {
        try {
            setLoading(true);

            // 1️⃣ Convert OTP to Firebase Credential
            const credential = PhoneAuthProvider.credential(
                verificationId as string,
                otp
            );

            const result = await signInWithCredential(auth, credential);
            const uid = result.user.uid;

            // 2️⃣ Get Location (Mandatory)
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Error", "Location required");
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});

            // 3️⃣ Send to backend to ensure user exists
            const userCheck = await axios.post(
                "https://YOUR_DOMAIN/checkUserOrCreateUser",
                {
                    phone,
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                }
            );

            // 4️⃣ Generate custom backend token for JWT-based API
            const jwtRes = await axios.post(
                "https://YOUR_DOMAIN/createJwtForPhoneUser",
                { uid }
            );

            // 5️⃣ Login inside your auth store
            // e.g. save jwtRes.data.customToken to storage

            router.replace("/(drawer)");
        } catch (err: any) {
            Alert.alert("OTP Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <TextInput label="Enter OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" />
            <Button mode="contained" loading={loading} onPress={submitOTP}>
                Verify & Login
            </Button>
        </View>
    );
}
