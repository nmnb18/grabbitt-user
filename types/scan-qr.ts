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