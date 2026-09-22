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
};

// Palet warna per anatomi tubuh (Kiri dan Kanan berwarna sama)
const PART_THEMES = {
    back: {
        color: "#ef4444", // Crimson Red
        rgb: "239, 68, 68",
    },
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
            { id: "back",           x: 50,   y: 30  },
            { id: "left-arm",       x: 34,   y: 45  },
            { id: "right-arm",      x: 67,   y: 45  },
            { id: "left-leg",       x: 43.2, y: 85  },
            { id: "right-leg",      x: 58.2, y: 85  },
            { id: "left-shoulder",  x: 36,   y: 38  },
            { id: "right-shoulder", x: 64,   y: 38  },
            { id: "left-elbow",     x: 30,   y: 58  },
            { id: "right-elbow",    x: 71,   y: 58  },
            { id: "left-waist",     x: 39,   y: 72  },
            { id: "right-waist",    x: 61,   y: 72  },
            { id: "left-knee",      x: 42,   y: 110 },
            { id: "right-knee",     x: 59,   y: 110 },
        ],
        []
    );

    const visibleSensors = visibleParts
        ? SENSORS.filter((s) => visibleParts.includes(s.id))
        : SENSORS;

    const isActive = (id) => activePart === id;
    const isHover = (id) => hoverId === id;

    // ======== ukuran ========
    const DOT_R = 2.4;
    const HALO_R = 6.5;

    // ======== pulse ========
    const PULSE_R_FROM = HALO_R - 1;
    const PULSE_R_TO = HALO_R + 7;
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

                const dotFill = `rgb(${theme.rgb})`;
                const ringStroke = theme.color;
                const haloFill = `rgba(${theme.rgb}, 0.28)`;

                const haloOpacity = active ? 0.75 : hover ? 0.85 : dimOthers ? 0.18 : 0.4;
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
                        {(active || hover) && (
                            <circle
                                cx={s.x}
                                cy={s.y}
                                r={PULSE_R_FROM}
                                fill="transparent"
                                stroke={theme.color}
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
