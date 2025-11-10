export type User = {
    uid: string;
    email: string;
    name: string;
    idToken?: string;
    shopName: string;
    role: string;
    phone: string;
    // Add additional fields that might be returned from backend
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