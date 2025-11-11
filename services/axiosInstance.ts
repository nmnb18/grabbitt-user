import { useAuthStore } from '@/store/authStore';
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
        const { refreshToken, idToken } = useAuthStore.getState();

        let token = idToken;
        try {
            const fresh = await refreshToken();
            if (fresh) token = fresh;
        } catch (err) {
            console.warn('Token refresh failed before request', err);
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
