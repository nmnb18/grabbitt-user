import { useAuthStore } from '@/store/authStore';
import auth from '@react-native-firebase/auth'
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL ||
    process.env.EXPO_PUBLIC_BACKEND_URL;

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
});

// 🔄 Interceptor to refresh token if needed
api.interceptors.request.use(
    async (config) => {
        let token: string | null = null;

        const firebaseUser = auth().currentUser;

        if (firebaseUser) {
            // SDK-based login (phone or future email)
            token = await firebaseUser.getIdToken();
        } else {
            const store = useAuthStore.getState();
            token = store.idToken;

            if (store.refreshToken) {
                try {
                    const fresh = await store.refreshToken();
                    if (fresh) token = fresh;
                } catch {
                }
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
