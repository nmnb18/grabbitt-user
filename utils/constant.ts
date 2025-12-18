import { PerkStatus } from "@/types/perks";
import { Colors } from "./theme";

export const ROLE = 'seller';
// Constants for business types and categories
export const BUSINESS_TYPES = [
    { label: 'Retail Store', value: 'retail' },
    { label: 'Restaurant/Cafe', value: 'restaurant' },
    { label: 'Service Business', value: 'service' },
    { label: 'FMCG/Manufacturer', value: 'fmcg' },
    { label: 'Other', value: 'other' },
];

export const CATEGORIES = {
    retail: [
        'Electronics', 'Fashion & Apparel', 'Home & Kitchen', 'Beauty & Personal Care',
        'Sports & Outdoors', 'Books & Stationery', 'Jewelry & Accessories', 'Other Retail'
    ],
    restaurant: [
        'Fine Dining', 'Casual Dining', 'Fast Food', 'Cafe & Bakery',
        'Food Truck', 'Bar & Pub', 'Other Food Service'
    ],
    service: [
        'Salon & Spa', 'Repair Services', 'Professional Services', 'Health & Wellness',
        'Education & Training', 'Other Services'
    ],
    fmcg: [
        'Food & Beverages', 'Personal Care', 'Household Care', 'Healthcare',
        'Other FMCG'
    ],
    other: ['Other']
};

export const QR_CODE_TYPES = [
    { value: 'dynamic', label: 'Dynamic QR', description: 'Expires after use' },
    { value: 'static', label: 'Static QR', description: 'Once per day per customer' },
    { value: 'static_hidden', label: 'Static with Hidden Code', description: 'For product packaging' },
];


export const PERK_STATUS_META: Record<
    PerkStatus,
    {
        label: string;
        icon: string;
        colorKey: "success" | "warning" | "error";
    }
> = {
    CLAIMED: {
        label: "Claimed",
        icon: "qrcode",
        colorKey: "warning",
    },
    REDEEMED: {
        label: "Redeemed",
        icon: "check-circle",
        colorKey: "success",
    },
    EXPIRED: {
        label: "Expired",
        icon: "clock-alert",
        colorKey: "error",
    },
};
