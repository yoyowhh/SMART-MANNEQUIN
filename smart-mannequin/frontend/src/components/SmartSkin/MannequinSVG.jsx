import { useMemo, useState } from "react";

const DEFAULT_LABELS = {
    back: "Punggung",
    "left-shoulder": "Bahu Kiri",
    "right-shoulder": "Bahu Kanan",
    "left-arm": "Lengan Kiri",
    "right-arm": "Lengan Kanan",
    "left-elbow": "Sikut Kiri",
    "right-elbow": "Sikut Kanan",
    "left-waist": "Pinggang Kiri",
    "right-waist": "Pinggang Kanan",
    "left-knee": "Lutut Kiri",
    "right-knee": "Lutut Kanan",
    "left-leg": "Kaki Kiri",
    "right-leg": "Kaki Kanan",

    // 14 Titik Hotspot Smart Skin (Suhu, Tekanan, Getaran)
    "back-1": "Punggung Kiri Atas",
    "back-2": "Punggung Kiri Bawah",
    "back-3": "Punggung Kanan Atas",
    "back-4": "Punggung Kanan Bawah",
    "chest-1": "Dada Kiri Atas",
    "chest-2": "Dada Kiri Bawah",
    "chest-3": "Dada Kanan Atas",
    "chest-4": "Dada Kanan Bawah",
    "arm-left-1": "Lengan Kiri Atas",
    "arm-left-2": "Lengan Kiri Bawah",
    "arm-right-1": "Lengan Kanan Atas",
    "arm-right-2": "Lengan Kanan Bawah",
    "leg-left-1": "Paha Kiri Atas",
    "leg-left-2": "Paha Kiri Tengah",
    "leg-left-3": "Paha Kiri Bawah",
    "leg-right-1": "Paha Kanan Atas",
    "leg-right-2": "Paha Kanan Tengah",
    "leg-right-3": "Paha Kanan Bawah",
};

// Palet warna per anatomi tubuh (Merah, Kuning, Biru cerah sesuai Visualisasi Manekin)
const PART_THEMES = {
    back: {
        color: "#ff3131", // Merah Cerah
        rgb: "255, 49, 49",
    },
    // 4 Titik Punggung (Merah Cerah)
    "back-1": { color: "#ff3131", rgb: "255, 49, 49" },
    "back-2": { color: "#ff3131", rgb: "255, 49, 49" },
    "back-3": { color: "#ff3131", rgb: "255, 49, 49" },
    "back-4": { color: "#ff3131", rgb: "255, 49, 49" },

    // 4 Titik Dada Depan (Merah Cerah)
    "chest-1": { color: "#ff3131", rgb: "255, 49, 49" },
    "chest-2": { color: "#ff3131", rgb: "255, 49, 49" },
    "chest-3": { color: "#ff3131", rgb: "255, 49, 49" },
    "chest-4": { color: "#ff3131", rgb: "255, 49, 49" },

    // 4 Titik Lengan (Kuning Cerah)
    "arm-left-1": { color: "#ffd21f", rgb: "255, 210, 31" },
    "arm-left-2": { color: "#ffd21f", rgb: "255, 210, 31" },
    "arm-right-1": { color: "#ffd21f", rgb: "255, 210, 31" },
    "arm-right-2": { color: "#ffd21f", rgb: "255, 210, 31" },

    // 6 Titik Kaki / Paha (Biru Royal Cerah)
    "leg-left-1": { color: "#2563eb", rgb: "37, 99, 235" },
    "leg-left-2": { color: "#2563eb", rgb: "37, 99, 235" },
    "leg-left-3": { color: "#2563eb", rgb: "37, 99, 235" },
    "leg-right-1": { color: "#2563eb", rgb: "37, 99, 235" },
    "leg-right-2": { color: "#2563eb", rgb: "37, 99, 235" },
    "leg-right-3": { color: "#2563eb", rgb: "37, 99, 235" },

    // Titik Sendi Flex & Strain (Warna Cerah Senada)
    "left-shoulder": {
        color: "#ff3131", // Merah Bahu
        rgb: "255, 49, 49",
    },
    "right-shoulder": {
        color: "#ff3131", // Merah Bahu
        rgb: "255, 49, 49",
    },
    "left-arm": {
        color: "#ffd21f", // Kuning Lengan
        rgb: "255, 210, 31",
    },
    "right-arm": {
        color: "#ffd21f", // Kuning Lengan
        rgb: "255, 210, 31",
    },
    "left-elbow": {
        color: "#ffd21f", // Kuning Cerah Sikut
        rgb: "255, 210, 31",
    },
    "right-elbow": {
        color: "#ffd21f", // Kuning Cerah Sikut
        rgb: "255, 210, 31",
    },
    "left-waist": {
        color: "#ff751f", // Orange Cerah Pinggang
        rgb: "255, 117, 31",
    },
    "right-waist": {
        color: "#ff751f", // Orange Cerah Pinggang
        rgb: "255, 117, 31",
    },
    "left-knee": {
        color: "#2563eb", // Biru Cerah Lutut
        rgb: "37, 99, 235",
    },
    "right-knee": {
        color: "#2563eb", // Biru Cerah Lutut
        rgb: "37, 99, 235",
    },
    "left-leg": {
        color: "#2563eb", // Biru Kaki
        rgb: "37, 99, 235",
    },
    "right-leg": {
        color: "#2563eb", // Biru Kaki
        rgb: "37, 99, 235",
    },
};

export default function MannequinHotspotSVG({
    className = "",
    side = "back",
    activePart,
    onClickPart,
    onHoverPart,
    onLeavePart,
    imageHref,
    visibleParts = null,
    labels = DEFAULT_LABELS,
}) {
    const [hoverId, setHoverId] = useState(null);

    const isFront = side === "front";
    const actualImageHref = imageHref || (isFront
        ? "/images/mannequin/Mannequin Full Body.png"
        : "/images/mannequin/Mannequin Back Full Body.png");

    const SENSORS = useMemo(
        () => {
            if (isFront) {
                return [
                    // --- 14 Titik SmartSkin Sesuai Diagram Manekin Depan ---
                    // 4 Titik Dada / Bahu (Merah Cerah)
                    { id: "chest-1",       x: 41.4, y: 25.1 },
                    { id: "chest-3",       x: 58.3, y: 25.1 },
                    { id: "chest-2",       x: 41.4, y: 31.1 },
                    { id: "chest-4",       x: 58.3, y: 31.1 },

                    // 4 Titik Lengan Depan (Kuning Cerah)
                    { id: "arm-left-1",   x: 32.0, y: 36.7 },
                    { id: "arm-right-1",  x: 67.3, y: 35.5 },
                    { id: "arm-left-2",   x: 31.0, y: 44.1 },
                    { id: "arm-right-2",  x: 69.0, y: 44.1 },

                    // 6 Titik Paha Depan (Biru Cerah)
                    { id: "leg-left-1",   x: 40.1, y: 78.5 },
                    { id: "leg-right-1",  x: 59.3, y: 78.5 },
                    { id: "leg-left-2",   x: 39.2, y: 86.0 },
                    { id: "leg-right-2",  x: 61.1, y: 86.0 },
                    { id: "leg-left-3",   x: 39.2, y: 93.4 },
                    { id: "leg-right-3",  x: 61.1, y: 93.4 },

                    // Titik Sendi Depan (Flex & Strain)
                    { id: "left-shoulder",  x: 34.0, y: 27.5 },
                    { id: "right-shoulder", x: 64.5, y: 27.5 },
                    { id: "left-elbow",     x: 27.5, y: 52.0 },
                    { id: "right-elbow",    x: 71.0, y: 52.0 },
                    { id: "left-waist",     x: 40.5, y: 65.0 },
                    { id: "right-waist",    x: 58.5, y: 65.0 },
                    { id: "left-knee",      x: 38.5, y: 104.0},
                    { id: "right-knee",     x: 59.5, y: 104.0},
                ];
            }

            return [
                // --- 14 Titik SmartSkin Sesuai Diagram Manekin Belakang ---
                // 4 Titik Punggung (Merah Cerah)
                { id: "back-1",       x: 40.7, y: 25.5 },
                { id: "back-3",       x: 57.7, y: 25.5 },
                { id: "back-2",       x: 40.7, y: 31.5 },
                { id: "back-4",       x: 57.7, y: 31.6 },

                // 4 Titik Lengan (Kuning Cerah)
                { id: "arm-left-1",   x: 31.3, y: 37.1 },
                { id: "arm-right-1",  x: 66.7, y: 36.0 },
                { id: "arm-left-2",   x: 30.3, y: 44.6 },
                { id: "arm-right-2",  x: 68.5, y: 44.6 },

                // 6 Titik Kaki / Paha (Biru Cerah)
                { id: "leg-left-1",   x: 39.5, y: 79.0 },
                { id: "leg-right-1",  x: 58.7, y: 79.0 },
                { id: "leg-left-2",   x: 38.5, y: 86.6 },
                { id: "leg-right-2",  x: 60.5, y: 86.6 },
                { id: "leg-left-3",   x: 38.5, y: 94.0 },
                { id: "leg-right-3",  x: 60.5, y: 94.0 },

                // Titik Standar / Flex & Strain Belakang
                { id: "back",           x: 49.5, y: 28.5 },
                { id: "left-arm",       x: 30.5, y: 41.0 },
                { id: "right-arm",      x: 67.5, y: 41.0 },
                { id: "left-leg",       x: 39.0, y: 86.0 },
                { id: "right-leg",      x: 59.5, y: 86.0 },
                { id: "left-shoulder",  x: 34.0, y: 27.5 },
                { id: "right-shoulder", x: 64.5, y: 27.5 },
                { id: "left-elbow",     x: 28.0, y: 52.0 },
                { id: "right-elbow",    x: 70.5, y: 52.0 },
                { id: "left-waist",     x: 40.5, y: 65.0 },
                { id: "right-waist",    x: 58.5, y: 65.0 },
                { id: "left-knee",      x: 38.5, y: 104.0},
                { id: "right-knee",     x: 59.5, y: 104.0},
            ];
        },
        [isFront]
    );

    const visibleSensors = visibleParts
        ? SENSORS.filter((s) => visibleParts.includes(s.id))
        : SENSORS;

    const isActive = (id) => activePart === id;
    const isHover = (id) => hoverId === id;

    // ======== ukuran titik ========
    const DOT_R = 2.4;
    const HALO_R = 4.8;

    const hoveredSensor = hoverId ? visibleSensors.find((s) => s.id === hoverId) : null;
    const activeHoverSensor = hoveredSensor || (activePart ? visibleSensors.find((s) => s.id === activePart) : null);

    const filterId = `neonGlow_${side}`;

    return (
        <svg
            className={className}
            viewBox="0 0 100 150"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur1" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="blur2" />
                    <feMerge>
                        <feMergeNode in="blur2" />
                        <feMergeNode in="blur1" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <image
                href={actualImageHref}
                x="0"
                y="0"
                width="100"
                height="150"
                preserveAspectRatio="xMidYMid meet"
                style={{ filter: "brightness(0.98) contrast(1.02)" }}
            />

            {visibleSensors.map((s) => {
                const active = isActive(s.id);
                const hover = isHover(s.id);
                const dimOthers = Boolean(hoverId || activePart) && !active && !hover;

                const theme = PART_THEMES[s.id] || { color: "#10b981", rgb: "16, 185, 129" };

                return (
                    <g
                        key={s.id}
                        onMouseEnter={() => {
                            setHoverId(s.id);
                            onHoverPart?.(s.id);
                        }}
                        onMouseLeave={() => {
                            setHoverId(null);
                            onLeavePart?.();
                        }}
                        onClick={() => onClickPart?.(s.id)}
                        style={{
                            cursor: "pointer",
                            transition: "all 180ms ease",
                            opacity: dimOthers ? 0.45 : 1,
                        }}
                    >
                        {/* Selected Active Ring Animation */}
                        {active && (
                            <circle
                                cx={s.x}
                                cy={s.y}
                                r={DOT_R + 3}
                                fill="none"
                                stroke={theme.color}
                                strokeWidth="0.8"
                                opacity="0.9"
                            >
                                <animate
                                    attributeName="r"
                                    values={`${DOT_R + 1.5};${DOT_R + 4.5};${DOT_R + 1.5}`}
                                    dur="1.6s"
                                    repeatCount="indefinite"
                                />
                                <animate
                                    attributeName="opacity"
                                    values="0.9;0.2;0.9"
                                    dur="1.6s"
                                    repeatCount="indefinite"
                                />
                            </circle>
                        )}

                        {/* Ambient Pulsing Outer Ring (Cerah seperti di Visualisasi Manekin) */}
                        <circle
                            cx={s.x}
                            cy={s.y}
                            r={DOT_R + 2.2}
                            fill="none"
                            stroke={theme.color}
                            strokeWidth="0.6"
                            opacity={active ? "0.9" : hover ? "0.85" : "0.55"}
                        >
                            <animate
                                attributeName="r"
                                values={`${DOT_R + 1};${DOT_R + 2.8};${DOT_R + 1}`}
                                dur="2.2s"
                                repeatCount="indefinite"
                            />
                            <animate
                                attributeName="opacity"
                                values="0.75;0.15;0.75"
                                dur="2.2s"
                                repeatCount="indefinite"
                            />
                        </circle>

                        {/* Soft Glow Underlay */}
                        <circle
                            cx={s.x}
                            cy={s.y}
                            r={hover ? HALO_R + 1 : HALO_R}
                            fill={`rgba(${theme.rgb}, 0.28)`}
                            opacity={active ? 0.9 : hover ? 0.85 : dimOthers ? 0.2 : 0.45}
                            style={{ transition: "all 180ms ease" }}
                        />

                        {/* Central Glowing Core Dot */}
                        <circle
                            cx={s.x}
                            cy={s.y}
                            r={hover ? DOT_R + 0.6 : DOT_R}
                            fill={theme.color}
                            filter={`url(#${filterId})`}
                            stroke={active ? "#ffffff" : "none"}
                            strokeWidth={active ? "0.6" : "0"}
                            style={{ transition: "all 180ms ease" }}
                        />

                        {/* Generous Hit Detection Area */}
                        <circle
                            cx={s.x}
                            cy={s.y}
                            r="6"
                            fill="transparent"
                            style={{ cursor: "pointer", pointerEvents: "all" }}
                        />
                    </g>
                );
            })}

            {/* Hover Tooltip Popup with Part Name (Rendered on top) */}
            {hoverId && activeHoverSensor && (() => {
                const labelText = labels[activeHoverSensor.id] || DEFAULT_LABELS[activeHoverSensor.id] || activeHoverSensor.id;
                const theme = PART_THEMES[activeHoverSensor.id] || { color: "#10b981" };
                const textLen = labelText.length;
                const boxW = Math.max(22, textLen * 2.3 + 6);
                const boxH = 6.8;

                let tx = activeHoverSensor.x - boxW / 2;
                if (tx < 2) tx = 2;
                if (tx + boxW > 98) tx = 98 - boxW;

                let ty = activeHoverSensor.y - 10;
                if (ty < 2) {
                    ty = activeHoverSensor.y + 6;
                }

                return (
                    <g pointerEvents="none" className="transition-all duration-150">
                        {/* Tooltip Background */}
                        <rect
                            x={tx}
                            y={ty}
                            width={boxW}
                            height={boxH}
                            rx="2.2"
                            fill="#0f172a"
                            stroke={theme.color}
                            strokeWidth="0.8"
                            opacity="0.96"
                        />
                        {/* Tooltip Text */}
                        <text
                            x={tx + boxW / 2}
                            y={ty + 4.6}
                            fill="#ffffff"
                            fontSize="3"
                            fontWeight="700"
                            textAnchor="middle"
                            fontFamily="system-ui, -apple-system, sans-serif"
                            letterSpacing="0.2"
                        >
                            {labelText}
                        </text>
                    </g>
                );
            })()}
        </svg>
    );
}
