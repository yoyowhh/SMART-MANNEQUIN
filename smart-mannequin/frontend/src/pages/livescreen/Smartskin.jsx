import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import BaseCard from "../../components/Elements/Card";
import ApexChart from "../../components/Elements/Chart";
import { createChartOptions } from "../../helpers/utils";
import SmartskinLogsModal from "../../components/SmartSkin/SmartskinLogsModal";
import { useSensorWebSocket } from "../../hooks/smartskin/useSensorWebSocket";
import { Wifi, WifiOff, ScrollText, Clock, Calendar } from "lucide-react";
import SensorInfoCard from "../../components/Dashboard/SensorInfoCard";
import moment from "moment";

const PERIOD_OPTIONS = [
  { label: "10 Data", value: 10 },
  { label: "25 Data", value: 25 },
  { label: "50 Data", value: 50 },
  { label: "100 Data", value: 100 },
];

const SENSORS_DEF = [
  {
    key: "temp",
    id: "smartskin-temp",
    titleKey: "smartskinSensor.temperature",
    defaultTitle: "SmartSkin Suhu (MCP9808)",
    unit: "°C",
    backendType: "temperature",
    initialVal: 32.5,
  },
  {
    key: "press",
    id: "smartskin-press",
    titleKey: "smartskinSensor.pressure",
    defaultTitle: "SmartSkin Tekanan (FSR)",
    unit: "N",
    backendType: "pressure",
    initialVal: 34.0,
  },
  {
    key: "vib",
    id: "smartskin-vib",
    titleKey: "smartskinSensor.vibration",
    defaultTitle: "SmartSkin Getaran (Piezo)",
    unit: "V",
    backendType: "vibration",
    initialVal: 0.85,
  },
  {
    key: "flex",
    id: "smartskin-flex",
    titleKey: "smartskinSensor.flex",
    defaultTitle: "SmartSkin Flex & Strain Gauge",
    unit: "Ω",
    backendType: "flex",
    initialVal: 52400,
  },
];

const PART_LABEL = {
  back: "Punggung",
  "left-arm": "Lengan Kiri",
  "right-arm": "Lengan Kanan",
  "right-shoulder": "Bahu Kanan",
  "left-shoulder": "Bahu Kiri",
  "right-elbow": "Sikut Kanan",
  "left-elbow": "Sikut Kiri",
  "right-waist": "Pinggang Samping Kanan",
  "left-waist": "Pinggang Samping Kiri",
  "right-knee": "Lutut Kanan",
  "left-knee": "Lutut Kiri",
  "left-leg": "Kaki Kiri",
  "right-leg": "Kaki Kanan",
};

const LOCATION_MAP = {
  back: "back",
  "left arm": "left-arm",
  "right arm": "right-arm",
  "left leg": "left-leg",
  "right leg": "right-leg",
  "left shoulder": "left-shoulder",
  "right shoulder": "right-shoulder",
  "left elbow": "left-elbow",
  "right elbow": "right-elbow",
  "left waist": "left-waist",
  "right waist": "right-waist",
  "left knee": "left-knee",
  "right knee": "right-knee",
  "bahu kanan": "right-shoulder",
  "bahu kiri": "left-shoulder",
  "sikut kanan": "right-elbow",
  "sikut kiri": "left-elbow",
  "pinggang samping kanan": "right-waist",
  "pinggang samping kiri": "left-waist",
  "lutut kanan": "right-knee",
  "lutut kiri": "left-knee",
};

export default function SmartskinPage() {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const mannequinId = Number(params?.id) || 1;

  const [activePart, setActivePart] = useState("back");
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [limit, setLimit] = useState(10);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  const [latestValues, setLatestValues] = useState({
    temp: { front: 32.5, back: 33.2 },
    press: { front: 34.0, back: 36.5 },
    vib: { front: 0.85, back: 0.92 },
    flex: { front: 52400, back: 54800 },
  });

  // Green flashing indicator flags when new batch data arrives
  const [newDataFlags, setNewDataFlags] = useState([false, false, false, false, false]);
  const flagTimeoutRef = useRef(null);

  // Time-series history for the 4 sensor charts (with Depan & Belakang series)
  const [chartHistories, setChartHistories] = useState(() => {
    const now = Date.now();
    const init = {};
    SENSORS_DEF.forEach((s) => {
      const frontData = [];
      const backData = [];
      const cats = [];
      for (let i = 25; i >= 0; i--) {
        const d = new Date(now - i * 3000);
        cats.push(d.toISOString().split(".")[0].replace("T", " "));
        const base = s.initialVal;
        const varianceF = Math.sin(i) * 0.03 * base;
        const varianceB = (Math.cos(i) * 0.04 + 0.02) * base;
        frontData.push(Number((base + varianceF).toFixed(s.unit === "Ω" ? 0 : 2)));
        backData.push(Number((base + varianceB).toFixed(s.unit === "Ω" ? 0 : 2)));
      }
      init[s.key] = { frontData, backData, categories: cats };
    });
    return init;
  });

  // WebSocket connection to SmartSkin backend
  const { isConnected, latestBatch } = useSensorWebSocket(mannequinId);

  // Handle incoming real-time batch from SmartSkin WebSocket
  useEffect(() => {
    if (!latestBatch || latestBatch.length === 0) return;

    const timeStr = new Date().toISOString().split(".")[0].replace("T", " ");
    setLastUpdateTime(new Date());

    setLatestValues((prev) => {
      const next = { ...prev };

      SENSORS_DEF.forEach((s) => {
        const matching = latestBatch.filter(
          (r) => r.sensorType === s.backendType || (s.backendType === "flex" && r.sensorType === "strain")
        );

        if (matching.length > 0) {
          const partMatch = matching.find((r) => {
            const normLoc = LOCATION_MAP[r.location?.toLowerCase()] || r.location;
            return normLoc === activePart;
          });

          const chosen = partMatch || matching[0];
          if (chosen && chosen.value !== null && chosen.value !== undefined) {
            const baseVal = Number(chosen.value);
            const isBack = chosen.side === "back" || chosen.sensorNumber === 2;
            const cur = next[s.key] ? { ...next[s.key] } : { front: baseVal, back: baseVal };
            if (isBack) {
              cur.back = baseVal;
            } else {
              cur.front = baseVal;
            }
            next[s.key] = cur;
          }
        }
      });

      return next;
    });

    // Append to charts history (buffered up to 100 entries for period switching)
    setChartHistories((prev) => {
      const next = { ...prev };

      SENSORS_DEF.forEach((s) => {
        const matching = latestBatch.filter(
          (r) => r.sensorType === s.backendType || (s.backendType === "flex" && r.sensorType === "strain")
        );
        if (matching.length > 0) {
          const chosen = matching[0];
          const baseVal = Number(chosen.value);
          const fVal = baseVal;
          const bVal = Number((baseVal * 1.02).toFixed(s.unit === "Ω" ? 0 : 2));

          const oldFront = prev[s.key]?.frontData || [];
          const oldBack = prev[s.key]?.backData || [];
          const oldCats = prev[s.key]?.categories || [];

          next[s.key] = {
            frontData: [...oldFront.slice(-100), fVal],
            backData: [...oldBack.slice(-100), bVal],
            categories: [...oldCats.slice(-100), timeStr],
          };
        }
      });

      return next;
    });

    // Flash green indicators
    setNewDataFlags([true, true, true, true, true]);
    if (flagTimeoutRef.current) clearTimeout(flagTimeoutRef.current);
    flagTimeoutRef.current = setTimeout(() => {
      setNewDataFlags([false, false, false, false, false]);
    }, 1800);
  }, [latestBatch, activePart]);

  // Clean timeout on unmount
  useEffect(() => {
    return () => {
      if (flagTimeoutRef.current) clearTimeout(flagTimeoutRef.current);
    };
  }, []);

  const formattedUpdateTime = lastUpdateTime
    ? moment(lastUpdateTime).format("DD/MM/YYYY, HH:mm:ss") + " WIB"
    : moment().format("DD/MM/YYYY, HH:mm:ss") + " WIB";

  return (
    <div className="w-full pb-2">
      {/* Control Toolbar: Status Koneksi & Filter Periode */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
        {/* Status Koneksi & Waktu Update */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
            {isConnected ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-700 font-mono">
                  ONLINE • TERHUBUNG
                </span>
              </>
            ) : (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-400"></span>
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  STANDBY / OFFLINE
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Update Terakhir:</span>
            <span className="font-bold text-slate-700">{formattedUpdateTime}</span>
          </div>
        </div>

        {/* Pilihan Periode Waktu */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
          <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
            Periode:
          </span>
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setLimit(opt.value)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${limit === opt.value
                  ? "bg-white text-[#00ba88] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Informasi Sensor (Di Atas) */}
      <div className="mb-5">
        <SensorInfoCard
          title={t("informasiSensor", "Informasi Sensor")}
          sensorCode="SMARTSKIN / MULTIMODAL"
          imageSlot={
            <div className="flex flex-row items-center justify-center gap-4 shrink-0 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
              <img
                src="/images/mannequin/Mannequin Full Body.png"
                alt="Mannequin Full Body"
                className="w-24 sm:w-28 lg:w-[130px] object-contain max-h-[175px] mix-blend-multiply transition-transform duration-300 hover:scale-105"
              />
              <img
                src="/images/mannequin/Mannequin Back Full Body.png"
                alt="Mannequin Back Full Body"
                className="w-24 sm:w-28 lg:w-[130px] object-contain max-h-[175px] mix-blend-multiply transition-transform duration-300 hover:scale-105"
              />
            </div>
          }
          action={
            <button
              type="button"
              onClick={() => setIsLogsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <ScrollText size={14} />
              <span>Lihat Log Riwayat Sensor</span>
            </button>
          }
        >
          <div className="flex flex-col gap-2.5 flex-1">
            <h4 className="font-bold text-slate-800 text-base sm:text-lg">
              Sistem Sensor Cerdas Smart Skin (STAS-RG)
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed text-justify">
              {t(
                "smartskinSensor.deskripsiSensor",
                "Smart Skin adalah sistem sensor multimodal yang terpasang pada permukaan manekin untuk mendeteksi berbagai stimulasi fisik secara real-time. Sistem ini mengintegrasikan sensor suhu (MCP9808) untuk pemantauan termal, sensor tekanan (FSR RP-S40-ST) untuk distribusi tekanan kontak, sensor getaran piezoelektrik untuk deteksi impak, dan flex sensor untuk pemantauan artikulasi kelengkungan sendi (bahu, siku, pinggang, dan lutut)."
              )}
            </p>
          </div>
        </SensorInfoCard>
      </div>

      {/* 4 Card Sensor SmartSkin: Grid 2x2 Simetris & Lega */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {SENSORS_DEF.map((sensor, index) => {
          const title = t(sensor.titleKey, sensor.defaultTitle);
          const valObj = latestValues[sensor.key] || {};
          const valF = valObj.front;
          const valB = valObj.back;

          const displayF =
            valF !== null && valF !== undefined
              ? sensor.unit === "Ω"
                ? Number(valF).toLocaleString()
                : Number(valF).toFixed(2)
              : "--";

          const displayB =
            valB !== null && valB !== undefined
              ? sensor.unit === "Ω"
                ? Number(valB).toLocaleString()
                : Number(valB).toFixed(2)
              : "--";

          const hist = chartHistories[sensor.key] || { frontData: [], backData: [], categories: [] };
          const sliceFront = (hist.frontData || []).slice(-limit);
          const sliceBack = (hist.backData || []).slice(-limit);
          const sliceCats = (hist.categories || []).slice(-limit);

          const baseChartOpts = createChartOptions(
            sensor.id,
            title,
            sliceCats
          );

          const isSingleSensor = sensor.key !== 'flex';

          const chartOptions = {
            ...baseChartOpts,
            title: {
              text: undefined,
            },
            colors: isSingleSensor ? ["#10b981"] : ["#10b981", "#ef4444"], // Single green for temp/press/vib, green/red for flex
            stroke: {
              width: isSingleSensor ? [2.5] : [2.5, 2.5],
              curve: "smooth",
            },
            legend: {
              show: !isSingleSensor,
              position: "top",
              horizontalAlign: "left",
              offsetX: -6,
              offsetY: -6,
              fontSize: "12px",
              fontWeight: 600,
              markers: {
                width: 10,
                height: 10,
                radius: 12,
              },
              itemMargin: {
                horizontal: 10,
                vertical: 2,
              },
              onItemHover: {
                highlightDataSeries: true,
              },
              onItemClick: {
                toggleDataSeries: true,
              },
            },
          };

          const series = isSingleSensor
            ? [
                {
                  name: title,
                  data: sliceBack,
                },
              ]
            : [
                {
                  name: "Depan",
                  data: sliceFront,
                },
                {
                  name: "Belakang",
                  data: sliceBack,
                },
              ];

          return (
            <div
              key={sensor.key}
              onClick={() => navigate(`/${mannequinId}/sensor/smartskin/${sensor.key}`)}
              className="col-span-1 h-full flex flex-col cursor-pointer group transition-all duration-300 hover:-translate-y-2"
              title={`Klik untuk melihat rincian ${title} per titik lokasi tubuh`}
            >
              <BaseCard
                height="h-full min-h-[380px]"
                mobileHeight="h-full min-h-[320px]"
                className="h-full flex flex-col hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/15"
              >
                <div className="flex flex-col h-full">
                  {/* Card Header: Kiri ada Judul Sensor, Kanan ada Badge Nilai & Status Dot */}
                  <div className="flex flex-wrap justify-between items-center mb-1 gap-2">
                    {/* Sisi Kiri: Judul di atas */}
                    <div className="flex flex-col">
                      <h3 className="font-bold text-sm sm:text-base text-slate-800 tracking-tight flex items-center gap-1.5">
                        {title}
                        <span className="text-[10px] text-emerald-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 ml-1">
                          Detail →
                        </span>
                      </h3>
                    </div>

                    {/* Sisi Kanan: Badge Nilai Sensor serta live indicator dot */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isSingleSensor ? (
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 shadow-xs flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {displayB} {sensor.unit}
                          </span>
                        ) : (
                          <>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 shadow-xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              D: {displayF} {sensor.unit}
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-50 border border-rose-300 text-rose-800 shadow-xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              B: {displayB} {sensor.unit}
                            </span>
                          </>
                        )}
                      </div>

                      <div
                        title={newDataFlags[index] ? "Receiving live data" : "Idle"}
                        className={`w-3.5 h-3.5 rounded-full transition-colors duration-300 shrink-0 ${newDataFlags[index]
                            ? "bg-green-600 shadow-[0_0_8px_rgba(22,163,74,0.8)]"
                            : isConnected
                              ? "bg-emerald-400"
                              : "bg-slate-400"
                          }`}
                      />
                    </div>
                  </div>

                  <div className="w-full flex-1">
                    <ApexChart
                      options={chartOptions}
                      series={series}
                      height={275}
                      type="line"
                    />
                  </div>
                </div>
              </BaseCard>
            </div>
          );
        })}
      </div>

      {/* Modal Log Riwayat Sensor Smart Skin */}
      <SmartskinLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        mannequinId={mannequinId}
      />
    </div>
  );
}
