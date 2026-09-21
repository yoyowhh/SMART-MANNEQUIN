import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_SMARTSKIN_API_URL || 'http://localhost:3001';
const POLL_INTERVAL_MS = 5000;

export function useMannequinHealth(mannequinId = '1') {
    const [health, setHealth] = useState({
        lastSeen: null,
        secondsAgo: null,
        status: null,
    });

    useEffect(() => {
        let cancelled = false;
        let controller = null;

        const fetchHealth = async () => {
            controller?.abort();
            controller = new AbortController();

            try {
                const res = await fetch(
                    `${API_BASE}/lora/health?mid=${mannequinId}`,
                    { cache: 'no-store', signal: controller.signal }
                );
                if (!res.ok) return;
                const data = await res.json();
                if (cancelled) return;
                setHealth({
                    lastSeen: data.lastSeen ?? null,
                    secondsAgo: data.secondsAgo ?? null,
                    status: data.status ?? null,
                });
            } catch (err) {
                // Ignore transient errors
            }
        };

        fetchHealth();
        const timerId = setInterval(fetchHealth, POLL_INTERVAL_MS);

        return () => {
            cancelled = true;
            clearInterval(timerId);
            controller?.abort();
        };
    }, [mannequinId]);

    return health;
}
