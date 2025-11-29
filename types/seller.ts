// Seller Business Types
export type BusinessType = 'restaurant' | 'retail' | 'service' | 'entertainment' | 'other';

// Subscription Tiers
export type SubscriptionTier = 'free' | 'pro' | 'premium';

// QR Code Types
export type QRCodeType = 'dynamic' | 'static' | 'static_hidden';

// Reward Types
export type RewardType = 'default' | 'percentage' | 'flat' | 'slab';

// Location Interface
export interface SellerLocation {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    latitude?: number;
    longitude?: number;
    enableLocation: boolean;
    locationRadius: number;
}

// Reward Configuration
export interface RewardConfig {
    rewardType: RewardType;
    defaultPoints?: number;
    percentageValue?: number;
    flatPoints?: number;
    slabRules?: Array<{
        min: number;
        max: number | null;
        points: number;
    }>;
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
export interface Seller {
    // Basic Info
    id: string;
    user_id: string;

    // Business Info
    shop_name: string;
    business_type: BusinessType;
    category: string;
    description: string;
    established_year?: number;

    // Contact Info
    email: string;
    phone: string;

    // Location
    location: SellerLocation;

    // Verification (Optional)
    gst_number?: string;
    pan_number?: string;
    business_registration_number?: string;

    // Subscription
    subscription: SubscriptionInfo;

    // Rewards & Points
    rewards: RewardConfig;
    points_per_visit: number;
    reward_points: number;
    reward_description?: string;

    // UPI
    upi: UPIInfo;

    // QR Code Preferences
    qr_code_type: QRCodeType;

    // Timestamps
    created_at: any; // Firestore Timestamp
    updated_at: any; // Firestore Timestamp
    last_active?: any; // Firestore Timestamp
}

// Simplified Seller for listing (to avoid sending sensitive data)
export interface SimplifiedSeller {
    id: string;
    shop_name: string;
    business_type: BusinessType;
    category: string;
    description: string;
    points_per_visit: number;
    reward_points: number;
    reward_description?: string;
    location: {
        city: string;
        state: string;
    };
    subscription: {
        tier: SubscriptionTier;
    };
}

// API Response Types
export interface SellersResponse {
    success: boolean;
    sellers: SimplifiedSeller[];
    error?: string;
}

export interface SellerResponse {
    success: boolean;
    seller: Seller;
    error?: string;
}