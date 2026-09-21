import React from "react";

export default function LiveIndicatorBadge({ isLive = true, label = "LIVE TELEMETRY" }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/70 text-[10px] font-mono shrink-0 shadow-2xs">
      <span
        className={`w-2 h-2 rounded-full ${
          isLive ? "bg-[#00ba88] animate-ping" : "bg-slate-300"
        }`}
      />
      <span className={isLive ? "text-[#00ba88] font-extrabold tracking-wider" : "text-slate-400 font-semibold"}>
        {isLive ? label : "OFFLINE"}
      </span>
    </div>
  );
}
