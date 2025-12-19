import React, { useState } from "react";
import { View, Alert } from "react-native";
import { TextInput, Button } from "react-native-paper";
import * as Location from "expo-location";
import axios from "axios";
import { useRouter, useLocalSearchParams } from "expo-router";
import auth from "@react-native-firebase/auth";
import api from "@/services/axiosInstance";

export default function UserVerifyOtp() {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const params = useLocalSearchParams();
    const router = useRouter();

    const submitOTP = async () => {
        try {
            setLoading(true);

            if (!otp) {
                Alert.alert("Error", "Enter OTP");
                return;
            }

            const confirmation = JSON.parse(params.confirmation as string);

            // 1️⃣ Convert OTP to Firebase Credential
            const result = await confirmation.confirm(otp);

            // 2️⃣ Get Firebase ID token
            const firebaseIdToken = await result.user.getIdToken();

            // 2️⃣ Get Location (Mandatory)
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Error", "Location required");
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});

            // 3️⃣ Send to backend to ensure user exists
            await axios.post(
                "/phoneLogin",
                {
                    firebaseIdToken,
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                }
            );
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
