import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Download, RefreshCw, X, FileSpreadsheet, Layers, Filter, Scale } from "lucide-react";
import moment from "moment";
import { useFetchSensor } from "../../hooks/useSensor";

const SENSOR_POINTS = [
  { value: "all", label: "Semua Titik Beban (1 - 5)" },
  { value: "801", label: "Titik #1: Leher (Loadcell 801)" },
  { value: "802", label: "Titik #2: Paha Kiri (Loadcell 802)" },
  { value: "803", label: "Titik #3: Paha Kanan (Loadcell 803)" },
  { value: "804", label: "Titik #4: Kaki Kiri (Loadcell 804)" },
  { value: "805", label: "Titik #5: Kaki Kanan (Loadcell 805)" },
];

export default function LoadcellLogsModal({
  isOpen,
  onClose,
  mannequinId = 1,
  allPointRows = [],
  onExportCsv,
}) {
  const [readings, setReadings] = useState(allPointRows);
  const [loading, setLoading] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [fetchLimit, setFetchLimit] = useState(50);

  const fetchLogs = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const [r1, r2, r3, r4, r5] = await Promise.all([
        useFetchSensor("loadcell", 801, mannequinId, true, fetchLimit),
        useFetchSensor("loadcell", 802, mannequinId, true, fetchLimit),
        useFetchSensor("loadcell", 803, mannequinId, true, fetchLimit),
        useFetchSensor("loadcell", 804, mannequinId, true, fetchLimit),
        useFetchSensor("loadcell", 805, mannequinId, true, fetchLimit),
      ]);

      const combine = [];
      const extract = (res, sensorId, name) => {
        const rows = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];
        rows.forEach((item) => {
          combine.push({
            id: `${sensorId}-${item.event_id || Math.random()}`,
            sensorId,
            pointName: name,
            value: parseFloat(item.value) || 0,
            timestamp: item.inputed_at,
          });
        });
      };

      extract(r1, 801, "Leher (Neck)");
      extract(r2, 802, "Paha Kiri (Left Thigh)");
      extract(r3, 803, "Paha Kanan (Right Thigh)");
      extract(r4, 804, "Kaki Kiri (Left Foot)");
      extract(r5, 805, "Kaki Kanan (Right Foot)");

      combine.sort((a, b) => {
        const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return tB - tA;
      });

      setReadings(combine);
    } catch (err) {
      console.error("Error fetching loadcell logs:", err);
    } finally {
      setLoading(false);
    }
  }, [isOpen, mannequinId, fetchLimit]);

  useEffect(() => {
    if (isOpen) {
      if (allPointRows && allPointRows.length > 0) {
        setReadings(allPointRows);
      } else {
        fetchLogs();
      }
    }
  }, [isOpen, allPointRows, fetchLogs]);

  const filteredReadings = useMemo(() => {
    return readings.filter((r) => {
      if (selectedPoint !== "all" && String(r.sensorId) !== selectedPoint) return false;
      return true;
    });
  }, [readings, selectedPoint]);

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

    if (!filteredReadings || filteredReadings.length === 0) return;

    const headers = [
      "No",
      "Waktu (WIB)",
      "Sensor ID",
      "Titik Anatomis",
      "Beban (kg)",
      "Beban (Newton)",
      "Status Distribusi",
      "Mannequin ID",
    ];

    let no = 1;
    const csvRows = filteredReadings.map((r) => {
      const val = r.value || 0;
      const status =
        val >= 40
          ? "Beban Tinggi"
          : val >= 15
          ? "Beban Sedang"
          : "Beban Ringan / Statik";

      return [
        no++,
        r.timestamp ? moment(r.timestamp).format("YYYY-MM-DD HH:mm:ss") : "-",
        r.sensorId,
        r.pointName,
        val.toFixed(2),
        (val * 9.80665).toFixed(2),
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
    link.download = `log_riwayat_sensor_loadcell_mannequin_${mannequinId}_${moment().format("YYYYMMDD_HHmmss")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-[#00ba88] border border-emerald-100 shadow-2xs">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">
                Log Riwayat Sensor Beban (Load Cell 5-Titik)
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Data histori telemetri distribusi beban manekin • Total {totalItems.toLocaleString()} data
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
              <span>Filter Titik:</span>
            </div>

            <select
              value={selectedPoint}
              onChange={(e) => {
                setSelectedPoint(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {SENSOR_POINTS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>

            <select
              value={fetchLimit}
              onChange={(e) => {
                setFetchLimit(Number(e.target.value));
                setPage(1);
              }}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value={25}>Ambil 25 Data/Titik</option>
              <option value={50}>Ambil 50 Data/Titik</option>
              <option value={100}>Ambil 100 Data/Titik</option>
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
        <div className="flex-1 overflow-y-auto p-6">
          {loading && readings.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
              Memuat data log riwayat Load Cell...
            </div>
          ) : paginatedRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <Scale className="w-10 h-10 text-slate-300" />
              <p className="text-sm font-medium">Belum ada rekaman log telemetri Load Cell.</p>
              <p className="text-xs text-slate-400">
                Pastikan modul transduser Load Cell terhubung dan aktif merekam gaya beban.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px] font-mono">
                  <tr>
                    <th className="py-3 px-4">Waktu (WIB)</th>
                    <th className="py-3 px-4">Sensor ID</th>
                    <th className="py-3 px-4">Titik Anatomis</th>
                    <th className="py-3 px-4 text-right">Beban (kg)</th>
                    <th className="py-3 px-4 text-right">Beban (N)</th>
                    <th className="py-3 px-4 text-center">Status Beban</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                  {paginatedRows.map((r) => {
                    const val = r.value || 0;
                    const isHigh = val >= 40;
                    const isMed = val >= 15 && val < 40;

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                          {r.timestamp
                            ? moment(r.timestamp).format("DD/MM/YYYY, HH:mm:ss")
                            : "-"}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-semibold text-slate-600">
                          LC-{r.sensorId}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-800">
                          {r.pointName}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-[#00ba88] text-sm">
                          {val.toFixed(2)} kg
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                          {(val * 9.80665).toFixed(1)} N
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {isHigh ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Beban Tinggi
                            </span>
                          ) : isMed ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Beban Sedang
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              Ringan / Normal
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
      </div>
    </div>
  );
}
