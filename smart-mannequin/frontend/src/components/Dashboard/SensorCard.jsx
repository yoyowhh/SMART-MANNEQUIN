import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function SensorCard({
  sensor,
  reading,
  isSelected,
  onHover,
  mannequinId = 1,
  status = "normal",
}) {
  const navigate = useNavigate();
  const Icon = sensor.icon;
  const displayVal = reading?.value !== undefined ? reading.value : sensor.defaultValue;
  const displayUnit = reading?.unit !== undefined ? reading.unit : sensor.unit;
  const progressPercent = sensor.progressPercent || 65;

  const handleCardClick = () => {
    navigate(`/${mannequinId}${sensor.route}`);
  };

  // Konfigurasi tema warna berdasarkan status
  const getStatusConfig = () => {
    switch (status) {
      case "critical":
        return {
          badge: "bg-rose-100 text-rose-700 border-rose-200",
          dot: "bg-rose-500 animate-ping",
          label: "Critical",
          accentColor: "text-rose-600",
          barColor: "bg-rose-500",
          borderHover: "hover:border-rose-400 hover:shadow-[0_12px_30px_rgba(244,63,94,0.14)]",
        };
      case "warning":
        return {
          badge: "bg-amber-100 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
          label: "Warning",
          accentColor: "text-amber-500",
          barColor: "bg-amber-500",
          borderHover: "hover:border-amber-400 hover:shadow-[0_12px_30px_rgba(245,158,11,0.14)]",
        };
      case "offline":
        return {
          badge: "bg-slate-100 text-slate-500 border-slate-200",
          dot: "bg-slate-400",
          label: "Offline",
          accentColor: "text-slate-400",
          barColor: "bg-slate-300",
          borderHover: "hover:border-slate-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]",
        };
      case "normal":
      default:
        return {
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
          dot: "bg-[#00ba88]",
          label: "Normal",
          accentColor: "text-[#00ba88]",
          barColor: "bg-[#00ba88]",
          borderHover: "hover:border-[#00ba88] hover:shadow-[0_12px_30px_rgba(0,186,136,0.14)]",
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => onHover && onHover(sensor.id)}
      className={`group cursor-pointer rounded-2xl p-5 bg-white transition-all duration-300 border flex flex-col justify-between hover:-translate-y-1 ${
        statusConfig.borderHover
      } ${
        isSelected
          ? "border-[#00ba88] ring-2 ring-[#00ba88]/20 shadow-[0_8px_30px_rgba(0,186,136,0.12)]"
          : status === "critical"
          ? "border-rose-300 shadow-[0_4px_20px_rgba(244,63,94,0.06)]"
          : status === "warning"
          ? "border-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.06)]"
          : "border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
      }`}>
      {/* Top row: Icon + Name (left) & Status Pill (right) */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Icon
              className={`w-5 h-5 ${statusConfig.accentColor} group-hover:scale-110 transition-transform`}
            />
            <h4
              className={`font-bold text-slate-800 text-[15px] leading-snug group-hover:${statusConfig.accentColor} transition-colors`}>
              {sensor.name}
            </h4>
          </div>

          {/* Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10.5px] font-bold ${statusConfig.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            <span>{statusConfig.label}</span>
          </div>
        </div>

        {/* Value + Unit */}
        <div className="mt-4 flex items-baseline gap-2 font-mono">
          <span className={`text-3xl font-extrabold tracking-tight ${statusConfig.accentColor}`}>
            {displayVal}
          </span>
          <span className={`text-base font-bold ${statusConfig.accentColor}`}>
            {displayUnit}
          </span>
        </div>

        {/* Indicator Bar */}
        <div className="mt-2.5 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${statusConfig.barColor} rounded-full transition-all duration-500 group-hover:brightness-110`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Bottom row: Subtitle / Anatomical Location (left) & Lihat Detail -> (right) */}
      <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium text-[11px]">
          {sensor.location}
        </span>

        <span
          className={`font-bold ${statusConfig.accentColor} flex items-center gap-1 transition-all text-[11.5px] group-hover:translate-x-0.5`}>
          <span>Lihat Detail</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </span>
      </div>
    </div>
  );
}

