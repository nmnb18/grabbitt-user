// Seller Business Types
export type BusinessType = 'restaurant' | 'retail' | 'service' | 'entertainment' | 'other';

// Subscription Tiers
export type SubscriptionTier = 'free' | 'pro' | 'premium';

// QR Code Types
export type QRCodeType = 'dynamic' | 'static' | 'static_hidden';

// Reward Types
export type RewardType = 'default' | 'percentage' | 'flat' | 'slab';

// Reward Configuration
export interface SellerRewards {
    default_points_value: number;
    offers?: {
        reward_points: number;
        reward_name: string;
        reward_description: string;
    }[];
    percentage_value?: string;

    reward_type?: string;
    flat_points?: string;
    reward_name?: string;
    reward_description?: string
    slab_rules?: {
        min: number;
        max: number;
        points: number;
    }[];
    upi_ids?: string[]
}
export interface SellerVerification {
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

// Subscription Information
export interface SubscriptionInfo {
    tier: SubscriptionTier;
    expires_at: any; // Firestore Timestamp
    qr_limit: number;
    updated_at: any; // Firestore Timestamp
    last_payment?: {
        order_id: string;
        razorpay_order_id: string;
        payment_id: string;
        amount: number;
        environment: string;
        paid_at: any; // Firestore Timestamp
    };
}

// UPI Information
export interface UPIInfo {
    upi_ids: string[];
    default_upi_id?: string;
}

// Main Seller Interface


// Simplified Seller for listing (to avoid sending sensitive data)
export interface SimplifiedSeller {
    address: string;
    phone: string;
    distance_km: undefined;
    id: string;
    shop_name: string;
    business_type: BusinessType;
    category: string;
    description: string;
    points_per_visit: number;
    reward_points: number;
    logo?: string;
    banner?: string;
    reward_description?: {
        text: any,
        type: string
    };
    location: {
        city: string;
        state: string;
    };
    subscription: {
        tier: SubscriptionTier;
    };
    perksAvailable: boolean;
}

// API Response Types
export interface SellersResponse {
    success: boolean;
    sellers: SimplifiedSeller[];
    error?: string;
}
export interface SellerBusiness {
    shop_name: string;
    business_type: string;
    category: string;
    description?: string;
}
// types/store.ts
export interface StoreDetails {
    user_id: string;
    account: {
        email: string;
        name: string;
        phone: string;
        established_year: string;
    };
    business: SellerBusiness;
    location: SellerLocation;
    media: SellerMedia;
    rewards: SellerRewards;
    stats: SellerStats;
    created_at: string;
    last_active: string;
}

export interface ApiResponse {
    success: boolean;
    user: {
        seller_profile: StoreDetails
    };
    error?: string;
}