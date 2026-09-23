import React from "react";
import { useTranslation } from "react-i18next";
import { Sliders, Download } from "lucide-react";
import Swal from "sweetalert2";

export default function HeroBanner({
  showActions = false,
  onExportCSV,
  onCalibrate,
  isCalibrating = false,
  calibrationProgress = 0,
}) {
  const { t } = useTranslation();

  const handleCalibrate = () => {
    if (onCalibrate) {
      onCalibrate();
      return;
    }
    Swal.fire({
      icon: "success",
      title: t("mannequinPage.calibrationSuccess", "Kalibrasi Zero-Point Berhasil"),
      text: t("mannequinPage.calibrationDesc", "Seluruh sensor dan load cell telah di-reset ke titik nol referensi."),
      timer: 2200,
      showConfirmButton: false,
      background: "#ffffff",
      customClass: {
        popup: "rounded-2xl shadow-xl",
      },
    });
  };

  return (
    <div className="w-full rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white p-6 sm:p-7 shadow-xl border border-emerald-600/30 relative overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-teal-400/20 blur-2xl pointer-events-none" />

      {/* Hero Main Row */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {t("dashboard.welcomeAdmin", "Selamat Datang Admin STAS")}
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 mt-2 leading-relaxed font-medium">
            {t("dashboard.heroSubtitle", "Anthropometric smart mannequin for passenger comfort and safety studies.")}
          </p>
        </div>

        {showActions && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Kalibrasi Zero-Point */}
            <button
              onClick={handleCalibrate}
              disabled={isCalibrating}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
              <Sliders className={`w-4 h-4 text-[#00ba88] ${isCalibrating ? "animate-spin" : ""}`} />
              <span>
                {isCalibrating
                  ? `${t("mannequinPage.calibrating", "Memindai Blueprint")} (${calibrationProgress}%)...`
                  : t("mannequinPage.calibrate", "Kalibrasi Zero-Point")}
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
        )}
      </div>
    </div>
  );
}
