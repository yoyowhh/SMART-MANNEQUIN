import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Download, RefreshCw, X, FileSpreadsheet, Filter, Thermometer } from "lucide-react";
import moment from "moment";
import { useFetchSensor } from "../../hooks/useSensor";
import LogsModalPortal from "../Elements/Modal/LogsModalPortal";

const STATUS_FILTERS = [
  { value: "all", label: "Semua Status" },
  { value: "cold", label: "Suhu Dingin (< 33.3°C)" },
  { value: "normal", label: "Suhu Normal (33.3 - 51.6°C)" },
  { value: "hot", label: "Suhu Panas (> 51.6°C)" },
];

export default function ThermalLogsModal({
  isOpen,
  onClose,
  mannequinId = 1,
  initialRows = [],
  onExportCsv,
}) {
  const [readings, setReadings] = useState(initialRows);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [fetchLimit, setFetchLimit] = useState(100);

  const fetchLogs = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const response = await useFetchSensor(
        "thermal",
        702,
        mannequinId,
        true,
        fetchLimit
      );
      const rows = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setReadings(rows);
    } catch (err) {
      console.error("Error fetching thermal logs:", err);
    } finally {
      setLoading(false);
    }
  }, [isOpen, mannequinId, fetchLimit]);

  useEffect(() => {
    if (isOpen) {
      if (initialRows && initialRows.length > 0) {
        setReadings(initialRows);
      } else {
        fetchLogs();
      }
    }
  }, [isOpen, initialRows, fetchLogs]);

  // Status evaluasi
  const getTempStatus = (temp) => {
    if (temp <= 25) {
      return { label: "Suhu Dingin", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" };
    } else if (temp <= 42) {
      return { label: "Suhu Normal / Nyaman", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    return { label: "Suhu Sangat Panas", badgeClass: "bg-rose-50 text-rose-700 border-rose-200" };
  };

  // Filter status
  const filteredReadings = useMemo(() => {
    if (selectedStatus === "all") return readings;
    return readings.filter((r) => {
      const temp = parseFloat(r.center_temp) || 0;
      if (selectedStatus === "cold") return temp <= 33.3;
      if (selectedStatus === "normal") return temp > 33.3 && temp <= 51.6;
      if (selectedStatus === "hot") return temp > 51.6;
      return true;
    });
  }, [readings, selectedStatus]);

  // Client-side pagination
  const totalItems = filteredReadings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.min(page, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return filteredReadings.slice(start, start + limit);
  }, [filteredReadings, currentPage, limit]);

  const handleExport = () => {
    if (onExportCsv) {
      onExportCsv();
      return;
    }

    if (!readings || readings.length === 0) return;

    const headers = [
      "No",
      "Waktu Pencatatan (WIB)",
      "Sensor ID",
      "Suhu Titik Pusat (°C)",
      "Suhu Titik Pusat (°F)",
      "Status Termal",
      "Mannequin ID",
    ];

    let no = 1;
    const csvRows = readings.map((r) => {
      const temp = parseFloat(r.center_temp) || 0;
      const tempF = (temp * 9) / 5 + 32;
      const status = getTempStatus(temp).label;

      return [
        no++,
        r.inputed_at ? moment(r.inputed_at).format("YYYY-MM-DD HH:mm:ss") : "-",
        "THERMAL-702",
        temp.toFixed(2),
        tempF.toFixed(1),
        status,
        mannequinId,
      ];
    });

    let csvContent = "\uFEFF";
    csvContent += headers.join(",") + "\n";
    csvRows.forEach((row) => {
      csvContent +=
        row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `log_riwayat_sensor_termal_mannequin_${mannequinId}_${moment().format("YYYYMMDD_HHmmss")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <LogsModalPortal isOpen={isOpen} onClose={onClose}>
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-[#00ba88] border border-emerald-100 shadow-2xs">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">
                Log Riwayat Sensor Termal Array (MLX90640)
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Data histori telemetri suhu titik pusat waktu nyata • Total {totalItems.toLocaleString()} data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Toolbar Filter & Aksi */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Filter size={13} className="text-[#00ba88]" />
              <span>Jumlah Ambil:</span>
            </div>

            <select
              value={fetchLimit}
              onChange={(e) => {
                setFetchLimit(Number(e.target.value));
                setPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:border-[#00ba88] cursor-pointer">
              <option value={50}>50 Data Terakhir</option>
              <option value={100}>100 Data Terakhir</option>
              <option value={200}>200 Data Terakhir</option>
              <option value={500}>500 Data Terakhir</option>
            </select>

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* Filter Status Suhu */}
            <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-lg">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => {
                    setSelectedStatus(f.value);
                    setPage(1);
                  }}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    selectedStatus === f.value
                      ? "bg-white text-[#00ba88] shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExport}
              disabled={readings.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50">
              <Download size={13} />
              <span>Unduh CSV</span>
            </button>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="flex-1 overflow-auto overscroll-contain">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <RefreshCw size={28} className="animate-spin text-[#00ba88]" />
              <p className="text-xs font-medium font-mono">Memuat log riwayat sensor termal...</p>
            </div>
          ) : paginatedRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <Thermometer size={36} className="text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Tidak ada data log yang sesuai.</p>
              <p className="text-xs text-slate-400 font-mono">
                Coba ubah filter atau klik tombol refresh.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Waktu Pencatatan (WIB)</th>
                  <th className="py-3 px-4">Sensor ID</th>
                  <th className="py-3 px-4 text-right">Suhu (°C)</th>
                  <th className="py-3 px-4 text-right">Suhu (°F)</th>
                  <th className="py-3 px-4 text-center">Status Termal</th>
                  <th className="py-3 px-4 text-center">Mannequin ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {paginatedRows.map((item, idx) => {
                  const globalIdx = (currentPage - 1) * limit + idx + 1;
                  const temp = parseFloat(item.center_temp) || 0;
                  const tempF = (temp * 9) / 5 + 32;
                  const status = getTempStatus(temp);

                  return (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
                        {globalIdx}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {item.inputed_at
                          ? moment(item.inputed_at).format("DD/MM/YYYY, HH:mm:ss")
                          : "-"}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 font-medium">
                        THERMAL-702
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        {temp.toFixed(2)} °C
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-500">
                        {tempF.toFixed(1)} °F
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border shadow-2xs ${status.badgeClass}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-500">
                        MID-{item.mannequin_id || mannequinId}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Pagination */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span>Baris per halaman:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer">
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-slate-400 font-mono ml-2">
              Menampilkan {totalItems > 0 ? (currentPage - 1) * limit + 1 : 0} -{" "}
              {Math.min(currentPage * limit, totalItems)} dari {totalItems} data
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-semibold transition-colors cursor-pointer">
              Sebelumnya
            </button>
            <span className="font-mono text-slate-600 px-2 font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-semibold transition-colors cursor-pointer">
              Berikutnya
            </button>
          </div>
        </div>
      </LogsModalPortal>
  );
}
