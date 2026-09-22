import React from "react";
import BaseCard from "../Elements/Card";
import { Info } from "lucide-react";

export default function SensorInfoCard({
  title = "Informasi Sensor",
  sensorCode = "",
  imageSrc = "",
  imageAlt = "",
  imageSlot = null,
  description = "",
  action = null,
  children = null,
  className = "",
}) {
  return (
    <div className={`col-span-full ${className}`}>
      <BaseCard mobileHeight="auto" height="auto" className="!h-auto">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <Info className="w-5 h-5 text-[#00ba88] shrink-0" strokeWidth={2.2} />
              <div>
                <h4 className="font-bold text-slate-800 text-base">
                  {title}
                </h4>
                <p className="text-xs text-slate-400">
                  Spesifikasi & Penempatan Anatomis Mannequin
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {action}
              {sensorCode && (
                <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                  {sensorCode}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-1">
            {(imageSlot || imageSrc) && (
              <div className="shrink-0 flex items-center justify-center">
                {imageSlot ? (
                  imageSlot
                ) : (
                  <img
                    src={imageSrc}
                    alt={imageAlt || "sensor-info"}
                    className="max-h-48 max-w-[260px] w-auto object-contain mix-blend-multiply"
                  />
                )}
              </div>
            )}
            <div className="text-slate-600 text-sm leading-relaxed font-medium flex-1 text-justify">
              {description && <p className="text-justify leading-relaxed">{description}</p>}
              {children}
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  );
}
