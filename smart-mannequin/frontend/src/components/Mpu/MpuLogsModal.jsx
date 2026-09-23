import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Download, RefreshCw, X, FileSpreadsheet, Layers, Filter, Compass } from "lucide-react";
import moment from "moment";
import { useFetchSensor } from "../../hooks/useSensor";
import LogsModalPortal from "../Elements/Modal/LogsModalPortal";

export default function MpuLogsModal({
  isOpen,
  onClose,
  mannequinId = 1,
  initialRows = [],
  onExportCsv,
}) {
  const [readings, setReadings] = useState(initialRows);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [fetchLimit, setFetchLimit] = useState(100);

  const fetchLogs = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const response = await useFetchSensor(
        "MPU",
        1002,
        mannequinId,
        true,
        fetchLimit
      );
      const rows = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
        ? response.data
        : [];
      setReadings(rows);
    } catch (err) {
      console.error("Error fetching mpu logs:", err);
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

  // Client-side pagination
  const totalItems = readings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.min(page, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return readings.slice(start, start + limit);
  }, [readings, currentPage, limit]);

  const handleExport = () => {
    if (onExportCsv) {
      onExportCsv();
      return;
    }

    if (!readings || readings.length === 0) return;

    const headers = [
      "No",
      "Waktu (WIB)",
      "Sensor ID",
      "X-Accel (m/s²)",
      "Y-Accel (m/s²)",
      "Z-Accel (m/s²)",
      "Magnitude Accel",
      "Status Orientasi",
      "Mannequin ID",
    ];

    let no = 1;
    const csvRows = readings.map((r) => {
      const x = parseFloat(r.x_acceleration) || 0;
      const y = parseFloat(r.y_acceleration) || 0;
      const z = parseFloat(r.z_acceleration) || 0;
      const mag = Math.sqrt(x * x + y * y + z * z);

      return [
        no++,
        r.inputed_at ? moment(r.inputed_at).format("YYYY-MM-DD HH:mm:ss") : "-",
        "MPU-6050",
        x.toFixed(2),
        y.toFixed(2),
        z.toFixed(2),
        mag.toFixed(2),
        mag >= 15 ? "Dinamik Cepat" : mag >= 9 ? "Stabil Normal" : "Micro-Motion",
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
    link.download = `log_riwayat_sensor_mpu6050_mannequin_${mannequinId}_${moment().format("YYYYMMDD_HHmmss")}.csv`;
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
                Log Riwayat Sensor Gerak & Orientasi (MPU-6050)
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Data histori telemetri 6-Axis Gyro & Akselerometer • Total {totalItems.toLocaleString()} data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
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
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value={50}>Ambil 50 Data</option>
              <option value={100}>Ambil 100 Data</option>
              <option value={200}>Ambil 200 Data</option>
            </select>

            <button
              onClick={fetchLogs}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-[#00ba88]" : ""} />
              <span>Segarkan</span>
            </button>
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Download size={14} className="text-emerald-400" />
            <span>Ekspor CSV</span>
          </button>
        </div>

        {/* Tabel Konten Log */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6">
          {loading && readings.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
              Memuat data log riwayat MPU-6050...
            </div>
          ) : paginatedRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <Compass className="w-10 h-10 text-slate-300" />
              <p className="text-sm font-medium">Belum ada rekaman log telemetri MPU.</p>
              <p className="text-xs text-slate-400">
                Pastikan sensor MPU-6050 terhubung dan mengirimkan data gerakan.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px] font-mono">
                  <tr>
                    <th className="py-3 px-4">Waktu (WIB)</th>
                    <th className="py-3 px-4">Sensor ID</th>
                    <th className="py-3 px-4 text-right">X-Accel</th>
                    <th className="py-3 px-4 text-right">Y-Accel</th>
                    <th className="py-3 px-4 text-right">Z-Accel</th>
                    <th className="py-3 px-4 text-right">Resultan Accel</th>
                    <th className="py-3 px-4 text-center">Status Gerakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                  {paginatedRows.map((r, idx) => {
                    const x = parseFloat(r.x_acceleration) || 0;
                    const y = parseFloat(r.y_acceleration) || 0;
                    const z = parseFloat(r.z_acceleration) || 0;
                    const mag = Math.sqrt(x * x + y * y + z * z);

                    return (
                      <tr key={r.event_id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                          {r.inputed_at
                            ? moment(r.inputed_at).format("DD/MM/YYYY, HH:mm:ss")
                            : "-"}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-semibold text-slate-600">
                          MPU-6050
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                          {x.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                          {y.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                          {z.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-[#00ba88] text-sm">
                          {mag.toFixed(2)} m/s²
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {mag >= 15 ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Dinamik Cepat
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              Stabil Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Pagination */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
          <div>
            Halaman <span className="font-bold text-slate-800">{currentPage}</span> dari{" "}
            <span className="font-bold text-slate-800">{totalPages}</span>
            <span className="text-slate-400 ml-2">({totalItems} data)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors font-medium cursor-pointer"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors font-medium cursor-pointer"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </LogsModalPortal>
  );
}
