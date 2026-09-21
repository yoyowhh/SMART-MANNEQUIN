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
import LidarLogsModal from "../../components/Lidar/LidarLogsModal";
import moment from "moment";
import Swal from "sweetalert2";
import {
  Clock,
  Activity,
  Layers,
  Calendar,
  Compass,
  ScrollText,
} from "lucide-react";

const PERIOD_OPTIONS = [
  { label: "10 Data", value: 10 },
  { label: "25 Data", value: 25 },
  { label: "50 Data", value: 50 },
  { label: "100 Data", value: 100 },
];

const LidarPage = () => {
  const { t } = useTranslation();
  const params = useParams();
  const mannequinId = params?.id || 1;

  // State Data Telemetri
  const [loading, setLoading] = useState(true);
  const [rawRows, setRawRows] = useState([]);
  const [latestDistance, setLatestDistance] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // Status Koneksi & Filter Periode
  const [isConnected, setIsConnected] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [limit, setLimit] = useState(10);

  // Status deteksi jarak LiDAR
  const getDistanceStatus = (val) => {
    if (val > 0) {
      return {
        label: "Normal / Terdeteksi",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        desc: "Jarak objek terukur secara real-time",
      };
    }
    return {
      label: "Standby",
      badgeClass: "bg-slate-50 text-slate-600 border-slate-200",
      desc: "Menunggu sinyal pantulan laser",
    };
  };

  const fetchAndProcessData = useCallback(async () => {
    try {
      const response = await useFetchSensor("lidar", 901, mannequinId, true, limit);
      setLoading(false);
      setLastFetchTime(new Date());

      const rows = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      setRawRows(rows);

      if (rows.length > 0) {
        setIsConnected(true);
        const latest = rows[0];
        const dist = parseFloat(latest.value) || 0;
        setLatestDistance(dist);
        setLastUpdateTime(latest.inputed_at);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Error fetching lidar data:", error);
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
        text: "Belum ada riwayat telemetri LiDAR yang dapat diekspor.",
      });
      return;
    }

    const headers = [
      "No",
      "Waktu Pencatatan (WIB)",
      "Sensor ID",
      "Nama Sensor",
      "Jarak (cm)",
      "Jarak (Meter)",
      "Status Kedekatan",
      "Mannequin ID",
    ];

    let no = 1;
    const rows = rawRows.map((item) => {
      const val = parseFloat(item.value) || 0;
      const status =
        val < 50
          ? "Terlalu Dekat"
          : val <= 150
          ? "Waspada"
          : "Jarak Aman";

      return [
        no++,
        item.inputed_at ? moment(item.inputed_at).format("YYYY-MM-DD HH:mm:ss") : "-",
        "LIDAR-901",
        "TF-Mini LiDAR 3D",
        val.toFixed(1),
        (val / 100).toFixed(2),
        status,
        item.mannequin_id || mannequinId,
      ];
    });

    let csvContent = "\uFEFF";
    csvContent += headers.join(",") + "\n";
    rows.forEach((r) => {
      csvContent += r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lidar_telemetry_mannequin_${mannequinId}_${moment().format("YYYYMMDD_HHmmss")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Konfigurasi Chart Area
  const chartData = useMemo(() => {
    const reversed = [...rawRows].reverse();
    const categories = reversed.map((item) =>
      item.inputed_at
        ? moment(item.inputed_at).format("HH:mm:ss")
        : moment().format("HH:mm:ss")
    );
    const distData = reversed.map((item) => parseFloat(item.value) || 0);

    const baseOpt = createChartOptions(
      "LiDAR-Monitor",
      "LiDAR Perimeter Chart",
      categories
    );

    const options = {
      ...baseOpt,
      title: { text: undefined },
      chart: {
        ...baseOpt.chart,
        type: "area",
        toolbar: { show: false },
      },
      colors: ["#00ba88"],
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.35,
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },
      stroke: { curve: "smooth", width: 3 },
      yaxis: {
        ...baseOpt.yaxis,
        title: {
          text: "Jarak Deteksi (cm)",
          style: { fontSize: "12px", fontWeight: "600", color: "#64748b" },
        },
        min: 0,
        forceNiceScale: true,
      },
    };

    const series = [{ name: "Jarak LiDAR (cm)", data: distData }];
    return { options, series };
  }, [rawRows]);

  const currentStatus = getDistanceStatus(latestDistance);
  const formattedUpdateTime = lastUpdateTime
    ? moment(lastUpdateTime).format("DD/MM/YYYY, HH:mm:ss") + " WIB"
    : lastFetchTime
    ? moment(lastFetchTime).format("DD/MM/YYYY, HH:mm:ss") + " WIB"
    : "-";

  return (
    <div className="w-full pb-10 space-y-6">
      {/* Control Toolbar: Status Koneksi & Filter Periode */}
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

      {/* Informasi Sensor Card */}
      <SensorInfoCard
        title={t("informasiSensor") || "Informasi Sensor"}
        sensorCode="LIDAR / DISTANCE SENSOR"
        imageSrc="/images/information/lidar-information.png"
        imageAlt="lidar-information"
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
            Sistem Sensor LiDAR TF-Mini (Perimeter & Proximity)
          </h4>
          <p className="text-slate-600 text-sm leading-relaxed text-justify">
            {t(
              "lidarSensor.deskripsiSensor",
              "Sensor LiDAR TF-Mini adalah sensor pengukur jarak optik berbasis laser time-of-flight yang terpasang pada manekin untuk mendeteksi keberadaan objek, perimeter halangan, dan jarak kedekatan lingkungan secara real-time. Sensor ini memiliki akurasi tinggi dan respon frekuensi cepat untuk aplikasi keselamatan kerja dan navigasi."
            )}
          </p>
        </div>
      </SensorInfoCard>

      {/* Row 1: 1 Card Hasil Data Pengukuran Jarak LiDAR (Simple & Minimalis) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 tracking-wider font-mono">
            JARAK TERDETEKSI (LIDAR)
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00ba88] flex items-center justify-center font-bold text-xs">
            <Compass className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2 font-mono">
          <span className="text-3xl sm:text-4xl font-extrabold text-[#00ba88] tracking-tight">
            {loading ? "--" : latestDistance.toFixed(1)}
          </span>
          <span className="text-sm font-bold text-slate-400">CM</span>
          <span className="text-xs font-semibold text-slate-400 ml-2">
            ({loading ? "--" : (latestDistance / 100).toFixed(2)} m)
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-50">
          <span className="text-slate-400">Sensor TF-Mini (901)</span>
          <span className="font-mono text-emerald-600 font-semibold flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-Time
          </span>
        </div>
      </div>

      {/* Row 2: Grafik Telemetri Jarak LiDAR */}
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
                      Telemetri Kontinu Jarak LiDAR
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tren fluktuasi jarak halangan perimeter waktu nyata
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full pt-1">
                <ApexChart
                  options={chartData.options}
                  series={chartData.series}
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

      {/* Row 3: Tabel Ringkasan Parameter LiDAR */}
      <BaseCard height="auto" mobileHeight="auto" className="!h-auto">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-[#00ba88] shrink-0 shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base">
                  Ringkasan Parameter Sensor LiDAR
                </h4>
                <p className="text-xs text-slate-400">
                  Parameter operasional, status jangkauan, dan waktu update telemetri real-time
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Nama Sensor</th>
                  <th className="py-3 px-4">Parameter</th>
                  <th className="py-3 px-4">Nilai Saat Ini</th>
                  <th className="py-3 px-4">Satuan</th>
                  <th className="py-3 px-4">Status Sensor</th>
                  <th className="py-3 px-4">Koneksi</th>
                  <th className="py-3 px-4">Waktu Update Terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>Sensor LiDAR TF-Mini</span>
                    </div>
                    <span className="block text-[11px] text-slate-400 font-normal pl-4">
                      Sensor ID: 901
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-mono text-[11px] font-semibold border border-emerald-200/60">
                      Jarak Perimeter
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-[#00ba88] text-base">
                    {latestDistance.toFixed(1)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-500">CM</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border shadow-xs ${currentStatus.badgeClass}`}>
                      {currentStatus.label}
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
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-semibold text-slate-600 font-mono">Status Operasional:</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Sensor Aktif (Online)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Pengukuran Waktu Nyata
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-400"></span> Frekuensi 100 Hz
              </span>
            </div>
            <div className="font-mono text-slate-400">
              Jangkauan Sensor: <strong className="text-emerald-700">12 Meter</strong>
            </div>
          </div>
        </div>
      </BaseCard>

      {/* Modal Log Riwayat LiDAR */}
      <LidarLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        mannequinId={mannequinId}
        initialRows={rawRows}
        onExportCsv={handleExportCSV}
      />
    </div>
  );
};

export default LidarPage;
