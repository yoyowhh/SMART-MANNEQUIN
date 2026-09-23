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
import LoadcellLogsModal from "../../components/Loadcell/LoadcellLogsModal";
import moment from "moment";
import Swal from "sweetalert2";
import {
  Clock,
  Calendar,
  ScrollText,
} from "lucide-react";

const PERIOD_OPTIONS = [
  { label: "10 Data", value: 10 },
  { label: "25 Data", value: 25 },
  { label: "50 Data", value: 50 },
  { label: "100 Data", value: 100 },
];

const LOADCELL_CONFIG = [
  { id: 801, nameKey: "loadcellSensor.neck", defaultName: "Leher", descKey: "loadcellSensor.neckDesc", defaultDesc: "Kompresi Servikal", maxSafe: 25 },
  { id: 802, nameKey: "loadcellSensor.leftThigh", defaultName: "Paha Kiri", descKey: "loadcellSensor.leftThighDesc", defaultDesc: "Distribusi Femur Kiri", maxSafe: 40 },
  { id: 803, nameKey: "loadcellSensor.rightThigh", defaultName: "Paha Kanan", descKey: "loadcellSensor.rightThighDesc", defaultDesc: "Distribusi Femur Kanan", maxSafe: 40 },
  { id: 804, nameKey: "loadcellSensor.leftFoot", defaultName: "Kaki Kiri", descKey: "loadcellSensor.leftFootDesc", defaultDesc: "Tumpuan Telapak Kiri", maxSafe: 50 },
  { id: 805, nameKey: "loadcellSensor.rightFoot", defaultName: "Kaki Kanan", descKey: "loadcellSensor.rightFootDesc", defaultDesc: "Tumpuan Telapak Kanan", maxSafe: 50 },
];

const LoadcellPage = () => {
  const { t } = useTranslation();
  const params = useParams();
  const mannequinId = params?.id || 1;

  // Data State
  const [loading, setLoading] = useState(true);
  const [rows801, setRows801] = useState([]);
  const [rows802, setRows802] = useState([]);
  const [rows803, setRows803] = useState([]);
  const [rows804, setRows804] = useState([]);
  const [rows805, setRows805] = useState([]);
  const [latestValues, setLatestValues] = useState({ 801: 0, 802: 0, 803: 0, 804: 0, 805: 0 });
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // Status Koneksi & Filter Periode
  const [isConnected, setIsConnected] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [limit, setLimit] = useState(10);

  // Status ambang beban
  const getLoadStatus = (val, maxSafe = 50) => {
    if (val >= maxSafe) {
      return {
        label: t("loadcellSensor.overload", "Overload (Kritis)"),
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      };
    }
    if (val >= maxSafe * 0.7) {
      return {
        label: t("loadcellSensor.highLoad", "Beban Tinggi"),
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }
    return {
      label: t("loadcellSensor.safeLoad", "Beban Aman"),
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    };
  };

  const fetchAndProcessData = useCallback(async () => {
    try {
      const [r1, r2, r3, r4, r5] = await Promise.all([
        useFetchSensor("loadcell", 801, mannequinId, true, limit),
        useFetchSensor("loadcell", 802, mannequinId, true, limit),
        useFetchSensor("loadcell", 803, mannequinId, true, limit),
        useFetchSensor("loadcell", 804, mannequinId, true, limit),
        useFetchSensor("loadcell", 805, mannequinId, true, limit),
      ]);

      setLoading(false);
      setLastFetchTime(new Date());

      const d1 = r1?.data?.data || [];
      const d2 = r2?.data?.data || [];
      const d3 = r3?.data?.data || [];
      const d4 = r4?.data?.data || [];
      const d5 = r5?.data?.data || [];

      setRows801(d1);
      setRows802(d2);
      setRows803(d3);
      setRows804(d4);
      setRows805(d5);

      const hasData = d1.length || d2.length || d3.length || d4.length || d5.length;
      if (hasData) {
        setIsConnected(true);
        setLatestValues({
          801: parseFloat(d1[0]?.value) || 0,
          802: parseFloat(d2[0]?.value) || 0,
          803: parseFloat(d3[0]?.value) || 0,
          804: parseFloat(d4[0]?.value) || 0,
          805: parseFloat(d5[0]?.value) || 0,
        });

        const updateCandidate = d1[0]?.inputed_at || d2[0]?.inputed_at || d3[0]?.inputed_at || d4[0]?.inputed_at || d5[0]?.inputed_at;
        if (updateCandidate) setLastUpdateTime(updateCandidate);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Error fetching loadcell data:", error);
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
    const allData = [
      ...rows801.map((item) => ({ ...item, sensorId: 801, name: "Leher (Neck)" })),
      ...rows802.map((item) => ({ ...item, sensorId: 802, name: "Paha Kiri (Left Thigh)" })),
      ...rows803.map((item) => ({ ...item, sensorId: 803, name: "Paha Kanan (Right Thigh)" })),
      ...rows804.map((item) => ({ ...item, sensorId: 804, name: "Kaki Kiri (Left Foot)" })),
      ...rows805.map((item) => ({ ...item, sensorId: 805, name: "Kaki Kanan (Right Foot)" })),
    ];

    if (!allData || allData.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Tidak Ada Data",
        text: "Belum ada riwayat telemetri Load Cell yang dapat diekspor.",
      });
      return;
    }

    allData.sort((a, b) => new Date(b.inputed_at) - new Date(a.inputed_at));

    const headers = [
      "No",
      "Waktu Pencatatan (WIB)",
      "Sensor ID",
      "Titik Anatomis",
      "Nilai Beban / Gaya (kg)",
    ];

    const csvData = allData.map((item, idx) => {
      const val = parseFloat(item.value) || 0;
      return [
        idx + 1,
        `"${moment(item.inputed_at).format("YYYY-MM-DD HH:mm:ss")}"`,
        item.sensorId,
        `"${item.name}"`,
        val.toFixed(2),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvData].join("\r\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Telemetri_LoadCell_Manekin_${mannequinId}_${moment().format("YYYYMMDD_HHmmss")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Konfigurasi Chart Area Spline Serba Hijau Emerald
  const { chartSeries, chartOptions } = useMemo(() => {
    // Gunakan baris 801 sebagai referensi kategori waktu, atau baris terpanjang
    const refRows = [rows801, rows802, rows803, rows804, rows805].reduce(
      (max, cur) => (cur.length > max.length ? cur : max),
      []
    );

    const reversedRef = [...refRows].reverse();
    const categories = reversedRef.map((r) =>
      moment(r.inputed_at).format("HH:mm:ss")
    );

    const getSeries = (rows) => {
      const rev = [...rows].reverse();
      return rev.map((r) => Number((parseFloat(r.value) || 0).toFixed(2)));
    };

    const seriesData = [
      { name: "Leher", data: getSeries(rows801) },
      { name: "Paha Kiri", data: getSeries(rows802) },
      { name: "Paha Kanan", data: getSeries(rows803) },
      { name: "Kaki Kiri", data: getSeries(rows804) },
      { name: "Kaki Kanan", data: getSeries(rows805) },
    ];

    const baseOpt = createChartOptions("Loadcell-Monitor", "Loadcell Distribution Chart", categories);

    const optionsData = {
      ...baseOpt,
      title: { text: undefined },
      chart: {
        ...baseOpt.chart,
        type: "area",
        toolbar: { show: false }, // Hapus menu hamburger / download
      },
      colors: ["#00ba88", "#0ea5e9", "#f59e0b", "#8b5cf6", "#ec4899"], // 5 warna berbeda untuk tiap titik beban
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
        width: [2.5, 2.5, 2.5, 2.5, 2.5],
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
          formatter: (val) => (val !== undefined ? `${val} kg` : "-"),
        },
      },
      yaxis: {
        ...baseOpt.yaxis,
        title: {
          text: "Beban Mekanis (kg)",
          style: { fontSize: "12px", fontWeight: "600", color: "#64748b" },
        },
        min: 0,
        forceNiceScale: true,
      },
    };

    return { chartSeries: seriesData, chartOptions: optionsData };
  }, [rows801, rows802, rows803, rows804, rows805]);

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
        sensorCode="LOAD CELL TRANSDUCERS"
        imageSlot={
          <div className="flex flex-row items-center gap-4 sm:gap-6 bg-slate-50/90 p-3 sm:p-4 rounded-2xl border border-slate-100 shrink-0 shadow-2xs">
            <div className="flex flex-col items-center">
              <img
                src="/images/information/loadcell-leher-information.png"
                alt="loadcell-leher"
                className="max-h-40 sm:max-h-48 max-w-[130px] sm:max-w-[160px] w-auto object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
              />
              <span className="text-xs font-mono font-bold text-slate-600 mt-2">
                {t("loadcellSensor.neckSensor", "Sensor Leher")}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <img
                src="/images/information/loadcell-kaki-information.png"
                alt="loadcell-kaki"
                className="max-h-40 sm:max-h-48 max-w-[130px] sm:max-w-[160px] w-auto object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
              />
              <span className="text-xs font-mono font-bold text-slate-600 mt-2">
                {t("loadcellSensor.legThighSensor", "Sensor Kaki & Paha")}
              </span>
            </div>
          </div>
        }
        action={
          <button
            type="button"
            onClick={() => setIsLogsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer">
            <ScrollText size={14} />
            <span>{t("common.viewLogs", "Lihat Log Riwayat Sensor")}</span>
          </button>
        }>
        <div className="flex flex-col gap-2.5">
          <h4 className="font-bold text-slate-800 text-base sm:text-lg">
            {t("loadcellSensor.title", "Sistem Distribusi Beban Mekanis Load Cell")}
          </h4>
          <p className="text-slate-600 text-sm leading-relaxed text-justify">
            {t(
              "loadcellSensor.dekripsiSensor",
              "Sensor Load Cell mengukur distribusi beban mekanis dan gaya kontak pada 5 titik anatomis manekin: Leher, Paha Kiri, Paha Kanan, Kaki Kiri, dan Kaki Kanan secara kontinu untuk evaluasi biomekanis komprehensif."
            )}
          </p>
        </div>
      </SensorInfoCard>

      {/* Row 1: 5 Cards Metrik Beban Anatomis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {LOADCELL_CONFIG.map((item) => {
          const val = latestValues[item.id] || 0;
          const status = getLoadStatus(val, item.maxSafe);
          const name = t(item.nameKey, item.defaultName);
          const desc = t(item.descKey, item.defaultDesc);

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group cursor-default hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/15 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                    {name}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border shadow-2xs ${status.badgeClass}`}>
                    {status.label}
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5 py-1 mb-1">
                  <span className="text-3xl font-black text-[#00ba88] tracking-tight font-mono">
                    {loading ? "--" : val.toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-slate-400">kg</span>
                </div>

                <div className="text-[11px] text-slate-500 mb-2">
                  {desc}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mt-auto">
                <span>{t("loadcellSensor.maxCapacity", "Kapasitas Maks")}</span>
                <span className="font-semibold text-emerald-700 font-mono">{item.maxSafe} kg</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Grafik Riwayat Telemetri Load Cell (Tanpa Download Menu & Tanpa Strip Stats) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800">
                {t("loadcellSensor.chartTitle", "Grafik Distribusi Beban 5 Titik Anatomis")}
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-[#00ba88] font-bold">
                REALTIME
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t("loadcellSensor.chartSubtitle", "Visualisasi kontur pembebanan komparatif pada seluruh titik transduser tubuh manekin.")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">
              {t("loadcellSensor.activeChannels", "Kanal Aktif:")}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#00ba88] font-bold font-mono text-xs">
              {t("loadcellSensor.loadPointsCount", "5 Titik Beban")}
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
              {t("loadcellSensor.summaryTitle", "Ringkasan Distribusi Beban Titik Transduser")}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t("loadcellSensor.summarySubtitle", "Nilai pengukuran beban statik dan dinamik pada seluruh titik anatomis manekin.")}
            </p>
          </div>
        </div>

        {/* Tabel Ringkasan */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">{t("loadcellSensor.anatomicalPoint", "Titik Anatomis")}</th>
                <th className="py-3.5 px-4">Sensor ID</th>
                <th className="py-3.5 px-4">{t("common.currentValue", "Nilai Terkini")}</th>
                <th className="py-3.5 px-4">{t("loadcellSensor.safeMaxCapacity", "Kapasitas Maks Aman")}</th>
                <th className="py-3.5 px-4">{t("loadcellSensor.loadStatus", "Status Pembebanan")}</th>
                <th className="py-3.5 px-4">{t("common.updatedAt", "Waktu Pembaruan")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              {LOADCELL_CONFIG.map((item, idx) => {
                const val = latestValues[item.id] || 0;
                const status = getLoadStatus(val, item.maxSafe);
                const dotColors = ["#00ba88", "#0ea5e9", "#f59e0b", "#8b5cf6", "#ec4899"];
                const name = t(item.nameKey, item.defaultName);
                const desc = t(item.descKey, item.defaultDesc);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: dotColors[idx] }}></span>
                        <div>
                          <span className="font-bold text-slate-800 block">{name}</span>
                          <span className="text-[11px] text-slate-400">{desc}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-500">{item.id}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {val.toFixed(2)} kg
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{item.maxSafe} kg</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${status.badgeClass}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{formattedUpdateTime}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend Informasi Status */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">{t("loadcellSensor.loadGuide", "Panduan Batas Pembebanan:")}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{t("loadcellSensor.safeLoadDesc", "Beban Aman (< 70% Kapasitas)")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>{t("loadcellSensor.highLoadDesc", "Beban Tinggi (70% - 100%)")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>{t("loadcellSensor.overloadDesc", "Overload (> 100% Kapasitas Maks)")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Log Riwayat */}
      <LoadcellLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        mannequinId={mannequinId}
        onExportCsv={handleExportCSV}
      />
    </div>
  );
};

export default LoadcellPage;
