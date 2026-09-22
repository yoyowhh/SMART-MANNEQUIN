/* eslint-disable react-hooks/rules-of-hooks */
import BaseCard from "../../components/Elements/Card";
import { useState, useEffect, useCallback, useMemo } from "react";
import ApexChart from "../../components/Elements/Chart";
import {
  createChartOptions,
  processData,
  useNewDataDetector,
  getLatestData,
} from "../../helpers/utils";
import { Skeleton } from "@mui/material";
import LinearGauge from "../../components/Elements/LinearGauge";
import { useTranslation } from "react-i18next";
import { useFetchSensor } from "../../hooks/useSensor";
import { useParams } from "react-router-dom";
import LiveIndicatorBadge from "../../components/Dashboard/LiveIndicatorBadge";
import SensorInfoCard from "../../components/Dashboard/SensorInfoCard";
import moment from "moment";
import Swal from "sweetalert2";
import SoundLogsModal from "../../components/Sound/SoundLogsModal";
import {
  Wifi,
  WifiOff,
  Clock,
  Activity,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Layers,
  ArrowRightLeft,
  Calendar,
  Download,
  Headphones,
  Radio,
  ScrollText,
} from "lucide-react";

const PERIOD_OPTIONS = [
  { label: "10 Data", value: 10 },
  { label: "25 Data", value: 25 },
  { label: "50 Data", value: 50 },
  { label: "100 Data", value: 100 },
];

const SoundSensorPage = () => {
  const { t } = useTranslation();
  const params = useParams();
  const mannequinId = params?.id || 1;

  // State Data & UI
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState([]);
  const [options, setOptions] = useState([]);
  const [gaugeDataKy601, setGaugeDataKy601] = useState(0);
  const [gaugeDataKy602, setGaugeDataKy602] = useState(0);
  const [lastUpdateKy601, setLastUpdateKy601] = useState(null);
  const [lastUpdateKy602, setLastUpdateKy602] = useState(null);
  const [ky601RawRows, setKy601RawRows] = useState([]);
  const [ky602RawRows, setKy602RawRows] = useState([]);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // Connection & Health Status
  const [isConnected, setIsConnected] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Time Period & Multi-Parameter Filter
  const [limit, setLimit] = useState(10);
  const [chartMode, setChartMode] = useState("combined"); // 'combined' | 'split'

  // Alert Thresholds
  const [isHigh, setIsHigh] = useState(false);
  const [showHighMessage, setShowHighMessage] = useState(false);
  const [ky601IsHigh, setKy601IsHigh] = useState(false);
  const [ky602IsHigh, setKy602IsHigh] = useState(false);

  // Helper untuk menentukan status suara berdasarkan nilai dB
  const getSoundStatus = (val, isHighFlag) => {
    if (isHighFlag || val >= 75) {
      return {
        label: "Bising Tinggi (Warning)",
        badgeClass: "bg-red-100 text-red-700 border-red-200",
        color: "#ef4444",
        desc: "Tingkat kebisingan melebihi batas toleransi",
      };
    }
    if (val >= 45) {
      return {
        label: "Normal / Percakapan",
        badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
        color: "#f59e0b",
        desc: "Kondisi suara lingkungan sedang / wajar",
      };
    }
    return {
      label: "Hening / Tenang",
      badgeClass: "bg-emerald-100 text-[#00ba88] border-emerald-200",
      color: "#00ba88",
      desc: "Kondisi suara lingkungan sangat tenang",
    };
  };

  const fetchAndProcessData = useCallback(async () => {
    try {
      const [ky601Response, ky602Response] = await Promise.all([
        useFetchSensor("ky", 601, mannequinId, true, limit),
        useFetchSensor("ky", 602, mannequinId, true, limit),
      ]);

      setLoading(false);
      setLastFetchTime(new Date());

      const ky601Data = ky601Response?.data;
      const ky602Data = ky602Response?.data;

      const raw601 = ky601Data?.data || [];
      const raw602 = ky602Data?.data || [];

      setKy601RawRows(raw601);
      setKy602RawRows(raw602);

      const processedData = [
        processData(ky601Data, 601, "Telinga Kanan (KY-601)", "ky"),
        processData(ky602Data, 602, "Telinga Kiri (KY-602)", "ky"),
      ].filter(Boolean);

      const latestDataKy601 = getLatestData(ky601Data);
      const latestDataKy602 = getLatestData(ky602Data);

      const val601 = parseFloat(latestDataKy601?.value || 0);
      const val602 = parseFloat(latestDataKy602?.value || 0);

      setGaugeDataKy601(val601);
      setGaugeDataKy602(val602);

      if (latestDataKy601?.inputed_at) {
        setLastUpdateKy601(latestDataKy601.inputed_at);
      }
      if (latestDataKy602?.inputed_at) {
        setLastUpdateKy602(latestDataKy602.inputed_at);
      }

      // Deteksi status koneksi aktif
      const latestTs = latestDataKy601?.inputed_at || latestDataKy602?.inputed_at;
      if (latestTs) {
        const diffSeconds = (Date.now() - new Date(latestTs).getTime()) / 1000;
        // Jika data diterima atau rentang wajar, dianggap online
        setIsConnected(diffSeconds < 60 || (raw601.length > 0 && ky601Response?.status === "ok"));
      } else {
        setIsConnected(raw601.length > 0 || raw602.length > 0);
      }

      const createOptions = [
        createChartOptions(
          "KY-601",
          t("soundSensor.sensorSuara1") || "Telinga Kanan (KY-601)",
          processedData[0]?.categories || [],
        ),
        createChartOptions(
          "KY-602",
          t("soundSensor.sensorSuara2") || "Telinga Kiri (KY-602)",
          processedData[1]?.categories || [],
        ),
      ];

      setKy601IsHigh(Boolean(ky601Response?.is_high_value));
      setKy602IsHigh(Boolean(ky602Response?.is_high_value));
      setOptions(createOptions);
      setSeries(processedData);
    } catch (error) {
      console.error("Error fetching sound data:", error);
      setIsConnected(false);
    }
  }, [mannequinId, limit, t]);

  useEffect(() => {
    fetchAndProcessData();
    const intervalId = setInterval(fetchAndProcessData, 3000);
    return () => clearInterval(intervalId);
  }, [fetchAndProcessData]);

  // Deteksi ambang batas suara berlebih
  useEffect(() => {
    const newIsHigh = ky601IsHigh || ky602IsHigh;
    setIsHigh(newIsHigh);
    setShowHighMessage(newIsHigh);
  }, [ky601IsHigh, ky602IsHigh]);

  const isNewData1 = useNewDataDetector(series[0]?.data);
  const isNewData2 = useNewDataDetector(series[1]?.data);

  // Multi-parameter metrics & statistik
  const averageValue = ((gaugeDataKy601 + gaugeDataKy602) / 2).toFixed(1);
  const diffStereo = Math.abs(gaugeDataKy601 - gaugeDataKy602).toFixed(1);
  const stereoDominance =
    gaugeDataKy601 > gaugeDataKy602
      ? "Dominan Kanan (+ " + diffStereo + " dB)"
      : gaugeDataKy602 > gaugeDataKy601
      ? "Dominan Kiri (+ " + diffStereo + " dB)"
      : "Seimbang (Stereo Balanced)";

  // Format Waktu Terakhir
  const primaryLastUpdate = lastUpdateKy601 || lastUpdateKy602;
  const formattedUpdateTime = primaryLastUpdate
    ? moment(primaryLastUpdate).format("DD/MM/YYYY, HH:mm:ss") + " WIB"
    : "-";
  const relativeUpdateTime = primaryLastUpdate
    ? moment(primaryLastUpdate).fromNow()
    : "Menunggu data...";

  // Ekspor Data Telemetri Suara ke Format CSV
  const handleExportCSV = () => {
    if (
      (!ky601RawRows || ky601RawRows.length === 0) &&
      (!ky602RawRows || ky602RawRows.length === 0)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Data Kosong",
        text: "Belum ada riwayat data telemetri suara untuk diekspor saat ini.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const headers = [
      "No",
      "Timestamp (WIB)",
      "Sensor ID",
      "Nama Sensor",
      "Kanal Anatomis",
      "Nilai Intensitas (dB)",
      "Nilai Raw (ADC)",
      "Status Kondisi",
      "Mannequin ID",
    ];

    const rows = [];
    let no = 1;

    // Data KY-601 (Telinga Kanan)
    ky601RawRows.forEach((item) => {
      const val = parseFloat(item.value) || 0;
      const adc = Math.round(val * 10.24);
      const status =
        val >= 75
          ? "Bising Tinggi (Warning)"
          : val >= 45
          ? "Normal / Percakapan"
          : "Hening / Tenang";
      rows.push([
        no++,
        item.inputed_at
          ? moment(item.inputed_at).format("YYYY-MM-DD HH:mm:ss")
          : "-",
        "KY-601",
        "Sensor Suara 1",
        "Telinga Kanan",
        val.toFixed(1),
        adc,
        status,
        item.mannequin_id || mannequinId,
      ]);
    });

    // Data KY-602 (Telinga Kiri)
    ky602RawRows.forEach((item) => {
      const val = parseFloat(item.value) || 0;
      const adc = Math.round(val * 10.24);
      const status =
        val >= 75
          ? "Bising Tinggi (Warning)"
          : val >= 45
          ? "Normal / Percakapan"
          : "Hening / Tenang";
      rows.push([
        no++,
        item.inputed_at
          ? moment(item.inputed_at).format("YYYY-MM-DD HH:mm:ss")
          : "-",
        "KY-602",
        "Sensor Suara 2",
        "Telinga Kiri",
        val.toFixed(1),
        adc,
        status,
        item.mannequin_id || mannequinId,
      ]);
    });

    let csvContent = "\uFEFF"; // UTF-8 BOM untuk Microsoft Excel
    csvContent += headers.join(",") + "\n";
    rows.forEach((r) => {
      csvContent +=
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `sound_telemetry_mannequin_${mannequinId}_${moment().format("YYYYMMDD_HHmmss")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    Swal.fire({
      icon: "success",
      title: "Ekspor CSV Berhasil",
      text: `${rows.length} baris riwayat data suara berhasil diunduh.`,
      timer: 2200,
      showConfirmButton: false,
    });
  };

  // Hitung data series gabungan (Multi-parameter chart)
  const combinedChartData = useMemo(() => {
    const rev601 = [...ky601RawRows].reverse();
    const rev602 = [...ky602RawRows].reverse();

    const maxLen = Math.max(rev601.length, rev602.length);
    if (maxLen === 0) return null;

    const refRows = rev601.length >= rev602.length ? rev601 : rev602;
    const categories = refRows.map((r) =>
      r?.inputed_at ? moment(r.inputed_at).format("HH:mm:ss") : moment().format("HH:mm:ss")
    );

    const getAlignedData = (rows) => {
      const data = rows.map((r) => parseFloat(r.value) || 0);
      while (data.length < categories.length) {
        data.unshift(data[0] ?? 0);
      }
      return data.slice(data.length - categories.length);
    };

    const data601 = getAlignedData(rev601);
    const data602 = getAlignedData(rev602);

    // Hitung rata-rata tiap titik
    const avgData = categories.map((_, i) => {
      const v1 = data601[i] ?? 0;
      const v2 = data602[i] ?? 0;
      return parseFloat(((v1 + v2) / 2).toFixed(1));
    });

    // Hitung ringkasan statistik periode ini
    const allVals = [...data601, ...data602].filter(
      (v) => typeof v === "number" && !isNaN(v),
    );
    const peakVal = allVals.length > 0 ? Math.max(...allVals).toFixed(1) : "-";
    const minVal = allVals.length > 0 ? Math.min(...allVals).toFixed(1) : "-";
    const meanVal =
      allVals.length > 0
        ? (allVals.reduce((a, b) => a + b, 0) / allVals.length).toFixed(1)
        : "-";

    const multiSeries = [
      {
        name: "Telinga Kanan (KY-601)",
        data: data601,
      },
      {
        name: "Telinga Kiri (KY-602)",
        data: data602,
      },
      {
        name: "Rata-rata Lingkungan (Ambience)",
        data: avgData,
      },
    ];

    const baseOpt = createChartOptions(
      "KY-Combined",
      "",
      categories,
    );

    const multiOptions = {
      ...baseOpt,
      title: {
        text: undefined, // Hapus judul ganda internal ApexCharts
      },
      colors: ["#00ba88", "#0ea5e9", "#f59e0b"], // 3 warna berbeda: Hijau Emerald, Biru Langit, Amber
      chart: {
        ...baseOpt.chart,
        type: "area",
        toolbar: {
          show: false,
        },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
          dynamicAnimation: {
            enabled: true,
            speed: 1000,
          },
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.22,
          opacityTo: 0.02,
          stops: [0, 90, 100],
        },
      },
      stroke: {
        curve: "smooth",
        width: [2.5, 2.5, 2],
        dashArray: [0, 0, 4],
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
        y: {
          formatter: (val) => (val !== undefined ? `${val} dB` : "-"),
        },
      },
      yaxis: {
        ...baseOpt.yaxis,
        title: {
          text: "Intensitas Suara (dB)",
          style: { fontSize: "12px", fontWeight: "600", color: "#64748b" },
        },
        min: 0,
        forceNiceScale: true,
      },
      annotations: {
        yaxis: [
          {
            y: 89,
            borderColor: "#ef4444",
            strokeDashArray: 4,
            label: {
              borderColor: "#ef4444",
              style: { color: "#fff", background: "#ef4444", fontSize: "10px", fontWeight: "bold" },
              text: "Ambang Batas Peringatan (89 dB)",
            },
          },
        ],
      },
    };

    return { multiSeries, multiOptions, stats: { peakVal, minVal, meanVal } };
  }, [ky601RawRows, ky602RawRows]);

  const statusKy601 = getSoundStatus(gaugeDataKy601, ky601IsHigh);
  const statusKy602 = getSoundStatus(gaugeDataKy602, ky602IsHigh);

  return (
    <div className="w-full pb-2 space-y-6">
      {/* Control Toolbar: Status Koneksi, Filter Periode Waktu & Mode Grafik (Paling Atas) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                <span className="h-3 w-3 rounded-full bg-slate-400"></span>
                <span className="text-xs font-bold text-slate-600 font-mono">
                  STANDBY / OFFLINE
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Update Terakhir:</span>
            <span className="font-semibold font-mono text-slate-700">
              {formattedUpdateTime}
            </span>
            <span className="text-[11px] text-slate-400">({relativeUpdateTime})</span>
          </div>
        </div>

        {/* Pilihan Periode Waktu & Ekspor CSV */}
        <div className="flex flex-wrap items-center gap-3">
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
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  limit === opt.value
                    ? "bg-white text-[#00ba88] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Informasi Sensor Card (Sama Seperti di Sensor Gas) */}
      <SensorInfoCard
        title={t("informasiSensor") || "Informasi Sensor"}
        sensorCode="KY-037 / SOUND SENSOR"
        imageSrc="/images/information/sound-information.png"
        imageAlt="sound-information"
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
        <div className="flex flex-col gap-2">
          <h4 className="font-bold text-slate-800 text-base">
            Sistem Sensor Suara KY-037 & KY-038 (Dual-Channel Acoustic)
          </h4>
          <p className="text-slate-600 text-sm leading-relaxed text-justify">
            Sensor Suara KY-037/KY-038 dirancang untuk mendeteksi intensitas gelombang suara dan getaran akustik lingkungan pada manekin di dua titik anatomis (Telinga Kiri dan Telinga Kanan). Dilengkapi pembanding komparasi stereo, pemantau ambang batas kebisingan (Heartrate/Acoustic pulse), serta riwayat telemetri real-time.
          </p>
        </div>
      </SensorInfoCard>

      {/* Row 1: Cards Informasi Nilai Saat Ini & Multi-Parameter */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Telinga Kiri (KY-602) */}
        <BaseCard className="relative overflow-hidden group hover:border-emerald-300">
          <div className="flex flex-col gap-3 justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-[#00ba88]">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    {t("soundSensor.telinga-kiri") || "Telinga Kiri"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">KY-602 • Kanal Kiri</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs bg-emerald-50 text-emerald-700 border-emerald-200/80">
                {statusKy602.label}
              </span>
            </div>

            {/* Nilai Utama, Equalizer Wave, & Gauge */}
            <div className="flex justify-between items-end w-full flex-grow pt-1">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl sm:text-4xl font-black text-[#00ba88] tracking-tight">
                    {gaugeDataKy602}
                  </span>
                  <span className="text-sm font-bold text-slate-400">dB</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Raw: ~{Math.round(gaugeDataKy602 * 10.24)} ADC
                </span>

                {/* Micro Equalizer Waveform Bars (Green) */}
                <div className="flex items-end gap-1 h-6 mt-2 px-2 py-1 rounded-md bg-emerald-50/70 border border-emerald-100/80 w-fit">
                  {[35, 75, 50, 90, 60, 80].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-[#00ba88] rounded-full transition-all duration-300"
                      style={{
                        height: `${Math.min(100, Math.max(18, (gaugeDataKy602 / 100) * h))}%`,
                        opacity: 0.6 + (i % 2) * 0.4,
                      }}
                    />
                  ))}
                  <span className="text-[9px] font-mono text-emerald-700 font-bold ml-1">EQ</span>
                </div>
              </div>

              <LinearGauge
                GHeight={125}
                GWidth={75}
                height={115}
                width={38}
                max={100}
                value={gaugeDataKy602}
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-slate-400" />
                <span>Status Kanal:</span>
              </span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
              </span>
            </div>
          </div>
        </BaseCard>

        {/* Card 2: Telinga Kanan (KY-601) */}
        <BaseCard className="relative overflow-hidden group hover:border-emerald-300">
          <div className="flex flex-col gap-3 justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-[#00ba88]">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    {t("soundSensor.telinga-kanan") || "Telinga Kanan"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">KY-601 • Kanal Kanan</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs bg-emerald-50 text-emerald-700 border-emerald-200/80">
                {statusKy601.label}
              </span>
            </div>

            {/* Nilai Utama, Equalizer Wave, & Gauge */}
            <div className="flex justify-between items-end w-full flex-grow pt-1">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl sm:text-4xl font-black text-[#00ba88] tracking-tight">
                    {gaugeDataKy601}
                  </span>
                  <span className="text-sm font-bold text-slate-400">dB</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Raw: ~{Math.round(gaugeDataKy601 * 10.24)} ADC
                </span>

                {/* Micro Equalizer Waveform Bars (Green) */}
                <div className="flex items-end gap-1 h-6 mt-2 px-2 py-1 rounded-md bg-emerald-50/70 border border-emerald-100/80 w-fit">
                  {[45, 85, 60, 95, 40, 75].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-[#00ba88] rounded-full transition-all duration-300"
                      style={{
                        height: `${Math.min(100, Math.max(18, (gaugeDataKy601 / 100) * h))}%`,
                        opacity: 0.6 + (i % 2) * 0.4,
                      }}
                    />
                  ))}
                  <span className="text-[9px] font-mono text-emerald-700 font-bold ml-1">EQ</span>
                </div>
              </div>

              <LinearGauge
                GHeight={125}
                GWidth={75}
                height={115}
                width={38}
                max={100}
                value={gaugeDataKy601}
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-slate-400" />
                <span>Status Kanal:</span>
              </span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
              </span>
            </div>
          </div>
        </BaseCard>

        {/* Card 3: Multi-Parameter Stereo & Rata-rata Ambience */}
        <BaseCard className="relative overflow-hidden group hover:border-emerald-300">
          <div className="flex flex-col justify-between h-full gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-[#00ba88]">
                  <Radio className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm">
                  Analisis Stereo & Ambience
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                STEREO
              </span>
            </div>

            {/* Rata-Rata Ambience Nilai */}
            <div className="space-y-2 py-0.5">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] font-medium text-slate-400">Rata-rata Ambience:</span>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-2xl font-black text-[#00ba88]">
                    {averageValue}
                  </span>
                  <span className="text-xs font-bold text-slate-400">dB</span>
                </div>
              </div>

              {/* Spectrum Meter Bar 0-100 dB (Pure Emerald Gradient) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-emerald-700 font-semibold">
                  <span>Hening (&lt;45)</span>
                  <span>Wajar (45-75)</span>
                  <span>Bising (&gt;75)</span>
                </div>
                <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-300 via-emerald-400 to-[#00ba88]"
                    style={{ width: `${Math.min(100, Math.max(5, parseFloat(averageValue) || 0))}%` }}
                  />
                </div>
              </div>

              {/* Stereo Balance Indicator Slider */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span>Kiri (L)</span>
                  <span className="font-mono text-[11px] font-bold text-emerald-700">
                    {stereoDominance}
                  </span>
                  <span>Kanan (R)</span>
                </div>
                <div className="relative h-1.5 bg-slate-100 rounded-full mt-1 border border-slate-200">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-[#00ba88] border-2 border-white rounded-full shadow-xs transition-all duration-500"
                    style={{
                      left: `${Math.min(92, Math.max(8, 50 + (gaugeDataKy601 - gaugeDataKy602) * 1.5))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Ambang Toleransi:</span>
              <span className="font-bold text-emerald-700 font-mono">≤ 89 dB</span>
            </div>
          </div>
        </BaseCard>

        {/* Card 4: Detak Akustik / Heartrate Pulse Monitor */}
        <BaseCard className="relative overflow-hidden group hover:border-emerald-300">
          <div className="flex flex-col gap-2 justify-between h-full">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-[#00ba88]">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm">
                  Acoustic Pulse Monitor
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#00ba88] border border-emerald-200">
                PULSE
              </span>
            </div>

            {/* Gambar Jantung dengan Animasi Pulse Hijau */}
            <div className="relative self-center flex items-center justify-center py-2">
              <div
                className="absolute rounded-full bg-emerald-400"
                style={{
                  width: "90px",
                  height: "90px",
                  animation: `heartPulse 1s ease-in-out infinite`,
                  opacity: 0.3,
                }}
              />
              <div
                className="absolute rounded-full bg-emerald-300"
                style={{
                  width: "70px",
                  height: "70px",
                  animation: `heartPulse 1s ease-in-out infinite`,
                  animationDelay: "0.1s",
                  opacity: 0.4,
                }}
              />
              <img
                src="/images/heart.png"
                alt="heartrate"
                style={{
                  width: "60px",
                  position: "relative",
                  animation: `heartBeat 1s ease-in-out infinite`,
                  filter: "drop-shadow(0 0 8px rgba(0,186,136,0.65))",
                }}
              />
            </div>
            <style>{`
              @keyframes heartBeat {
                0%   { transform: scale(1); }
                15%  { transform: scale(1.18); }
                30%  { transform: scale(1); }
                45%  { transform: scale(1.12); }
                60%  { transform: scale(1); }
                100% { transform: scale(1); }
              }
              @keyframes heartPulse {
                0%   { transform: scale(0.8); opacity: 0.4; }
                50%  { transform: scale(1.3); opacity: 0; }
                100% { transform: scale(0.8); opacity: 0; }
              }
            `}</style>

            <div className="flex flex-col items-center gap-1 pb-1">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-bold border bg-emerald-50 text-[#00ba88] border-emerald-200/60">
                {t("LowHeart") || "Ritme Normal"}
              </span>
            </div>
          </div>
        </BaseCard>
      </div>

      {/* Row 2: Grafik Data Riwayat Sebelumnya */}
      <div className="w-full">
        {!loading && combinedChartData ? (
          <BaseCard height="auto" mobileHeight="auto" className="!h-auto">
            <div className="flex flex-col gap-4">
              {/* Header Kartu Grafik */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-[#00ba88] shrink-0 shadow-xs">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800 text-base">
                        Grafik Riwayat Data Sebelumnya
                      </h4>
                      <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Multi-Parameter Dual-Channel
                      </span>
                      <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {limit} Titik Terakhir
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Komparasi gelombang suara Telinga Kanan (KY-601), Telinga Kiri (KY-602), dan Rata-rata Ambience
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <LiveIndicatorBadge isLive={isNewData1 || isNewData2} label="TELEMETRI STEREO" />
                </div>
              </div>

              {/* Area Grafik ApexChart */}
              <div className="w-full pt-1">
                <ApexChart
                  options={combinedChartData.multiOptions}
                  series={combinedChartData.multiSeries}
                  height={350}
                />
              </div>

              {/* Summary Strip / Footer Statistik Grafik */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 bg-slate-50/70 p-3.5 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-slate-400">Puncak Suara (Peak):</span>
                  <span className="text-base font-bold font-mono text-red-500 mt-0.5">
                    {combinedChartData.stats.peakVal} <span className="text-xs text-slate-400">dB</span>
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-slate-400">Tingkat Minimum (Floor):</span>
                  <span className="text-base font-bold font-mono text-blue-600 mt-0.5">
                    {combinedChartData.stats.minVal} <span className="text-xs text-slate-400">dB</span>
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-slate-400">Rata-rata Periode Ini:</span>
                  <span className="text-base font-bold font-mono text-amber-600 mt-0.5">
                    {combinedChartData.stats.meanVal} <span className="text-xs text-slate-400">dB</span>
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-slate-400">Status Ambang Batas:</span>
                  <span className="text-xs font-bold font-mono text-slate-700 mt-1 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
                    Maks Aman 89 dB
                  </span>
                </div>
              </div>
            </div>
          </BaseCard>
        ) : (
          <BaseCard height="auto" mobileHeight="auto" className="!h-auto">
            <Skeleton variant="rectangular" height={360} className="rounded-xl" />
          </BaseCard>
        )}
      </div>

      {/* Row 3: Tabel Informasi & Ketentuan Sensor Suara */}
      <BaseCard height="auto" mobileHeight="auto" className="!h-auto">
        <div className="flex flex-col gap-4">
          {/* Header Kartu Tabel */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-[#00ba88] shrink-0 shadow-xs">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-slate-800 text-base">
                    Tabel Ketentuan & Ringkasan Parameter Sensor Suara
                  </h4>
                  <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                    4 Parameter Aktif
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Spesifikasi telemetri real-time, status batas ambang, dan waktu update terakhir
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-center">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
                title="Unduh seluruh data tabel ini ke format CSV">
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Ekspor CSV</span>
              </button>
              <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold border border-emerald-200/80 shadow-xs flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE MONITORING
              </span>
            </div>
          </div>

          {/* Table Container dengan Border Rapi */}
          <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-xs">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="bg-slate-50/90 text-slate-700 border-b border-slate-200/80 text-[11px] uppercase font-mono tracking-wider">
                  <th className="py-3 px-4 font-bold">Nama Sensor</th>
                  <th className="py-3 px-4 font-bold">Parameter</th>
                  <th className="py-3 px-4 font-bold">Nilai Saat Ini</th>
                  <th className="py-3 px-4 font-bold">Satuan</th>
                  <th className="py-3 px-4 font-bold">Status Sensor</th>
                  <th className="py-3 px-4 font-bold">Status Koneksi</th>
                  <th className="py-3 px-4 font-bold">Waktu Update Terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium bg-white">
                {/* Parameter 1: Telinga Kanan (KY-601) */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>Sensor Suara (KY-601)</span>
                    </div>
                    <span className="block text-[11px] text-slate-400 font-normal pl-4">
                      Telinga Kanan Mannequin
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-mono text-[11px] font-semibold border border-emerald-200/60">
                      Intensitas Suara Kanan
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-[#00ba88] text-base">
                    {gaugeDataKy601}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-500">dB</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border shadow-xs ${statusKy601.badgeClass}`}>
                      {statusKy601.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold font-mono text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {lastUpdateKy601
                      ? moment(lastUpdateKy601).format("DD/MM/YYYY, HH:mm:ss") + " WIB"
                      : "-"}
                  </td>
                </tr>

                {/* Parameter 2: Telinga Kiri (KY-602) */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0"></span>
                      <span>Sensor Suara (KY-602)</span>
                    </div>
                    <span className="block text-[11px] text-slate-400 font-normal pl-4">
                      Telinga Kiri Mannequin
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-mono text-[11px] font-semibold border border-blue-200/60">
                      Intensitas Suara Kiri
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-blue-600 text-base">
                    {gaugeDataKy602}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-500">dB</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border shadow-xs ${statusKy602.badgeClass}`}>
                      {statusKy602.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold font-mono text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {lastUpdateKy602
                      ? moment(lastUpdateKy602).format("DD/MM/YYYY, HH:mm:ss") + " WIB"
                      : "-"}
                  </td>
                </tr>

                {/* Parameter 3: Rata-Rata Ambience */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0"></span>
                      <span>Acoustic Ambience</span>
                    </div>
                    <span className="block text-[11px] text-slate-400 font-normal pl-4">
                      Komposit Dual-Channel
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-mono text-[11px] font-semibold border border-amber-200/60">
                      Rata-Rata Kebisingan Ruang
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-amber-600 text-base">
                    {averageValue}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-500">dB</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200 shadow-xs">
                      Tingkat Ambience
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold font-mono text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Aktif
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {formattedUpdateTime}
                  </td>
                </tr>

                {/* Parameter 4: Stereo Differential Balance */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-purple-500 shrink-0"></span>
                      <span>Stereo Directional</span>
                    </div>
                    <span className="block text-[11px] text-slate-400 font-normal pl-4">
                      Selisih Kanan vs Kiri
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-mono text-[11px] font-semibold border border-purple-200/60">
                      Arah Sumber Suara (Δ)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-purple-600 text-base">
                    {diffStereo}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-500">dB</td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-700 font-semibold text-xs bg-slate-100 px-2 py-0.5 rounded">
                      {stereoDominance}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold font-mono text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Aktif
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {formattedUpdateTime}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Legend / Keterangan Batas Ambang */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-semibold text-slate-600 font-mono">Batas Ambang:</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> &lt; 45 dB (Hening / Tenang)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span> 45 – 75 dB (Wajar / Percakapan)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500"></span> &ge; 75 dB (Bising Tinggi)
              </span>
            </div>
            <div className="font-mono text-slate-400">
              Threshold Alarm Sistem: <strong className="text-red-500">89 dB</strong>
            </div>
          </div>
        </div>
      </BaseCard>

      {/* Modal Log Riwayat Sensor Suara (Sama Seperti di Sensor Gas) */}
      <SoundLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        mannequinId={mannequinId}
        ky601Rows={ky601RawRows}
        ky602Rows={ky602RawRows}
        onExportCsv={handleExportCSV}
      />
    </div>
  );
};

export default SoundSensorPage;
