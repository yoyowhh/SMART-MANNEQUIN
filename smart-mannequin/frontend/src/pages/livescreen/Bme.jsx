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
  Activity,
  Layers,
  Calendar,
  Thermometer,
  Droplets,
  Gauge,
  Mountain,
  ScrollText,
  ShieldCheck,
  Cpu,
} from "lucide-react";

const PERIOD_OPTIONS = [
  { label: "10 Data", value: 10 },
  { label: "25 Data", value: 25 },
  { label: "50 Data", value: 50 },
  { label: "100 Data", value: 100 },
];

const CHART_PARAM_TABS = [
  { id: "all", label: "Multi-Parameter" },
  { id: "temp", label: "Suhu (°C)" },
  { id: "humidity", label: "Kelembaban (%)" },
  { id: "pressure", label: "Tekanan (hPa)" },
  { id: "altitude", label: "Ketinggian (m)" },
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
  const [selectedParamTab, setSelectedParamTab] = useState("all");

  // Status Koneksi & Filter Periode
  const [isConnected, setIsConnected] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [limit, setLimit] = useState(10);

  // Status kenyamanan lingkungan
  const getTempStatus = (val) => {
    if (val >= 35) {
      return {
        label: "Panas Ekstrem",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
        desc: "Suhu di atas ambang batas wajar",
      };
    }
    if (val >= 28) {
      return {
        label: "Hangat",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        desc: "Suhu agak tinggi di atas batas optimal",
      };
    }
    if (val < 18 && val > 0) {
      return {
        label: "Dingin",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
        desc: "Suhu di bawah batas kenyamanan",
      };
    }
    return {
      label: "Optimal / Sejuk",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      desc: "Kondisi termal ideal ruang uji",
    };
  };

  const getHumidityStatus = (val) => {
    if (val > 70) {
      return {
        label: "Sangat Lembab",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      };
    }
    if (val < 30 && val > 0) {
      return {
        label: "Kering",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }
    return {
      label: "Nyaman / Ideal",
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

    let seriesData = [];
    let colors = [];
    let yAxisTitle = "Nilai Pengukuran";

    if (selectedParamTab === "temp") {
      seriesData = [{ name: "Temperatur (°C)", data: tempSeries }];
      colors = ["#00ba88"];
      yAxisTitle = "Suhu Lingkungan (°C)";
    } else if (selectedParamTab === "humidity") {
      seriesData = [{ name: "Kelembaban Relatif (%)", data: humSeries }];
      colors = ["#10b981"];
      yAxisTitle = "Kelembaban Relatif (%RH)";
    } else if (selectedParamTab === "pressure") {
      seriesData = [{ name: "Tekanan Barometrik (hPa)", data: pressSeries }];
      colors = ["#34d399"];
      yAxisTitle = "Tekanan Udara (hPa)";
    } else if (selectedParamTab === "altitude") {
      seriesData = [{ name: "Ketinggian Estimasi (m)", data: altSeries }];
      colors = ["#059669"];
      yAxisTitle = "Ketinggian Barometrik (m dpl)";
    } else {
      // Multi-Parameter (Standardized dual/multi display)
      seriesData = [
        { name: "Temperatur (°C)", data: tempSeries },
        { name: "Kelembaban (%)", data: humSeries },
        { name: "Ketinggian (m)", data: altSeries },
      ];
      colors = ["#00ba88", "#10b981", "#34d399"];
      yAxisTitle = "Parameter Termal & Ketinggian";
    }

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
        width: 2.5,
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
          text: yAxisTitle,
          style: { fontSize: "12px", fontWeight: "600", color: "#64748b" },
        },
        forceNiceScale: true,
      },
    };

    return { chartSeries: seriesData, chartOptions: optionsData };
  }, [rawRows, selectedParamTab]);

  const tempStatus = getTempStatus(latestTemp);
  const humStatus = getHumidityStatus(latestHumidity);

  const formattedUpdateTime = lastUpdateTime
    ? moment(lastUpdateTime).format("DD/MM/YYYY, HH:mm:ss") + " WIB"
    : lastFetchTime
    ? moment(lastFetchTime).format("DD/MM/YYYY, HH:mm:ss") + " WIB"
    : "-";

  return (
    <div className="w-full pb-10 space-y-6">
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

      {/* Informasi Sensor Card */}
      <SensorInfoCard
        title={t("informasiSensor", "Informasi Sensor")}
        sensorCode="BME280 Environmental Sensor"
        imageSrc="/images/information/bme-information.png"
        imageAlt="bme-information"
        description={
          t("bmeSensor.dekripsiSensor") ||
          "Sensor BME280 merupakan sensor lingkungan digital presisi tinggi buatan Bosch Sensortec yang mengukur suhu ambient, kelembaban relatif, tekanan atmosferik, dan estimasi ketinggian di sekitar manekin secara komprehensif."
        }>
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <button
            onClick={() => setIsLogsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs hover:shadow cursor-pointer">
            <ScrollText className="w-4 h-4 text-emerald-400" />
            Lihat Log Riwayat Sensor
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Bosch Environmental Unit Active
          </div>
        </div>
      </SensorInfoCard>

      {/* Row 1: 4 Cards Metrik Lingkungan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Suhu */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 tracking-wider font-mono">
              TEMPERATUR
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00ba88] flex items-center justify-center">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight font-mono">
              {loading ? "--" : latestTemp.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-400">°C</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-50">
            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${tempStatus.badgeClass}`}>
              {tempStatus.label}
            </span>
            <span className="font-mono text-slate-400">Ambient Temp</span>
          </div>
        </div>

        {/* Card 2: Kelembaban */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 tracking-wider font-mono">
              KELEMBABAN
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00ba88] flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight font-mono">
              {loading ? "--" : latestHumidity.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-400">%RH</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-50">
            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${humStatus.badgeClass}`}>
              {humStatus.label}
            </span>
            <span className="font-mono text-slate-400">Relative Humidity</span>
          </div>
        </div>

        {/* Card 3: Tekanan Udara */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 tracking-wider font-mono">
              TEKANAN UDARA
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00ba88] flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight font-mono">
              {loading ? "--" : latestPressure.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-400">hPa</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-50">
            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] border bg-emerald-50 text-emerald-700 border-emerald-200/80">
              Barometrik
            </span>
            <span className="font-mono text-slate-400">Atmospheric</span>
          </div>
        </div>

        {/* Card 4: Ketinggian */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 tracking-wider font-mono">
              ESTIMASI KETINGGIAN
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00ba88] flex items-center justify-center">
              <Mountain className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight font-mono">
              {loading ? "--" : latestAltitude.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-400">meter (dpl)</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-50">
            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] border bg-emerald-50 text-emerald-700 border-emerald-200/80">
              Presisi Altimetri
            </span>
            <span className="font-mono text-slate-400">Sensor 1001</span>
          </div>
        </div>
      </div>

      {/* Row 2: Grafik Riwayat Telemetri BME280 (Tanpa Download Menu & Tanpa Strip Stats) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800">
                Grafik Telemetri Lingkungan BME280
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-[#00ba88] font-bold">
                REALTIME
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pantau fluktuasi parameter mikroklimat lingkungan di sekitar manekin secara komprehensif.
            </p>
          </div>

          {/* Parameter View Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
            {CHART_PARAM_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedParamTab(tab.id)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedParamTab === tab.id
                    ? "bg-white text-[#00ba88] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}>
                {tab.label}
              </button>
            ))}
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
              Ringkasan Parameter & Ambang Batas BME280
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Spesifikasi dan batas toleransi operasional sensor mikroklimat (Sensor ID: 1001).
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
                <th className="py-3.5 px-4">Parameter Lingkungan</th>
                <th className="py-3.5 px-4">Sensor ID</th>
                <th className="py-3.5 px-4">Nilai Terkini</th>
                <th className="py-3.5 px-4">Batas Operasional Optimal</th>
                <th className="py-3.5 px-4">Status Kondisi</th>
                <th className="py-3.5 px-4">Waktu Pembaruan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00ba88]"></span>
                    <div>
                      <span className="font-bold text-slate-800 block">Temperatur Ambient</span>
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
                      <span className="font-bold text-slate-800 block">Kelembaban Relatif</span>
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
                      <span className="font-bold text-slate-800 block">Tekanan Barometrik</span>
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
                    Stabil Normal
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500">{formattedUpdateTime}</td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
                    <div>
                      <span className="font-bold text-slate-800 block">Perkiraan Ketinggian</span>
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
                    Akurat
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
            <span className="font-bold text-slate-700">Panduan Status Lingkungan:</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Optimal (Kenyamanan Standar)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Waspada (Hangat / Udara Kering)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Ekstrem (Suhu &gt; 35°C / Sangat Panas)</span>
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
