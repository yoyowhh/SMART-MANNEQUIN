import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, AlertOctagon, ShieldCheck, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

export default function AlertBanner({ alerts = [], mannequinId = 1 }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hasCritical = alerts.some((a) => a.status === "critical");
  const hasWarning = alerts.some((a) => a.status === "warning");

  // Jika tidak ada anomali sama sekali
  if (alerts.length === 0) {
    return (
      <div className="w-full bg-emerald-50/70 border border-emerald-200/80 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-emerald-800 shadow-[0_2px_10px_rgba(0,186,136,0.04)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#00ba88]/15 text-[#00ba88] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-xs sm:text-sm text-emerald-900">
              {t("dashboard.conditionNormal", "Kondisi Manekin Normal:")}
            </span>{" "}
            <span className="text-xs text-emerald-700">
              {t("dashboard.conditionNormalDesc", "Seluruh sensor telemetri terhubung dan beroperasi dalam ambang batas aman.")}
            </span>
          </div>
        </div>
        <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00ba88]/20 text-[#008f68] uppercase tracking-wider">
          {t("dashboard.optimal", "Optimal")}
        </span>
      </div>
    );
  }

  // Jika ada peringatan Warning / Critical
  const bannerTheme = hasCritical
    ? {
        bg: "bg-rose-50/90 border-rose-300 shadow-[0_4px_20px_rgba(244,63,94,0.08)]",
        iconBg: "bg-rose-100 text-rose-600",
        badge: "bg-rose-600 text-white",
        textTitle: "text-rose-950",
        textDesc: "text-rose-800",
        icon: AlertOctagon,
        label: t("dashboard.criticalBadge", "KRITIS"),
      }
    : {
        bg: "bg-amber-50/90 border-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.08)]",
        iconBg: "bg-amber-100 text-amber-600",
        badge: "bg-amber-500 text-white",
        textTitle: "text-amber-950",
        textDesc: "text-amber-800",
        icon: AlertTriangle,
        label: t("dashboard.warningBadge", "PERINGATAN"),
      };

  const Icon = bannerTheme.icon;

  return (
    <div className={`w-full rounded-2xl border p-4 transition-all duration-300 ${bannerTheme.bg}`}>
      {/* Header Banner */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${bannerTheme.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-xs sm:text-sm ${bannerTheme.textTitle}`}>
                Informasi Peringatan Telemetri ({alerts.length} Anomali Terdeteksi)
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${bannerTheme.badge}`}>
                {bannerTheme.label}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${bannerTheme.textDesc}`}>
              Terdapat pembacaan sensor pada Manekin #{mannequinId} yang melewati batas parameter aman.
            </p>
          </div>
        </div>

        {/* Toggle Collapse */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-black/5 text-slate-600 transition flex items-center gap-1 text-xs font-semibold">
          <span className="hidden sm:inline">
            {isCollapsed ? "Lihat Detail" : "Sembunyikan"}
          </span>
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Detail Peringatan per Sensor (Collapsible) */}
      {!isCollapsed && (
        <div className="mt-3.5 pt-3 border-t border-black/10 flex flex-col gap-2">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    alert.status === "critical" ? "bg-rose-500 animate-ping" : "bg-amber-500"
                  }`}
                />
                <span className="font-bold text-slate-800">{alert.name}</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-600 font-medium">{alert.message}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="font-mono text-slate-800">
                  Nilai:{" "}
                  <strong
                    className={
                      alert.status === "critical"
                        ? "text-rose-600 font-extrabold"
                        : "text-amber-600 font-bold"
                    }>
                    {alert.value} {alert.unit}
                  </strong>
                </div>
                {alert.threshold && (
                  <span className="text-[11px] text-slate-400">
                    (Batas: {alert.threshold})
                  </span>
                )}
                {alert.route && (
                  <button
                    onClick={() => navigate(`/${mannequinId}${alert.route}`)}
                    className="ml-2 px-2.5 py-1 rounded-lg bg-white shadow-xs border border-slate-200 hover:border-[#00ba88] hover:text-[#00ba88] text-[11px] font-bold text-slate-700 transition flex items-center gap-1 shrink-0">
                    <span>Periksa</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
