/* eslint-disable react-hooks/rules-of-hooks */
import BaseCard from "../../components/Elements/Card";
import { useState, useEffect, useCallback, useMemo } from "react";
import ApexChart from "../../components/Elements/Chart";
import { createChartOptions } from "../../helpers/utils";
import { Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useFetchSensor } from "../../hooks/useSensor";
import SensorInfoCard from "../../components/Dashboard/SensorInfoCard";
import BmeLogsModal from "../../components/Bme/BmeLogsModal";
import moment from "moment";
import Swal from "sweetalert2";
import {
  Clock,
  Calendar,
  Thermometer,
  Droplets,
  Gauge,
  Mountain,
  ScrollText,
  Cpu,
} from "lucide-react";

const PERIOD_OPTIONS = [
  { label: "10 Data", value: 10 },
  { label: "25 Data", value: 25 },
  { label: "50 Data", value: 50 },
  { label: "100 Data", value: 100 },
];

const BmePage = () => {
  const { t } = useTranslation();
  const params = useParams();
  const mannequinId = params?.id || 1;

  // Data State
  const [loading, setLoading] = useState(true);
  const [rawRows, setRawRows] = useState([]);
  const [latestTemp, setLatestTemp] = useState(0);
  const [latestHumidity, setLatestHumidity] = useState(0);
  const [latestPressure, setLatestPressure] = useState(0);
  const [latestAltitude, setLatestAltitude] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // Status Koneksi & Filter Periode
  const [isConnected, setIsConnected] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [limit, setLimit] = useState(10);

  // Status kenyamanan lingkungan
  const getTempStatus = (val) => {
    if (val >= 35) {
      return {
        label: t("bmeSensor.extremeHot", "Panas Ekstrem"),
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
        desc: t("bmeSensor.extremeHotDesc", "Suhu di atas ambang batas wajar"),
      };
    }
    if (val >= 28) {
      return {
        label: t("bmeSensor.warm", "Hangat"),
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        desc: t("bmeSensor.warmDesc", "Suhu agak tinggi di atas batas optimal"),
      };
    }
    if (val < 18 && val > 0) {
      return {
        label: t("bmeSensor.cold", "Dingin"),
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
        desc: t("bmeSensor.coldDesc", "Suhu di bawah batas kenyamanan"),
      };
    }
    return {
      label: t("bmeSensor.optimalCool", "Optimal / Sejuk"),
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      desc: t("bmeSensor.optimalCoolDesc", "Kondisi termal ideal ruang uji"),
    };
  };

  const getHumidityStatus = (val) => {
    if (val > 70) {
      return {
        label: t("bmeSensor.veryHumid", "Sangat Lembab"),
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      };
    }
    if (val < 30 && val > 0) {
      return {
        label: t("bmeSensor.dry", "Kering"),
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }
    return {
      label: t("bmeSensor.idealHumid", "Nyaman / Ideal"),
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    };
  };

  const fetchAndProcessData = useCallback(async () => {
    try {
      const response = await useFetchSensor("bme", 1001, mannequinId, true, limit);
      setLoading(false);
      setLastFetchTime(new Date());

      const rows = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      setRawRows(rows);

      if (rows.length > 0) {
        setIsConnected(true);
        const latest = rows[0];
        const temp = parseFloat(latest.temperature) || 0;
        const hum = parseFloat(latest.humidity) || 0;
        const press = parseFloat(latest.pressure) || 0;
        const alt = parseFloat(latest.approximate_altitude) || 0;

        setLatestTemp(temp);
        setLatestHumidity(hum);
        setLatestPressure(press);
        setLatestAltitude(alt);
        setLastUpdateTime(latest.inputed_at);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Error fetching bme data:", error);
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
        text: "Belum ada riwayat telemetri BME280 yang dapat diekspor.",
      });
      return;
    }

    const headers = [
      "No",
      "Waktu Pencatatan (WIB)",
      "Sensor ID",
      "Nama Sensor",
      "Temperatur (°C)",
      "Kelembaban (%RH)",
      "Tekanan (hPa)",
      "Ketinggian (m)",
    ];

    const csvData = rawRows.map((item, idx) => {
      const temp = parseFloat(item.temperature) || 0;
      const hum = parseFloat(item.humidity) || 0;
      const press = parseFloat(item.pressure) || 0;
      const alt = parseFloat(item.approximate_altitude) || 0;

      return [
        idx + 1,
        `"${moment(item.inputed_at).format("YYYY-MM-DD HH:mm:ss")}"`,
        item.sensor_id || 1001,
        `"BME280 Environmental"`,
        temp.toFixed(2),
        hum.toFixed(2),
        press.toFixed(2),
        alt.toFixed(2),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvData].join("\r\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Telemetri_BME280_Manekin_${mannequinId}_${moment().format("YYYYMMDD_HHmmss")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Konfigurasi Chart Area Spline Serba Hijau Emerald
  const { chartSeries, chartOptions } = useMemo(() => {
    const reversedRows = [...rawRows].reverse();
    const categories = reversedRows.map((r) =>
      moment(r.inputed_at).format("HH:mm:ss")
    );

    const tempSeries = reversedRows.map((r) => Number((parseFloat(r.temperature) || 0).toFixed(2)));
    const humSeries = reversedRows.map((r) => Number((parseFloat(r.humidity) || 0).toFixed(2)));
    const pressSeries = reversedRows.map((r) => Number((parseFloat(r.pressure) || 0).toFixed(1)));
    const altSeries = reversedRows.map((r) => Number((parseFloat(r.approximate_altitude) || 0).toFixed(1)));

    // 4 Metrik Lingkungan Terpadu: Temperatur, Kelembaban, Tekanan Udara, dan Ketinggian
    const seriesData = [
      { name: "Temperatur (°C)", data: tempSeries },
      { name: "Kelembaban (%RH)", data: humSeries },
      { name: "Tekanan Udara (hPa)", data: pressSeries },
      { name: "Estimasi Ketinggian (m)", data: altSeries },
    ];

    // Warna masing-masing metrik: Emerald (Suhu), Biru Langit (Kelembaban), Amber (Tekanan Udara), Ungu (Ketinggian)
    const colors = ["#00ba88", "#0ea5e9", "#f59e0b", "#8b5cf6"];

    const baseOpt = createChartOptions("BME-Monitor", "BME280 Environmental Chart", categories);

    const optionsData = {
      ...baseOpt,
      title: { text: undefined },
      chart: {
        ...baseOpt.chart,
        type: "area",
        toolbar: { show: false }, // Hapus menu hamburger / download
      },
      colors: colors,
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.25,
          opacityTo: 0.02,
          stops: [0, 90, 100],
        },
      },
      stroke: {
        curve: "smooth",
        width: [2.5, 2.5, 2.5, 2.5],
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
          formatter: (val, { seriesIndex }) => {
            if (val === undefined || val === null) return "-";
            if (seriesIndex === 0) return `${val} °C`;
            if (seriesIndex === 1) return `${val} %RH`;
            if (seriesIndex === 2) return `${val} hPa`;
            if (seriesIndex === 3) return `${val} m`;
            return `${val}`;
          },
        },
      },
      yaxis: [
        {
          seriesName: "Temperatur (°C)",
          title: {
            text: "Suhu (°C) / RH (%) / Ketinggian (m)",
            style: { fontSize: "11px", fontWeight: "600", color: "#64748b" },
          },
          labels: {
            style: { colors: "#64748b" },
            formatter: (val) => (val !== undefined ? `${Number(val).toFixed(0)}` : ""),
          },
          forceNiceScale: true,
        },
        {
          seriesName: "Kelembaban (%RH)",
          show: false,
        },
        {
          seriesName: "Tekanan Udara (hPa)",
          opposite: true,
          title: {
            text: "Tekanan Udara (hPa)",
            style: { fontSize: "11px", fontWeight: "600", color: "#f59e0b" },
          },
          labels: {
            style: { colors: "#f59e0b" },
            formatter: (val) => (val !== undefined ? `${Number(val).toFixed(0)} hPa` : ""),
          },
          forceNiceScale: true,
        },
        {
          seriesName: "Estimasi Ketinggian (m)",
          show: false,
        },
      ],
    };

    return { chartSeries: seriesData, chartOptions: optionsData };
  }, [rawRows]);

  const tempStatus = getTempStatus(latestTemp);
  const humStatus = getHumidityStatus(latestHumidity);

  const formattedUpdateTime = lastUpdateTime
    ? moment(lastUpdateTime).format("DD/MM/YYYY, HH:mm:ss") + " WIB"
    : lastFetchTime
    ? moment(lastFetchTime).format("DD/MM/YYYY, HH:mm:ss") + " WIB"
    : "-";

  return (
    <div className="w-full pb-2 space-y-6">
      {/* Control Toolbar: Status Koneksi & Filter Periode */}
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
      </div>

      {/* Informasi Sensor Card */}
      <SensorInfoCard
        title={t("sensorInfo.title", "Informasi Sensor")}
        sensorCode="BME280 ENVIRONMENTAL SENSOR"
        imageSrc="/images/information/bme-information.png"
        imageAlt="bme-information"
        action={
          <button
            type="button"
            onClick={() => setIsLogsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer">
            <ScrollText size={14} />
            <span>{t("common.viewLogs", "Lihat Log Riwayat Sensor")}</span>
          </button>
        }>
        <div className="flex flex-col gap-2">
          <h4 className="font-bold text-slate-800 text-base">
            {t("bmeSensor.title", "Sistem Pemantauan Mikroklimat BME280")}
          </h4>
          <p className="text-slate-600 text-sm leading-relaxed text-justify">
            {t(
              "bmeSensor.dekripsiSensor",
              "Sensor BME280 merupakan sensor lingkungan digital presisi tinggi buatan Bosch Sensortec yang mengukur suhu ambient, kelembaban relatif, tekanan atmosferik, dan estimasi ketinggian di sekitar manekin secara komprehensif."
            )}
          </p>
        </div>
      </SensorInfoCard>

      {/* Row 1: 4 Cards Metrik Lingkungan (Desain Loadcell Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Suhu / Temperatur */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group cursor-default hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/15 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                {t("bmeSensor.temperature", "Temperatur")}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border shadow-2xs ${tempStatus.badgeClass}`}>
                {tempStatus.label}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 py-1 mb-1">
              <span className="text-3xl font-black text-[#00ba88] tracking-tight font-mono">
                {loading ? "--" : latestTemp.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-slate-400">°C</span>
            </div>

            <div className="text-[11px] text-slate-500 mb-2">
              {t("bmeSensor.ambientTemp", "Suhu Lingkungan Kabin (Ambient)")}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{t("common.optimalRange", "Rentang Optimal")}</span>
            <span className="font-semibold text-emerald-700 font-mono">20 - 32 °C</span>
          </div>
        </div>

        {/* Card 2: Kelembaban */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group cursor-default hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/15 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                {t("bmeSensor.humidity", "Kelembaban")}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border shadow-2xs ${humStatus.badgeClass}`}>
                {humStatus.label}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 py-1 mb-1">
              <span className="text-3xl font-black text-[#00ba88] tracking-tight font-mono">
                {loading ? "--" : latestHumidity.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-slate-400">%RH</span>
            </div>

            <div className="text-[11px] text-slate-500 mb-2">
              {t("bmeSensor.relativeHumidity", "Kelembaban Relatif Udara")}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{t("common.idealRange", "Rentang Ideal")}</span>
            <span className="font-semibold text-emerald-700 font-mono">40 - 70 %RH</span>
          </div>
        </div>

        {/* Card 3: Tekanan Udara */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group cursor-default hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/15 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                {t("bmeSensor.pressure", "Tekanan Udara")}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] border shadow-2xs bg-emerald-50 text-emerald-700 border-emerald-200/80">
                {t("bmeSensor.barometric", "Barometrik")}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 py-1 mb-1">
              <span className="text-3xl font-black text-[#00ba88] tracking-tight font-mono">
                {loading ? "--" : latestPressure.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-slate-400">hPa</span>
            </div>

            <div className="text-[11px] text-slate-500 mb-2">
              {t("bmeSensor.atmosphericPressure", "Tekanan Atmosferik Barometrik")}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{t("bmeSensor.seaLevelStandard", "Standar Permukaan Laut")}</span>
            <span className="font-semibold text-emerald-700 font-mono">1013.25 hPa</span>
          </div>
        </div>

        {/* Card 4: Estimasi Ketinggian */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group cursor-default hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/15 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                {t("bmeSensor.altitude", "Estimasi Ketinggian")}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] border shadow-2xs bg-emerald-50 text-emerald-700 border-emerald-200/80">
                {t("bmeSensor.altimetryPrecision", "Presisi Altimetri")}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 py-1 mb-1">
              <span className="text-3xl font-black text-[#00ba88] tracking-tight font-mono">
                {loading ? "--" : latestAltitude.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-slate-400">meter (dpl)</span>
            </div>

            <div className="text-[11px] text-slate-500 mb-2">
              {t("bmeSensor.aboveSeaLevel", "Ketinggian dari Permukaan Laut")}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{t("bmeSensor.nodeReference", "Referensi Node")}</span>
            <span className="font-semibold text-emerald-700 font-mono">Sensor BME-1001</span>
          </div>
        </div>
      </div>

      {/* Row 2: Grafik Riwayat Telemetri BME280 (Tanpa Download Menu & Tanpa Strip Stats) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800">
                {t("bmeSensor.chartTitle", "Grafik Telemetri Lingkungan BME280")}
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-[#00ba88] font-bold">
                REALTIME MULTI-PARAM
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t("bmeSensor.chartSubtitle", "Pantau fluktuasi parameter mikroklimat lingkungan (suhu, kelembaban, tekanan udara, dan ketinggian) secara terpadu.")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">
              {t("common.displayedSamples", "Sampel Ditampilkan:")}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#00ba88] font-bold font-mono text-xs">
              {rawRows.length} {t("common.points", "Titik")}
            </span>
          </div>
        </div>

        {/* Container Chart */}
        {!loading && chartSeries.length > 0 ? (
          <div className="w-full">
            <ApexChart
              options={chartOptions}
              series={chartSeries}
              type="area"
              height={320}
            />
          </div>
        ) : (
          <Skeleton variant="rectangular" height={320} className="rounded-xl" />
        )}
      </div>

      {/* Row 3: Ringkasan Parameter & Ambang Batas Operasional */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {t("bmeSensor.summaryTitle", "Ringkasan Parameter & Ambang Batas BME280")}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t("bmeSensor.summarySubtitle", "Spesifikasi dan batas toleransi operasional sensor mikroklimat (Sensor ID: 1001).")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/60">
              <Cpu className="w-3.5 h-3.5" />
              Sensor ID: 1001
            </span>
          </div>
        </div>

        {/* Tabel Ringkasan */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">{t("bmeSensor.envParam", "Parameter Lingkungan")}</th>
                <th className="py-3.5 px-4">Sensor ID</th>
                <th className="py-3.5 px-4">{t("common.currentValue", "Nilai Terkini")}</th>
                <th className="py-3.5 px-4">{t("bmeSensor.optimalThreshold", "Batas Operasional Optimal")}</th>
                <th className="py-3.5 px-4">{t("common.conditionStatus", "Status Kondisi")}</th>
                <th className="py-3.5 px-4">{t("common.updatedAt", "Waktu Pembaruan")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00ba88]"></span>
                    <div>
                      <span className="font-bold text-slate-800 block">{t("bmeSensor.temperature", "Temperatur")} Ambient</span>
                      <span className="text-[11px] text-slate-400">Thermal Monitoring</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono font-medium text-slate-500">1001</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                  {latestTemp.toFixed(2)} °C
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500">20.0 - 28.0 °C</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${tempStatus.badgeClass}`}>
                    {tempStatus.label}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500">{formattedUpdateTime}</td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                    <div>
                      <span className="font-bold text-slate-800 block">{t("bmeSensor.relativeHumidity", "Kelembaban Relatif")}</span>
                      <span className="text-[11px] text-slate-400">Relative Humidity</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono font-medium text-slate-500">1001</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                  {latestHumidity.toFixed(2)} %RH
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500">40.0 - 65.0 %RH</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${humStatus.badgeClass}`}>
                    {humStatus.label}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500">{formattedUpdateTime}</td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]"></span>
                    <div>
                      <span className="font-bold text-slate-800 block">{t("bmeSensor.atmosphericPressure", "Tekanan Barometrik")}</span>
                      <span className="text-[11px] text-slate-400">Atmospheric Pressure</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono font-medium text-slate-500">1001</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                  {latestPressure.toFixed(2)} hPa
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500">950.0 - 1050.0 hPa</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200/80">
                    {t("common.normalOperational", "Stabil Normal")}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500">{formattedUpdateTime}</td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
                    <div>
                      <span className="font-bold text-slate-800 block">{t("bmeSensor.altitude", "Perkiraan Ketinggian")}</span>
                      <span className="text-[11px] text-slate-400">Altimetry Calculation</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono font-medium text-slate-500">1001</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                  {latestAltitude.toFixed(2)} m
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500">-100 s/d 9000 m</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200/80">
                    {t("common.optimalPrecision", "Akurat")}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500">{formattedUpdateTime}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Legend Informasi Status */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">{t("bmeSensor.statusGuide", "Panduan Status Lingkungan:")}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{t("bmeSensor.optimalGuide", "Optimal (Kenyamanan Standar)")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>{t("bmeSensor.warmGuide", "Waspada (Hangat / Udara Kering)")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>{t("bmeSensor.extremeGuide", "Ekstrem (Suhu > 35°C / Sangat Panas)")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Log Riwayat */}
      <BmeLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        mannequinId={mannequinId}
        initialRows={rawRows}
        onExportCsv={handleExportCSV}
      />
    </div>
  );
};

export default BmePage;
