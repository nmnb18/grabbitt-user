// types/redemption.ts
export interface Redemption {
    id: string;
    redemption_id: string;
    seller_id: string;
    seller_name: string;
    seller_shop_name: string;
    user_id: string;
    points: number;
    status: 'pending' | 'redeemed' | 'cancelled' | 'expired';
    offer_id?: string;
    offer_name?: string;
    qr_data: string;
    qr_image_url?: string;
    qr_code_base64?: string;
    created_at: Date;
    updated_at: Date;
    redeemed_at?: Date;
    expires_at: Date;
}

export interface RedemptionRequest {
    seller_id: string;
    points: number;
    offer_id?: string;
    offer_name?: string;
}

export interface RedemptionResponse {
    success: boolean;
    redemption_id: string;
    qr_code_base64: string;
    qr_data: string;
    expires_at: Date;
    status: string;
    seller_name: string;
    points: number;
}

export interface UserRedemptionsResponse {
    success: boolean;
    redemptions: Redemption[];
    count: number;
}

// types/redemption.ts (add these interfaces)
// types/redemption.ts
export interface RedemptionHistoryItem {
    id: string;
    redemption_id: string;
    seller_id: string;
    seller_name: string;
    seller_shop_name: string;
    user_id: string;
    points: number;
    status: 'pending' | 'redeemed' | 'cancelled' | 'expired';
    offer_id?: string;
    offer_name?: string;
    qr_data: string;
    qr_code_base64?: string; // Now included
    qr_image_url?: string;
    created_at: Date | string;
    updated_at: Date | string;
    redeemed_at?: Date | string;
    expires_at: Date | string;
    metadata?: any;
}

export interface RedemptionHistoryResponse {
    success: boolean;
    redemptions: RedemptionHistoryItem[];
    count: number;
    stats: {
        total: number;
        pending: number;
        redeemed: number;
        cancelled: number;
        expired: number;
        total_points: number;
        redeemed_points: number;
        pending_points: number;
    };
}