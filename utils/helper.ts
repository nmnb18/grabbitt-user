export const isValidPassword = (password: string) => {
    const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=<>/{}[\]|~])[A-Za-z\d@$!%*?&#^()_\-+=<>/{}[\]|~]{8,}$/;
    return regex.test(password);
};

export const isPaymentQR = (data: string): boolean => {
    return data.startsWith('upi://') || data.includes('upi://pay') || data.includes('@');
};

export const isGrabbittQR = (data: string): boolean => {
    return data.startsWith('grabbitt://');
};

// Extract QR ID from Grabbitt QR
export const extractGrabbittQRId = (data: string): string => {
    return data.replace('grabbitt://', '');
};

export const parseUPIQR = (qrData: string): any => {
    const params: any = {};

    if (qrData.startsWith('upi://')) {
        const url = new URL(qrData);
        url.searchParams.forEach((value, key) => {
            params[key] = value;
        });
    } else {
        // Handle other UPI formats
        const parts = qrData.split('&');
        parts.forEach(part => {
            const [key, value] = part.split('=');
            if (key && value) {
                params[key] = decodeURIComponent(value);
            }
        });
    }

    return params;
};

export const formatTimestamp = (timestamp: any) => {
    try {
        // Handle Firebase timestamp format: "November 26, 2025 at 11:08:39 AM UTC"
        // Remove " at " and " UTC" and parse
        const date = timestamp._seconds
            ? new Date(timestamp._seconds * 1000)
            : new Date(timestamp);

        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch (e) {
        console.warn("Failed to parse timestamp:", timestamp, e);
    }
};


