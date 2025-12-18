export type PerkStatus =
    | "CLAIMED"   // claimed but not redeemed
    | "REDEEMED"  // successfully redeemed
    | "EXPIRED";  // auto expired by cron


// Firestore stored shape
export interface UserPerkItem {
    perk_id: string;

    // Store
    seller_id: string;
    shop_name: string;
    shop_logo_url?: string;

    // Offer
    offer_title: string;
    min_spend: string;
    terms: string;

    // Redemption
    redeem_code: string | null;
    status: PerkStatus;

    // Dates
    expiry_date: string;     // YYYY-MM-DD
    created_at: string;      // ISO string
    redeemed_at?: string | null;
}


export interface UserPerksHistoryResponse {
    success: true;
    total: number;
    perks: UserPerkItem[];
}