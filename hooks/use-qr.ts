// hooks/use-qr.ts
import api from '@/services/axiosInstance';
import { useCallback, useEffect, useRef, useState } from 'react';

export type QRMode = 'dynamic' | 'static' | 'static_hidden';

export interface ActiveQR {
    qr_id: string;
    qr_type: QRMode;
    qr_code_base64: string;
    expires_at?: any;
    hidden_code?: string | null;
    status?: string;
    [key: string]: any;
}

interface UseSellerQROptions {
    autoLoad?: boolean;
    pollIntervalMs?: number;
}

export function useSellerQR(options?: UseSellerQROptions) {
    const [activeQR, setActiveQR] = useState<ActiveQR | null>(null);
    const [loadingQR, setLoadingQR] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pollInterval = options?.pollIntervalMs ?? 60000;

    // track interval
    const intervalRef = useRef<NodeJS.Timeout | null | number>(null);

    // --- Fetch active QR ---
    const fetchActiveQR = useCallback(async () => {
        try {
            setError(null);
            setLoadingQR(true);

            const resp = await api.get('/qr-code/get-active-qr');

            if (resp.status === 200 && resp.data?.success && resp.data.data) {
                setActiveQR(resp.data.data);
            } else {
                setActiveQR(null);
            }
        } catch (err: any) {
            if (err?.response?.status === 204) {
                setActiveQR(null);
            } else {
                setError(err?.response?.data?.error || 'Failed to load QR');
            }
        } finally {
            setLoadingQR(false);
        }
    }, []);

    // --- Smart Poll Start/Stop ---
    const startPolling = useCallback(() => {
        if (intervalRef.current) return; // already polling

        intervalRef.current = setInterval(() => {
            fetchActiveQR();
        }, pollInterval);
    }, [fetchActiveQR, pollInterval]);

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // --- Start initial load ---
    useEffect(() => {
        if (options?.autoLoad !== false) {
            fetchActiveQR();
        }
        return () => stopPolling(); // cleanup
    }, []);

    // --- Decide when to poll ---
    useEffect(() => {
        stopPolling(); // reset first

        if (!activeQR) {
            return;
        }

        if (activeQR.qr_type !== 'dynamic') {
            return;
        }

        // For dynamic QR → check if expired
        const expiresAt = activeQR.expires_at
            ? new Date(activeQR.expires_at)
            : null;

        if (!expiresAt) {
            return;
        }

        // If already expired → stop
        if (expiresAt.getTime() <= Date.now()) {
            setActiveQR(null);
            return;
        }

        // Otherwise → start polling
        startPolling();

        return () => stopPolling();
    }, [activeQR]);

    // --- Create QR ---
    const generateQR = useCallback(
        async (payload: any) => {
            const resp = await api.post('/qr-code/generate-qr', payload);
            await fetchActiveQR(); // refresh active QR
            return resp;
        },
        [fetchActiveQR]
    );

    return {
        activeQR,
        loadingQR,
        error,
        fetchActiveQR,
        generateQR,
        setActiveQR,
    };
}
