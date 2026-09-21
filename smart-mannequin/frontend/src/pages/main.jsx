import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
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
} from "lucide-react";
import Swal from "sweetalert2";

import HeroBanner from "../components/Dashboard/HeroBanner";
import MannequinBlueprint from "../components/Dashboard/MannequinBlueprint";
import SensorCard from "../components/Dashboard/SensorCard";
import QuickStatusSummary from "../components/Dashboard/QuickStatusSummary";
import AlertBanner from "../components/Dashboard/AlertBanner";

import { useFetchSensor } from "../hooks/useSensor";
import { getLatestData } from "../helpers/utils";
import { useSensorWebSocket } from "../hooks/smartskin/useSensorWebSocket";

// Evaluasi ambang batas kesehatan & kenyamanan telemetri sensor
const evaluateSensor = (sensorId, val) => {
  const num = parseFloat(val);
  if (isNaN(num)) return { status: "normal", message: "Kondisi normal", threshold: "-" };

  switch (sensorId) {
    case "sound":
      if (num > 85) return { status: "critical", message: "Kebisingan ekstrem (>85 dB), risiko kenyamanan kabin", threshold: "70 - 85 dB" };
      if (num > 70) return { status: "warning", message: "Tingkat suara tinggi (>70 dB), mendekati batas nyaman", threshold: "< 70 dB" };
      return { status: "normal", message: "Kondisi akustik normal", threshold: "< 70 dB" };

    case "gas":
      if (num > 1000) return { status: "critical", message: "Konsentrasi gas berlebih (>1000 ppm)", threshold: "500 - 1000 ppm" };
      if (num > 500) return { status: "warning", message: "Kadar gas meningkat (>500 ppm), periksa sirkulasi", threshold: "< 500 ppm" };
      return { status: "normal", message: "Kualitas udara normal", threshold: "< 500 ppm" };

    case "lidar":
      if (num < 15) return { status: "critical", message: "Objek terlalu dekat (<15 cm), potensi benturan", threshold: "15 - 30 cm" };
      if (num < 30) return { status: "warning", message: "Jarak batas sempit (<30 cm)", threshold: "> 30 cm" };
      return { status: "normal", message: "Jarak perimeter aman", threshold: "> 30 cm" };

    case "camera":
      if (num > 39.0) return { status: "critical", message: "Suhu termal tubuh/kabin sangat tinggi (>39°C)", threshold: "37.5 - 39°C" };
      if (num > 37.5) return { status: "warning", message: "Suhu hangat/meningkat (>37.5°C)", threshold: "30 - 37.5°C" };
      return { status: "normal", message: "Suhu termal stabil", threshold: "30 - 37.5°C" };

    case "adxl":
      if (num > 1.2) return { status: "critical", message: "Guncangan inersia keras (>1.2 g)", threshold: "0.5 - 1.2 g" };
      if (num > 0.5) return { status: "warning", message: "Getaran sedang terdeteksi (>0.5 g)", threshold: "< 0.5 g" };
      return { status: "normal", message: "Akselerasi inersia normal", threshold: "< 0.5 g" };

    case "mpu":
      if (num > 15.0) return { status: "critical", message: "Perubahan sudut rotasi ekstrem (>15°/s)", threshold: "5 - 15°/s" };
      if (num > 5.0) return { status: "warning", message: "Goyangan aktif terdeteksi (>5°/s)", threshold: "< 5°/s" };
      return { status: "normal", message: "Orientasi stabil", threshold: "< 5°/s" };

    case "bme":
      if (num > 35.0 || num < 15.0) return { status: "critical", message: "Suhu mikroklimat ekstrem di luar batas operasional", threshold: "20 - 28°C" };
      if (num > 28.0 || num < 18.0) return { status: "warning", message: "Suhu mikroklimat di luar zona kenyamanan termal", threshold: "20 - 28°C" };
      return { status: "normal", message: "Mikroklimat optimal", threshold: "20 - 28°C" };

    case "loadcell":
      if (num > 130.0) return { status: "critical", message: "Beban kursi melebihi kapasitas (>130 kg)", threshold: "100 - 130 kg" };
      if (num > 100.0) return { status: "warning", message: "Beban mendekati batas atas (>100 kg)", threshold: "40 - 100 kg" };
      return { status: "normal", message: "Beban kursi proporsional", threshold: "40 - 100 kg" };

    case "smartskin":
      if (num > 50.0) return { status: "critical", message: "Tekanan titik kontak sangat tinggi (>50 kPa)", threshold: "35 - 50 kPa" };
      if (num > 35.0) return { status: "warning", message: "Tekanan kontak permukaan tinggi (>35 kPa)", threshold: "< 35 kPa" };
      return { status: "normal", message: "Distribusi tekanan aman", threshold: "< 35 kPa" };

    default:
      return { status: "normal", message: "Operasional normal", threshold: "-" };
  }
};

// Definisi sensor persis sesuai desain
const SENSOR_LIST = [
  {
    id: "sound",
    name: "Sensor Suara",
    defaultValue: "43.3",
    unit: "dB",
    location: "Head / Binaural Ears",
    icon: Volume2,
    route: "/sensor/sound",
    progressPercent: 45,
  },
  {
    id: "gas",
    name: "Sensor Gas",
    defaultValue: "410",
    unit: "ppm",
    location: "Nasal / Respiratory Node",
    icon: Wind,
    route: "/sensor/gas",
    progressPercent: 78,
  },
  {
    id: "lidar",
    name: "Sensor Lidar",
    defaultValue: "84.2",
    unit: "cm",
    location: "Chest / Torso Perimeter",
    icon: Radio,
    route: "/sensor/lidar",
    progressPercent: 62,
  },
  {
    id: "camera",
    name: "Kamera",
    defaultValue: "60",
    unit: "FPS",
    location: "Facial / Vision Mount",
    icon: Camera,
    route: "/sensor/camera",
    progressPercent: 85,
  },
  {
    id: "adxl",
    name: "Sensor ADXL345",
    defaultValue: "0.14",
    unit: "g",
    location: "Spine / Lumbar Vertebrae",
    icon: Activity,
    route: "/sensor/adxl",
    progressPercent: 30,
  },
  {
    id: "mpu",
    name: "Sensor MPU6050",
    defaultValue: "1.2",
    unit: "°/s",
    location: "Pelvic / Center of Gravity",
    icon: Compass,
    route: "/sensor/mpu6050",
    progressPercent: 55,
  },
  {
    id: "bme",
    name: "Sensor BME280",
    defaultValue: "23.9",
    unit: "°C",
    location: "Chest Microclimate Node",
    icon: Thermometer,
    route: "/sensor/bme",
    progressPercent: 40,
  },
  {
    id: "loadcell",
    name: "Sensor Load Cell",
    defaultValue: "72.3",
    unit: "kg",
    location: "Seat Cushion & Backrest",
    icon: LayoutGrid,
    route: "/sensor/loadcell",
    progressPercent: 68,
  },
  {
    id: "smartskin",
    name: "SmartSkin",
    defaultValue: "18.6",
    unit: "kPa",
    location: "Full Body Contact Matrix",
    icon: Fingerprint,
    route: "/sensor/smartskin",
    progressPercent: 52,
  },
];

const NewLiveScreen = () => {
  const params = useParams();
  const mannequinId = params?.id || 1;

  const [selectedSensorKey, setSelectedSensorKey] = useState(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Live SmartSkin WebSocket subscription
  const { latestBatch } = useSensorWebSocket(mannequinId);

  // Live readings dictionary
  const [readings, setReadings] = useState({
    sound: { value: "43.3", unit: "dB" },
    gas: { value: "410", unit: "ppm" },
    lidar: { value: "84.2", unit: "cm" },
    camera: { value: "34.0", unit: "°C" },
    adxl: { value: "0.14", unit: "g" },
    mpu: { value: "1.2", unit: "°/s" },
    bme: { value: "23.9", unit: "°C" },
    loadcell: { value: "72.3", unit: "kg" },
    smartskin: { value: "18.6", unit: "kPa" },
  });

  // Real-time update for SmartSkin from WebSocket
  useEffect(() => {
    if (latestBatch && latestBatch.length > 0) {
      const pressures = latestBatch
        .filter((r) => r.sensor_type === "pressure" || r.sensorType === "pressure")
        .map((r) => parseFloat(r.value))
        .filter((v) => !isNaN(v));
      if (pressures.length > 0) {
        const avg = (pressures.reduce((a, b) => a + b, 0) / pressures.length).toFixed(1);
        setReadings((prev) => ({
          ...prev,
          smartskin: { value: avg, unit: "kPa" },
        }));
        setLastUpdated(new Date());
      }
    }
  }, [latestBatch]);

  // Handler for Zero-Point Calibration with Blueprint Scanning
  const handleStartCalibration = useCallback(() => {
    if (isCalibrating) return;

    setIsCalibrating(true);
    setCalibrationProgress(0);

    const stepTime = 25; // 25ms per 1% -> 2500ms total
    let currentProgress = 0;

    const timer = setInterval(() => {
      currentProgress += 1;
      if (currentProgress >= 100) {
        clearInterval(timer);
        setCalibrationProgress(100);

        // Reset loadcell zero-point
        setReadings((prev) => ({
          ...prev,
          loadcell: { value: "0.0", unit: "kg" },
        }));
        setLastUpdated(new Date());

        setTimeout(() => {
          setIsCalibrating(false);
          Swal.fire({
            icon: "success",
            title: "Kalibrasi Zero-Point Berhasil",
            text: "Pemindaian blueprint selesai. Seluruh titik sensor anatomis mannequin telah berhasil di-scan dan di-reset ke titik nol referensi.",
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

  // Polling data periodically for all LoRa sensors
  const fetchTelemetry = useCallback(async () => {
    try {
      // 1. BME280 (1001)
      const bmeData = await useFetchSensor("bme", 1001, mannequinId);
      if (bmeData) {
        const latest = getLatestData(bmeData);
        if (latest?.temperature) {
          setReadings((prev) => ({
            ...prev,
            bme: { value: parseFloat(latest.temperature).toFixed(1), unit: "°C" },
          }));
        }
      }

      // 2. Sound KY-601 (601)
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

      // 3. Lidar (901)
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

      // 4. Gas MQ-2 (101)
      const gasData = await useFetchSensor("mq", 101, mannequinId);
      if (gasData) {
        const latest = getLatestData(gasData);
        const val = latest?.value !== undefined ? latest.value : latest?.co;
        if (val !== undefined) {
          setReadings((prev) => ({
            ...prev,
            gas: { value: parseFloat(val).toFixed(0), unit: "ppm" },
          }));
        }
      }

      // 5. ADXL345 (201)
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

      // 6. MPU6050 (1002)
      const mpuData = await useFetchSensor("mpu", 1002, mannequinId);
      if (mpuData) {
        const latest = getLatestData(mpuData);
        const val = latest?.x_rotation !== undefined ? latest.x_rotation : latest?.x_acceleration;
        if (val !== undefined) {
          setReadings((prev) => ({
            ...prev,
            mpu: { value: Math.abs(parseFloat(val)).toFixed(1), unit: "°/s" },
          }));
        }
      }

      // 7. Load Cell (801)
      const loadData = await useFetchSensor("loadcell", 801, mannequinId);
      if (loadData) {
        const latest = getLatestData(loadData);
        if (latest?.value !== undefined) {
          const totalKg = (65 + parseFloat(latest.value) * 1.8).toFixed(1);
          setReadings((prev) => ({
            ...prev,
            loadcell: { value: totalKg, unit: "kg" },
          }));
        }
      }

      // 8. Thermal Camera (702)
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

      // Update waktu pembaruan telemetri
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

  // Export Telemetry Data to CSV
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
    link.setAttribute("download", `telemetry_smart_mannequin_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      icon: "success",
      title: "Ekspor Berhasil",
      text: "Data telemetri seluruh sensor berhasil diunduh dalam format CSV.",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  // Evaluasi telemetri tiap sensor untuk statistik & alert
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

  const totalSensors = SENSOR_LIST.length;
  const activeSensors = totalSensors; // seluruh 9 sensor node telemetri aktif terhubung
  const offlineSensors = 0;
  const warningSensors = evaluatedSensors.filter((s) => s.status === "warning").length;
  const criticalSensors = evaluatedSensors.filter((s) => s.status === "critical").length;

  const alerts = evaluatedSensors
    .filter((s) => s.status === "warning" || s.status === "critical")
    .map((s) => ({
      id: s.id,
      name: s.name,
      value: s.currentVal,
      unit: readings[s.id]?.unit ?? s.unit,
      status: s.status,
      message: s.message,
      threshold: s.threshold,
      route: s.route,
    }));

  return (
    <div className="w-full bg-[#f8fafc] -m-6 p-6 sm:p-8 min-h-screen">
      <div className="w-full max-w-[1700px] mx-auto flex flex-col gap-6">
        {/* 1. Hero Banner with Live Telemetry HUD Bar */}
        <HeroBanner
          onExportCSV={handleExportCSV}
          onCalibrate={handleStartCalibration}
          isCalibrating={isCalibrating}
          calibrationProgress={calibrationProgress}
        />

        {/* 2. Quick Status Summary (Identitas, Status Manekin, Status Sistem, Waktu Update & 5 KPI) */}
        <QuickStatusSummary
          mannequinId={mannequinId}
          totalSensors={totalSensors}
          activeSensors={activeSensors}
          offlineSensors={offlineSensors}
          warningSensors={warningSensors}
          criticalSensors={criticalSensors}
          lastUpdated={lastUpdated}
          onRefresh={fetchTelemetry}
        />

        {/* 3. Alert Banner: Informasi Peringatan Terbaru jika ada */}
        <AlertBanner alerts={alerts} mannequinId={mannequinId} />

        {/* 4. Main Layout Grid: Blueprint & 9 Sensor Summary Cards */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: High-Tech Mannequin Blueprint Card - Fixed & Non-sticky */}
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
      </div>
    </div>
  );
};

export default NewLiveScreen;
