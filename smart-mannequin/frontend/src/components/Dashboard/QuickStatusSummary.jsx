import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Cpu,
  CheckCircle2,
  WifiOff,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Radio,
  RefreshCw,
  Activity,
  ShieldCheck,
} from "lucide-react";

export default function QuickStatusSummary({
  mannequinId = 1,
  totalSensors = 9,
  activeSensors = 9,
  offlineSensors = 0,
  warningSensors = 0,
  criticalSensors = 0,
  lastUpdated = null,
  onRefresh = null,
}) {
  const { t } = useTranslation();
  const [timeAgo, setTimeAgo] = useState(t("dashboard.justNow", "Baru saja"));

  // Format timestamp ke WIB
  const formatTimestamp = (date) => {
    if (!date) return "--:--:-- WIB";
    const d = new Date(date);
    const hrs = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    const secs = String(d.getSeconds()).padStart(2, "0");
    return `${hrs}:${mins}:${secs} WIB`;
  };

  // Update relative time ("x detik lalu" / "x seconds ago")
  useEffect(() => {
    if (!lastUpdated) return;

    const updateRelative = () => {
      const now = new Date();
      const diffSec = Math.floor((now - new Date(lastUpdated)) / 1000);
      if (diffSec < 2) {
        setTimeAgo(t("dashboard.justNow", "Baru saja"));
      } else if (diffSec < 60) {
        setTimeAgo(`${diffSec} ${t("dashboard.secondsAgo", "detik lalu")}`);
      } else {
        const mins = Math.floor(diffSec / 60);
        setTimeAgo(`${mins} ${t("dashboard.minutesAgo", "menit lalu")}`);
      }
    };

    updateRelative();
    const interval = setInterval(updateRelative, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated, t]);

  // Tentukan status manekin secara keseluruhan
  const getMannequinStatus = () => {
    if (criticalSensors > 0) {
      return {
        label: t("dashboard.criticalStatus", "Kritis / Bahaya"),
        color: "bg-rose-500/10 text-rose-600 border-rose-500/30",
        dotColor: "bg-rose-500",
        pulse: true,
      };
    }
    if (warningSensors > 0) {
      return {
        label: t("dashboard.warningStatus", "Perhatian / Warning"),
        color: "bg-amber-500/10 text-amber-600 border-amber-500/30",
        dotColor: "bg-amber-500",
        pulse: true,
      };
    }
    if (offlineSensors === totalSensors) {
      return {
        label: t("dashboard.offlineStatus", "Offline / Terputus"),
        color: "bg-slate-500/10 text-slate-600 border-slate-500/30",
        dotColor: "bg-slate-500",
        pulse: false,
      };
    }
    return {
      label: t("dashboard.normalOperational", "Normal & Operasional"),
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
      dotColor: "bg-[#00ba88]",
      pulse: true,
    };
  };

  const mannequinStatus = getMannequinStatus();

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Baris Status Sistem & Waktu Update Terakhir */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col gap-3.5">
        {/* Baris Atas: Identitas Manekin di Kiri & (Status Sistem + Update Terakhir Sejajar di Kanan) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Identitas Manekin */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
              #{mannequinId}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-slate-800 text-sm sm:text-base">
                  {t("Mannequin", "Manekin")} #{mannequinId}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  (Anthropometric Test Unit)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {t("dashboard.testingCabinet", "Kabinet Uji Kenyamanan & Ergonomi Penumpang")}
              </p>
            </div>
          </div>

          {/* Status Sistem & Waktu Update Terakhir (Sejajar di Atas Card) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Sistem */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs shrink-0">
              <Radio className="w-3.5 h-3.5 text-[#00ba88]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-semibold uppercase leading-none">
                  {t("dashboard.systemStatus", "Status Sistem")}
                </span>
                <span className="text-xs font-bold text-slate-700 leading-tight">
                  {t("dashboard.loraActive", "LoRa & WebSocket Aktif")}
                </span>
              </div>
            </div>

            {/* Waktu Update Terakhir */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs shrink-0">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-semibold uppercase leading-none">
                  {t("common.lastUpdated", "Update Terakhir")}
                </span>
                <div className="flex items-center gap-1.5 leading-tight">
                  <span className="font-mono font-bold text-slate-800">
                    {formatTimestamp(lastUpdated)}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    ({timeAgo})
                  </span>
                </div>
              </div>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="ml-1 p-1 hover:bg-slate-200 rounded-lg transition text-slate-500 cursor-pointer"
                  title="Refresh Telemetri">
                  <RefreshCw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Baris Bawah: Status Manekin Badge */}
        <div className="flex items-center gap-2 pl-0.5">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${mannequinStatus.color}`}>
            <span
              className={`w-2 h-2 rounded-full ${mannequinStatus.dotColor} ${
                mannequinStatus.pulse ? "animate-ping" : ""
              }`}
            />
            <span>{mannequinStatus.label}</span>
          </div>
        </div>
      </div>

      {/* Grid 5 Kartu KPI Sensor */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Total Sensor */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {t("dashboard.totalSensors", "Total Sensor")}
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {totalSensors}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
              {t("dashboard.telemetryPoints", "Titik telemetri")}
            </div>
          </div>
        </div>

        {/* 2. Sensor Aktif */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-[#00ba88]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {t("dashboard.activeSensors", "Sensor Aktif")}
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#00ba88] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black text-[#00ba88] font-mono">
              {activeSensors}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
              {totalSensors > 0
                ? `${Math.round((activeSensors / totalSensors) * 100)}% online`
                : "Online"}
            </div>
          </div>
        </div>

        {/* 3. Sensor Offline */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {t("dashboard.offlineSensors", "Sensor Offline")}
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                offlineSensors > 0
                  ? "bg-slate-200 text-slate-700 font-bold"
                  : "bg-slate-50 text-slate-400"
              }`}>
              <WifiOff className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div
              className={`text-2xl font-black font-mono ${
                offlineSensors > 0 ? "text-slate-800" : "text-slate-400"
              }`}>
              {offlineSensors}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
              {offlineSensors > 0 ? t("dashboard.disconnected", "Terputus") : t("dashboard.optimal", "Semua terhubung")}
            </div>
          </div>
        </div>

        {/* 4. Status Warning */}
        <div
          className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between ${
            warningSensors > 0
              ? "border-amber-300 bg-amber-50/20 shadow-[0_2px_12px_rgba(245,158,11,0.1)]"
              : "border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
          }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {t("dashboard.warningSensors", "Status Warning")}
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                warningSensors > 0
                  ? "bg-amber-100 text-amber-600"
                  : "bg-slate-50 text-slate-400"
              }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div
              className={`text-2xl font-black font-mono ${
                warningSensors > 0 ? "text-amber-500" : "text-slate-400"
              }`}>
              {warningSensors}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
              {warningSensors > 0 ? t("dashboard.needsAttention", "Mendekati batas") : "Normal"}
            </div>
          </div>
        </div>

        {/* 5. Status Critical */}
        <div
          className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between col-span-2 sm:col-span-1 ${
            criticalSensors > 0
              ? "border-rose-300 bg-rose-50/20 shadow-[0_2px_12px_rgba(244,63,94,0.12)]"
              : "border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
          }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {t("dashboard.criticalSensors", "Status Critical")}
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                criticalSensors > 0
                  ? "bg-rose-100 text-rose-600"
                  : "bg-slate-50 text-slate-400"
              }`}>
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div
              className={`text-2xl font-black font-mono ${
                criticalSensors > 0 ? "text-rose-600 animate-pulse" : "text-slate-400"
              }`}>
              {criticalSensors}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
              {criticalSensors > 0 ? t("dashboard.emergencyState", "Bahaya terdeteksi") : t("dashboard.optimal", "Kondisi terkendali")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
