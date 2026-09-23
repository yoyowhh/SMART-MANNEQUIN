import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../service/config';
import { Download, RefreshCw, X, FileSpreadsheet } from 'lucide-react';
import LogsModalPortal from '../Elements/Modal/LogsModalPortal';

const SENSOR_TYPES = [
  { value: 'all', label: 'Semua Tipe' },
  { value: 'temperature', label: 'Suhu (MCP9808) - °C' },
  { value: 'pressure', label: 'Tekanan (FSR) - N' },
  { value: 'vibration', label: 'Getaran (Piezo) - V' },
  { value: 'flex', label: 'Flex / Strain - Ω' },
];

const LOCATIONS = [
  { value: 'all', label: 'Semua Lokasi' },
  { value: 'back', label: 'Punggung (Back)' },
  { value: 'right arm', label: 'Lengan Kanan' },
  { value: 'left arm', label: 'Lengan Kiri' },
  { value: 'right leg', label: 'Kaki Kanan' },
  { value: 'left leg', label: 'Kaki Kiri' },
  { value: 'right shoulder', label: 'Bahu Kanan' },
  { value: 'left shoulder', label: 'Bahu Kiri' },
  { value: 'right elbow', label: 'Siku Kanan' },
  { value: 'left elbow', label: 'Siku Kiri' },
  { value: 'right waist', label: 'Pinggang Kanan' },
  { value: 'left waist', label: 'Pinggang Kiri' },
  { value: 'right knee', label: 'Lutut Kanan' },
  { value: 'left knee', label: 'Lutut Kiri' },
];

export default function SmartskinLogsModal({ isOpen, onClose, mannequinId = 1 }) {
  const [readings, setReadings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sensorType, setSensorType] = useState('all');
  const [location, setLocation] = useState('all');

  const fetchLogs = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const query = new URLSearchParams({
        mannequin_id: String(mannequinId),
        page: String(page),
        limit: '15',
      });
      if (sensorType !== 'all') query.append('sensorType', sensorType);
      if (location !== 'all') query.append('location', location);

      const res = await fetch(`${API_BASE_URL}/sensor-reading/paginated?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setReadings(json.data || []);
        setTotal(json.total || 0);
        setTotalPages(json.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching sensor logs:', err);
    } finally {
      setLoading(false);
    }
  }, [isOpen, mannequinId, page, sensorType, location]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportCsv = () => {
    const query = new URLSearchParams({
      mannequin_id: String(mannequinId),
    });
    if (sensorType !== 'all') query.append('sensorType', sensorType);
    if (location !== 'all') query.append('location', location);

    window.open(`${API_BASE_URL}/sensor-reading/export?${query.toString()}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <LogsModalPortal isOpen={isOpen} onClose={onClose}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Log Riwayat Sensor Smart Skin</h3>
              <p className="text-xs text-slate-500">
                Data histori rekaman sensor dari MySQL (Total: {total.toLocaleString()} data)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sensorType}
              onChange={(e) => {
                setSensorType(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {SENSOR_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <select
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {LOCATIONS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>

            <button
              onClick={fetchLogs}
              disabled={loading}
              className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6">
          {loading && readings.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
              Memuat data log...
            </div>
          ) : readings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <p className="text-sm">Belum ada rekaman log untuk filter ini.</p>
              <p className="text-xs text-slate-400">
                Jalankan generator simulasi data (simulate:smartskin) untuk mengisi data.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Tipe Sensor</th>
                    <th className="py-3 px-4">Lokasi Tubuh</th>
                    <th className="py-3 px-4">Titik</th>
                    <th className="py-3 px-4 text-right">Nilai Bacaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {readings.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(r.timestamp).toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-4 font-semibold capitalize text-emerald-700">
                        {r.sensorType}
                      </td>
                      <td className="py-2.5 px-4 capitalize font-medium">{r.location}</td>
                      <td className="py-2.5 px-4 text-slate-500">Titik #{r.sensorNumber}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800">
                        {Number(r.value).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Pagination */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
          <div>
            Halaman <span className="font-bold text-slate-800">{page}</span> dari{' '}
            <span className="font-bold text-slate-800">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors font-medium"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors font-medium"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </LogsModalPortal>
  );
}
