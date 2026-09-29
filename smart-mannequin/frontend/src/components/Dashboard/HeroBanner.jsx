import React, { useState, useEffect } from "react";
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

  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("user") || "User";
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setUserName(localStorage.getItem("user") || "User");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 text-white px-6 py-4 sm:py-5 shadow-sm">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-10 w-60 h-60 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

      {/* Hero Main Row */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1 w-full">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
            {t("dashboard.welcomeAdmin", {
              name: userName,
              defaultValue: `Selamat Datang ${userName} di Smart Mannequin`,
            })}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            {t("dashboard.heroSubtitle", "Manekin cerdas antropometrik untuk studi kenyamanan dan keselamatan penumpang.")}
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
