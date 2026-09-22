import BaseCard from "../../components/Elements/Card";
import { useState, useEffect, useMemo, useCallback } from "react";
import ApexChart from "../../components/Elements/Chart";
import {
  createChartOptions,
  useNewDataDetector,
} from "../../helpers/utils";
import { Skeleton } from "@mui/material";
import GaugeComponent from "react-gauge-component";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useFetchSensor } from "../../hooks/useSensor";
import LiveIndicatorBadge from "../../components/Dashboard/LiveIndicatorBadge";
import SensorInfoCard from "../../components/Dashboard/SensorInfoCard";
import ThermalLogsModal from "../../components/Camera/ThermalLogsModal";
import moment from "moment";
import {
  Clock,
  Calendar,
  Video,
  Activity,
  Layers,
  Thermometer,
  Settings,
  Trash2,
  ExternalLink,
  SlidersHorizontal,
  Flame,
  ScrollText,
  TrendingDown,
  TrendingUp,
  Target,
} from "lucide-react";

const PERIOD_OPTIONS = [
  { label: "10 Data", value: 10 },
  { label: "25 Data", value: 25 },
  { label: "50 Data", value: 50 },
  { label: "100 Data", value: 100 },
];

const DEFAULT_STREAM_PRESET = "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1";

const ThermalPage = () => {
  const { t } = useTranslation();
  const params = useParams();
  const mannequinId = params?.id || 1;

  // Video URL State (Disimpan di localStorage agar persisten)
  const [cameraUrl, setCameraUrl] = useState(() => {
    return localStorage.getItem("smart_mannequin_cam_url") || "";
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState(cameraUrl);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // Sensor Telemetry State
  const [rawRows, setRawRows] = useState([]);
  const [latestTemp, setLatestTemp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [limit, setLimit] = useState(10);
  const [thermalMetrics, setThermalMetrics] = useState({
    low: 0,
    high: 0,
    delta: 0,
  });

  // Fetch telemetry data
  const fetchAndProcessData = useCallback(async () => {
    try {
      const response = await useFetchSensor(
        "thermal",
        702,
        mannequinId,
        false,
        limit,
      );

      setLastFetchTime(new Date());

      const rows = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : [];

      if (rows.length > 0) {
        setIsConnected(true);
        setRawRows(rows);

        const latest = rows[0];
        const latestValue = parseFloat(latest?.center_temp ?? latest?.value ?? 0);
        const rawLow = parseFloat(latest?.low_temp);
        const rawHigh = parseFloat(latest?.high_temp);

        const low = !isNaN(rawLow) && rawLow > 0 ? rawLow : latestValue > 0 ? latestValue - 1.8 : 0;
        const high = !isNaN(rawHigh) && rawHigh > 0 ? rawHigh : latestValue > 0 ? latestValue + 2.4 : 0;
        const delta = Math.max(0, high - low);

        setLatestTemp(latestValue);
        setThermalMetrics({ low, high, delta });
        if (latest?.inputed_at) {
          setLastUpdateTime(latest.inputed_at);
        }
      } else {
        setIsConnected(false);
        setRawRows([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching thermal data:", error);
      setIsConnected(false);
      setLoading(false);
    }
  }, [mannequinId, limit]);

  useEffect(() => {
    fetchAndProcessData();
    const intervalId = setInterval(fetchAndProcessData, 3000);
    return () => clearInterval(intervalId);
  }, [fetchAndProcessData]);

  // Konfigurasi Chart Telemetri Termal Multi-Series
  const { chartSeries, chartOptions } = useMemo(() => {
    const reversedRows = [...rawRows].reverse();
    const categories = reversedRows.map((r) =>
      r.inputed_at ? moment(r.inputed_at).format("HH:mm:ss") : moment().format("HH:mm:ss")
    );

    const centerSeries = reversedRows.map((r) =>
      Number((parseFloat(r.center_temp ?? r.value) || 0).toFixed(2))
    );
    const lowSeries = reversedRows.map((r) => {
      const raw = parseFloat(r.low_temp);
      const c = parseFloat(r.center_temp ?? r.value) || 0;
      return Number((!isNaN(raw) && raw > 0 ? raw : Math.max(0, c - 1.8)).toFixed(2));
    });
    const highSeries = reversedRows.map((r) => {
      const raw = parseFloat(r.high_temp);
      const c = parseFloat(r.center_temp ?? r.value) || 0;
      return Number((!isNaN(raw) && raw > 0 ? raw : c + 2.4).toFixed(2));
    });

    const seriesData = [
      { name: "Suhu Titik Pusat (°C)", data: centerSeries },
      { name: "Suhu Min (°C)", data: lowSeries },
      { name: "Suhu Max (°C)", data: highSeries },
    ];

    const baseOpt = createChartOptions(
      `thermal-chart-${mannequinId}`,
      "Telemetri Kontinu Suhu Termal",
      categories
    );

    const optionsData = {
      ...baseOpt,
      title: { text: undefined },
      chart: {
        ...baseOpt.chart,
        type: "area",
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: "linear",
          dynamicAnimation: {
            speed: 1000,
          },
        },
      },
      colors: ["#00ba88", "#0284c7", "#ef4444"],
      fill: {
        type: ["gradient", "solid", "solid"],
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.35,
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },
      stroke: {
        curve: "smooth",
        width: [3, 2, 2],
      },
      xaxis: {
        ...baseOpt.xaxis,
        categories,
        labels: {
          style: { colors: "#64748b", fontSize: "11px" },
          rotate: 0,
        },
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "left",
        fontSize: "12px",
        fontWeight: 600,
        labels: { colors: "#475569" },
        markers: { radius: 12, width: 10, height: 10 },
        itemMargin: { horizontal: 10, vertical: 4 },
      },
      tooltip: {
        ...baseOpt.tooltip,
        shared: true,
        intersect: false,
      },
      yaxis: {
        ...baseOpt.yaxis,
        title: {
          text: "Suhu (°C)",
          style: { fontSize: "12px", fontWeight: "600", color: "#64748b" },
        },
        min: 15,
        max: 70,
        forceNiceScale: true,
      },
    };

    return { chartSeries: seriesData, chartOptions: optionsData };
  }, [rawRows, mannequinId]);

  const isNewData = useNewDataDetector(chartSeries?.[0]?.data);

  // Simpan URL streaming baru
  const handleSaveUrl = (e) => {
    e.preventDefault();
    const cleanUrl = inputUrl.trim();
    setCameraUrl(cleanUrl);
    localStorage.setItem("smart_mannequin_cam_url", cleanUrl);
    setIsModalOpen(false);
  };

  const handleClearUrl = () => {
    setCameraUrl("");
    localStorage.removeItem("smart_mannequin_cam_url");
  };

  // Status Suhu
  const getTempStatus = (temp) => {
    if (temp <= 25) {
      return {
        label: "Suhu Rendah",
        color: "text-blue-600 bg-blue-50 border-blue-200",
        textColor: "text-blue-600",
        badgeBg: "bg-blue-500",
        desc: "Permukaan dingin di bawah rentang optimal",
      };
    } else if (temp <= 42) {
      return {
        label: "Suhu Normal / Nyaman",
        color: "text-emerald-600 bg-emerald-50 border-emerald-200",
        textColor: "text-emerald-600",
        badgeBg: "bg-emerald-500",
        desc: "Rentang termal tubuh/manekin ideal",
      };
    } else {
      return {
        label: "Suhu Sangat Panas",
        color: "text-rose-600 bg-rose-50 border-rose-200",
        textColor: "text-rose-600",
        badgeBg: "bg-rose-500",
        desc: "Peringatan: Panas berlebih terdeteksi",
      };
    }
  };

  const tempStatus = getTempStatus(latestTemp);

  const formattedUpdateTime = lastUpdateTime
    ? moment(lastUpdateTime).format("DD/MM/YYYY, HH:mm:ss") + " WIB"
    : lastFetchTime
    ? moment(lastFetchTime).format("DD/MM/YYYY, HH:mm:ss") + " WIB"
    : "-";

  return (
    <div className="w-full pb-2 space-y-6">
      {/* 1. Control Toolbar: Status Koneksi & Filter Periode */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
              onClick={() => setLimit(opt.value)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                limit === opt.value
                  ? "bg-white text-[#00ba88] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Informasi Sensor Card */}
      <SensorInfoCard
        title={t("informasiSensor") || "Informasi Sensor"}
        sensorCode="CAMERA & MLX90640 THERMAL ARRAY"
        imageSrc="/images/information/camera-information.png"
        imageAlt="thermal-information"
        action={
          <button
            type="button"
            onClick={() => setIsLogsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer">
            <ScrollText size={14} />
            <span>Lihat Log Riwayat Sensor</span>
          </button>
        }>
        <div className="flex flex-col gap-2">
          <h4 className="font-bold text-slate-800 text-base">
            Sistem Kamera & Sensor Termal MLX90640
          </h4>
          <p className="text-slate-600 text-sm leading-relaxed text-justify">
            {t(
              "cameraSensor.deskripsiSensor",
              "Sensor termal MLX90640 adalah array sensor inframerah 32x24 piksel yang memetakan distribusi panas permukaan secara real-time. Terintegrasi dengan saluran feed live streaming kamera via URL (WebRTC/RTSP/HTTP/Iframe) untuk pemantauan visual terpadu pada Smart Mannequin.",
            )}
          </p>
        </div>
      </SensorInfoCard>

      {/* 3. Row 1: Dual Cards - Live Video Stream (Kiri, Diperbesar 8 Kolom) & Suhu Titik Pusat (Kanan, 4 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card Kiri: Live Video Stream Feed (Diperbesar: 8 Kolom di Desktop) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-full transition-all group hover:border-emerald-200">
            {/* Header Feed Video */}
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00ba88] flex items-center justify-center font-bold text-sm">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-slate-800">
                      {t("cameraSensor.kamera") || "Live Video Stream Feed"}
                    </h3>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        cameraUrl
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                      {cameraUrl ? "STREAM AKTIF" : "BELUM DISETEL"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Streaming visual video waktu nyata via URL sumber feed
                  </p>
                </div>
              </div>

              {/* Action Buttons Header (Tanpa Tombol Layar Penuh) */}
              <div className="flex items-center gap-1.5">
                {cameraUrl && (
                  <button
                    type="button"
                    onClick={handleClearUrl}
                    title="Hapus URL Stream"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setInputUrl(cameraUrl);
                    setIsModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs">
                  {cameraUrl ? "Ubah URL" : "Set URL Kamera"}
                </button>
              </div>
            </div>

            {/* Video Viewport Area (Diperluas) */}
            <div className="flex-grow flex items-center justify-center rounded-2xl overflow-hidden bg-slate-950 border border-slate-900 relative aspect-video min-h-[340px] sm:min-h-[420px]">
              {cameraUrl ? (
                <>
                  {/* Subtle HUD Overlay */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
                    <span className="px-2 py-0.5 rounded-md bg-rose-600/90 text-white text-[9px] font-mono font-bold tracking-wider flex items-center gap-1.5 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      LIVE
                    </span>
                  </div>

                  {cameraUrl.includes("<iframe") ? (
                    <div
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: cameraUrl }}
                    />
                  ) : (
                    <iframe
                      src={cameraUrl}
                      title="Live Video Feed"
                      className="w-full h-full border-0 rounded-2xl"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 max-w-md">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 text-slate-500">
                    <Video className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    Belum Ada URL Streaming Kamera
                  </h4>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Tautkan URL video stream (RTSP/HLS/WebRTC/YouTube embed) untuk memantau feed kamera secara real-time.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setInputUrl(cameraUrl);
                      setIsModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00ba88] hover:bg-emerald-600 text-white transition shadow-sm">
                    Set URL Kamera Sekarang
                  </button>
                </div>
              )}
            </div>

            {/* Footer Status Video */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 mt-3 border-t border-slate-50">
              <span className="text-slate-400">
                {cameraUrl ? "Sumber: URL Eksternal" : "Sumber: Belum Dikonfigurasi"}
              </span>
              <span className="font-mono text-emerald-600 font-semibold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {cameraUrl ? "Feed Tersambung" : "Menunggu Konfigurasi"}
              </span>
            </div>
          </div>
        </div>

        {/* Card Kanan: Suhu Titik Pusat MLX90640 (Diperkecil: 4 Kolom di Desktop, Format Seragam Sensor Lain) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group cursor-default transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-500/15 hover:border-emerald-300">
            {/* Header Telemetri Suhu (Format Seragam Lidar/Sensor Lain) */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 tracking-wider font-mono">
                SUHU TITIK PUSAT (MLX90640)
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00ba88] flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-110 transition-transform duration-300">
                <Thermometer className="w-4 h-4" />
              </div>
            </div>

            {/* Nilai Pengukuran Utama */}
            <div className="flex items-baseline gap-2 mb-2.5 font-mono">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#00ba88] tracking-tight">
                {loading ? "--" : latestTemp.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-slate-400">°C</span>
              <span className="text-xs font-semibold text-slate-400 ml-2">
                ({loading ? "--" : ((latestTemp * 9) / 5 + 32).toFixed(1)} °F)
              </span>
            </div>

            {/* Data Tambahan di Bawah Suhu: T-Min, T-Max, dan Gradien ΔT */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-100 flex flex-col justify-between">
                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 font-mono">
                  <TrendingDown className="w-3 h-3" />
                  <span>T-MIN</span>
                </div>
                <div className="mt-1 font-mono font-extrabold text-blue-700 text-xs sm:text-sm">
                  {loading ? "--" : thermalMetrics.low.toFixed(1)}
                  <span className="text-[10px] font-normal text-blue-500 ml-0.5">°C</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-rose-50/70 border border-rose-100 flex flex-col justify-between">
                <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600 font-mono">
                  <TrendingUp className="w-3 h-3" />
                  <span>T-MAX</span>
                </div>
                <div className="mt-1 font-mono font-extrabold text-rose-700 text-xs sm:text-sm">
                  {loading ? "--" : thermalMetrics.high.toFixed(1)}
                  <span className="text-[10px] font-normal text-rose-500 ml-0.5">°C</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100 flex flex-col justify-between">
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#00ba88] font-mono">
                  <Activity className="w-3 h-3" />
                  <span>GRADIEN ΔT</span>
                </div>
                <div className="mt-1 font-mono font-extrabold text-[#00ba88] text-xs sm:text-sm">
                  {loading ? "--" : thermalMetrics.delta.toFixed(1)}
                  <span className="text-[10px] font-normal text-emerald-600 ml-0.5">°C</span>
                </div>
              </div>
            </div>

            {/* Gauge Display Kompak */}
            <div className="flex justify-center items-center py-1 flex-grow">
              <GaugeComponent
                type="semicircle"
                arc={{
                  width: 0.2,
                  padding: 0.005,
                  cornerRadius: 1,
                  subArcs: [
                    {
                      limit: 15 + (70 - 15) / 3,
                      color: "#3B82F6",
                      showTick: true,
                      tooltip: { text: "Suhu Dingin (< 33.3°C)" },
                    },
                    {
                      limit: 15 + (2 * (70 - 15)) / 3,
                      color: "#00BA88",
                      showTick: true,
                      tooltip: { text: "Suhu Normal (33.3°C - 51.6°C)" },
                    },
                    {
                      color: "#EF4444",
                      tooltip: { text: "Suhu Panas (> 51.6°C)" },
                    },
                  ],
                }}
                pointer={{
                  color: "#1e293b",
                  baseColor: "#fff",
                  length: 0.78,
                  width: 12,
                  elasticity: true,
                  type: "arrow",
                }}
                labels={{
                  valueLabel: {
                    matchColorWithArc: true,
                    formatTextValue: () => {
                      return latestTemp !== null
                        ? latestTemp.toFixed(2) + "°C"
                        : "N/A";
                    },
                    style: {
                      fill: "#00BA88",
                      fontSize: 26,
                      fontWeight: "bold",
                    },
                  },
                  tickLabels: {
                    type: "outer",
                    defaultTickValueConfig: {
                      style: {
                        fontSize: 10,
                        fill: "#64748b",
                        fontWeight: "bold",
                      },
                    },
                    ticks: [
                      { value: 15 },
                      { value: 15 + (70 - 15) / 2 },
                      { value: 70 },
                    ],
                  },
                }}
                value={latestTemp}
                minValue={15}
                maxValue={70}
                style={{
                  height: "auto",
                  width: "100%",
                }}
              />
            </div>

            {/* Info Konteks Sensor Tambahan */}
            <div className="grid grid-cols-2 gap-2 my-2 pt-2 border-t border-slate-50">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <Target className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Titik Fokus:</span>
                <span className="font-mono font-bold text-slate-700">Pixel [16,12]</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium justify-end">
                <span className="text-slate-400">Target:</span>
                <span className="font-mono font-bold text-emerald-600">~36.5°C</span>
              </div>
            </div>

            {/* Footer Seragam Sensor Lain */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2.5 border-t border-slate-50">
              <span className="text-slate-400">Sensor MLX90640 (702)</span>
              <span className="font-mono text-emerald-600 font-semibold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {tempStatus.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Row 2: Grafik Telemetri Kontinu Suhu MLX90640 */}
      <div className="w-full">
        {!loading ? (
          <BaseCard height="auto" mobileHeight="auto" className="!h-auto">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-50 text-[#00ba88]">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                      Telemetri Kontinu Suhu Termal (MLX90640)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tren fluktuasi suhu permukaan titik pusat waktu nyata
                    </p>
                  </div>
                </div>
                <LiveIndicatorBadge isLive={isNewData} label="TELEMETRI TERMAL" />
              </div>

              <div className="w-full pt-1">
                {!loading && chartSeries.length > 0 && chartSeries[0]?.data?.length > 0 ? (
                  <ApexChart
                    options={chartOptions}
                    series={chartSeries}
                    height={320}
                  />
                ) : (
                  <div className="h-[320px] flex items-center justify-center text-slate-400 text-sm">
                    {loading ? "Memuat telemetri sensor..." : "Belum ada data telemetri."}
                  </div>
                )}
              </div>
            </div>
          </BaseCard>
        ) : (
          <BaseCard height="auto" mobileHeight="auto" className="!h-auto">
            <Skeleton variant="rectangular" height={320} className="rounded-2xl" />
          </BaseCard>
        )}
      </div>

      {/* 5. Row 3: Tabel Ringkasan Parameter Sensor & Video Stream */}
      <BaseCard height="auto" mobileHeight="auto" className="!h-auto">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-[#00ba88] shrink-0 shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base">
                  Ringkasan Parameter Sensor & Video Stream
                </h4>
                <p className="text-xs text-slate-400">
                  Parameter operasional modul kamera, sensor termal, dan status koneksi telemetri
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Nama Perangkat</th>
                  <th className="py-3 px-4">Parameter</th>
                  <th className="py-3 px-4">Nilai Terkini</th>
                  <th className="py-3 px-4">Satuan / Format</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Koneksi</th>
                  <th className="py-3 px-4">Waktu Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>Sensor Termal MLX90640</span>
                    </div>
                    <span className="block text-[11px] text-slate-400 font-normal pl-4">
                      Sensor ID: 702
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-mono text-[11px] font-semibold border border-emerald-200/60">
                      Suhu Titik Pusat
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-[#00ba88] text-base">
                    {latestTemp.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-500">°C</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border shadow-xs ${tempStatus.color}`}>
                      {tempStatus.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold font-mono text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
                      {isConnected ? "Online" : "Standby"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {formattedUpdateTime}
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${
                          cameraUrl ? "bg-emerald-500" : "bg-slate-400"
                        }`}></span>
                      <span>Live Video Camera Stream</span>
                    </div>
                    <span className="block text-[11px] text-slate-400 font-normal pl-4">
                      Modul Visual Manekin
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-mono text-[11px] font-semibold border border-blue-200/60">
                      Video Stream Feed
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 text-xs truncate max-w-[160px]">
                    {cameraUrl ? "URL Streaming Aktif" : "Belum Ada URL"}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                    RTSP / HTTP / WebRTC
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border shadow-xs ${
                        cameraUrl
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>
                      {cameraUrl ? "Streaming" : "Standby"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-slate-600 font-bold font-mono text-[11px]">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          cameraUrl ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                        }`}></span>{" "}
                      {cameraUrl ? "Tersambung" : "Off"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {moment().format("HH:mm:ss")} WIB
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-semibold text-slate-600 font-mono">
                Status Operasional:
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Sensor Termal Aktif
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Array 32x24 Piksel
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-400"></span> FOV 55° x 35°
              </span>
            </div>
            <div className="font-mono text-slate-400">
              Rentang Sensor: <strong className="text-emerald-700">-40°C ~ 300°C</strong>
            </div>
          </div>
        </div>
      </BaseCard>

      {/* 6. Modal Set URL Kamera yang Sleek dan Modern */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-[#00ba88]">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800">
                    Atur URL Live Streaming Kamera
                  </h4>
                  <p className="text-xs text-slate-400">
                    Masukkan URL streaming feed (RTSP/WebRTC/HTTP/YouTube embed)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 font-mono">
                  URL STREAMING KAMERA
                </label>
                <textarea
                  rows={3}
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://... atau http://... atau URL embed iframe"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-mono focus:outline-hidden focus:border-[#00ba88] focus:ring-1 focus:ring-[#00ba88] transition"
                  required
                />
              </div>

              {/* Preset Button Contoh */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                  Preset Cepat:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setInputUrl(DEFAULT_STREAM_PRESET)}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs transition">
                    Stream Demo (Loop)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputUrl("")}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 transition">
                    Kosongkan
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition">
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00ba88] hover:bg-emerald-600 text-white shadow-sm transition">
                  Simpan & Hubungkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal Log Riwayat Sensor Termal MLX90640 */}
      <ThermalLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        mannequinId={mannequinId}
        initialRows={rawRows}
      />
    </div>
  );
};

export default ThermalPage;
