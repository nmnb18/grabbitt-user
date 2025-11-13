let expiryTimer: number | null = null;

export const clearSubscriptionWatcher = () => {
    if (expiryTimer) clearTimeout(expiryTimer);
};

export const startSubscriptionWatcher = (
    expiryTimestamp: number | null,
    onExpireCallback: () => void
) => {
    clearSubscriptionWatcher();

    if (!expiryTimestamp) return;

    const now = Date.now();
    const remaining = expiryTimestamp - now;

    // Already expired → refresh immediately
    if (remaining <= 0) {
        onExpireCallback();
        return;
    }

    expiryTimer = setTimeout(() => {
        onExpireCallback();
    }, remaining);
};
