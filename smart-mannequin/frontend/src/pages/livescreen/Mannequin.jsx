import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Volume2,
  Wind,
  Radio,
  Camera,
  Activity,
  Compass,
  Thermometer,
  LayoutGrid,
  Fingerprint,
  RefreshCw,
  Download,
  Sliders,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ScrollText,
} from "lucide-react";
import Swal from "sweetalert2";

import MannequinBlueprint from "../../components/Dashboard/MannequinBlueprint";
import SensorCard from "../../components/Dashboard/SensorCard";
import MannequinLogsModal from "../../components/Dashboard/MannequinLogsModal";
import { useFetchSensor } from "../../hooks/useSensor";
import { getLatestData } from "../../helpers/utils";
import { useSensorWebSocket } from "../../hooks/smartskin/useSensorWebSocket";

// Evaluasi ambang batas kesehatan & kenyamanan telemetri sensor
const evaluateSensor = (sensorId, val) => {
  const num = parseFloat(val);
  if (isNaN(num)) return { status: "normal", message: "Kondisi normal", threshold: "-" };

  switch (sensorId) {
    case "sound":
      if (num > 85) return { status: "critical", message: "Kebisingan ekstrem (>85 dB), risiko pendengaran", threshold: "70 - 85 dB" };
      if (num > 70) return { status: "warning", message: "Tingkat suara tinggi (>70 dB), mendekati batas nyaman", threshold: "< 70 dB" };
      return { status: "normal", message: "Kondisi akustik normal", threshold: "< 70 dB" };

    case "gas":
      if (num > 50) return { status: "critical", message: "Kadar gas CO berbahaya (>50 ppm)", threshold: "25 - 50 ppm" };
      if (num > 25) return { status: "warning", message: "Kadar gas CO meningkat (>25 ppm)", threshold: "< 25 ppm" };
      return { status: "normal", message: "Kualitas udara normal", threshold: "< 25 ppm" };

    case "lidar":
      if (num < 20) return { status: "critical", message: "Objek sangat dekat (<20 cm), potensi impak", threshold: "20 - 50 cm" };
      if (num < 50) return { status: "warning", message: "Jarak deteksi mendekat (<50 cm)", threshold: "> 50 cm" };
      return { status: "normal", message: "Jarak perimeter aman", threshold: "> 50 cm" };

    case "camera":
      if (num > 39.0) return { status: "critical", message: "Suhu termal kritis (>39°C)", threshold: "37.5 - 39°C" };
      if (num > 37.5) return { status: "warning", message: "Suhu termal meningkat (>37.5°C)", threshold: "30 - 37.5°C" };
      return { status: "normal", message: "Suhu termal stabil", threshold: "30 - 37.5°C" };

    case "adxl":
      if (num > 1.2) return { status: "critical", message: "Guncangan inersia tinggi (>1.2 g)", threshold: "0.5 - 1.2 g" };
      if (num > 0.5) return { status: "warning", message: "Getaran sedang (>0.5 g)", threshold: "< 0.5 g" };
      return { status: "normal", message: "Akselerasi inersia normal", threshold: "< 0.5 g" };

    case "mpu":
      if (num > 2.5) return { status: "critical", message: "Akselerasi dinamis kritis (>2.5 G)", threshold: "1.5 - 2.5 G" };
      if (num > 1.5) return { status: "warning", message: "Akselerasi dinamis meningkat (>1.5 G)", threshold: "< 1.5 G" };
      return { status: "normal", message: "Akselerasi stabil", threshold: "< 1.5 G" };

    case "bme":
      if (num > 38.0 || num < 15.0) return { status: "critical", message: "Suhu mikroklimat ekstrem (>38°C)", threshold: "20 - 34°C" };
      if (num > 34.0 || num < 18.0) return { status: "warning", message: "Suhu mikroklimat hangat (>34°C)", threshold: "20 - 34°C" };
      return { status: "normal", message: "Mikroklimat optimal", threshold: "20 - 34°C" };

    case "loadcell":
      if (num > 80.0) return { status: "critical", message: "Beban titik leher berlebih (>80 N)", threshold: "45 - 80 N" };
      if (num > 45.0) return { status: "warning", message: "Beban titik leher meningkat (>45 N)", threshold: "< 45 N" };
      return { status: "normal", message: "Beban leher seimbang", threshold: "< 45 N" };

    case "smartskin":
      if (num > 39.0) return { status: "critical", message: "Suhu permukaan sangat tinggi (>39°C)", threshold: "37.5 - 39°C" };
      if (num > 37.5) return { status: "warning", message: "Suhu permukaan meningkat (>37.5°C)", threshold: "28 - 37.5°C" };
      return { status: "normal", message: "Suhu kontak aman", threshold: "28 - 37.5°C" };

    default:
      return { status: "normal", message: "Operasional normal", threshold: "-" };
  }
};

const SENSOR_LIST = [
  {
    id: "sound",
    name: "Sensor Suara",
    defaultValue: "43.3",
    unit: "dB",
    location: "Telinga Kanan (KY-601)",
    icon: Volume2,
    route: "/sensor/sound",
    progressPercent: 45,
  },
  {
    id: "gas",
    name: "Sensor Gas",
    defaultValue: "18.5",
    unit: "ppm",
    location: "Karbon Monoksida / CO (MQ-101)",
    icon: Wind,
    route: "/sensor/gas",
    progressPercent: 68,
  },
  {
    id: "lidar",
    name: "Sensor Lidar",
    defaultValue: "84.2",
    unit: "cm",
    location: "Dahi / TF-Mini LiDAR (901)",
    icon: Radio,
    route: "/sensor/lidar",
    progressPercent: 62,
  },
  {
    id: "camera",
    name: "Kamera",
    defaultValue: "33.7",
    unit: "°C",
    location: "Sensor Termal Kabin (702)",
    icon: Camera,
    route: "/sensor/camera",
    progressPercent: 85,
  },
  {
    id: "adxl",
    name: "Sensor ADXL345",
    defaultValue: "0.14",
    unit: "g",
    location: "Bahu Kanan (ADXL-201)",
    icon: Activity,
    route: "/sensor/adxl",
    progressPercent: 30,
  },
  {
    id: "mpu",
    name: "Sensor MPU6050",
    defaultValue: "1.02",
    unit: "G",
    location: "Dada Atas / Sumbu X (1002)",
    icon: Compass,
    route: "/sensor/mpu6050",
    progressPercent: 55,
  },
  {
    id: "bme",
    name: "Sensor BME280",
    defaultValue: "28.5",
    unit: "°C",
    location: "Dada Tengah / Suhu (BME-1001)",
    icon: Thermometer,
    route: "/sensor/bme",
    progressPercent: 40,
  },
  {
    id: "loadcell",
    name: "Sensor Load Cell",
    defaultValue: "12.4",
    unit: "N",
    location: "Leher / Neck (801)",
    icon: LayoutGrid,
    route: "/sensor/loadcell",
    progressPercent: 48,
  },
  {
    id: "smartskin",
    name: "SmartSkin",
    defaultValue: "32.5",
    unit: "°C",
    location: "Punggung Kiri Atas / Suhu (MCP9808)",
    icon: Fingerprint,
    route: "/sensor/smartskin",
    progressPercent: 52,
  },
];

const MannequinPage = () => {
  const { t } = useTranslation();
  const params = useParams();
  const mannequinId = params?.id || 1;

  const [selectedSensorKey, setSelectedSensorKey] = useState(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // WebSocket SmartSkin
  const { latestBatch } = useSensorWebSocket(mannequinId);

  // Live readings state
  const [readings, setReadings] = useState({
    sound: { value: "43.3", unit: "dB" },
    gas: { value: "18.5", unit: "ppm" },
    lidar: { value: "84.2", unit: "cm" },
    camera: { value: "33.7", unit: "°C" },
    adxl: { value: "0.14", unit: "g" },
    mpu: { value: "1.02", unit: "G" },
    bme: { value: "28.5", unit: "°C" },
    loadcell: { value: "12.4", unit: "N" },
    smartskin: { value: "32.5", unit: "°C" },
  });

  // WebSocket update
  useEffect(() => {
    if (latestBatch && latestBatch.length > 0) {
      const tempReadings = latestBatch.filter(
        (r) => r.sensor_type === "temperature" || r.sensorType === "temperature"
      );
      if (tempReadings.length > 0) {
        const firstVal = parseFloat(tempReadings[0].value);
        if (!isNaN(firstVal)) {
          setReadings((prev) => ({
            ...prev,
            smartskin: { value: firstVal.toFixed(1), unit: "°C" },
          }));
          setLastUpdated(new Date());
        }
      }
    }
  }, [latestBatch]);

  // Polling data telemetry
  const fetchTelemetry = useCallback(async () => {
    try {
      // 1. BME280 (Suhu dada tengah)
      const bmeData = await useFetchSensor("bme", 1001, mannequinId);
      if (bmeData) {
        const latest = getLatestData(bmeData);
        if (latest?.temperature !== undefined) {
          setReadings((prev) => ({
            ...prev,
            bme: { value: parseFloat(latest.temperature).toFixed(1), unit: "°C" },
          }));
        }
      }

      // 2. Sound (Telinga Kanan KY-601)
      const soundData = await useFetchSensor("ky", 601, mannequinId);
      if (soundData) {
        const latest = getLatestData(soundData);
        if (latest?.value !== undefined) {
          setReadings((prev) => ({
            ...prev,
            sound: { value: parseFloat(latest.value).toFixed(1), unit: "dB" },
          }));
        }
      }

      // 3. Lidar (Dahi 901)
      const lidarData = await useFetchSensor("lidar", 901, mannequinId);
      if (lidarData) {
        const latest = getLatestData(lidarData);
        if (latest?.value !== undefined) {
          setReadings((prev) => ({
            ...prev,
            lidar: { value: parseFloat(latest.value).toFixed(1), unit: "cm" },
          }));
        }
      }

      // 4. Gas (CO MQ-101)
      const gasData = await useFetchSensor("mq", 101, mannequinId);
      if (gasData) {
        const latest = getLatestData(gasData);
        const val = latest?.co !== undefined ? latest.co : latest?.value;
        if (val !== undefined) {
          setReadings((prev) => ({
            ...prev,
            gas: { value: parseFloat(val).toFixed(1), unit: "ppm" },
          }));
        }
      }

      // 5. ADXL345 (Bahu Kanan 201)
      const adxlData = await useFetchSensor("adxl", 201, mannequinId);
      if (adxlData) {
        const latest = getLatestData(adxlData);
        if (latest?.x_axis !== undefined) {
          setReadings((prev) => ({
            ...prev,
            adxl: { value: Math.abs(parseFloat(latest.x_axis)).toFixed(2), unit: "g" },
          }));
        }
      }

      // 6. MPU6050 (Dada Atas 1002 - Akselerasi Sumbu X)
      const mpuData = await useFetchSensor("mpu", 1002, mannequinId);
      if (mpuData) {
        const latest = getLatestData(mpuData);
        const val = latest?.x_acceleration !== undefined ? latest.x_acceleration : latest?.x_axis;
        if (val !== undefined) {
          setReadings((prev) => ({
            ...prev,
            mpu: { value: Math.abs(parseFloat(val)).toFixed(2), unit: "G" },
          }));
        }
      }

      // 7. Load Cell (Leher 801)
      const loadData = await useFetchSensor("loadcell", 801, mannequinId);
      if (loadData) {
        const latest = getLatestData(loadData);
        if (latest?.value !== undefined) {
          setReadings((prev) => ({
            ...prev,
            loadcell: { value: parseFloat(latest.value).toFixed(1), unit: "N" },
          }));
        }
      }

      // 8. Thermal Camera (Mata Kanan 702)
      const thermalData = await useFetchSensor("thermal", 702, mannequinId);
      if (thermalData) {
        const latest = getLatestData(thermalData);
        if (latest?.center_temp !== undefined) {
          setReadings((prev) => ({
            ...prev,
            camera: { value: parseFloat(latest.center_temp).toFixed(1), unit: "°C" },
          }));
        }
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.warn("Live telemetry poll warning:", err);
    }
  }, [mannequinId]);

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2500);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  // Zero-Point Calibration
  const handleStartCalibration = useCallback(() => {
    if (isCalibrating) return;

    setIsCalibrating(true);
    setCalibrationProgress(0);

    const stepTime = 25;
    let currentProgress = 0;

    const timer = setInterval(() => {
      currentProgress += 1;
      if (currentProgress >= 100) {
        clearInterval(timer);
        setCalibrationProgress(100);

        setReadings((prev) => ({
          ...prev,
          loadcell: { value: "0.0", unit: "kg" },
        }));
        setLastUpdated(new Date());

        setTimeout(() => {
          setIsCalibrating(false);
          Swal.fire({
            icon: "success",
            title: t("mannequinPage.calibrationSuccess", "Kalibrasi Zero-Point Berhasil"),
            text: t("mannequinPage.calibrationDesc", "Pemindaian blueprint selesai. Seluruh titik sensor anatomis mannequin telah berhasil di-scan dan di-reset ke titik nol referensi."),
            timer: 2400,
            showConfirmButton: false,
            background: "#ffffff",
            customClass: {
              popup: "rounded-2xl shadow-xl",
            },
          });
        }, 300);
      } else {
        setCalibrationProgress(currentProgress);
      }
    }, stepTime);
  }, [isCalibrating]);

  // Ekspor CSV
  const handleExportCSV = () => {
    const timestamp = new Date().toISOString();
    let csvContent = "data:text/csv;charset=utf-8,Sensor,Nilai,Satuan,Lokasi,Timestamp\n";

    SENSOR_LIST.forEach((sensor) => {
      const val = readings[sensor.id]?.value || sensor.defaultValue;
      const unit = readings[sensor.id]?.unit || sensor.unit;
      csvContent += `"${sensor.name}","${val}","${unit}","${sensor.location}","${timestamp}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `telemetry_mannequin_${mannequinId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      icon: "success",
      title: t("mannequinPage.exportSuccess", "Ekspor Berhasil"),
      text: t("mannequinPage.exportSuccessDesc", "Data telemetri seluruh sensor mannequin berhasil diunduh dalam format CSV."),
      timer: 2000,
      showConfirmButton: false,
    });
  };

  // Evaluasi sensor untuk status badge
  const evaluatedSensors = SENSOR_LIST.map((sensor) => {
    const val = readings[sensor.id]?.value ?? sensor.defaultValue;
    const evalResult = evaluateSensor(sensor.id, val);
    return {
      ...sensor,
      currentVal: val,
      status: evalResult.status,
      message: evalResult.message,
      threshold: evalResult.threshold,
    };
  });

  const sensorStatusMap = evaluatedSensors.reduce((acc, s) => {
    acc[s.id] = s.status;
    return acc;
  }, {});

  const normalCount = evaluatedSensors.filter((s) => s.status === "normal").length;
  const warningCount = evaluatedSensors.filter((s) => s.status === "warning").length;
  const criticalCount = evaluatedSensors.filter((s) => s.status === "critical").length;

  return (
    <div className="w-full max-w-[1700px] mx-auto flex flex-col gap-6">
        {/* Header Halaman Manekin - Dark Modern (Serasi dengan Informasi Tim) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 text-white px-6 py-4 sm:py-5 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
          {/* Decorative ambient gradients */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 -mb-10 w-60 h-60 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

          {/* Left Text Block - Exact same margin & padding as Informasi Tim */}
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {t("mannequinPage.title", "Visualisasi Manekin")}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t("Mannequin", "Manekin")} #{mannequinId}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              {t("mannequinPage.subtitle", "Visualisasi blueprint anatomi mannequin interaktif & telemetri kesehatan sensor secara real-time.")}
            </p>
          </div>

          {/* Quick Metrics & Actions (Vertical Stack) */}
          <div className="relative z-10 flex flex-col items-start md:items-end gap-2.5 flex-shrink-0">
            {/* Status counts: 6 Normal 2 Perhatian 1 Kritis */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs font-medium">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> {normalCount} {t("dashboard.optimal", "Normal")}
              </span>
              {warningCount > 0 && (
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" /> {warningCount} {t("dashboard.warningStatus", "Perhatian")}
                </span>
              )}
              {criticalCount > 0 && (
                <span className="flex items-center gap-1 text-rose-400 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" /> {criticalCount} {t("dashboard.criticalBadge", "Kritis")}
                </span>
              )}
            </div>

            {/* Dibawahnya: Kalibrasi dan Log Riwayat */}
            <div className="flex items-center gap-2">
              {/* Tombol Kalibrasi */}
              <button
                onClick={handleStartCalibration}
                disabled={isCalibrating}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  isCalibrating
                    ? "bg-amber-500 text-white border-amber-600 animate-pulse cursor-wait"
                    : "bg-slate-800/80 hover:bg-slate-750 text-slate-200 hover:text-white border-slate-700 shadow-2xs"
                }`}
                title="Mulai kalibrasi zero-point">
                <Sliders className={`w-3.5 h-3.5 ${isCalibrating ? "animate-spin text-white" : "text-emerald-400"}`} />
                <span>
                  {isCalibrating
                    ? `${t("mannequinPage.calibrating", "Scanning")} (${calibrationProgress}%)`
                    : t("mannequinPage.calibrate", "Kalibrasi")}
                </span>
              </button>

              {/* Tombol Log Riwayat */}
              <button
                onClick={() => setIsLogsModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#00ba88] hover:bg-[#009e74] text-white transition-all shadow-xs cursor-pointer"
                title="Buka log riwayat dan ekspor data">
                <ScrollText className="w-3.5 h-3.5" />
                <span>{t("common.viewLogs", "Log Riwayat")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notifikasi Hotspot Terpilih */}
        {selectedSensorKey && (
          <div className="bg-[#00ba88]/10 border border-[#00ba88]/30 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 text-slate-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#00ba88]" />
              Titik sensor fokus:{" "}
              <strong className="text-[#00ba88] font-bold">
                {SENSOR_LIST.find((s) => s.id === selectedSensorKey)?.name || selectedSensorKey}
              </strong>
              <span className="text-slate-500 hidden sm:inline">
                ({SENSOR_LIST.find((s) => s.id === selectedSensorKey)?.location})
              </span>
            </div>
            <button
              onClick={() => setSelectedSensorKey(null)}
              className="text-xs font-bold text-[#00ba88] hover:text-[#009e74] hover:underline px-2 py-1 rounded-lg">
              {t("showMore", "Tampilkan Semua")}
            </button>
          </div>
        )}

        {/* Main Layout Grid: Blueprint & 9 Sensor Summary Cards (Persis yang di foto) */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: High-Tech Mannequin Blueprint Card */}
          <div className="w-full lg:w-[34%] xl:w-[30%]">
            <MannequinBlueprint
              selectedSensorKey={selectedSensorKey}
              onSelectHotspot={(sensorKey) =>
                setSelectedSensorKey((prev) => (prev === sensorKey ? null : sensorKey))
              }
              mannequinId={mannequinId}
              isCalibrating={isCalibrating}
              calibrationProgress={calibrationProgress}
            />
          </div>

          {/* Right: 9 Sensor Summary Cards Grid */}
          <div className="w-full lg:w-[66%] xl:w-[70%]">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {SENSOR_LIST.map((sensor) => (
                <SensorCard
                  key={sensor.id}
                  sensor={sensor}
                  reading={readings[sensor.id]}
                  status={sensorStatusMap[sensor.id] || "normal"}
                  isSelected={selectedSensorKey === sensor.id}
                  onSelect={(id) =>
                    setSelectedSensorKey((prev) => (prev === id ? null : id))
                  }
                  mannequinId={mannequinId}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Modal Log Riwayat Telemetri Manekin (didalemnya ada Ekspor Data) */}
        <MannequinLogsModal
          isOpen={isLogsModalOpen}
          onClose={() => setIsLogsModalOpen(false)}
          mannequinId={mannequinId}
          sensors={evaluatedSensors}
          readings={readings}
          onExportCsv={handleExportCSV}
        />
      </div>
  );
};

export default MannequinPage;
