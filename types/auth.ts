export interface SellerStats {
    total_scans: number;
    total_points_distributed: number;
    active_customers: number;
    monthly_scans: number;
}
export interface SellerMedia {
    logo_url?: string | null;
    banner_url?: string | null;
    gallery_urls: string[];
}
export interface SellerQRSettings {
    qr_code_type: "static" | "dynamic" | "static_hidden";
}
export interface SellerSubscription {
    tier: "free" | "pro" | "premium";
    monthly_limit: number;
    price: number;
    status: "active" | "expired" | "canceled";
    period_start: FirebaseTimestamp | null;
    expires_at: FirebaseTimestamp | null;
}
export interface SellerRewards {
    default_points_value: number;
    reward_points: number;
    reward_description?: string;
    reward_name?: string;
}export interface SellerVerification {
    gst_number?: string | null;
    pan_number?: string | null;
    business_registration_number?: string | null;
    status: "pending" | "approved" | "rejected";
    is_verified: boolean;
}
export interface SellerAddress {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
}

export interface SellerLocation {
    address: SellerAddress;
    lat?: number | null;
    lng?: number | null;
    radius_meters?: number | null;
}
export interface SellerBusiness {
    shop_name: string;
    business_type: string;
    category: string;
    description?: string;
}
export interface SellerAccount {
    name: string;
    email: string;
    phone: string;
    established_year?: number | null;
}

export interface SellerSettings {
    notifications_enabled: boolean;
    email_notifications: boolean;
    push_notifications: boolean;
}
export interface SellerProfile {
    user_id: string;

    account: SellerAccount;
    business: SellerBusiness;
    location: SellerLocation;
    verification: SellerVerification;
    rewards: SellerRewards;
    subscription: SellerSubscription;
    qr_settings: SellerQRSettings;
    media: SellerMedia;
    stats: SellerStats;
    settings: SellerSettings;

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