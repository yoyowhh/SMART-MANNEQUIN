/* eslint-disable react-hooks/rules-of-hooks */
import BaseCard from "../../components/Elements/Card";
import { useState, useEffect, useCallback, useMemo } from "react";
import ApexChart from "../../components/Elements/Chart";
import { createChartOptions } from "../../helpers/utils";
import { Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useFetchSensor } from "../../hooks/useSensor";
import { useParams } from "react-router-dom";
import LiveIndicatorBadge from "../../components/Dashboard/LiveIndicatorBadge";
import SensorInfoCard from "../../components/Dashboard/SensorInfoCard";
import moment from "moment";
import Swal from "sweetalert2";
import GasLogsModal from "../../components/Gas/GasLogsModal";
import {
  Clock,
  Activity,
  BarChart3,
  Layers,
  Calendar,
  Download,
  Wind,
  CloudFog,
  Flame,
  Info,
  ScrollText,
} from "lucide-react";

const PERIOD_OPTIONS = [
  { label: "10 Data", value: 10 },
  { label: "25 Data", value: 25 },
  { label: "50 Data", value: 50 },
  { label: "100 Data", value: 100 },
];

const GasPage = () => {
  const { t } = useTranslation();
  const params = useParams();
  const mannequinId = params?.id || 1;

  // Data State
  const [loading, setLoading] = useState(true);
  const [rawRows, setRawRows] = useState([]);
  const [latestCo, setLatestCo] = useState(0);
  const [latestSmoke, setLatestSmoke] = useState(0);
  const [latestCo2, setLatestCo2] = useState(0);
  const [latestNh3, setLatestNh3] = useState(0);
  const [latestValue, setLatestValue] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // Connection & Period Filter
  const [isConnected, setIsConnected] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [limit, setLimit] = useState(10);

  // Helper status gas dengan skema warna hijau emerald
  const getGasStatus = (val, thresholdWarn = 35, thresholdDanger = 65) => {
    if (val >= thresholdDanger) {
      return {
        label: "Bahaya Tinggi",
        badgeClass: "bg-red-100 text-red-700 border-red-200",
        desc: "Konsentrasi gas melebihi ambang batas bahaya",
      };
    }
    if (val >= thresholdWarn) {
      return {
        label: "Waspada",
        badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
        desc: "Konsentrasi gas sedang / perlu ventilasi",
      };
    }
    return {
      label: "Normal",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      desc: "Kualitas udara normal dan bebas cemaran gas",
    };
  };

  // Fetch data dari backend
  const fetchAndProcessData = useCallback(async () => {
    try {
      const sensorIdToFetch = String(mannequinId) === "2" ? 103 : 101;
      const response = await useFetchSensor("mq", sensorIdToFetch, mannequinId, true, limit);

      setLoading(false);
      setLastFetchTime(new Date());

      const apiData = response?.data;
      const rows = Array.isArray(apiData?.data)
        ? apiData.data
        : Array.isArray(apiData)
        ? apiData
        : [];

      setRawRows(rows);

      if (rows && rows.length > 0) {
        setIsConnected(true);
        const latest = rows[0]; // baris terbaru (ORDER BY event_id DESC)

        const coVal = parseFloat(latest.co) || 0;
        const smokeVal = parseFloat(latest.smoke) || 0;
        const co2Val = parseFloat(latest.co2) || 0;
        const nh3Val = parseFloat(latest.nh3) || 0;
        const rawVal = parseFloat(latest.value) || 0;

        setLatestCo(coVal);
        setLatestSmoke(smokeVal);
        setLatestCo2(co2Val);
        setLatestNh3(nh3Val);
        setLatestValue(rawVal);
        setLastUpdateTime(latest.inputed_at);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Error fetching gas data:", error);
      setIsConnected(false);
    }
  }, [mannequinId, limit]);

  useEffect(() => {
    fetchAndProcessData();
    const intervalId = setInterval(fetchAndProcessData, 3000);
    return () => clearInterval(intervalId);
  }, [fetchAndProcessData]);

  // Ekspor CSV
  const handleExportCSV = () => {
    if (!rawRows || rawRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Tidak Ada Data",
        text: "Belum ada riwayat telemetri gas yang dapat diekspor.",
      });
      return;
    }

    const headers = [
      "No",
      "Waktu Pencatatan (WIB)",
      "Sensor ID",
      "Nama Sensor",
      "Partikel Asap / Smoke (PPM)",
      "Amonia / NH3 (PPM)",
      "Karbon Dioksida / CO2 (PPM)",
      "Karbon Monoksida / CO (PPM)",
      "Analog ADC Value",
      "Status Kualitas Udara",
      "Mannequin ID",
    ];

    let no = 1;
    const rows = rawRows.map((item) => {
      const coVal = parseFloat(item.co) || 0;
      const smokeVal = parseFloat(item.smoke) || 0;
      const co2Val = parseFloat(item.co2) || 0;
      const nh3Val = parseFloat(item.nh3) || 0;
      const rawVal = parseFloat(item.value) || 0;

      const status =
        coVal >= 50 || smokeVal >= 60
          ? "Bahaya Gas"
          : coVal >= 25 || smokeVal >= 30
          ? "Waspada"
          : "Normal";

      return [
        no++,
        item.inputed_at
          ? moment(item.inputed_at).format("YYYY-MM-DD HH:mm:ss")
          : "-",
        item.sensor_id || (String(mannequinId) === "2" ? "103" : "101"),
        String(mannequinId) === "2" ? "MiCS-6814" : "MQ-2 Gas Detector",
        smokeVal.toFixed(2),
        nh3Val.toFixed(2),
        co2Val.toFixed(2),
        coVal.toFixed(2),
        rawVal,
        status,
        item.mannequin_id || mannequinId,
      ];
    });

    let csvContent = "\uFEFF"; // UTF-8 BOM
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
      `gas_telemetry_mannequin_${mannequinId}_${moment().format("YYYYMMDD_HHmmss")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    Swal.fire({
      icon: "success",
      title: "Ekspor CSV Berhasil",
      text: `${rows.length} baris riwayat data gas berhasil diunduh.`,
      timer: 2200,
      showConfirmButton: false,
    });
  };

  // Multi-Parameter ApexChart Data (Smoke, NH3, CO2, CO)
  const chartData = useMemo(() => {
    if (!rawRows || rawRows.length === 0) return null;

    // Balik urutan agar kronologis dari kiri ke kanan
    const chronological = [...rawRows].reverse();

    const categories = chronological.map((item) =>
      item?.inputed_at ? moment(item.inputed_at).format("HH:mm:ss") : moment().format("HH:mm:ss")
    );

    const smokeSeries = chronological.map((item) => parseFloat(item.smoke) || 0);
    const nh3Series = chronological.map((item) => parseFloat(item.nh3) || 0);
    const co2Series = chronological.map((item) => parseFloat(item.co2) || 0);
    const coSeries = chronological.map((item) => parseFloat(item.co) || 0);

    const allValues = [...smokeSeries, ...nh3Series, ...co2Series, ...coSeries];
    const peakVal = allValues.length > 0 ? Math.max(...allValues).toFixed(1) : "0";
    const minVal = allValues.length > 0 ? Math.min(...allValues).toFixed(1) : "0";
    const meanVal =
      allValues.length > 0
        ? (allValues.reduce((a, b) => a + b, 0) / allValues.length).toFixed(1)
        : "0";

    const multiSeries = [
      { name: "Partikel Asap (Smoke)", data: smokeSeries },
      { name: "Amonia (NH3)", data: nh3Series },
      { name: "Karbon Dioksida (CO2)", data: co2Series },
      { name: "Karbon Monoksida (CO)", data: coSeries },
    ];

    const baseOpt = createChartOptions(
      "Gas-Monitor",
      "Gas Chart",
      categories,
    );

    const multiOptions = {
      ...baseOpt,
      title: { text: undefined }, // Matikan duplicate title
      chart: {
        ...baseOpt.chart,
        type: "line",
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
      colors: ["#00ba88", "#0ea5e9", "#f59e0b", "#ef4444"], // 4 warna berbeda: Hijau Emerald (Asap), Biru (NH3), Amber (CO2), Merah (CO)
      stroke: {
        curve: "smooth",
        width: 2.5,
      },
      markers: {
        size: 0,
        hover: { size: 5 },
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
          formatter: (val) => (val !== undefined ? `${val} PPM` : "-"),
        },
      },
      yaxis: {
        ...baseOpt.yaxis,
        title: {
          text: "Konsentrasi Gas (PPM)",
          style: { fontSize: "12px", fontWeight: "600", color: "#64748b" },
        },
        min: 0,
        forceNiceScale: true,
      },
      annotations: {
        yaxis: [
          {
            y: 75,
            borderColor: "#059669",
            strokeDashArray: 4,
            label: {
              borderColor: "#059669",
              style: { color: "#fff", background: "#059669", fontSize: "10px", fontWeight: "bold" },
              text: "Ambang Batas Waspada (75 PPM)",
            },
          },
        ],
      },
    };

    return { multiSeries, multiOptions, stats: { peakVal, minVal, meanVal } };
  }, [rawRows]);

  const statusSmoke = getGasStatus(latestSmoke, 30, 60);
  const statusNh3 = getGasStatus(latestNh3, 20, 40);
  const statusCo2 = getGasStatus(latestCo2, 100, 300);
  const statusCo = getGasStatus(latestCo, 25, 50);

  const formattedUpdateTime = lastUpdateTime
    ? moment(lastUpdateTime).format("DD/MM/YYYY, HH:mm:ss") + " WIB"
    : lastFetchTime
    ? moment(lastFetchTime).format("DD/MM/YYYY, HH:mm:ss") + " WIB"
    : "-";

  return (
    <div className="w-full pb-2 space-y-6">
      {/* Control Toolbar: Status Koneksi & Filter Periode Waktu (Paling Atas, tanpa tombol Ekspor CSV) */}
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
                  {t("common.online", "ONLINE • TERHUBUNG")}
                </span>
              </>
            ) : (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-400"></span>
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  {t("common.offline", "STANDBY / OFFLINE")}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{t("common.lastUpdated", "Update Terakhir:")}</span>
            <span className="font-bold text-slate-700">{formattedUpdateTime}</span>
          </div>
        </div>
      </div>

      {/* Informasi Sensor (Ukuran Gambar Besar Sama Seperti Sensor Suara) */}
      <SensorInfoCard
        title={t("sensorInfo.title", "Informasi Sensor")}
        sensorCode="MQ-2 / GAS SENSOR"
        imageSrc="/images/information/gas-information.png"
        imageAlt="gas-information"
        action={
          <button
            type="button"
            onClick={() => setIsLogsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <ScrollText size={14} />
            <span>{t("common.viewLogs", "Lihat Log Riwayat Sensor")}</span>
          </button>
        }
      >
        <div className="flex flex-col gap-2">
          <h4 className="font-bold text-slate-800 text-base">
            Sistem Sensor Gas MQ-2 (Air Quality & Flammable Gas)
          </h4>
          <p className="text-slate-600 text-sm leading-relaxed text-left">
            {t(
              "gasSensor.deskripsiSensor",
              "Sensor Gas MQ-2 adalah sensor yang dapat mendeteksi gas seperti LPG, i-butana, propana, metana, alkohol, hidrogen, asap dan karbon monoksida. Sensor ini memiliki dua pin keluaran, satu adalah keluaran analog (AO) dan yang lainnya adalah keluaran digital (DO). Sensor ini memiliki sensitivitas yang tinggi dan waktu respon yang cepat. Sensor ini sangat cocok untuk aplikasi deteksi gas dan pemantauan kualitas udara lingkungan secara real-time."
            )}
          </p>
        </div>
      </SensorInfoCard>

      {/* Row 1: 4 Cards Khusus Tiap Parameter Gas (Smoke, NH3, CO2, CO) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Partikel Asap (Smoke) */}
        <BaseCard
          height="h-auto"
          mobileHeight="h-auto"
          className="relative overflow-hidden group hover:border-emerald-300 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-[#00ba88]">
                  <CloudFog className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    Partikel Asap
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Smoke / LPG</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${statusSmoke.badgeClass}`}>
                {statusSmoke.label}
              </span>
            </div>

            {/* Nilai Utama */}
            <div className="py-1">
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-3xl sm:text-4xl font-black text-[#00ba88] tracking-tight">
                  {latestSmoke.toFixed(1)}
                </span>
                <span className="text-sm font-bold text-slate-400">PPM</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>Batas Toleransi:</span>
              <span className="font-semibold text-emerald-700 font-mono">&lt; 50 PPM</span>
            </div>
          </div>
        </BaseCard>

        {/* Card 2: Gas Amonia (NH3) */}
        <BaseCard
          height="h-auto"
          mobileHeight="h-auto"
          className="relative overflow-hidden group hover:border-emerald-300 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-[#00ba88]">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    Gas Amonia
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">NH3 • Bau Menyengat</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${statusNh3.badgeClass}`}>
                {statusNh3.label}
              </span>
            </div>

            {/* Nilai Utama */}
            <div className="py-1">
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-3xl sm:text-4xl font-black text-[#00ba88] tracking-tight">
                  {latestNh3.toFixed(1)}
                </span>
                <span className="text-sm font-bold text-slate-400">PPM</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>Batas Toleransi:</span>
              <span className="font-semibold text-emerald-700 font-mono">&lt; 25 PPM</span>
            </div>
          </div>
        </BaseCard>

        {/* Card 3: Karbon Dioksida (CO2) */}
        <BaseCard
          height="h-auto"
          mobileHeight="h-auto"
          className="relative overflow-hidden group hover:border-emerald-300 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-[#00ba88]">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    Karbon Dioksida
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">CO2 • Kerapatan Udara</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${statusCo2.badgeClass}`}>
                {statusCo2.label}
              </span>
            </div>

            {/* Nilai Utama */}
            <div className="py-1">
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-3xl sm:text-4xl font-black text-[#00ba88] tracking-tight">
                  {latestCo2.toFixed(1)}
                </span>
                <span className="text-sm font-bold text-slate-400">PPM</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>Batas Toleransi:</span>
              <span className="font-semibold text-emerald-700 font-mono">&lt; 100 PPM</span>
            </div>
          </div>
        </BaseCard>

        {/* Card 4: Karbon Monoksida (CO) */}
        <BaseCard
          height="h-auto"
          mobileHeight="h-auto"
          className="relative overflow-hidden group hover:border-emerald-300 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-[#00ba88]">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    Karbon Monoksida
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">CO • Gas Toksik</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${statusCo.badgeClass}`}>
                {statusCo.label}
              </span>
            </div>

            {/* Nilai Utama */}
            <div className="py-1">
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-3xl sm:text-4xl font-black text-[#00ba88] tracking-tight">
                  {latestCo.toFixed(1)}
                </span>
                <span className="text-sm font-bold text-slate-400">PPM</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>Batas Toleransi:</span>
              <span className="font-semibold text-emerald-700 font-mono">&lt; 35 PPM</span>
            </div>
          </div>
        </BaseCard>
      </div>

      {/* Row 2: Grafik Data Riwayat Sebelumnya (Multi-Parameter Multi-Gas: Smoke, NH3, CO2, CO) */}
      <div className="w-full">
        {!loading && chartData ? (
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
                        Multi-Parameter Multi-Gas
                      </span>
                      <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {limit} Titik Terakhir
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Komparasi tren konsentrasi Partikel Asap (Smoke), Gas Amonia (NH3), Karbon Dioksida (CO2), dan Karbon Monoksida (CO)
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
                  {/* Pilihan Periode Waktu */}
                  <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                      {t("common.period", "Periode:")}
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
                        {opt.value} {t("common.data", "Data")}
                      </button>
                    ))}
                  </div>

                  <LiveIndicatorBadge isLive={isConnected} label="TELEMETRI GAS" />
                </div>
              </div>

              {/* Area Grafik ApexChart */}
              <div className="w-full pt-1">
                <ApexChart
                  options={chartData.multiOptions}
                  series={chartData.multiSeries}
                  type="line"
                  height={350}
                />
              </div>
            </div>
          </BaseCard>
        ) : (
          <BaseCard height="auto" mobileHeight="auto" className="!h-auto">
            <Skeleton variant="rectangular" height={320} className="rounded-2xl" />
          </BaseCard>
        )}
      </div>

      {/* Row 3: Tabel Ketentuan & Ringkasan 10 Parameter Sensor Gas */}
      <BaseCard height="auto" mobileHeight="auto" className="!h-auto">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-[#00ba88] shrink-0 shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base">
                  Ringkasan Parameter Sensor Gas
                </h4>
                <p className="text-xs text-slate-400">
                  Parameter operasional, status batas ambang, dan waktu update telemetri real-time
                </p>
              </div>
            </div>
          </div>

          {/* Tabel Konten Ringkasan */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Nama Sensor</th>
                  <th className="py-3 px-4">Parameter Sensor</th>
                  <th className="py-3 px-4">Nilai Saat Ini</th>
                  <th className="py-3 px-4">Satuan</th>
                  <th className="py-3 px-4">Status Sensor</th>
                  <th className="py-3 px-4">Koneksi</th>
                  <th className="py-3 px-4">Waktu Update Terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {/* Parameter 1: Partikel Asap (Smoke) */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>Sensor Gas MQ-101</span>
                    </div>
                    <span className="block text-[11px] text-slate-400 font-normal pl-4">
                      Detektor Asap & LPG
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-mono text-[11px] font-semibold border border-emerald-200/60">
                      Partikel Asap (Smoke)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-[#00ba88] text-base">
                    {latestSmoke.toFixed(1)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-500">PPM</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border shadow-xs ${statusSmoke.badgeClass}`}>
                      {statusSmoke.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold font-mono text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {formattedUpdateTime}
                  </td>
                </tr>

                {/* Parameter 2: Gas Amonia (NH3) */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>Sensor Gas MQ-101</span>
                    </div>
                    <span className="block text-[11px] text-slate-400 font-normal pl-4">
                      Emisi Gas Amonia
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-mono text-[11px] font-semibold border border-emerald-200/60">
                      Amonia (NH3)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-[#00ba88] text-base">
                    {latestNh3.toFixed(1)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-500">PPM</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border shadow-xs ${statusNh3.badgeClass}`}>
                      {statusNh3.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold font-mono text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Online
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {formattedUpdateTime}
                  </td>
                </tr>

                {/* Parameter 3: Karbon Dioksida (CO2) */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>Sensor Gas MQ-101</span>
                    </div>
                    <span className="block text-[11px] text-slate-400 font-normal pl-4">
                      Konsentrasi Karbon Dioksida
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-mono text-[11px] font-semibold border border-emerald-200/60">
                      Karbon Dioksida (CO2)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-[#00ba88] text-base">
                    {latestCo2.toFixed(1)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-500">PPM</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border shadow-xs ${statusCo2.badgeClass}`}>
                      {statusCo2.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold font-mono text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-emerald-50"></span> Online
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {formattedUpdateTime}
                  </td>
                </tr>

                {/* Parameter 4: Karbon Monoksida (CO) */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>Sensor Gas MQ-101</span>
                    </div>
                    <span className="block text-[11px] text-slate-400 font-normal pl-4">
                      MQ-2 / MiCS Multi-Gas
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-mono text-[11px] font-semibold border border-emerald-200/60">
                      Karbon Monoksida (CO)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-[#00ba88] text-base">
                    {latestCo.toFixed(1)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-500">PPM</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border shadow-xs ${statusCo.badgeClass}`}>
                      {statusCo.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold font-mono text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-emerald-50 animate-pulse"></span> Online
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {formattedUpdateTime}
                  </td>
                </tr>

                {/* Parameter 5: Raw Analog ADC */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>Modul ADC Sensor Gas</span>
                    </div>
                    <span className="block text-[11px] text-slate-400 font-normal pl-4">
                      Tegangan Analog Konversi
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-mono text-[11px] font-semibold border border-emerald-200/60">
                      Nilai Mentah (Analog ADC)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-[#00ba88] text-base">
                    {latestValue}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-500">ADC</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
                      Aktif
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold font-mono text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-emerald-50"></span> Online
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {formattedUpdateTime}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Legend / Keterangan Batas Ambang Gas */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-semibold text-slate-600 font-mono">Batas Ambang Gas:</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> &lt; 25 PPM (Aman / Bersih)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span> 25 – 50 PPM (Waspada)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-600"></span> &ge; 50 PPM (Bahaya Tinggi)
              </span>
            </div>
            <div className="font-mono text-slate-400">
              Threshold Alarm Sistem: <strong className="text-emerald-700">75 PPM</strong>
            </div>
          </div>
        </div>
      </BaseCard>

      {/* Modal Log Riwayat Sensor Gas (Sama Seperti di SmartSkin) */}
      <GasLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        mannequinId={mannequinId}
        initialRows={rawRows}
        onExportCsv={handleExportCSV}
      />
    </div>
  );
};

export default GasPage;
