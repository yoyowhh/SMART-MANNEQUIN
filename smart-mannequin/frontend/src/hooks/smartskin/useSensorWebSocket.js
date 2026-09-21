import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

import { API_BASE_URL } from '../../service/config';

const WS_URL = import.meta.env.VITE_SMARTSKIN_API_URL || API_BASE_URL || 'http://localhost:4013';

export function useSensorWebSocket(mannequinId = '1') {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [latestBatch, setLatestBatch] = useState([]);
    const [connectionEpoch, setConnectionEpoch] = useState(0);

    useEffect(() => {
        const socket = io(`${WS_URL}/sensor`, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1500,
            reconnectionAttempts: 15,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            setConnectionEpoch((n) => n + 1);
        });
        socket.on('disconnect', () => setIsConnected(false));
        socket.on('connect_error', () => setIsConnected(false));

        socket.on('sensor-batch-update', (readings) => {
            if (Array.isArray(readings)) {
                const filtered = readings.filter((r) => String(r.mannequin_id) === String(mannequinId));
                if (filtered.length > 0) setLatestBatch(filtered);
            }
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [mannequinId]);

    return { isConnected, latestBatch, connectionEpoch, wsUrl: WS_URL };
}
