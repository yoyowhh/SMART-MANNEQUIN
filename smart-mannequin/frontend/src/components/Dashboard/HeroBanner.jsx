import React from "react";
import { Sliders, Download } from "lucide-react";
import Swal from "sweetalert2";

export default function HeroBanner({
  onExportCSV,
  onCalibrate,
  isCalibrating = false,
  calibrationProgress = 0,
}) {
  const handleCalibrate = () => {
    if (onCalibrate) {
      onCalibrate();
      return;
    }
    Swal.fire({
      icon: "success",
      title: "Kalibrasi Zero-Point Berhasil",
      text: "Seluruh sensor dan load cell telah di-reset ke titik nol referensi.",
      timer: 2200,
      showConfirmButton: false,
      background: "#ffffff",
      customClass: {
        popup: "rounded-2xl shadow-xl",
      },
    });
  };

  return (
    <div className="w-full rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Hero Main Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Selamat Datang Admin STAS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
            Anthropometric smart mannequin for passenger comfort and safety studies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Kalibrasi Zero-Point */}
          <button
            onClick={handleCalibrate}
            disabled={isCalibrating}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
            <Sliders className={`w-4 h-4 text-[#00ba88] ${isCalibrating ? "animate-spin" : ""}`} />
            <span>
              {isCalibrating
                ? `Memindai Blueprint (${calibrationProgress}%)...`
                : "Kalibrasi Zero-Point"}
            </span>
          </button>

          {/* Ekspor Data CSV */}
          <button
            onClick={onExportCSV}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00ba88] hover:bg-[#00a377] text-slate-950 transition-all flex items-center gap-2 shadow-md shadow-[#00ba88]/20 font-sans">
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Ekspor Data (CSV)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
