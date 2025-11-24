import { LoginResponse as User, UserPayload } from "@/types/auth";
import { startSubscriptionWatcher } from "@/utils/subscription-watcher";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import { create } from "zustand";

const API_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL;

interface AuthStore {
  user: User | null;
  loading: boolean;
  idToken: string | null;
  setUser: (user: User | null) => void;
  register: (payload: UserPayload) => Promise<void>;
  login: (
    email: string,
    password: string,
  ) => Promise<void>;
  fetchUserDetails: (uid: string) => Promise<void>;
  logout: (uid: string) => Promise<void>;
  loadUser: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: false,
  idToken: null,
  setUser: (user) => set({ user }),

  register: async (payload: UserPayload) => {
    try {
      set({ loading: true });

      await axios.post(`${API_URL}/registerUser`, payload);
    } catch (err: any) {
      set({ loading: false });
      console.error("Register error:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || "Registration failed");
    }
  },


  login: async (email, password) => {
    try {
      set({ loading: true });
      const response = await axios.post(`${API_URL}/loginUser`, {
        email,
        password,
        role: 'user'
      });

      const { uid, idToken, refreshToken } = response.data;

      // Fetch full structured profile
      const details = await axios.get(
        `${API_URL}/getUserDetails?uid=${uid}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      const fullUser: User = {
        success: true,
        uid,
        idToken,
        refreshToken,
        user: details.data.user,
      };

      await AsyncStorage.setItem("user", JSON.stringify(fullUser));

      set({
        user: fullUser,
        idToken,
        loading: false,
      });
    } catch (err: any) {
      set({ loading: false });
      console.error("Login error:", err.response?.data || err.message);
      throw new Error(err.response?.data?.error || err.message || "Login failed");
    }
  },

  fetchUserDetails: async (uid) => {
    try {
      const { idToken, user } = get();

      // Prefer passed token, or fallback to stored one
      const token = idToken || user?.idToken;

      if (!token) {
        console.warn("No idToken found in store.");
        throw new Error("Not authenticated.");
      }
      set({ loading: true });
      const response = await axios.get(
        `${API_URL}/getUserDetails?uid=${uid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedUser: User = {
        ...user!,
        success: true,
        user: response.data.user,
      };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (err: any) {
      console.error("Fetch user error:", err.response?.data || err.message);
      throw new Error(
        err.response?.data?.message || "Failed to fetch user details"
      );
    } finally {
      set({ loading: false });
    }
  },

  logout: async (uid: string) => {
    try {
      const { idToken, user } = get();

      // Prefer passed token, or fallback to stored one
      const token = idToken || user?.idToken;
      set({ loading: true });
      await axios.post(
        `${API_URL}/logoutUser`,
        {
          uid,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await AsyncStorage.removeItem("user");
      set({ user: null, loading: false });
    } catch (err) {
      set({ loading: false });
      console.error("Logout error:", err);
    }
  },

  loadUser: async () => {
    try {
      set({ loading: true });
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        set({ user });

      }
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      console.error("Load user error:", error);
    }
  },

  refreshToken: async () => {
    try {
      const { user } = get();
      if (!user?.refreshToken) return null;
      const response = await axios.post(`${API_URL}/refreshToken`, {
        refreshToken: user.refreshToken,
      });

      if (!response.data.success) {
        console.warn("Token refresh failed:", response.data.error);
        return null;
      }

      const { idToken, refreshToken } = response.data;
      const updatedUser = { ...user, idToken, refreshToken };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      set({ user: updatedUser, idToken });

      return idToken;
    } catch (error) {
      console.error("Refresh token error:", error);
      return null;
    }
  },
}));
