import React from "react";
import { useNavigate } from "react-router-dom";

// Definisi lengkap 10 sensor anatomis mannequin sesuai dashboard
const SENSOR_HOTSPOTS = [
  {
    key: "camera",
    name: "Kamera Vision",
    tag: "VISION AI",
    route: "/sensor/camera",
    color: "#3B82F6", // Royal Blue
    locationName: "Wajah / Vision Mount",
    shape: "circle",
    cx: 200,
    cy: 54,
    r: 8.5,
  },
  {
    key: "sound",
    name: "Sensor Suara (KY-601/602)",
    tag: "AKUSTIK",
    route: "/sensor/sound",
    color: "#10B981", // Emerald Green
    locationName: "Binaural Ears (Telinga Kiri & Kanan)",
    shape: "multi-circle",
    nodes: [
      { cx: 178, cy: 68, label: "Telinga Kiri (KY-601)" },
      { cx: 222, cy: 68, label: "Telinga Kanan (KY-602)" },
    ],
  },
  {
    key: "gas",
    name: "Sensor Gas",
    tag: "LINGKUNGAN",
    route: "/sensor/gas",
    color: "#14B8A6", // Teal
    locationName: "Hidung / Saluran Pernafasan",
    shape: "circle",
    cx: 200,
    cy: 84,
    r: 8,
  },
  {
    key: "smartskin",
    name: "SmartSkin (E-Skin Matriks)",
    tag: "E-SKIN MATRIKS",
    route: "/sensor/smartskin",
    color: "#00BA88", // Bright Mint
    locationName: "Matriks Bahu & Tubuh",
    shape: "multi-circle",
    nodes: [
      { cx: 158, cy: 105, label: "Bahu Kiri (E-Skin Matriks)" },
      { cx: 242, cy: 105, label: "Bahu Kanan (E-Skin Matriks)" },
    ],
  },
  {
    key: "bme",
    name: "Sensor BME280",
    tag: "MIKROKLIMAT",
    route: "/sensor/bme",
    color: "#06B6D4", // Cyan
    locationName: "Dada Tengah (Sternum)",
    shape: "circle",
    cx: 200,
    cy: 145,
    r: 9.5,
  },
  {
    key: "lidar",
    name: "Sensor LiDAR",
    tag: "JARAK 3D",
    route: "/sensor/lidar",
    color: "#0284C7", // Sky Blue
    locationName: "Dada Bawah / Perimeter Torso",
    shape: "triangle",
    cx: 200,
    cy: 180,
  },
  {
    key: "adxl",
    name: "Sensor ADXL345",
    tag: "KINEMATIKA",
    route: "/sensor/adxl",
    color: "#F59E0B", // Amber
    locationName: "Lumbar Spine / Pinggang Belakang",
    shape: "circle",
    cx: 200,
    cy: 215,
    r: 9,
  },
  {
    key: "smartskin",
    name: "SmartSkin",
    tag: "E-SKIN",
    route: "/sensor/smartskin",
    color: "#EC4899", // Rose Pink
    locationName: "Matriks Kontak SmartSkin (Telapak & Lengan)",
    shape: "multi-circle",
    nodes: [
      { cx: 112, cy: 242, label: "Matriks Kiri" },
      { cx: 288, cy: 242, label: "Matriks Kanan" },
    ],
  },
  {
    key: "mpu",
    name: "Sensor MPU6050",
    tag: "ORIENTASI",
    route: "/sensor/mpu6050",
    color: "#8B5CF6", // Violet Purple
    locationName: "Panggul / Titik Gravitasi",
    shape: "circle",
    cx: 200,
    cy: 260,
    r: 9,
  },
  {
    key: "loadcell",
    name: "Sensor Load Cell",
    tag: "BEBAN KURSI",
    route: "/sensor/loadcell",
    color: "#6366F1", // Indigo
    locationName: "Dudukan Kursi & Paha",
    shape: "rect",
    x: 160,
    y: 298,
    width: 80,
    height: 18,
    rx: 6,
  },
];

function getSensorScanState(item, progress, isCalibrating) {
  if (!isCalibrating) return { isScanning: false, isPassed: false };
  let yPos = item.cy;
  if (item.shape === "rect") yPos = item.y + item.height / 2;
  else if (item.shape === "multi-circle") yPos = item.nodes[0].cy;

  const sensorPct = (yPos / 510) * 100;
  const isScanning = progress >= sensorPct - 6 && progress <= sensorPct + 12;
  const isPassed = progress > sensorPct + 12;
  return { isScanning, isPassed };
}

export default function MannequinBlueprint({
  selectedSensorKey,
  onSelectHotspot,
  mannequinId = 1,
  isCalibrating = false,
  calibrationProgress = 0,
}) {
  const navigate = useNavigate();

  const handleHotspotClick = (sensorItem) => {
    if (onSelectHotspot) {
      onSelectHotspot(sensorItem.key);
    }
    const targetId = mannequinId || 1;
    const path = sensorItem.route.startsWith("/")
      ? sensorItem.route
      : `/${sensorItem.route}`;
    navigate(`/${targetId}${path}`);
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-full relative">
      {/* Header: Title */}
      <div className="flex items-center justify-between gap-3 w-full">
        <div>
          <span className="text-slate-800 font-bold text-base sm:text-lg block leading-tight">
            Visualisasi Blueprint Anatomis Mannequin
          </span>
        </div>
      </div>

      {/* Static Subtitle without any dynamic layout-shift */}
      <p className="text-xs text-slate-400 text-center my-3 font-medium">
        Klik titik sensor di tubuh mannequin untuk melihat data spesifik
      </p>

      {/* Blueprint Canvas Container - Fixed Dimension & Zero Motion */}
      <div
        id="blueprint-canvas-container"
        className="w-full flex-grow min-h-[480px] sm:min-h-[520px] rounded-2xl border-2 border-dashed border-[#c6f0e4] bg-[#fbfdfd] flex items-center justify-center relative p-2 overflow-hidden">
        {/* Holographic Scanning Laser & HUD Overlay */}
        {isCalibrating && (
          <>
            {/* Ambient Tech Grid */}
            <div
              className="absolute inset-0 pointer-events-none z-10 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0, 186, 136, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 186, 136, 0.25) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* Floating HUD Scanner Bar */}
            <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-[#00ba88]/50 text-white shadow-lg pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00ba88] animate-ping" />
                <span className="text-[11px] font-mono font-bold text-[#00ba88] tracking-wider uppercase">
                  MEMINDAI BLUEPRINT ANATOMIS...
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-200">
                {calibrationProgress}%
              </span>
            </div>

            {/* Glowing Laser Scan Beam moving down */}
            <div
              className="absolute inset-x-0 pointer-events-none z-20 transition-all duration-75 ease-linear"
              style={{ top: `${calibrationProgress}%` }}>
              {/* Upward gradient trail */}
              <div className="w-full h-24 -mt-24 bg-gradient-to-t from-[#00ba88]/30 via-[#00ba88]/8 to-transparent" />
              {/* Primary laser line */}
              <div className="w-full h-[3px] bg-[#00ba88] shadow-[0_0_20px_6px_rgba(0,186,136,0.9)]" />
              {/* Downward light wash */}
              <div className="w-full h-4 bg-gradient-to-b from-[#00ba88]/20 to-transparent" />
            </div>
          </>
        )}
        <svg
          viewBox="0 0 400 510"
          className="w-full h-full max-h-[500px] select-none pointer-events-auto"
          preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="glowEffect" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Authentic Fullbody Mannequin Model Graphic - Fixed & Static */}
          <g className="mannequin-body-layer">
            <image
              href="/images/img-manekin.png"
              x="80"
              y="15"
              width="240"
              height="480"
              opacity="0.95"
              preserveAspectRatio="xMidYMid meet"
              style={{ filter: "brightness(0.98) contrast(1.02)" }}
            />
          </g>

          {/* Clickable Sensor Hotspot Layer - Fixed in place without jumping */}
          <g className="blueprint-hotspots-layer">
            {SENSOR_HOTSPOTS.map((item) => {
              const { isScanning, isPassed } = getSensorScanState(
                item,
                calibrationProgress,
                isCalibrating
              );
              const activeColor = isScanning ? "#00ba88" : item.color;

              // Render Multi-circle (e.g. 2 ears, 2 shoulders, 2 hands)
              if (item.shape === "multi-circle") {
                return (
                  <g key={item.key} id={`hotspot-${item.key}`}>
                    {item.nodes.map((node, nIdx) => (
                      <g
                        key={`${item.key}-${nIdx}`}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHotspotClick(item);
                        }}>
                        <title>{`${item.name} - ${node.label} (Klik untuk membuka)`}</title>

                        {/* Calibration Active Pulse Effect */}
                        {isScanning && (
                          <circle
                            cx={node.cx}
                            cy={node.cy}
                            r="22"
                            fill="none"
                            stroke="#00ba88"
                            strokeWidth="2.5"
                            opacity="0.9"
                          />
                        )}

                        {/* Calibrated Check Ring */}
                        {isPassed && (
                          <circle
                            cx={node.cx}
                            cy={node.cy}
                            r="13"
                            fill="none"
                            stroke="#00ba88"
                            strokeWidth="1.5"
                            strokeDasharray="3 2"
                            opacity="0.85"
                          />
                        )}

                        {/* Animated pulsing outer halo */}
                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r={isScanning ? "18" : "15"}
                          fill="none"
                          stroke={activeColor}
                          strokeWidth={isScanning ? "2.5" : "1.5"}
                          opacity={isScanning ? "0.9" : "0.5"}>
                          <animate
                            attributeName="r"
                            values="9;18;9"
                            dur="2.2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.8;0.1;0.8"
                            dur="2.2s"
                            repeatCount="indefinite"
                          />
                        </circle>

                        {/* Glowing core dot */}
                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r={isScanning ? "10" : "8"}
                          fill={activeColor}
                          filter="url(#glowEffect)"
                        />

                        {/* Generous invisible hit detection circle for effortless clicking */}
                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r="22"
                          fill="transparent"
                          style={{ cursor: "pointer", pointerEvents: "all" }}
                        />
                      </g>
                    ))}
                  </g>
                );
              }

              // Render Triangle (LiDAR)
              if (item.shape === "triangle") {
                return (
                  <g
                    key={item.key}
                    id={`hotspot-${item.key}`}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHotspotClick(item);
                    }}>
                    <title>{`${item.name} - ${item.locationName} (Klik untuk membuka)`}</title>
                    {isScanning && (
                      <circle
                        cx={item.cx}
                        cy={item.cy}
                        r="22"
                        fill="none"
                        stroke="#00ba88"
                        strokeWidth="2.5"
                        opacity="0.9"
                      />
                    )}
                    {isPassed && (
                      <circle
                        cx={item.cx}
                        cy={item.cy}
                        r="14"
                        fill="none"
                        stroke="#00ba88"
                        strokeWidth="1.5"
                        strokeDasharray="3 2"
                        opacity="0.85"
                      />
                    )}
                    <circle
                      cx={item.cx}
                      cy={item.cy}
                      r="14"
                      fill="none"
                      stroke={activeColor}
                      strokeWidth={isScanning ? "2.5" : "1.5"}
                      opacity={isScanning ? "0.9" : "0.5"}>
                      <animate
                        attributeName="r"
                        values="10;19;10"
                        dur="2.4s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.7;0.1;0.7"
                        dur="2.4s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <polygon
                      points={`${item.cx - 7},${item.cy + 6} ${item.cx + 7},${item.cy + 6} ${item.cx},${item.cy - 7}`}
                      fill={activeColor}
                      filter="url(#glowEffect)"
                    />
                    {/* Generous hit circle */}
                    <circle
                      cx={item.cx}
                      cy={item.cy}
                      r="22"
                      fill="transparent"
                      style={{ cursor: "pointer", pointerEvents: "all" }}
                    />
                  </g>
                );
              }

              // Render Rectangle (Load Cell)
              if (item.shape === "rect") {
                return (
                  <g
                    key={item.key}
                    id={`hotspot-${item.key}`}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHotspotClick(item);
                    }}>
                    <title>{`${item.name} - ${item.locationName} (Klik untuk membuka)`}</title>
                    {isScanning && (
                      <rect
                        x={item.x - 5}
                        y={item.y - 5}
                        width={item.width + 10}
                        height={item.height + 10}
                        rx={item.rx + 4}
                        fill="none"
                        stroke="#00ba88"
                        strokeWidth="2.5"
                        opacity="0.9"
                      />
                    )}
                    {isPassed && (
                      <rect
                        x={item.x - 3}
                        y={item.y - 3}
                        width={item.width + 6}
                        height={item.height + 6}
                        rx={item.rx + 3}
                        fill="none"
                        stroke="#00ba88"
                        strokeWidth="1.5"
                        strokeDasharray="3 2"
                        opacity="0.85"
                      />
                    )}
                    {/* Pulsing outline */}
                    <rect
                      x={item.x - 2}
                      y={item.y - 2}
                      width={item.width + 4}
                      height={item.height + 4}
                      rx={item.rx + 2}
                      fill="none"
                      stroke={activeColor}
                      strokeWidth={isScanning ? "2.5" : "1.5"}
                      opacity={isScanning ? "0.9" : "0.6"}>
                      <animate
                        attributeName="opacity"
                        values="0.8;0.2;0.8"
                        dur="2.2s"
                        repeatCount="indefinite"
                      />
                    </rect>
                    {/* Solid bar */}
                    <rect
                      x={item.x}
                      y={item.y}
                      width={item.width}
                      height={item.height}
                      rx={item.rx}
                      fill={activeColor}
                      filter="url(#glowEffect)"
                    />
                    {/* Hit box */}
                    <rect
                      x={item.x - 10}
                      y={item.y - 8}
                      width={item.width + 20}
                      height={item.height + 16}
                      fill="transparent"
                      style={{ cursor: "pointer", pointerEvents: "all" }}
                    />
                  </g>
                );
              }

              // Standard Single Circle (Camera, Gas, BME, ADXL, MPU)
              return (
                <g
                  key={item.key}
                  id={`hotspot-${item.key}`}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHotspotClick(item);
                  }}>
                  <title>{`${item.name} - ${item.locationName} (Klik untuk membuka)`}</title>

                  {/* Calibration Scan Effect */}
                  {isScanning && (
                    <circle
                      cx={item.cx}
                      cy={item.cy}
                      r={item.r + 12}
                      fill="none"
                      stroke="#00ba88"
                      strokeWidth="2.5"
                      opacity="0.9"
                    />
                  )}

                  {/* Calibrated Indicator */}
                  {isPassed && (
                    <circle
                      cx={item.cx}
                      cy={item.cy}
                      r={item.r + 4}
                      fill="none"
                      stroke="#00ba88"
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                      opacity="0.85"
                    />
                  )}

                  {/* Outer pulse */}
                  <circle
                    cx={item.cx}
                    cy={item.cy}
                    r={item.r + 6}
                    fill="none"
                    stroke={activeColor}
                    strokeWidth={isScanning ? "2.5" : "1.5"}
                    opacity={isScanning ? "0.9" : "0.5"}>
                    <animate
                      attributeName="r"
                      values={`${item.r};${item.r + 9};${item.r}`}
                      dur="2.2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0.1;0.8"
                      dur="2.2s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Core glow circle */}
                  <circle
                    cx={item.cx}
                    cy={item.cy}
                    r={isScanning ? item.r + 2 : item.r}
                    fill={activeColor}
                    filter="url(#glowEffect)"
                  />

                  {/* Reliable Hit Target (24px radius) */}
                  <circle
                    cx={item.cx}
                    cy={item.cy}
                    r="24"
                    fill="transparent"
                    style={{ cursor: "pointer", pointerEvents: "all" }}
                  />
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
