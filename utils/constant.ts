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

export const SUBSCRIPTION_PLANS = {
    free: {
        name: 'General',
        monthlyLimit: 10,
        qrFlexibility: 'single-type',
        changeType: false,
        price: 0,
        billing: 'month',
    },
    pro: {
        name: 'Pro',
        monthlyLimit: Infinity,
        qrFlexibility: 'single-type',
        changeType: true,
        price: 299,
        billing: 'month',
    },
    premium: {
        name: 'Premium',
        monthlyLimit: Infinity,
        qrFlexibility: 'all-types',
        changeType: true,
        price: 2999,
        billing: 'year',
    },
};

export const PLANS = [
    {
        id: 'free',
        name: 'General',
        price: '₹0 / month',
        color: Colors.light.accent,
        features: [
            'Generate up to 10 QRs per month',

            'Basic analytics (points & scans summary)',
            'Email support only',
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '₹299 / month',
        color: Colors.light.secondary,
        features: [
            'Unlimited QR generation (single type)',
            'Access to one QR type (chosen at registration)',
            'Advanced analytics dashboard',
            'Priority support via phone/chat/email',
        ],
    },
    {
        id: 'premium',
        name: 'Premium',
        price: '₹2999 / year',
        color: Colors.light.primary,
        features: [
            'Unlimited dynamic + static QR creation',
            'Full flexibility to change QR type anytime',
            'AI-based insights & fraud detection',
            'Dedicated account manager & premium support',
        ],
    },
];