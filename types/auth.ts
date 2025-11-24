
export interface UserAddress {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
}

export interface UserLocation {
    lat?: number | null;
    lng?: number | null;
}
export interface UserAccount {
    name: string;
    email: string;
    phone: string;
}

export interface UserSettings {
    notifications_enabled: boolean;
    email_notifications: boolean;
    push_notifications: boolean;
}
export interface UserProfile {
    user_id: string;
    address: UserAddress;
    account: UserAccount;
    location: UserLocation;
    preferences: UserSettings;
    created_at?: FirebaseTimestamp;
    updated_at?: FirebaseTimestamp;
    last_active?: FirebaseTimestamp;
}

export interface FirebaseTimestamp {
    _seconds: number;
    _nanoseconds: number;
}

export interface AppUser {
    uid: string;
    email: string;
    name: string;
    phone?: string;
    role: "seller" | "user";
    createdAt?: FirebaseTimestamp;
    updatedAt?: FirebaseTimestamp;
    customer_profile?: UserProfile;
}

export interface LoginResponse {
    success: boolean;
    uid: string;
    idToken: string;
    refreshToken: string;
    user: AppUser;
}


export type UserPayload = {
    email: string;
    name: string;
    phone: string;
    password: string;
    lat?: number | null;
    lng?: number | null;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    acceptTerms?: boolean;
}