import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function SensorPageHeader({
  title,
  subtitle,
  sensorTag,
  tag,
  location,
  mannequinId = 1,
  children,
}) {
  const navigate = useNavigate();
  const displayTag = sensorTag || tag;

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/${mannequinId}`)}
          className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-[#00ba88]/10 hover:text-[#00ba88] border border-slate-200/80 text-slate-700 flex items-center justify-center transition-all shadow-xs shrink-0"
          title="Kembali ke Dashboard">
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              {title}
            </h1>
            {displayTag && (
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#00ba88]/10 text-[#00ba88] uppercase tracking-wider">
                {displayTag}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            {location ? `Lokasi Anatomis: ${location}` : subtitle} • Manekin #{mannequinId}
          </p>
        </div>
      </div>

      {children && (
        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          {children}
        </div>
      )}
    </div>
  );
}
