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

// Palet warna per anatomi tubuh (Kiri dan Kanan berwarna sama)
const PART_THEMES = {
    back: {
        color: "#ef4444", // Crimson Red
        rgb: "239, 68, 68",
    },
    // 4 Titik Punggung (Merah)
    "back-1": { color: "#ef4444", rgb: "239, 68, 68" },
    "back-2": { color: "#ef4444", rgb: "239, 68, 68" },
    "back-3": { color: "#ef4444", rgb: "239, 68, 68" },
    "back-4": { color: "#ef4444", rgb: "239, 68, 68" },

    // 4 Titik Lengan (Pink)
    "arm-left-1": { color: "#ec4899", rgb: "236, 72, 153" },
    "arm-left-2": { color: "#ec4899", rgb: "236, 72, 153" },
    "arm-right-1": { color: "#ec4899", rgb: "236, 72, 153" },
    "arm-right-2": { color: "#ec4899", rgb: "236, 72, 153" },

    // 6 Titik Kaki / Paha (Biru Navy)
    "leg-left-1": { color: "#1d4ed8", rgb: "29, 78, 216" },
    "leg-left-2": { color: "#1d4ed8", rgb: "29, 78, 216" },
    "leg-left-3": { color: "#1d4ed8", rgb: "29, 78, 216" },
    "leg-right-1": { color: "#1d4ed8", rgb: "29, 78, 216" },
    "leg-right-2": { color: "#1d4ed8", rgb: "29, 78, 216" },
    "leg-right-3": { color: "#1d4ed8", rgb: "29, 78, 216" },

    "left-shoulder": {
        color: "#0284c7", // Sky Blue
        rgb: "2, 132, 199",
    },
    "right-shoulder": {
        color: "#0284c7", // Sky Blue (sama dengan kiri)
        rgb: "2, 132, 199",
    },
    "left-arm": {
        color: "#8b5cf6", // Purple
        rgb: "139, 92, 246",
    },
    "right-arm": {
        color: "#8b5cf6", // Purple (sama dengan kiri)
        rgb: "139, 92, 246",
    },
    "left-elbow": {
        color: "#f59e0b", // Amber Orange
        rgb: "245, 158, 11",
    },
    "right-elbow": {
        color: "#f59e0b", // Amber Orange (sama dengan kiri)
        rgb: "245, 158, 11",
    },
    "left-waist": {
        color: "#ec4899", // Pink Rose
        rgb: "236, 72, 153",
    },
    "right-waist": {
        color: "#ec4899", // Pink Rose (sama dengan kiri)
        rgb: "236, 72, 153",
    },
    "left-knee": {
        color: "#10b981", // Emerald Green
        rgb: "16, 185, 129",
    },
    "right-knee": {
        color: "#10b981", // Emerald Green (sama dengan kiri)
        rgb: "16, 185, 129",
    },
    "left-leg": {
        color: "#6366f1", // Indigo
        rgb: "99, 102, 241",
    },
    "right-leg": {
        color: "#6366f1", // Indigo (sama dengan kiri)
        rgb: "99, 102, 241",
    },
};

export default function MannequinHotspotSVG({
    className = "",
    activePart,
    onClickPart,
    onHoverPart,
    onLeavePart,
    imageHref = "/mannequin-back.png",
    visibleParts = null,
    labels = DEFAULT_LABELS,
}) {
    const [hoverId, setHoverId] = useState(null);

    const SENSORS = useMemo(
        () => [
            // --- 14 Titik SmartSkin Sesuai Gambar Manekin ---
            // 4 Titik Punggung (Merah)
            { id: "back-1",       x: 40.7, y: 25.4 },
            { id: "back-2",       x: 40.7, y: 31.4 },
            { id: "back-3",       x: 57.7, y: 25.4 },
            { id: "back-4",       x: 57.7, y: 31.4 },

            // 4 Titik Lengan (Pink)
            { id: "arm-left-1",   x: 31.2, y: 37.0 },
            { id: "arm-left-2",   x: 30.2, y: 44.5 },
            { id: "arm-right-1",  x: 66.7, y: 35.8 },
            { id: "arm-right-2",  x: 68.6, y: 44.5 },

            // 6 Titik Kaki / Paha (Biru)
            { id: "leg-left-1",   x: 39.4, y: 78.9 },
            { id: "leg-left-2",   x: 38.4, y: 86.3 },
            { id: "leg-left-3",   x: 38.4, y: 93.8 },
            { id: "leg-right-1",  x: 58.7, y: 78.9 },
            { id: "leg-right-2",  x: 60.6, y: 86.4 },
            { id: "leg-right-3",  x: 60.6, y: 93.8 },

            // --- Titik Standar / Flex & Strain ---
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
        ],
        []
    );

    const visibleSensors = visibleParts
        ? SENSORS.filter((s) => visibleParts.includes(s.id))
        : SENSORS;

    const isActive = (id) => activePart === id;
    const isHover = (id) => hoverId === id;

    // ======== ukuran ========
    const DOT_R = 2.2;
    const HALO_R = 5.2;

    // ======== pulse ========
    const PULSE_R_FROM = HALO_R - 0.5;
    const PULSE_R_TO = HALO_R + 4.5;
    const PULSE_DUR = "1.2s";

    const hoveredSensor = hoverId ? visibleSensors.find((s) => s.id === hoverId) : null;
    const activeHoverSensor = hoveredSensor || (activePart ? visibleSensors.find((s) => s.id === activePart) : null);

    return (
        <svg
            className={className}
            viewBox="0 0 100 150"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur1" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur2" />
                    <feMerge>
                        <feMergeNode in="blur2" />
                        <feMergeNode in="blur1" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <image
                href={imageHref}
                x="0"
                y="0"
                width="100"
                height="150"
                preserveAspectRatio="xMidYMid meet"
            />

            {visibleSensors.map((s) => {
                const active = isActive(s.id);
                const hover = isHover(s.id);
                const dimOthers = Boolean(hoverId || activePart) && !active && !hover;

                const theme = PART_THEMES[s.id] || { color: "#10b981", rgb: "16, 185, 129" };
                const activeOrHover = active || hover;
                const highlightColor = "#10b981";
                const highlightRgb = "16, 185, 129";

                const dotFill = active ? `rgb(${highlightRgb})` : `rgb(${theme.rgb})`;
                const ringStroke = activeOrHover ? highlightColor : theme.color;
                const haloFill = activeOrHover ? `rgba(${highlightRgb}, 0.35)` : `rgba(${theme.rgb}, 0.28)`;

                const haloOpacity = active ? 0.85 : hover ? 0.9 : dimOthers ? 0.18 : 0.4;
                const ringOpacity = active ? 1 : hover ? 1 : dimOthers ? 0.35 : 0.8;
                const dotOpacity = active ? 1 : hover ? 1 : dimOthers ? 0.5 : 0.95;

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
                            opacity: dimOthers ? 0.65 : 1,
                        }}
                    >
                        {activeOrHover && (
                            <circle
                                cx={s.x}
                                cy={s.y}
                                r={PULSE_R_FROM}
                                fill="transparent"
                                stroke={highlightColor}
                                strokeWidth="1.6"
                                opacity="0.8"
                                pointerEvents="none"
                            >
                                <animate
                                    attributeName="r"
                                    values={`${PULSE_R_FROM};${PULSE_R_TO}`}
                                    dur={PULSE_DUR}
                                    repeatCount="indefinite"
                                />
                                <animate
                                    attributeName="opacity"
                                    values="0.8;0"
                                    dur={PULSE_DUR}
                                    repeatCount="indefinite"
                                />
                            </circle>
                        )}

                        {/* Halo glow */}
                        <circle
                            cx={s.x}
                            cy={s.y}
                            r={hover ? HALO_R + 1.5 : HALO_R}
                            fill={haloFill}
                            opacity={haloOpacity}
                            style={{ transition: "all 180ms ease" }}
                        />
                        {/* Outer ring */}
                        <circle
                            cx={s.x}
                            cy={s.y}
                            r={hover ? HALO_R - 0.5 : HALO_R - 1.8}
                            fill="transparent"
                            stroke={ringStroke}
                            strokeWidth={hover ? "1.8" : "1.4"}
                            opacity={ringOpacity}
                            style={{ transition: "all 180ms ease" }}
                        />
                        {/* Central dot */}
                        <circle
                            cx={s.x}
                            cy={s.y}
                            r={hover ? DOT_R + 0.8 : DOT_R}
                            fill={dotFill}
                            opacity={dotOpacity}
                            filter={hover || active ? "url(#neonGlow)" : "none"}
                            style={{ transition: "all 180ms ease" }}
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
                            stroke="#10b981"
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
