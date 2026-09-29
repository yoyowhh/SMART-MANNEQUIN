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
import MpuLogsModal from "../../components/Mpu/MpuLogsModal";
import moment from "moment";
import Swal from "sweetalert2";
import {
  Clock,
  Calendar,
  ScrollText,
  Cpu,
} from "lucide-react";

const PERIOD_OPTIONS = [
  { label: "10 Data", value: 10 },
  { label: "25 Data", value: 25 },
  { label: "50 Data", value: 50 },
  { label: "100 Data", value: 100 },
];

const MpuPage = () => {
  const { t } = useTranslation();
  const params = useParams();
  const mannequinId = params?.id || 1;

  // Data State
  const [loading, setLoading] = useState(true);
  const [rawRows, setRawRows] = useState([]);
  const [latestX, setLatestX] = useState(0);
  const [latestY, setLatestY] = useState(0);
  const [latestZ, setLatestZ] = useState(0);
  const [latestG, setLatestG] = useState(0);
  const [latestTemp, setLatestTemp] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // Status Koneksi & Filter Periode
  const [isConnected, setIsConnected] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [limit, setLimit] = useState(10);

  // Status getaran / dinamika gerak MPU
  const getMotionStatus = (gVal) => {
    if (gVal >= 2.0) {
      return {
        label: "Impak Ekstrem",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
        desc: "Akselerasi impak mendadak > 2.0G",
      };
    }
    if (gVal >= 1.25 || gVal <= 0.75) {
      return {
        label: "Gerak Dinamis",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        desc: "Akselerasi orientasi sedang berfluktuasi",
      };
    }
    return {
      label: "Statik Normal",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      desc: "Gravitasi stabil 1.0G (Manekin diam)",
    };
  };

  const fetchAndProcessData = useCallback(async () => {
    try {
      const response = await useFetchSensor("MPU", 1002, mannequinId, true, limit);
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
        const x = parseFloat(latest.x_acceleration) || 0;
        const y = parseFloat(latest.y_acceleration) || 0;
        const z = parseFloat(latest.z_acceleration) || 0;
        const temp = parseFloat(latest.temperature) || 0;
        const g = Math.sqrt(x * x + y * y + z * z);

        setLatestX(x);
        setLatestY(y);
        setLatestZ(z);
        setLatestG(g);
        setLatestTemp(temp);
        setLastUpdateTime(latest.inputed_at);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Error fetching mpu data:", error);
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
        text: "Belum ada riwayat telemetri MPU-6050 yang dapat diekspor.",
      });
      return;
    }

    const headers = [
      "No",
      "Waktu Pencatatan (WIB)",
      "Sensor ID",
      "Nama Sensor",
      "X-Acceleration (G)",
      "Y-Acceleration (G)",
      "Z-Acceleration (G)",
      "Resultan (G)",
      "Temperatur (°C)",
    ];

    const csvData = rawRows.map((item, idx) => {
      const x = parseFloat(item.x_acceleration) || 0;
      const y = parseFloat(item.y_acceleration) || 0;
      const z = parseFloat(item.z_acceleration) || 0;
      const g = Math.sqrt(x * x + y * y + z * z).toFixed(3);
      const temp = parseFloat(item.temperature) || 0;

      return [
        idx + 1,
        `"${moment(item.inputed_at).format("YYYY-MM-DD HH:mm:ss")}"`,
        item.sensor_id || 1002,
        `"MPU-6050 MotionTracking"`,
        x.toFixed(3),
        y.toFixed(3),
        z.toFixed(3),
        g,
        temp.toFixed(1),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvData].join("\r\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Telemetri_MPU6050_Manekin_${mannequinId}_${moment().format("YYYYMMDD_HHmmss")}.csv`);
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

    const xSeries = reversedRows.map((r) => Number((parseFloat(r.x_acceleration) || 0).toFixed(3)));
    const ySeries = reversedRows.map((r) => Number((parseFloat(r.y_acceleration) || 0).toFixed(3)));
    const zSeries = reversedRows.map((r) => Number((parseFloat(r.z_acceleration) || 0).toFixed(3)));
    const gSeries = reversedRows.map((r) => {
      const x = parseFloat(r.x_acceleration) || 0;
      const y = parseFloat(r.y_acceleration) || 0;
      const z = parseFloat(r.z_acceleration) || 0;
      return Number(Math.sqrt(x * x + y * y + z * z).toFixed(3));
    });

    const seriesData = [
      { name: "Sumbu X (X-Axis)", data: xSeries },
      { name: "Sumbu Y (Y-Axis)", data: ySeries },
      { name: "Sumbu Z (Z-Axis)", data: zSeries },
    ];

    const baseOpt = createChartOptions("MPU-Monitor", "MPU-6050 Motion Chart", categories);

    const optionsData = {
      ...baseOpt,
      title: { text: undefined },
      chart: {
        ...baseOpt.chart,
        type: "line",
        toolbar: { show: false }, // Hapus menu hamburger / download
      },
      colors: ["#00ba88", "#0ea5e9", "#f59e0b"], // 3 warna berbeda: Sumbu X (Hijau), Sumbu Y (Biru), Sumbu Z (Amber)
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
          formatter: (val) => (val !== undefined ? `${val} G` : "-"),
        },
      },
      yaxis: {
        ...baseOpt.yaxis,
        title: {
          text: "Akselerasi Gravitasi (G)",
          style: { fontSize: "12px", fontWeight: "600", color: "#64748b" },
        },
        forceNiceScale: true,
      },
    };

    return { chartSeries: seriesData, chartOptions: optionsData };
  }, [rawRows]);

  const motionStatus = getMotionStatus(latestG);

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
      </div>

      {/* Informasi Sensor Card */}
      <SensorInfoCard
        title={t("sensorInfo.title", "Informasi Sensor")}
        sensorCode="MPU-6050 6-AXIS MOTIONTRACKING"
        imageSrc="/images/information/mpu-information.png"
        imageAlt="mpu-information"
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
            {t("mpuSensor.title", "Sistem Sensor Gerak & Orientasi MPU-6050")}
          </h4>
          <p className="text-slate-600 text-sm leading-relaxed text-left">
            {t(
              "mpuSensor.dekripsiSensor",
              "Sensor MPU-6050 menggabungkan akselerometer 3-sumbu dan giroskop 3-sumbu dengan Digital Motion Processor (DMP) terintegrasi untuk melacak orientasi angular, akselerasi gravitasi, dan stabilitas dinamis manekin."
            )}
          </p>
        </div>
      </SensorInfoCard>

      {/* Row 1: 3 Cards Metrik Dinamik (X, Y, Z) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: X-Axis */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm relative overflow-hidden group cursor-default hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/15 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between">
          <div className="flex flex-col gap-3 justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00ba88] flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform duration-300">
                  X
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                    Akselerasi Sumbu X
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">Sumbu Sagital • Lateral Axis</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-mono">
                ±2G Range
              </span>
            </div>

            <div className="py-2.5">
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-3xl sm:text-4xl font-black text-[#00ba88] tracking-tight">
                  {loading ? "--" : latestX.toFixed(3)}
                </span>
                <span className="text-base font-bold text-slate-400">G</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Percepatan lateral horizontal manekin
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mt-auto">
              <span>Orientasi Sumbu:</span>
              <span className="font-semibold text-emerald-700 font-mono">Lateral (X-Axis)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Y-Axis */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm relative overflow-hidden group cursor-default hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/15 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between">
          <div className="flex flex-col gap-3 justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00ba88] flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform duration-300">
                  Y
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                    Akselerasi Sumbu Y
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">Sumbu Longitudinal • Vertical Axis</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-mono">
                ±2G Range
              </span>
            </div>

            <div className="py-2.5">
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-3xl sm:text-4xl font-black text-[#00ba88] tracking-tight">
                  {loading ? "--" : latestY.toFixed(3)}
                </span>
                <span className="text-base font-bold text-slate-400">G</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Percepatan vertikal longitudinal tubuh manekin
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mt-auto">
              <span>Orientasi Sumbu:</span>
              <span className="font-semibold text-emerald-700 font-mono">Longitudinal (Y-Axis)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Z-Axis */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm relative overflow-hidden group cursor-default hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/15 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between">
          <div className="flex flex-col gap-3 justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00ba88] flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform duration-300">
                  Z
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                    Akselerasi Sumbu Z
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">Sumbu Transversal • Frontal Axis</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-mono">
                ±2G Range
              </span>
            </div>

            <div className="py-2.5">
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-3xl sm:text-4xl font-black text-[#00ba88] tracking-tight">
                  {loading ? "--" : latestZ.toFixed(3)}
                </span>
                <span className="text-base font-bold text-slate-400">G</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Percepatan normal gravitasi bidang transversal
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mt-auto">
              <span>Orientasi Sumbu:</span>
              <span className="font-semibold text-emerald-700 font-mono">Transversal (Z-Axis)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Grafik Riwayat Telemetri MPU (Tanpa Download Menu & Tanpa Strip Stats) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800">
                Grafik Akselerasi Dinamis MPU-6050
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-[#00ba88] font-bold">
                REALTIME 6-DoF
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Visualisasi tren akselerasi tri-aksial (Sumbu X, Y, Z) secara berkala.
            </p>
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

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500">
                Sampel Ditampilkan:
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#00ba88] font-bold font-mono text-xs">
                {rawRows.length} Titik
              </span>
            </div>
          </div>
        </div>

        {/* Container Chart */}
        {!loading && chartSeries.length > 0 ? (
          <div className="w-full">
            <ApexChart
              options={chartOptions}
              series={chartSeries}
              type="line"
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
              Ringkasan Parameter & Ambang Batas Sensor MPU
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Nilai pengukuran terkini pada kanal sensor 1002 (MPU-6050 MotionTracking).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/60">
              <Cpu className="w-3.5 h-3.5" />
              Sensor ID: 1002
            </span>
          </div>
        </div>

        {/* Tabel Ringkasan */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Parameter Akselerasi</th>
                <th className="py-3.5 px-4">Sensor ID</th>
                <th className="py-3.5 px-4">Nilai Terkini</th>
                <th className="py-3.5 px-4">Status Dinamik</th>
                <th className="py-3.5 px-4">Frekuensi & Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00ba88]"></span>
                    <div>
                      <span className="font-bold text-slate-800 block">Sumbu X (X-Axis)</span>
                      <span className="text-[11px] text-slate-400">Lateral Tilt / Sideways</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono font-medium text-slate-500">1002</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                  {latestX.toFixed(3)} G
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200/80">
                    Normal
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500">{formattedUpdateTime}</td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                    <div>
                      <span className="font-bold text-slate-800 block">Sumbu Y (Y-Axis)</span>
                      <span className="text-[11px] text-slate-400">Longitudinal / Front-Back</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono font-medium text-slate-500">1002</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                  {latestY.toFixed(3)} G
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200/80">
                    Normal
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500">{formattedUpdateTime}</td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]"></span>
                    <div>
                      <span className="font-bold text-slate-800 block">Sumbu Z (Z-Axis)</span>
                      <span className="text-[11px] text-slate-400">Vertical Axis / Normal Gravity</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono font-medium text-slate-500">1002</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                  {latestZ.toFixed(3)} G
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200/80">
                    Normal
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500">{formattedUpdateTime}</td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
                    <div>
                      <span className="font-bold text-slate-800 block">Resultan Vektor Gravitasi</span>
                      <span className="text-[11px] text-slate-400">Total Magnitude Vector |G|</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono font-medium text-slate-500">1002</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                  {latestG.toFixed(3)} G
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${motionStatus.badgeClass}`}>
                    {motionStatus.label}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500">{formattedUpdateTime}</td>
              </tr>

              {latestTemp > 0 && (
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                      <div>
                        <span className="font-bold text-slate-800 block">Suhu Internal Chip</span>
                        <span className="text-[11px] text-slate-400">MPU Die Temperature</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-500">1002</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    {latestTemp.toFixed(1)} °C
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200/80">
                      Normal
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{formattedUpdateTime}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Legend Informasi Status */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Panduan Status Akselerasi:</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Statik Normal (~1.0G)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Gerak Dinamis (1.25G - 2.0G)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Impak Ekstrem (&gt; 2.0G)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Log Riwayat */}
      <MpuLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        mannequinId={mannequinId}
        initialRows={rawRows}
        onExportCsv={handleExportCSV}
      />
    </div>
  );
};

export default MpuPage;
