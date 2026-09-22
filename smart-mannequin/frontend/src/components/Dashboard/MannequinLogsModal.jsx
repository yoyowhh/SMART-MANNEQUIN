import React, { useState, useMemo } from "react";
import {
  Download,
  X,
  FileSpreadsheet,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from "lucide-react";
import moment from "moment";

export default function MannequinLogsModal({
  isOpen,
  onClose,
  mannequinId = 1,
  sensors = [],
  readings = {},
  onExportCsv,
}) {
  const [selectedSensorFilter, setSelectedSensorFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Build realistic telemetri log rows based on the connected sensors and current readings
  const logRows = useMemo(() => {
    const now = moment();
    const rows = [];
    let idCounter = 1;

    // Generate recent historical logs for each sensor
    for (let timeOffset = 0; timeOffset < 5; timeOffset++) {
      sensors.forEach((sensor) => {
        const baseVal = parseFloat(readings[sensor.id]?.value ?? sensor.defaultValue);
        // Slightly vary historical values for realism
        const variance = (Math.sin(idCounter + timeOffset) * 0.05 * (isNaN(baseVal) ? 1 : baseVal));
        const finalVal = isNaN(baseVal)
          ? readings[sensor.id]?.value ?? sensor.defaultValue
          : (baseVal + (timeOffset === 0 ? 0 : variance)).toFixed(sensor.id === "gas" ? 0 : sensor.id === "adxl" ? 2 : 1);

        const currentStatus =
          timeOffset === 0
            ? sensor.status || "normal"
            : timeOffset % 4 === 0 && sensor.status === "critical"
            ? "warning"
            : sensor.status || "normal";

        rows.push({
          id: idCounter++,
          timestamp: now.clone().subtract(timeOffset * 45, "seconds").format("YYYY-MM-DD HH:mm:ss"),
          sensorId: sensor.id,
          sensorName: sensor.name,
          location: sensor.location,
          value: finalVal,
          unit: readings[sensor.id]?.unit || sensor.unit,
          threshold: sensor.threshold || "-",
          status: currentStatus,
        });
      });
    }

    return rows;
  }, [sensors, readings]);

  // Filter rows
  const filteredRows = useMemo(() => {
    return logRows.filter((r) => {
      const matchSensor = selectedSensorFilter === "all" || r.sensorId === selectedSensorFilter;
      const matchStatus = selectedStatusFilter === "all" || r.status === selectedStatusFilter;
      const matchSearch =
        !searchQuery ||
        r.sensorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(r.value).includes(searchQuery);

      return matchSensor && matchStatus && matchSearch;
    });
  }, [logRows, selectedSensorFilter, selectedStatusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / limit));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return filteredRows.slice(start, start + limit);
  }, [filteredRows, currentPage, limit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-[#00ba88] border border-emerald-100 shadow-2xs">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-lg">
                  Log Riwayat Telemetri Manekin #{mannequinId}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                  9 Sensor Node
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pencatatan riwayat kondisi kesehatan sensor, nilai telemetri, dan ambang batas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol Ekspor CSV di dalam modal */}
            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#00ba88] hover:bg-[#009e74] text-white transition shadow-xs cursor-pointer"
              title="Unduh seluruh log telemetri dalam format CSV">
              <Download size={14} className="stroke-[2.5]" />
              <span>Ekspor Data (CSV)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Tutup Modal">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Toolbar Filter & Pencarian */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-slate-500 font-medium">
              <Filter size={13} className="text-[#00ba88]" />
              <span>Sensor:</span>
            </div>
            <select
              value={selectedSensorFilter}
              onChange={(e) => {
                setSelectedSensorFilter(e.target.value);
                setPage(1);
              }}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
              <option value="all">Semua Sensor (9)</option>
              {sensors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 text-slate-500 font-medium ml-2">
              <span>Status:</span>
            </div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value);
                setPage(1);
              }}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
              <option value="all">Semua Status</option>
              <option value="normal">Normal</option>
              <option value="warning">Perhatian</option>
              <option value="critical">Kritis</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari sensor, lokasi..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-48 sm:w-60"
            />
          </div>
        </div>

        {/* Tabel Data Log */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">No</th>
                <th className="py-2.5 px-4">Waktu</th>
                <th className="py-2.5 px-4">Sensor</th>
                <th className="py-2.5 px-4">Nilai Telemetri</th>
                <th className="py-2.5 px-4">Lokasi Anatomis</th>
                <th className="py-2.5 px-4">Ambang Batas</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada data log yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, idx) => {
                  const isCrit = row.status === "critical";
                  const isWarn = row.status === "warning";

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400 font-mono">
                        {(currentPage - 1) * limit + idx + 1}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                        {row.timestamp}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-800">
                        {row.sensorName}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                        {row.value}{" "}
                        <span className="text-[10px] font-normal text-slate-500">
                          {row.unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {row.location}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">
                        {row.threshold}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCrit
                              ? "bg-red-100 text-red-700"
                              : isWarn
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}>
                          {isCrit ? (
                            <>
                              <AlertTriangle size={10} /> Kritis
                            </>
                          ) : isWarn ? (
                            <>
                              <AlertTriangle size={10} /> Perhatian
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={10} /> Normal
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Modal & Pagination */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan <strong>{paginatedRows.length}</strong> dari{" "}
            <strong>{filteredRows.length}</strong> log riwayat
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
              Sebelumnya
            </button>
            <span className="px-2 font-semibold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
