import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Download, RefreshCw, X, FileSpreadsheet, Layers, Filter, Volume2 } from "lucide-react";
import moment from "moment";
import { useFetchSensor } from "../../hooks/useSensor";
import LogsModalPortal from "../Elements/Modal/LogsModalPortal";

const CHANNEL_FILTERS = [
  { value: "all", label: "Semua Kanal (Stereo)" },
  { value: "601", label: "Telinga Kanan (KY-601)" },
  { value: "602", label: "Telinga Kiri (KY-602)" },
];

const STATUS_FILTERS = [
  { value: "all", label: "Semua Status Kebisingan" },
  { value: "high", label: "Bising Tinggi (> 75 dB)" },
  { value: "normal", label: "Normal / Percakapan (45 - 75 dB)" },
  { value: "quiet", label: "Hening / Tenang (< 45 dB)" },
];

export default function SoundLogsModal({
  isOpen,
  onClose,
  mannequinId = 1,
  ky601Rows = [],
  ky602Rows = [],
  onExportCsv,
}) {
  const [data601, setData601] = useState(ky601Rows);
  const [data602, setData602] = useState(ky602Rows);
  const [loading, setLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [fetchLimit, setFetchLimit] = useState(100);

  const fetchLogs = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const [res601, res602] = await Promise.all([
        useFetchSensor("ky", 601, mannequinId, true, fetchLimit),
        useFetchSensor("ky", 602, mannequinId, true, fetchLimit),
      ]);

      const raw601 = res601?.data?.data || [];
      const raw602 = res602?.data?.data || [];

      setData601(raw601);
      setData602(raw602);
    } catch (err) {
      console.error("Error fetching sound logs:", err);
    } finally {
      setLoading(false);
    }
  }, [isOpen, mannequinId, fetchLimit]);

  useEffect(() => {
    if (isOpen) {
      if ((ky601Rows && ky601Rows.length > 0) || (ky602Rows && ky602Rows.length > 0)) {
        setData601(ky601Rows);
        setData602(ky602Rows);
      } else {
        fetchLogs();
      }
    }
  }, [isOpen, ky601Rows, ky602Rows, fetchLogs]);

  // Gabungkan dan urutkan kedua kanal berdasarkan timestamp terbaru
  const allReadings = useMemo(() => {
    const combined = [];

    data601.forEach((item) => {
      const val = parseFloat(item.value) || 0;
      combined.push({
        id: `601-${item.event_id || Math.random()}`,
        sensorId: "KY-601",
        channelName: "Telinga Kanan",
        valDb: val,
        rawAdc: Math.round(val * 10.24),
        timestamp: item.inputed_at,
        isHigh: item.is_high || val >= 75,
      });
    });

    data602.forEach((item) => {
      const val = parseFloat(item.value) || 0;
      combined.push({
        id: `602-${item.event_id || Math.random()}`,
        sensorId: "KY-602",
        channelName: "Telinga Kiri",
        valDb: val,
        rawAdc: Math.round(val * 10.24),
        timestamp: item.inputed_at,
        isHigh: item.is_high || val >= 75,
      });
    });

    // Urutkan descending berdasarkan waktu
    return combined.sort((a, b) => {
      const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return tB - tA;
    });
  }, [data601, data602]);

  // Filter berdasarkan pilihan pengguna
  const filteredReadings = useMemo(() => {
    return allReadings.filter((r) => {
      // Filter Kanal
      if (selectedChannel === "601" && r.sensorId !== "KY-601") return false;
      if (selectedChannel === "602" && r.sensorId !== "KY-602") return false;

      // Filter Status
      if (selectedStatus === "high" && !(r.isHigh || r.valDb >= 75)) return false;
      if (selectedStatus === "normal" && (r.valDb < 45 || r.valDb >= 75)) return false;
      if (selectedStatus === "quiet" && r.valDb >= 45) return false;

      return true;
    });
  }, [allReadings, selectedChannel, selectedStatus]);

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
      "Kanal Anatomis",
      "Nilai Intensitas (dB)",
      "Nilai Raw (ADC)",
      "Status Ambang Batas",
      "Mannequin ID",
    ];

    let no = 1;
    const csvRows = filteredReadings.map((r) => {
      const status =
        r.valDb >= 75
          ? "Bising Tinggi (Warning)"
          : r.valDb >= 45
          ? "Normal / Percakapan"
          : "Hening / Tenang";

      return [
        no++,
        r.timestamp ? moment(r.timestamp).format("YYYY-MM-DD HH:mm:ss") : "-",
        r.sensorId,
        r.channelName,
        r.valDb.toFixed(1),
        r.rawAdc,
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
    link.download = `log_riwayat_sensor_suara_mannequin_${mannequinId}_${moment().format("YYYYMMDD_HHmmss")}.csv`;
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
                Log Riwayat Sensor Suara (KY-037 / KY-038)
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Data histori telemetri stereo akustik • Total {totalItems.toLocaleString()} data
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
              <span>Filter:</span>
            </div>

            <select
              value={selectedChannel}
              onChange={(e) => {
                setSelectedChannel(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {CHANNEL_FILTERS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
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
          {loading && allReadings.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
              Memuat data log riwayat suara...
            </div>
          ) : paginatedRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <Volume2 className="w-10 h-10 text-slate-300" />
              <p className="text-sm font-medium">Belum ada rekaman log telemetri suara.</p>
              <p className="text-xs text-slate-400">
                Pastikan sensor mikrofon KY-037/KY-038 terhubung dan aktif merekam.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px] font-mono">
                  <tr>
                    <th className="py-3 px-4">Waktu (WIB)</th>
                    <th className="py-3 px-4">Sensor</th>
                    <th className="py-3 px-4">Kanal Anatomis</th>
                    <th className="py-3 px-4 text-right">Intensitas (dB)</th>
                    <th className="py-3 px-4 text-right">Raw ADC</th>
                    <th className="py-3 px-4 text-center">Status Kebisingan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                  {paginatedRows.map((r) => {
                    const isDanger = r.valDb >= 75 || r.isHigh;
                    const isWarn = r.valDb >= 45 && r.valDb < 75;

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                          {r.timestamp
                            ? moment(r.timestamp).format("DD/MM/YYYY, HH:mm:ss")
                            : "-"}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-semibold text-slate-600">
                          {r.sensorId}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-800">
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                r.sensorId === "KY-601" ? "bg-emerald-500" : "bg-teal-500"
                              }`}
                            />
                            {r.channelName}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-[#00ba88] text-sm">
                          {r.valDb.toFixed(1)} dB
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                          {r.rawAdc}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {isDanger ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Bising Tinggi
                            </span>
                          ) : isWarn ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Normal
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              Hening / Tenang
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
