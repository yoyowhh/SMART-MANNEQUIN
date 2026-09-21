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
import AdxlLogsModal from "../../components/Adxl/AdxlLogsModal";
import moment from "moment";
import Swal from "sweetalert2";
import {
  Clock,
  Activity,
  Layers,
  Calendar,
  Hand,
  ArrowRightLeft,
  Zap,
  ScrollText,
} from "lucide-react";

const PERIOD_OPTIONS = [
  { label: "10 Data", value: 10 },
  { label: "25 Data", value: 25 },
  { label: "50 Data", value: 50 },
  { label: "100 Data", value: 100 },
];

const AdxlPage = () => {
  const { t } = useTranslation();
  const params = useParams();
  const mannequinId = params?.id || 1;

  // Data State
  const [loading, setLoading] = useState(true);
  const [rawRows201, setRawRows201] = useState([]);
  const [rawRows202, setRawRows202] = useState([]);
  const [latest201, setLatest201] = useState({ x: 0, y: 0, z: 0, g: 0 });
  const [latest202, setLatest202] = useState({ x: 0, y: 0, z: 0, g: 0 });
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // Status Koneksi & Filter Periode
  const [isConnected, setIsConnected] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [limit, setLimit] = useState(10);

  const getMotionStatus = (gVal) => {
    if (gVal >= 2.0) {
      return {
        label: "Impak Tinggi",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
        desc: "Akselerasi impak mendadak",
      };
    }
    if (gVal >= 1.2) {
      return {
        label: "Gerak Aktif",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        desc: "Akselerasi dinamik sedang",
      };
    }
    return {
      label: "Statik Normal",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      desc: "Gravitasi stabil 1.0G",
    };
  };

  const fetchAndProcessData = useCallback(async () => {
    try {
      const [res201, res202] = await Promise.all([
        useFetchSensor("adxl", 201, mannequinId, true, limit),
        useFetchSensor("adxl", 202, mannequinId, true, limit),
      ]);

      setLoading(false);
      setLastFetchTime(new Date());

      const d201 = res201?.data?.data || [];
      const d202 = res202?.data?.data || [];

      setRawRows201(d201);
      setRawRows202(d202);

      if (d201.length > 0 || d202.length > 0) {
        setIsConnected(true);

        if (d201.length > 0) {
          const l1 = d201[0];
          const x = parseFloat(l1.x_axis) || 0;
          const y = parseFloat(l1.y_axis) || 0;
          const z = parseFloat(l1.z_axis) || 0;
          const g = Math.sqrt(x * x + y * y + z * z);
          setLatest201({ x, y, z, g });
          if (l1.inputed_at) setLastUpdateTime(l1.inputed_at);
        }

        if (d202.length > 0) {
          const l2 = d202[0];
          const x = parseFloat(l2.x_axis) || 0;
          const y = parseFloat(l2.y_axis) || 0;
          const z = parseFloat(l2.z_axis) || 0;
          const g = Math.sqrt(x * x + y * y + z * z);
          setLatest202({ x, y, z, g });
          if (l2.inputed_at && !d201.length) setLastUpdateTime(l2.inputed_at);
        }
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Error fetching adxl data:", error);
      setIsConnected(false);
    }
  }, [mannequinId, limit]);

  useEffect(() => {
    fetchAndProcessData();
    const intervalId = setInterval(fetchAndProcessData, 3000);
    return () => clearInterval(intervalId);
  }, [fetchAndProcessData]);

  const handleExportCSV = () => {
    if ((!rawRows201 || rawRows201.length === 0) && (!rawRows202 || rawRows202.length === 0)) {
      Swal.fire({
        icon: "warning",
        title: "Tidak Ada Data",
        text: "Belum ada riwayat telemetri ADXL yang dapat diekspor.",
      });
      return;
    }

    const headers = [
      "No",
      "Waktu Pencatatan (WIB)",
      "Sensor ID",
      "Kanal Anatomis",
      "X-Axis (G)",
      "Y-Axis (G)",
      "Z-Axis (G)",
      "Resultan G-Force",
      "Mannequin ID",
    ];

    const rows = [];
    let no = 1;

    rawRows201.forEach((item) => {
      const x = parseFloat(item.x_axis) || 0;
      const y = parseFloat(item.y_axis) || 0;
      const z = parseFloat(item.z_axis) || 0;
      rows.push([
        no++,
        item.inputed_at ? moment(item.inputed_at).format("YYYY-MM-DD HH:mm:ss") : "-",
        "ADXL-201",
        "Tangan Kanan",
        x.toFixed(2),
        y.toFixed(2),
        z.toFixed(2),
        Math.sqrt(x * x + y * y + z * z).toFixed(2),
        mannequinId,
      ]);
    });

    rawRows202.forEach((item) => {
      const x = parseFloat(item.x_axis) || 0;
      const y = parseFloat(item.y_axis) || 0;
      const z = parseFloat(item.z_axis) || 0;
      rows.push([
        no++,
        item.inputed_at ? moment(item.inputed_at).format("YYYY-MM-DD HH:mm:ss") : "-",
        "ADXL-202",
        "Tangan Kiri",
        x.toFixed(2),
        y.toFixed(2),
        z.toFixed(2),
        Math.sqrt(x * x + y * y + z * z).toFixed(2),
        mannequinId,
      ]);
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
    link.download = `adxl_telemetry_mannequin_${mannequinId}_${moment().format("YYYYMMDD_HHmmss")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Konfigurasi Chart Area
  const chartData = useMemo(() => {
    const rev201 = [...rawRows201].reverse();
    const rev202 = [...rawRows202].reverse();

    const maxLen = Math.max(rev201.length, rev202.length);
    const categories = [];
    for (let i = 0; i < maxLen; i++) {
      const item = rev201[i] || rev202[i];
      categories.push(
        item?.inputed_at
          ? moment(item.inputed_at).format("HH:mm:ss")
          : moment().format("HH:mm:ss")
      );
    }

    const g201Series = rev201.map((item) => {
      const x = parseFloat(item.x_axis) || 0;
      const y = parseFloat(item.y_axis) || 0;
      const z = parseFloat(item.z_axis) || 0;
      return parseFloat(Math.sqrt(x * x + y * y + z * z).toFixed(2));
    });

    const g202Series = rev202.map((item) => {
      const x = parseFloat(item.x_axis) || 0;
      const y = parseFloat(item.y_axis) || 0;
      const z = parseFloat(item.z_axis) || 0;
      return parseFloat(Math.sqrt(x * x + y * y + z * z).toFixed(2));
    });

    const baseOpt = createChartOptions(
      "ADXL-Chart",
      "ADXL Telemetry",
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
      colors: ["#00ba88", "#0d9488"],
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.35,
          opacityTo: 0.04,
          stops: [0, 90, 100],
        },
      },
      stroke: { curve: "smooth", width: [2.5, 2.5] },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "left",
        fontSize: "12px",
        fontWeight: 600,
        labels: { colors: "#475569" },
      },
      yaxis: {
        ...baseOpt.yaxis,
        title: {
          text: "Resultan G-Force (G)",
          style: { fontSize: "12px", fontWeight: "600", color: "#64748b" },
        },
        min: 0,
        forceNiceScale: true,
      },
    };

    const series = [
      { name: "Tangan Kanan (ADXL-201)", data: g201Series },
      { name: "Tangan Kiri (ADXL-202)", data: g202Series },
    ];

    return { options, series };
  }, [rawRows201, rawRows202]);

  const status201 = getMotionStatus(latest201.g);
  const status202 = getMotionStatus(latest202.g);
  const diffG = Math.abs(latest201.g - latest202.g).toFixed(2);
  const formattedUpdateTime = lastUpdateTime
    ? moment(lastUpdateTime).format("DD/MM/YYYY, HH:mm:ss") + " WIB"
    : lastFetchTime
    ? moment(lastFetchTime).format("DD/MM/YYYY, HH:mm:ss") + " WIB"
    : "-";

  return (
    <div className="w-full pb-10 space-y-6">
      {/* Control Toolbar */}
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
        sensorCode="ADXL345 / ACCELEROMETER"
        imageSrc="/images/information/adxl-information.png"
        imageAlt="adxl-information"
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
            Sistem Sensor Akselerometer ADXL345 (Kinematika Ekstremitas)
          </h4>
          <p className="text-slate-600 text-sm leading-relaxed text-justify">
            {t(
              "adxlSensor.dekripsiSensor",
              "Sensor ADXL345 adalah modul akselerometer digital 3-sumbu dengan resolusi tinggi (13-bit) yang dipasang pada lengan manekin (Tangan Kanan ADXL-201 dan Tangan Kiri ADXL-202). Sensor ini mengukur percepatan statis gravitasi serta percepatan dinamis akibat gerakan tubuh, getaran mekanik, dan impak benturan secara real-time."
            )}
          </p>
        </div>
      </SensorInfoCard>

      {/* Row 1: 4 Cards Khusus Parameter ADXL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Tangan Kanan (ADXL-201) */}
        <BaseCard className="relative overflow-hidden group hover:border-emerald-300 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col gap-3 justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-[#00ba88]">
                  <Hand className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    Tangan Kanan
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">ADXL-201 • G-Force</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${status201.badgeClass}`}>
                {status201.label}
              </span>
            </div>

            <div className="py-2">
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-3xl sm:text-4xl font-black text-[#00ba88] tracking-tight">
                  {latest201.g.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-slate-400">G</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                X: {latest201.x.toFixed(2)} | Y: {latest201.y.toFixed(2)} | Z: {latest201.z.toFixed(2)}
              </span>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Intensitas Gerakan</span>
                <span className="text-emerald-700 font-semibold">{Math.min(100, Math.round(latest201.g * 40))}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-300 to-[#00ba88] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, latest201.g * 40))}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Batas Impak:</span>
              <span className="font-semibold text-emerald-700 font-mono">&lt; 2.0 G</span>
            </div>
          </div>
        </BaseCard>

        {/* Card 2: Tangan Kiri (ADXL-202) */}
        <BaseCard className="relative overflow-hidden group hover:border-emerald-300 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col gap-3 justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-[#00ba88]">
                  <Hand className="w-4 h-4 scale-x-[-1]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    Tangan Kiri
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">ADXL-202 • G-Force</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${status202.badgeClass}`}>
                {status202.label}
              </span>
            </div>

            <div className="py-2">
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-3xl sm:text-4xl font-black text-[#00ba88] tracking-tight">
                  {latest202.g.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-slate-400">G</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                X: {latest202.x.toFixed(2)} | Y: {latest202.y.toFixed(2)} | Z: {latest202.z.toFixed(2)}
              </span>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Intensitas Gerakan</span>
                <span className="text-emerald-700 font-semibold">{Math.min(100, Math.round(latest202.g * 40))}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-300 to-[#00ba88] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, latest202.g * 40))}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Batas Impak:</span>
              <span className="font-semibold text-emerald-700 font-mono">&lt; 2.0 G</span>
            </div>
          </div>
        </BaseCard>

        {/* Card 3: Diferensial Kinematik */}
        <BaseCard className="relative overflow-hidden group hover:border-emerald-300 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col gap-3 justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-[#00ba88]">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    Simetri Gerak
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Selisih Kanan-Kiri</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs bg-emerald-50 text-emerald-700 border-emerald-200/80">
                Simetris
              </span>
            </div>

            <div className="py-2">
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-3xl sm:text-4xl font-black text-[#00ba88] tracking-tight">
                  {diffG}
                </span>
                <span className="text-sm font-bold text-slate-400">Δ G</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                {latest201.g > latest202.g ? "Dominan Lengan Kanan" : latest202.g > latest201.g ? "Dominan Lengan Kiri" : "Gerakan Seimbang"}
              </span>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Toleransi Asimetri</span>
                <span className="text-emerald-700 font-semibold">&lt; 0.50 G</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full w-full" />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Resolusi ADC:</span>
              <span className="font-semibold text-emerald-700 font-mono">13-bit (~4mg/LSB)</span>
            </div>
          </div>
        </BaseCard>

        {/* Card 4: Deteksi Getaran Maksimal */}
        <BaseCard className="relative overflow-hidden group hover:border-emerald-300 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col gap-3 justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-[#00ba88]">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    Puncak Getaran
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Peak Amplitude</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs bg-emerald-50 text-emerald-700 border-emerald-200/80">
                Aktif
              </span>
            </div>

            <div className="py-2">
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-3xl sm:text-4xl font-black text-[#00ba88] tracking-tight">
                  {Math.max(latest201.g, latest202.g).toFixed(2)}
                </span>
                <span className="text-sm font-bold text-slate-400">PEAK G</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                Nilai percepatan ekstremitas tertinggi
              </span>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Tingkat Getaran</span>
                <span className="text-emerald-700 font-semibold">{Math.max(latest201.g, latest202.g) >= 2.0 ? "Tinggi" : "Aman"}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-300 to-[#00ba88] rounded-full w-3/4" />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Batas Skala Sensor:</span>
              <span className="font-semibold text-emerald-700 font-mono">± 16 G</span>
            </div>
          </div>
        </BaseCard>
      </div>

      {/* Row 2: Grafik Telemetri Dual-Channel G-Force */}
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
                      Telemetri Kontinu Kinematika Lengan (Dual-Channel)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tren fluktuasi resultan akselerasi G-Force pada Tangan Kanan & Tangan Kiri
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

      {/* Row 3: Tabel Ringkasan Parameter ADXL345 */}
      <BaseCard height="auto" mobileHeight="auto" className="!h-auto">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-[#00ba88] shrink-0 shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base">
                  Ringkasan Parameter Sensor Akselerometer ADXL345
                </h4>
                <p className="text-xs text-slate-400">
                  Parameter kinematika, status pergerakan, dan waktu update telemetri real-time
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Nama Sensor</th>
                  <th className="py-3 px-4">Kanal Anatomis</th>
                  <th className="py-3 px-4 text-right">X-Axis</th>
                  <th className="py-3 px-4 text-right">Y-Axis</th>
                  <th className="py-3 px-4 text-right">Z-Axis</th>
                  <th className="py-3 px-4 text-right">Resultan (G)</th>
                  <th className="py-3 px-4">Status Gerakan</th>
                  <th className="py-3 px-4">Koneksi</th>
                  <th className="py-3 px-4">Waktu Update Terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>ADXL-201</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">Tangan Kanan</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">{latest201.x.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">{latest201.y.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">{latest201.z.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#00ba88] text-sm">{latest201.g.toFixed(2)} G</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border shadow-xs ${status201.badgeClass}`}>
                      {status201.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold font-mono text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{formattedUpdateTime}</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-teal-500 shrink-0"></span>
                      <span>ADXL-202</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">Tangan Kiri</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">{latest202.x.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">{latest202.y.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">{latest202.z.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#00ba88] text-sm">{latest202.g.toFixed(2)} G</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border shadow-xs ${status202.badgeClass}`}>
                      {status202.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold font-mono text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Online
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{formattedUpdateTime}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-semibold text-slate-600 font-mono">Batas G-Force:</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> ~1.0 G (Gravitasi Bumi)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400"></span> 1.2 – 2.0 G (Gerak Aktif)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span> &ge; 2.0 G (Impak / Benturan)
              </span>
            </div>
            <div className="font-mono text-slate-400">
              Sampling Rate: <strong className="text-emerald-700">100 Hz SPI/I2C</strong>
            </div>
          </div>
        </div>
      </BaseCard>

      {/* Modal Log Riwayat ADXL345 */}
      <AdxlLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        mannequinId={mannequinId}
        data201={rawRows201}
        data202={rawRows202}
        onExportCsv={handleExportCSV}
      />
    </div>
  );
};

export default AdxlPage;
