// utils/types/user.ts

export interface SellerProfile {
    active_customers: number;
    address?: Record<string, any>; // Replace with specific address type if you have one
    banner_url?: string | null;
    business_registration_number?: string | null;
    business_type?: string;
    category?: string;
    created_at?: FirebaseTimestamp;
    default_points_value?: number;
    description?: string;
    email: string;
    email_notifications?: boolean;
    gallery_urls?: string[];
    gst_number?: string | null;
    is_verified?: boolean;
    last_active?: FirebaseTimestamp;
    location_lat?: number | null;
    location_lng?: number | null;
    location_radius_meters?: number;
    logo_url?: string | null;
    monthly_scans?: number;
    notifications_enabled?: boolean;
    pan_number?: string | null;
    phone: string;
    push_notifications?: boolean;
    qr_code_type?: "static" | "dynamic" | "static_hidden";
    shop_name: string;
    subscription_tier?: "free" | "pro" | "premium";
    total_points_distributed?: number;
    total_scans?: number;
    updated_at?: FirebaseTimestamp;
    user_id: string;
    subscription_expiry?: FirebaseTimestamp;
    verification_status?: "pending" | "approved" | "rejected";
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
    shopName?: string;
    createdAt?: FirebaseTimestamp;
    updatedAt?: FirebaseTimestamp;
    seller_profile?: SellerProfile;
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
    shopName: string;
    phone: string;
    password: string;
    latitude?: number | null;
    longitude?: number | null;
    businessType?: string;
    category?: string;
    description?: string;
    establishedYear?: number;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    enableLocation?: boolean;
    locationRadius?: number;
    gstNumber?: string;
    panNumber?: string;
    businessRegistrationNumber?: string;
    qrCodeType?: string;
    defaultPoints?: number;
    subscriptionTier?: string;
    acceptTerms?: boolean;
}