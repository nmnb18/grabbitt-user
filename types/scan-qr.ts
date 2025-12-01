// Types
export interface PaymentSeller {
    id: string;
    shop_name: string;
    upi_ids: string[];
    rewards?: any;
}

export interface UPIQRData {
    pa?: string;
    pn?: string;
    am?: string;
    [key: string]: string | undefined;
}

// Add to your types/scan-qr.ts
export interface ScanResult {
    sellerName: string;
    pointsEarned: number;
    totalPoints: number;
    message: string;
    amount?: number; // For payment scans
    timestamp: string;
    type: 'grabbitt_scan' | 'payment';
}