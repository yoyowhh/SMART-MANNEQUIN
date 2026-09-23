import React from "react";
import { useNavigate } from "react-router-dom";

// Definisi lengkap 9 sensor anatomis mannequin sesuai blueprint desain terbaru
// merah       : Sensor suara (KY-601/602 - 2 titik telinga)
// kuning      : Sensor gas (MQ - 1 titik hidung/mulut)
// hijau       : Sensor LiDAR (1 titik dahi/kepala atas)
// biru        : Kamera Vision (2 titik mata kiri & kanan)
// ungu        : Sensor ADXL345 (2 titik bahu kiri & kanan)
// orange      : Sensor MPU6050 (1 titik dada atas / sternum)
// hitam       : Sensor BME280 (1 titik dada tengah / solar plexus)
// pink        : Sensor Load Cell (5 titik: leher, paha kiri, paha kanan, lutut kiri, lutut kanan)
// hijau neon  : SmartSkin (2 titik dada pektoral kiri & kanan)
const SENSOR_HOTSPOTS = [
  {
    key: "lidar",
    name: "Sensor LiDAR",
    tag: "JARAK 3D",
    route: "/sensor/lidar",
    color: "#22c55e", // Hijau
    locationName: "Dahi / Kepala Atas",
    shape: "circle",
    cx: 200,
    cy: 31.5,
    r: 7,
  },
  {
    key: "camera",
    name: "Kamera Vision",
    tag: "VISION AI",
    route: "/sensor/camera",
    color: "#0ea5e9", // Biru (Cyan/Sky)
    locationName: "Mata Kiri & Kanan",
    shape: "multi-circle",
    nodes: [
      { cx: 195, cy: 56.5, label: "Mata Kiri", r: 5.5 },
      { cx: 211, cy: 56.5, label: "Mata Kanan", r: 5.5 },
    ],
  },
  {
    key: "sound",
    name: "Sensor Suara (KY-601/602)",
    tag: "AKUSTIK",
    route: "/sensor/sound",
    color: "#ef4444", // Merah
    locationName: "Binaural Ears (Telinga Kiri & Kanan)",
    shape: "multi-circle",
    nodes: [
      { cx: 177, cy: 61.8, label: "Telinga Kiri (KY-601)", r: 7 },
      { cx: 224, cy: 61.8, label: "Telinga Kanan (KY-602)", r: 7 },
    ],
  },
  {
    key: "gas",
    name: "Sensor Gas",
    tag: "LINGKUNGAN",
    route: "/sensor/gas",
    color: "#eab308", // Kuning
    locationName: "Hidung / Saluran Pernafasan",
    shape: "circle",
    cx: 200,
    cy: 70,
    r: 6.5,
  },
  {
    key: "loadcell",
    name: "Sensor Load Cell",
    tag: "BEBAN TEKANAN",
    route: "/sensor/loadcell",
    color: "#ec4899", // Pink
    locationName: "5 Titik: Leher, Paha & Lutut",
    shape: "multi-circle",
    nodes: [
      { cx: 200, cy: 93, label: "Leher", r: 7 },
      { cx: 165.5, cy: 283, label: "Paha Kiri", r: 7 },
      { cx: 237, cy: 283, label: "Paha Kanan", r: 7 },
      { cx: 162, cy: 349, label: "Lutut Kiri", r: 7 },
      { cx: 237, cy: 350, label: "Lutut Kanan", r: 7 },
    ],
  },
  {
    key: "adxl",
    name: "Sensor ADXL345",
    tag: "AKSELEROMETER",
    route: "/sensor/adxl",
    color: "#8b5cf6", // Ungu
    locationName: "Bahu Kiri & Bahu Kanan",
    shape: "multi-circle",
    nodes: [
      { cx: 151, cy: 105, label: "Bahu Kiri", r: 7 },
      { cx: 254, cy: 105, label: "Bahu Kanan", r: 7 },
    ],
  },
  {
    key: "mpu",
    name: "Sensor MPU6050",
    tag: "ORIENTASI / IMU",
    route: "/sensor/mpu6050",
    color: "#f97316", // Orange
    locationName: "Dada Atas (Sternum)",
    shape: "circle",
    cx: 200,
    cy: 118,
    r: 7.5,
  },
  {
    key: "smartskin",
    name: "SmartSkin Multimodal",
    tag: "SMARTSKIN",
    route: "/sensor/smartskin",
    color: "#84cc16", // Hijau Neon / Lime
    locationName: "Dada Pektoral (Kiri & Kanan)",
    shape: "multi-circle",
    nodes: [
      { cx: 168, cy: 124, label: "Dada Kiri", r: 7.5 },
      { cx: 233, cy: 124, label: "Dada Kanan", r: 7.5 },
    ],
  },
  {
    key: "bme",
    name: "Sensor BME280",
    tag: "MIKROKLIMAT",
    route: "/sensor/bme",
    color: "#0f172a", // Hitam
    locationName: "Dada Tengah (Solar Plexus)",
    shape: "circle",
    cx: 200,
    cy: 143,
    r: 7.5,
    hasWhiteBorder: true,
  },
];

const VIEWBOX_MIN_X = 80;
const VIEWBOX_MIN_Y = 10;
const VIEWBOX_WIDTH = 240;
const VIEWBOX_HEIGHT = 485;

function getSensorScanState(item, progress, isCalibrating, nodeY = null) {
  if (!isCalibrating) return { isScanning: false, isPassed: false };
  let yPos = nodeY !== null ? nodeY : item.cy;
  if (yPos === undefined && item.shape === "multi-circle" && item.nodes?.length > 0) {
    yPos = item.nodes[0].cy;
  }
  const sensorPct = ((yPos - VIEWBOX_MIN_Y) / VIEWBOX_HEIGHT) * 100;
  const isScanning = progress >= sensorPct - 6 && progress <= sensorPct + 10;
  const isPassed = progress > sensorPct + 10;
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

      {/* Subtitle */}
      <p className="text-xs text-slate-400 text-center my-3 font-medium">
        Klik titik sensor di tubuh mannequin untuk melihat data spesifik
      </p>

      {/* Blueprint Canvas Container - Tampil Lega & Besar */}
      <div
        id="blueprint-canvas-container"
        className="w-full flex-grow min-h-[500px] sm:min-h-[540px] rounded-2xl border-2 border-dashed border-[#c6f0e4] bg-[#fbfdfd] flex items-center justify-center relative p-1 sm:p-2 overflow-hidden">
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

        {/* SVG ViewBox diperbesar & difokuskan membingkai penuh tubuh manekin (240x485) */}
        <svg
          viewBox={`${VIEWBOX_MIN_X} ${VIEWBOX_MIN_Y} ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="w-full h-full max-h-[580px] select-none pointer-events-auto"
          preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="glowEffect" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Authentic Fullbody Mannequin Model Graphic */}
          <g className="mannequin-body-layer">
            <image
              href="/images/mannequin/Mannequin Full Body.png"
              x="80"
              y="15"
              width="240"
              height="480"
              opacity="0.95"
              preserveAspectRatio="xMidYMid meet"
              style={{ filter: "brightness(0.98) contrast(1.02)" }}
            />
          </g>

          {/* Clickable Sensor Hotspot Layer */}
          <g className="blueprint-hotspots-layer">
            {SENSOR_HOTSPOTS.map((item) => {
              const isSelected = selectedSensorKey === item.key;
              const isDimmed = Boolean(selectedSensorKey) && !isSelected;

              // Render Multi-circle (Ears, Eyes, Shoulders, Pectorals, Load Cell 5-points)
              if (item.shape === "multi-circle") {
                return (
                  <g
                    key={item.key}
                    id={`hotspot-${item.key}`}
                    style={{
                      opacity: isDimmed ? 0.35 : 1,
                      transition: "opacity 200ms ease",
                    }}>
                    {item.nodes.map((node, nIdx) => {
                      const nodeR = node.r || 7;
                      const { isScanning, isPassed } = getSensorScanState(
                        item,
                        calibrationProgress,
                        isCalibrating,
                        node.cy
                      );
                      const activeColor = isScanning ? "#00ba88" : item.color;

                      return (
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
                              r="18"
                              fill="none"
                              stroke="#00ba88"
                              strokeWidth="2"
                              opacity="0.9"
                            />
                          )}

                          {/* Calibrated Check Ring */}
                          {isPassed && (
                            <circle
                              cx={node.cx}
                              cy={node.cy}
                              r={nodeR + 3}
                              fill="none"
                              stroke="#00ba88"
                              strokeWidth="1.2"
                              strokeDasharray="3 2"
                              opacity="0.85"
                            />
                          )}

                          {/* Selected Active Extra Highlight */}
                          {isSelected && (
                            <circle
                              cx={node.cx}
                              cy={node.cy}
                              r={nodeR + 8}
                              fill="none"
                              stroke={item.color}
                              strokeWidth="1.8"
                              opacity="0.9">
                              <animate
                                attributeName="r"
                                values={`${nodeR + 3};${nodeR + 10};${nodeR + 3}`}
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

                          {/* Animated pulsing outer halo */}
                          <circle
                            cx={node.cx}
                            cy={node.cy}
                            r={isScanning ? nodeR + 6 : nodeR + 4}
                            fill="none"
                            stroke={activeColor}
                            strokeWidth={isScanning ? "2" : "1.2"}
                            opacity={isScanning ? "0.9" : "0.5"}>
                            <animate
                              attributeName="r"
                              values={`${nodeR};${nodeR + 6};${nodeR}`}
                              dur="2.2s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="opacity"
                              values="0.7;0.1;0.7"
                              dur="2.2s"
                              repeatCount="indefinite"
                            />
                          </circle>

                          {/* Glowing core dot */}
                          <circle
                            cx={node.cx}
                            cy={node.cy}
                            r={isScanning ? nodeR + 1.5 : nodeR}
                            fill={activeColor}
                            filter="url(#glowEffect)"
                          />

                          {/* Generous invisible hit detection circle for effortless clicking */}
                          <circle
                            cx={node.cx}
                            cy={node.cy}
                            r="18"
                            fill="transparent"
                            style={{ cursor: "pointer", pointerEvents: "all" }}
                          />
                        </g>
                      );
                    })}
                  </g>
                );
              }

              // Standard Single Circle (LiDAR, Gas, MPU6050, BME280)
              const { isScanning, isPassed } = getSensorScanState(
                item,
                calibrationProgress,
                isCalibrating,
                item.cy
              );
              const activeColor = isScanning ? "#00ba88" : item.color;
              const dotR = item.r || 7.5;

              return (
                <g
                  key={item.key}
                  id={`hotspot-${item.key}`}
                  className="cursor-pointer"
                  style={{
                    opacity: isDimmed ? 0.35 : 1,
                    transition: "opacity 200ms ease",
                  }}
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
                      r={dotR + 10}
                      fill="none"
                      stroke="#00ba88"
                      strokeWidth="2"
                      opacity="0.9"
                    />
                  )}

                  {/* Calibrated Indicator */}
                  {isPassed && (
                    <circle
                      cx={item.cx}
                      cy={item.cy}
                      r={dotR + 3}
                      fill="none"
                      stroke="#00ba88"
                      strokeWidth="1.2"
                      strokeDasharray="3 2"
                      opacity="0.85"
                    />
                  )}

                  {/* Selected Active Extra Highlight */}
                  {isSelected && (
                    <circle
                      cx={item.cx}
                      cy={item.cy}
                      r={dotR + 8}
                      fill="none"
                      stroke={item.color === "#0f172a" ? "#64748b" : item.color}
                      strokeWidth="1.8"
                      opacity="0.9">
                      <animate
                        attributeName="r"
                        values={`${dotR + 3};${dotR + 10};${dotR + 3}`}
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

                  {/* Outer pulse */}
                  <circle
                    cx={item.cx}
                    cy={item.cy}
                    r={dotR + 4.5}
                    fill="none"
                    stroke={activeColor === "#0f172a" ? "#64748b" : activeColor}
                    strokeWidth={isScanning ? "2" : "1.2"}
                    opacity={isScanning ? "0.9" : "0.5"}>
                    <animate
                      attributeName="r"
                      values={`${dotR};${dotR + 6};${dotR}`}
                      dur="2.2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.7;0.1;0.7"
                      dur="2.2s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Core glow circle */}
                  <circle
                    cx={item.cx}
                    cy={item.cy}
                    r={isScanning ? dotR + 1.5 : dotR}
                    fill={activeColor}
                    stroke={item.hasWhiteBorder ? "#ffffff" : "none"}
                    strokeWidth={item.hasWhiteBorder ? "1.4" : "0"}
                    filter="url(#glowEffect)"
                  />

                  {/* Reliable Hit Target (20px radius) */}
                  <circle
                    cx={item.cx}
                    cy={item.cy}
                    r="20"
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
