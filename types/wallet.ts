// types/wallet.ts
export interface Offer {
    reward_points: number;
    reward_name: string;
    reward_description: string;
    reward_id?: string;
}
export interface StoreBalance {
    seller_id: string;
    seller_name: string;
    points: number;
    reward_points: number;
    reward_description: string;
    reward_type: string;
    can_redeem: boolean;
    offers: Offer[];
}

export interface Transaction {
    id: string;
    seller_id: string;
    seller_name: string;
    points: number;
    type: 'earn' | 'redeem' | 'payment';
    description: string;
    created_at: string;
    amount?: number; // for payment transactions
}

export interface WalletData {
    balances: StoreBalance[];
    transactions: Transaction[];
    total_points: number;
}