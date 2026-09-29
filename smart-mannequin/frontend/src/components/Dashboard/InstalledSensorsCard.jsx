import React from "react";
import { useNavigate } from "react-router-dom";
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
  MapPin,
  ArrowRight,
  Cpu,
  Layers,
  CheckCircle2,
} from "lucide-react";

export const INSTALLED_SENSORS_CONFIG = [
  {
    id: "sound",
    name: "Sensor Suara",
    model: "KY-601 / KY-602",
    tag: "Akustik",
    quantity: "2 Unit",
    quantityNumber: 2,
    location: "Telinga Kiri & Kanan (Binaural Ears)",
    points: ["Telinga Kiri (KY-601)", "Telinga Kanan (KY-602)"],
    icon: Volume2,
    route: "/sensor/sound",
    unit: "dB",
    description: "Mengukur intensitas kebisingan akustik lingkungan kabin",
  },
  {
    id: "gas",
    name: "Sensor Gas",
    model: "MQ-2 / MQ-101",
    tag: "Kualitas Udara",
    quantity: "1 Unit",
    quantityNumber: 1,
    location: "Hidung / Saluran Pernafasan",
    points: ["Saluran Hidung / Udara"],
    icon: Wind,
    route: "/sensor/gas",
    unit: "ppm",
    description: "Mendeteksi konsentrasi gas berbahaya & kualitas udara",
  },
  {
    id: "lidar",
    name: "Sensor Lidar",
    model: "TF-Mini LiDAR (901)",
    tag: "Jarak 3D",
    quantity: "1 Unit",
    quantityNumber: 1,
    location: "Puncak Kepala (Cranial Apex)",
    points: ["Puncak Kepala (Laser ToF)"],
    icon: Radio,
    route: "/sensor/lidar",
    unit: "cm",
    description: "Pemindaian jarak optik laser & perimeter halangan 3D",
  },
  {
    id: "camera",
    name: "Kamera Vision / Termal",
    model: "MLX90640 (702)",
    tag: "Vision & Suhu",
    quantity: "2 Titik",
    quantityNumber: 2,
    location: "Mata Kiri & Mata Kanan",
    points: ["Mata Kiri", "Mata Kanan"],
    icon: Camera,
    route: "/sensor/camera",
    unit: "°C",
    description: "Pemantauan visual spasial & distribusi termal wajah",
  },
  {
    id: "adxl",
    name: "Sensor ADXL345",
    model: "ADXL-201 (3-Axis)",
    tag: "Akselerometer",
    quantity: "2 Unit",
    quantityNumber: 2,
    location: "Bahu Kiri & Bahu Kanan",
    points: ["Bahu Kiri", "Bahu Kanan"],
    icon: Activity,
    route: "/sensor/adxl",
    unit: "g",
    description: "Mendeteksi gaya inersia tubuh & getaran lateral",
  },
  {
    id: "mpu",
    name: "Sensor MPU6050",
    model: "MPU-6050 (1002)",
    tag: "Orientasi / IMU",
    quantity: "1 Unit",
    quantityNumber: 1,
    location: "Dada Atas (Sternum)",
    points: ["Dada Atas / Sternum"],
    icon: Compass,
    route: "/sensor/mpu6050",
    unit: "°/s",
    description: "Mengukur orientasi sudut rotasi kinetik & kemiringan tubuh",
  },
  {
    id: "bme",
    name: "Sensor BME280",
    model: "BME280 (1001)",
    tag: "Mikroklimat",
    quantity: "1 Unit",
    quantityNumber: 1,
    location: "Dada Tengah (Solar Plexus)",
    points: ["Dada Tengah / Solar Plexus"],
    icon: Thermometer,
    route: "/sensor/bme",
    unit: "°C",
    description: "Mengukur suhu mikroklimat, kelembaban, dan tekanan udara",
  },
  {
    id: "loadcell",
    name: "Sensor Load Cell",
    model: "Strain Gauge 50kg (801)",
    tag: "Beban Tekanan",
    quantity: "5 Titik",
    quantityNumber: 5,
    location: "5 Titik: Leher, Paha & Tulang Kering",
    points: [
      "Leher (1 Titik)",
      "Paha Kiri & Kanan (2 Titik)",
      "Tulang Kering Kiri & Kanan (2 Titik)",
    ],
    icon: LayoutGrid,
    route: "/sensor/loadcell",
    unit: "kg",
    description: "Mengukur distribusi beban tekanan titik tumpu tubuh",
  },
  {
    id: "smartskin",
    name: "SmartSkin",
    model: "MCP9808 & Piezoresistive",
    tag: "Multimodal Matrix",
    quantity: "2 Modul (14 Titik Matriks)",
    quantityNumber: 2,
    location: "Dada Pektoral Kiri & Kanan",
    points: ["Pektoral Kiri (7 Titik)", "Pektoral Kanan (7 Titik)"],
    icon: Fingerprint,
    route: "/sensor/smartskin",
    unit: "kPa",
    description: "Matriks multimodal suhu permukaan kulit & tekanan kontak",
  },
];

export default function InstalledSensorsCard({
  sensors = [],
  readings = {},
  mannequinId = 1,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Hitung total unit / titik sensor fisik
  const totalSensorTypes = INSTALLED_SENSORS_CONFIG.length;
  const totalSensorPoints = 17; // 1 Lidar + 2 Kamera + 2 Suara + 1 Gas + 5 Load Cell + 2 ADXL + 1 MPU + 1 BME + 2 SmartSkin

  const getStatusBadge = (status) => {
    switch (status) {
      case "critical":
        return {
          badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
          dotClass: "bg-rose-500",
          label: "Bahaya",
        };
      case "warning":
        return {
          badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
          dotClass: "bg-amber-500",
          label: "Waspada",
        };
      case "offline":
        return {
          badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
          dotClass: "bg-slate-400",
          label: "Offline",
        };
      case "normal":
      default:
        return {
          badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
          dotClass: "bg-[#00ba88]",
          label: "Normal",
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col gap-5">
      {/* Header Kartu: Judul, Deskripsi & Summary Pill */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00ba88] flex items-center justify-center shrink-0 mt-0.5">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">
                {t("dashboard.installedSensorsTitle", "Sensor Terpasang pada Manekin")}
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[11px] font-bold font-mono">
                #{mannequinId}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              {t(
                "dashboard.installedSensorsSubtitle",
                "Daftar instrumen perangkat keras sensor telemetri yang terpasang pada manekin beserta jumlah unit dan lokasi titik anatomi."
              )}
            </p>
          </div>
        </div>

        {/* Quick Badges Summary */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>{totalSensorTypes} Jenis Sensor</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-[#00ba88]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{totalSensorPoints} Titik / Unit Terpasang</span>
          </div>
        </div>
      </div>

      {/* Grid Kartu Sensor Terpasang */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INSTALLED_SENSORS_CONFIG.map((item) => {
          const Icon = item.icon;
          const sensorData = sensors.find((s) => s.id === item.id);
          const currentStatus = sensorData?.status || "normal";
          const reading = readings[item.id];
          const val = reading?.value !== undefined ? reading.value : sensorData?.defaultValue || "-";
          const unit = reading?.unit || item.unit;
          const statusBadge = getStatusBadge(currentStatus);

          return (
            <div
              key={item.id}
              onClick={() => navigate(`/${mannequinId}${item.route}`)}
              className="group cursor-pointer rounded-2xl p-4 sm:p-4.5 bg-slate-50/50 hover:bg-white border border-slate-200/70 hover:border-[#00ba88]/60 transition-all duration-300 hover:shadow-[0_8px_25px_rgba(0,186,136,0.12)] -translate-y-0 hover:-translate-y-1 flex flex-col justify-between">
              <div>
                {/* Baris Atas: Icon + Nama Sensor & BADGE JUMLAH */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 group-hover:border-[#00ba88]/30 group-hover:bg-emerald-50/50 text-[#00ba88] flex items-center justify-center shrink-0 shadow-2xs transition-colors">
                      <Icon className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm group-hover:text-[#00ba88] transition-colors truncate">
                        {item.name}
                      </h4>
                      <span className="text-[10.5px] font-mono text-slate-600 font-semibold block truncate">
                        {item.model}
                      </span>
                    </div>
                  </div>

                  {/* Badge JUMLAH SENSOR - Menonjol dan Jelas */}
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-[#00ba88] text-xs font-black font-mono shrink-0 shadow-2xs">
                    {item.quantity}
                  </span>
                </div>

                {/* Deskripsi Singkat Fungsi */}
                <p className="text-[11.5px] text-slate-500 mt-2.5 leading-snug line-clamp-2">
                  {item.description}
                </p>

                {/* Lokasi Pemasangan di Manekin */}
                <div className="mt-3 flex items-start gap-1.5 text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100">
                  <MapPin className="w-3.5 h-3.5 text-[#00ba88] shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Titik Pemasangan:
                    </span>
                    <span className="font-medium text-slate-700 leading-tight">
                      {item.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Baris Bawah: Telemetri Terkini & Tombol Link */}
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    {val} <span className="text-xs font-semibold text-slate-500">{unit}</span>
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.badgeClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotClass}`} />
                    {statusBadge.label}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-[#00ba88] group-hover:translate-x-0.5 transition-transform">
                  <span>Lihat Detail</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
