import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BaseCard from '../../components/Elements/Card';
import ApexChart from '../../components/Elements/Chart';
import MannequinHotspotSVG from '../../components/SmartSkin/MannequinSVG';
import { useSensorWebSocket } from '../../hooks/smartskin/useSensorWebSocket';
import { createChartOptions } from '../../helpers/utils';
import SmartskinLogsModal from '../../components/SmartSkin/SmartskinLogsModal';
import {
  ArrowLeft,
  Thermometer,
  Gauge,
  Waves,
  ArrowLeftRight,
  Wifi,
  WifiOff,
  Activity,
  Calendar,
  ScrollText,
} from 'lucide-react';

const SECTIONS_14_POINTS = [
  {
    id: 'back',
    title: 'Area Punggung',
    subtitle: '4 Titik Sensor Kontak Tubuh Bagian Belakang Atas',
    tag: '4 Titik Belakang',
    colorTheme: {
      dot: 'bg-[#ff3131]',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      cardActive: 'border-emerald-500 shadow-md ring-2 ring-emerald-500/25 bg-emerald-50/25',
      iconActive: 'bg-emerald-500 text-white shadow-2xs',
      iconDefault: 'bg-emerald-50 text-emerald-600',
    },
    locations: [
      { id: 'back-1', label: 'Punggung Kiri Atas' },
      { id: 'back-2', label: 'Punggung Kiri Bawah' },
      { id: 'back-3', label: 'Punggung Kanan Atas' },
      { id: 'back-4', label: 'Punggung Kanan Bawah' },
    ],
  },
  {
    id: 'arm',
    title: 'Area Lengan',
    subtitle: '4 Titik Sensor Kontak Lengan Belakang Kiri & Kanan',
    tag: '4 Titik Belakang',
    colorTheme: {
      dot: 'bg-[#ffd21f]',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      cardActive: 'border-emerald-500 shadow-md ring-2 ring-emerald-500/25 bg-emerald-50/25',
      iconActive: 'bg-emerald-500 text-white shadow-2xs',
      iconDefault: 'bg-emerald-50 text-emerald-600',
    },
    locations: [
      { id: 'arm-left-1', label: 'Lengan Kiri Atas' },
      { id: 'arm-left-2', label: 'Lengan Kiri Bawah' },
      { id: 'arm-right-1', label: 'Lengan Kanan Atas' },
      { id: 'arm-right-2', label: 'Lengan Kanan Bawah' },
    ],
  },
  {
    id: 'leg',
    title: 'Area Kaki & Paha',
    subtitle: '6 Titik Sensor Kontak Paha Belakang Kiri & Kanan',
    tag: '6 Titik Belakang',
    colorTheme: {
      dot: 'bg-[#2563eb]',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      cardActive: 'border-emerald-500 shadow-md ring-2 ring-emerald-500/25 bg-emerald-50/25',
      iconActive: 'bg-emerald-500 text-white shadow-2xs',
      iconDefault: 'bg-emerald-50 text-emerald-600',
    },
    locations: [
      { id: 'leg-left-1', label: 'Paha Kiri Atas' },
      { id: 'leg-left-2', label: 'Paha Kiri Tengah' },
      { id: 'leg-left-3', label: 'Paha Kiri Bawah' },
      { id: 'leg-right-1', label: 'Paha Kanan Atas' },
      { id: 'leg-right-2', label: 'Paha Kanan Tengah' },
      { id: 'leg-right-3', label: 'Paha Kanan Bawah' },
    ],
  },
];

const LOCATIONS_14 = [
  'back-1', 'back-2', 'back-3', 'back-4',
  'arm-left-1', 'arm-left-2', 'arm-right-1', 'arm-right-2',
  'leg-left-1', 'leg-left-2', 'leg-left-3', 'leg-right-1', 'leg-right-2', 'leg-right-3',
];

const SENSOR_CONFIGS = {
  temp: {
    key: 'temp',
    backendType: 'temperature',
    title: 'Temperature',
    unit: '°C',
    sensorName: 'MCP9808',
    desc: 'Thermal load monitoring per body segment',
    icon: Thermometer,
    initialVal: 32.5,
    sections: SECTIONS_14_POINTS,
    locations: LOCATIONS_14,
  },
  temperature: {
    key: 'temp',
    backendType: 'temperature',
    title: 'Temperature',
    unit: '°C',
    sensorName: 'MCP9808',
    desc: 'Thermal load monitoring per body segment',
    icon: Thermometer,
    initialVal: 32.5,
    sections: SECTIONS_14_POINTS,
    locations: LOCATIONS_14,
  },
  press: {
    key: 'press',
    backendType: 'pressure',
    title: 'Pressure',
    unit: 'N',
    sensorName: 'FSR RP-S40-ST',
    desc: 'Contact pressure distribution across body hotspots',
    icon: Gauge,
    initialVal: 34.0,
    sections: SECTIONS_14_POINTS,
    locations: LOCATIONS_14,
  },
  pressure: {
    key: 'press',
    backendType: 'pressure',
    title: 'Pressure',
    unit: 'N',
    sensorName: 'FSR RP-S40-ST',
    desc: 'Contact pressure distribution across body hotspots',
    icon: Gauge,
    initialVal: 34.0,
    sections: SECTIONS_14_POINTS,
    locations: LOCATIONS_14,
  },
  vib: {
    key: 'vib',
    backendType: 'vibration',
    title: 'Vibration',
    unit: 'V',
    sensorName: 'Piezoelectric',
    desc: 'Impact & vibration intensity recording',
    icon: Waves,
    initialVal: 0.85,
    sections: SECTIONS_14_POINTS,
    locations: LOCATIONS_14,
  },
  vibration: {
    key: 'vib',
    backendType: 'vibration',
    title: 'Vibration',
    unit: 'V',
    sensorName: 'Piezoelectric',
    desc: 'Impact & vibration intensity recording',
    icon: Waves,
    initialVal: 0.85,
    sections: SECTIONS_14_POINTS,
    locations: LOCATIONS_14,
  },
  flex: {
    key: 'flex',
    backendType: 'flex',
    title: 'Flex & Strain Gauge',
    unit: 'µε / Ω',
    sensorName: 'Flex Sensor & Strain Gauge',
    desc: 'Monitoring artikulasi kelengkungan sendi & regangan tubuh (Depan & Belakang)',
    icon: ArrowLeftRight,
    initialVal: 52.4,
    sections: null,
    locations: [
      'right-shoulder',
      'left-shoulder',
      'right-elbow',
      'left-elbow',
      'right-waist',
      'left-waist',
      'right-knee',
      'left-knee',
    ],
  },
  flexStrain: {
    key: 'flex',
    backendType: 'flex',
    title: 'Flex & Strain Gauge',
    unit: 'µε / Ω',
    sensorName: 'Flex Sensor & Strain Gauge',
    desc: 'Monitoring artikulasi kelengkungan sendi & regangan tubuh (Depan & Belakang)',
    icon: ArrowLeftRight,
    initialVal: 52.4,
    sections: null,
    locations: [
      'right-shoulder',
      'left-shoulder',
      'right-elbow',
      'left-elbow',
      'right-waist',
      'left-waist',
      'right-knee',
      'left-knee',
    ],
  },
};

const LOCATION_LABELS = {
  // 14 Titik Baru SmartSkin (Suhu, Tekanan, Getaran)
  'back-1': 'Punggung Kiri Atas',
  'back-2': 'Punggung Kiri Bawah',
  'back-3': 'Punggung Kanan Atas',
  'back-4': 'Punggung Kanan Bawah',
  'arm-left-1': 'Lengan Kiri Atas',
  'arm-left-2': 'Lengan Kiri Bawah',
  'arm-right-1': 'Lengan Kanan Atas',
  'arm-right-2': 'Lengan Kanan Bawah',
  'leg-left-1': 'Paha Kiri Atas',
  'leg-left-2': 'Paha Kiri Tengah',
  'leg-left-3': 'Paha Kiri Bawah',
  'leg-right-1': 'Paha Kanan Atas',
  'leg-right-2': 'Paha Kanan Tengah',
  'leg-right-3': 'Paha Kanan Bawah',

  // Titik Standar / Flex & Strain
  back: 'Punggung',
  'left-arm': 'Lengan Kiri',
  'right-arm': 'Lengan Kanan',
  'left-leg': 'Kaki Kiri',
  'right-leg': 'Kaki Kanan',
  'right-shoulder': 'Bahu Kanan',
  'left-shoulder': 'Bahu Kiri',
  'right-elbow': 'Sikut Kanan',
  'left-elbow': 'Sikut Kiri',
  'right-waist': 'Pinggang Samping Kanan',
  'left-waist': 'Pinggang Samping Kiri',
  'right-knee': 'Lutut Kanan',
  'left-knee': 'Lutut Kiri',
};

const LOCATION_NORMALIZER = {
  // Direct 14 titik keys
  'back-1': 'back-1',
  'back-2': 'back-2',
  'back-3': 'back-3',
  'back-4': 'back-4',
  'arm-left-1': 'arm-left-1',
  'arm-left-2': 'arm-left-2',
  'arm-right-1': 'arm-right-1',
  'arm-right-2': 'arm-right-2',
  'leg-left-1': 'leg-left-1',
  'leg-left-2': 'leg-left-2',
  'leg-left-3': 'leg-left-3',
  'leg-right-1': 'leg-right-1',
  'leg-right-2': 'leg-right-2',
  'leg-right-3': 'leg-right-3',

  // General mappings
  back: 'back',
  'left arm': 'left-arm',
  'right arm': 'right-arm',
  'left leg': 'left-leg',
  'right leg': 'right-leg',
  'left shoulder': 'left-shoulder',
  'right shoulder': 'right-shoulder',
  'left elbow': 'left-elbow',
  'right elbow': 'right-elbow',
  'left waist': 'left-waist',
  'right waist': 'right-waist',
  'left knee': 'left-knee',
  'right knee': 'right-knee',
  'bahu kanan': 'right-shoulder',
  'bahu kiri': 'left-shoulder',
  'sikut kanan': 'right-elbow',
  'sikut kiri': 'left-elbow',
  'pinggang samping kanan': 'right-waist',
  'pinggang samping kiri': 'left-waist',
  'lutut kanan': 'right-knee',
  'lutut kiri': 'left-knee',
};

// Pemetaan dari nama area umum ke sub-titik 14 lokasi
const MULTI_LOCATION_TARGETS = {
  back: ['back-1', 'back-2', 'back-3', 'back-4'],
  'left-arm': ['arm-left-1', 'arm-left-2'],
  'right-arm': ['arm-right-1', 'arm-right-2'],
  'left-leg': ['leg-left-1', 'leg-left-2', 'leg-left-3'],
  'right-leg': ['leg-right-1', 'leg-right-2', 'leg-right-3'],
};

// Format angka sensor agar rapi 2 angka di belakang koma (misal 52.40)
const formatSensorVal = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '--';
  const num = Number(val);
  const normalized = num > 1000 ? num / 1000 : num;
  return normalized.toFixed(2);
};

export default function SmartskinDetailPage() {
  const { t } = useTranslation();
  const { sensorKey } = useParams();
  const params = useParams();
  const navigate = useNavigate();
  const mannequinId = Number(params?.id) || 1;

  const config = SENSOR_CONFIGS[sensorKey] || SENSOR_CONFIGS.temp;
  const IconComponent = config.icon;

  const [activeLocation, setActiveLocation] = useState(config.locations[0]);

  // Pastikan activeLocation selalu valid saat berganti sensor
  useEffect(() => {
    if (!config.locations.includes(activeLocation)) {
      setActiveLocation(config.locations[0]);
    }
  }, [config.locations, activeLocation]);

  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [locationValues, setLocationValues] = useState(() => {
    const init = {};
    config.locations.forEach((loc, idx) => {
      const base = config.initialVal;
      const offset = idx % 3 === 0 ? 0.35 : idx % 3 === 1 ? -0.25 : 0.45;
      init[loc] = {
        front: Number((base + offset).toFixed(2)),
        back: Number((base + offset + 0.8).toFixed(2)),
      };
    });
    return init;
  });

  const [history, setHistory] = useState(() => {
    const now = Date.now();
    const frontData = [];
    const backData = [];
    const categories = [];
    for (let i = 10; i >= 0; i--) {
      const d = new Date(now - i * 3000);
      categories.push(d.toISOString().split('.')[0].replace('T', ' '));
      const base = config.initialVal;
      const varianceF = Math.sin(i) * 0.03 * base;
      const varianceB = (Math.cos(i) * 0.04 + 0.02) * base;
      frontData.push(Number((base + varianceF).toFixed(2)));
      backData.push(Number((base + varianceB).toFixed(2)));
    }
    return { frontData, backData, categories };
  });

  const { isConnected, latestBatch } = useSensorWebSocket(mannequinId);

  // Handle incoming batch readings
  useEffect(() => {
    if (!latestBatch || latestBatch.length === 0) return;

    const timeStr = new Date().toISOString().split('.')[0].replace('T', ' ');

    // Filter readings matching this sensor backend type
    const matches = latestBatch.filter(
      (r) =>
        r.sensorType === config.backendType ||
        (config.backendType === 'flex' && r.sensorType === 'strain')
    );

    if (matches.length > 0) {
      let activeFrontVal = null;
      let activeBackVal = null;

      setLocationValues((prev) => {
        const next = { ...prev };
        matches.forEach((r) => {
          const normLoc =
            LOCATION_NORMALIZER[r.location?.toLowerCase()] ||
            r.location?.toLowerCase().replace(/_/g, '-');
          if (normLoc) {
            const rawVal = Number(r.value);
            const isBack =
              r.side === 'back' ||
              r.sensorNumber === 2 ||
              (r.location && r.location.toLowerCase().includes('back'));

            const targetKeys = MULTI_LOCATION_TARGETS[normLoc] || [normLoc];
            targetKeys.forEach((key, kIdx) => {
              const varianceOffset = targetKeys.length > 1
                ? (kIdx % 2 === 0 ? 0.2 : -0.15) * (config.unit === 'Ω' ? 350 : 0.4)
                : 0;
              const pointVal = Number((rawVal + varianceOffset).toFixed(config.unit === 'Ω' ? 0 : 2));

              const cur = next[key] ? { ...next[key] } : { front: pointVal, back: pointVal };
              if (isBack) {
                cur.back = pointVal;
              } else {
                cur.front = pointVal;
              }
              next[key] = cur;

              if (key === activeLocation) {
                if (isBack) activeBackVal = pointVal;
                else activeFrontVal = pointVal;
              }
            });
          }
        });
        return next;
      });

      // Update history for active location
      const fallbackMatch = matches.find((r) => {
        const normLoc =
          LOCATION_NORMALIZER[r.location?.toLowerCase()] ||
          r.location?.toLowerCase().replace(/_/g, '-');
        return normLoc === activeLocation;
      }) || matches[0];

      if (fallbackMatch) {
        const baseVal = Number(fallbackMatch.value);
        const fVal = activeFrontVal !== null ? activeFrontVal : baseVal;
        const bVal =
          activeBackVal !== null
            ? activeBackVal
            : Number((baseVal * 1.02).toFixed(config.unit === 'Ω' ? 0 : 2));

        setHistory((prev) => ({
          frontData: [...(prev.frontData || []).slice(-14), fVal],
          backData: [...(prev.backData || []).slice(-14), bVal],
          categories: [...prev.categories.slice(-14), timeStr],
        }));
      }
    }
  }, [latestBatch, config.backendType, config.unit, activeLocation]);

  const chartOptions = useMemo(() => {
    const baseOpts = createChartOptions(
      `smartskin-detail-${config.key}`,
      `${config.title} - ${LOCATION_LABELS[activeLocation] || activeLocation}`,
      history.categories
    );
    return {
      ...baseOpts,
      title: {
        text: undefined,
      },
      chart: {
        ...baseOpts.chart,
        parentHeightOffset: 0,
        toolbar: { show: false },
      },
      grid: {
        padding: {
          top: 0,
          bottom: 15,
          left: 15,
          right: 15,
        },
      },
      colors: !config.sections ? ['#10b981', '#ef4444'] : ['#00ba88'],
      stroke: {
        width: !config.sections ? [2.5, 2.5] : 3,
        curve: 'smooth',
      },
      markers: {
        size: 0,
        hover: {
          size: 6,
        },
      },
      legend: {
        show: false,
      },
      ...(config.key === 'temp' && {
        annotations: {
          yaxis: [
            {
              y: 38,
              borderColor: '#ef4444',
              strokeDashArray: 4,
              label: {
                borderColor: '#fca5a5',
                style: {
                  color: '#dc2626',
                  background: '#fee2e2',
                  fontSize: '10px',
                  fontWeight: 'bold',
                },
                text: 'Warning: 38 °C',
              },
            },
          ],
        },
      }),
    };
  }, [config.key, config.title, config.backendType, config.sections, activeLocation, history.categories]);

  const chartSeries = useMemo(() => {
    if (!config.sections) {
      // Flex & Strain: Tampilkan 2 series (Depan & Belakang)
      return [
        {
          name: 'Depan',
          data: history.frontData || [],
        },
        {
          name: 'Belakang',
          data: history.backData || [],
        },
      ];
    }
    // 14 Titik (Suhu, Tekanan, Getaran): 1 series Belakang
    return [
      {
        name: `${config.title} (${LOCATION_LABELS[activeLocation] || activeLocation})`,
        data: history.backData || [],
      },
    ];
  }, [config.sections, history.frontData, history.backData, config.title, activeLocation]);

  return (
    <div className="w-full pb-2">
      {/* Top Bar / Navigation */}
      <div className="w-full bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(`/${mannequinId}/sensor/smartskin`)}
            className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-[#00ba88]/10 hover:text-[#00ba88] border border-slate-200/80 text-slate-700 flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
            title="Kembali ke Ringkasan SmartSkin"
          >
            <ArrowLeft size={18} className="stroke-[2.2]" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00ba88]/10 text-[#00ba88] flex items-center justify-center border border-[#00ba88]/20 shrink-0">
              <IconComponent size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                  {config.title} Detail
                </h2>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#00ba88]/10 text-[#00ba88] uppercase tracking-wider">
                  {config.sensorName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tombol Log Riwayat Sensor di Kanan Atas Card */}
        <button
          type="button"
          onClick={() => setIsLogsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
        >
          <ScrollText size={15} />
          <span>{t("common.viewLogs", "Lihat Log Riwayat Sensor")}</span>
        </button>
      </div>

      {/* Main Grid: Chart + Anatomy SVG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
        {/* Left: Real-time Chart */}
        <div className={config.key === 'flex' ? 'lg:col-span-7 xl:col-span-7' : 'lg:col-span-8 xl:col-span-8'}>
          <BaseCard height="h-[460px]" mobileHeight="min-h-[420px]" className="h-full flex flex-col justify-between">
            <div className="flex flex-col h-full justify-between pb-1">
              {/* Header: Kiri ada Judul, Kanan ada Badge Nilai Data Sensor */}
              <div className="flex flex-wrap justify-between items-center mb-1 gap-2">
                <h3 className="font-bold text-base text-slate-800 tracking-tight">
                  {config.title} - {LOCATION_LABELS[activeLocation] || activeLocation}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {!config.sections ? (
                    /* Flex & Strain: Tampilkan Badge Depan & Belakang */
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 shadow-xs flex items-center gap-1.5 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {t("common.front", "Depan")}:{' '}
                        {locationValues[activeLocation]?.front !== undefined
                          ? formatSensorVal(locationValues[activeLocation].front)
                          : '--'}{' '}
                        {config.unit}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 shadow-xs flex items-center gap-1.5 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        {t("common.back", "Belakang")}:{' '}
                        {locationValues[activeLocation]?.back !== undefined
                          ? formatSensorVal(locationValues[activeLocation].back)
                          : '--'}{' '}
                        {config.unit}
                      </span>
                    </div>
                  ) : (
                    /* Suhu, Tekanan, Getaran: Telemetri Tunggal Belakang */
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-800 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>
                        {locationValues[activeLocation]?.back !== undefined
                          ? formatSensorVal(locationValues[activeLocation].back)
                          : '--'}{' '}
                        {config.unit}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full flex-1">
                <ApexChart
                  options={chartOptions}
                  series={chartSeries}
                  height={320}
                  type="line"
                />
              </div>
            </div>
          </BaseCard>
        </div>

        {/* Right: Mannequin SVG Hotspot (Pilih Titik Anatomi) */}
        <div className={config.key === 'flex' ? 'lg:col-span-5 xl:col-span-5' : 'lg:col-span-4 xl:col-span-4'}>
          <BaseCard height="h-[460px]" mobileHeight="min-h-[420px]" className="h-full flex flex-col justify-between">
            <div className="flex flex-col h-full justify-between items-center text-center pb-1">
              <div className="w-full flex justify-between items-center mb-2">
                <p className="font-bold text-sm text-slate-800">{t("smartskinSensor.selectAnatomyPoint", "Pilih Titik Anatomi")}</p>
                <span className="text-[10px] font-semibold text-slate-400">{t("smartskinSensor.interactive", "Interaktif")}</span>
              </div>

              {config.key === 'flex' ? (
                /* Flex & Strain Gauge: Dua Sisi Berdampingan dalam 1 Card (Depan & Belakang) */
                <div className="flex-1 w-full grid grid-cols-2 gap-3 items-center justify-center my-auto">
                  {/* Sisi Depan */}
                  <div className="flex flex-col items-center h-full justify-center">
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100/90 border border-slate-200 px-2.5 py-0.5 rounded-full mb-1 shadow-2xs">
                      {t("common.frontView", "Tampak Depan")}
                    </span>
                    <div className="w-full h-[335px] flex items-center justify-center">
                      <MannequinHotspotSVG
                        className="w-full h-full object-contain"
                        side="front"
                        activePart={activeLocation}
                        visibleParts={config.locations}
                        labels={LOCATION_LABELS}
                        onClickPart={(part) => {
                          if (config.locations.includes(part)) {
                            setActiveLocation(part);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Sisi Belakang */}
                  <div className="flex flex-col items-center h-full justify-center border-l border-slate-100 pl-2">
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100/90 border border-slate-200 px-2.5 py-0.5 rounded-full mb-1 shadow-2xs">
                      {t("common.backView", "Tampak Belakang")}
                    </span>
                    <div className="w-full h-[335px] flex items-center justify-center">
                      <MannequinHotspotSVG
                        className="w-full h-full object-contain"
                        side="back"
                        activePart={activeLocation}
                        visibleParts={config.locations}
                        labels={LOCATION_LABELS}
                        onClickPart={(part) => {
                          if (config.locations.includes(part)) {
                            setActiveLocation(part);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Suhu, Tekanan, Getaran: 1 Sisi Belakang (14 Titik) */
                <div className="flex-1 w-full flex flex-col items-center justify-center my-auto">
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100/90 border border-slate-200 px-2.5 py-0.5 rounded-full mb-1 shadow-2xs">
                    {t("common.backView", "Tampak Belakang")}
                  </span>
                  <div className="w-[195px] h-[335px] flex items-center justify-center">
                    <MannequinHotspotSVG
                      className="w-full h-full object-contain"
                      side="back"
                      activePart={activeLocation}
                      visibleParts={config.locations}
                      labels={LOCATION_LABELS}
                      onClickPart={(part) => {
                        if (config.locations.includes(part)) {
                          setActiveLocation(part);
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </BaseCard>
        </div>
      </div>

      {/* Grid: Details Per Body Location */}
      <div className="mt-8 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-800">
              {config.sections
                ? t("smartskinSensor.bodyAreaDetail", "Rincian Bacaan Sensor per Area Tubuh (3 Area - 14 Titik Belakang)")
                : `${t("smartskinSensor.jointPointDetail", "Rincian Bacaan Sensor per Titik Sendi")} (${config.locations.length} ${t("common.points", "Titik")})`}
            </h3>
            {config.sections && (
              <p className="text-xs text-slate-500 mt-1">
                {t("smartskinSensor.backSensorDist", "Monitoring sensor belakang terdistribusi dalam 3 card area: Area Punggung (4 titik), Area Lengan (4 titik), dan Area Kaki & Paha (6 titik).")}
              </p>
            )}
          </div>
        </div>

        {config.sections ? (
          /* Tampilan Grid Card per Area Tubuh untuk 14 Titik Belakang */
          <div className="space-y-6">
            {/* List Seksi Area Tubuh dengan Card Grid */}
            {config.sections.map((sec) => (
              <div key={sec.id} className="space-y-3.5">
                {/* Header Subseksi */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">
                      {sec.title}
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">
                      ({sec.locations.length} Titik)
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sec.colorTheme.badge}`}>
                    {sec.tag}
                  </span>
                </div>

                {/* Grid Card Gambar 2 per Area */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${sec.locations.length > 4 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4`}>
                  {sec.locations.map((locItem) => {
                    const loc = typeof locItem === 'string' ? locItem : locItem.id;
                    const label = typeof locItem === 'string' ? (LOCATION_LABELS[loc] || loc) : locItem.label;
                    const valObj = locationValues[loc] || {};
                    const isSelected = activeLocation === loc;
                    const isOmega = config.unit === 'Ω' || config.unit === 'µε / Ω';

                    const displayVal =
                      valObj.back !== undefined
                        ? isOmega
                          ? Number(valObj.back).toLocaleString()
                          : Number(valObj.back).toFixed(2)
                        : '--';

                    const rawNum = parseFloat(displayVal) || 0;
                    const maxScale = config.unit === '°C' ? 50 : config.unit === 'N' ? 50 : config.unit === 'V' ? 3 : 100;
                    const progressPercent = Math.min(100, Math.max(10, Math.round((rawNum / maxScale) * 100)));

                    return (
                      <div
                        key={loc}
                        onClick={() => setActiveLocation(loc)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setActiveLocation(loc)}
                        className={`bg-white rounded-2xl p-5 border shadow-sm relative overflow-hidden group cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-500 shadow-xl ring-2 ring-emerald-500/25 bg-emerald-50/15 -translate-y-1'
                            : 'border-slate-100 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/15 hover:-translate-y-2'
                        }`}
                      >
                        <div>
                          {/* Header Card: Judul Titik & Pill Status Badge */}
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-extrabold text-slate-800 text-sm sm:text-base truncate pr-1" title={label}>
                              {label}
                            </h3>
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border shadow-2xs shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : 'bg-slate-50 text-slate-500 border-slate-200 group-hover:border-emerald-200 group-hover:text-emerald-700 group-hover:bg-emerald-50'
                              }`}
                            >
                              {isSelected ? t("common.activePoint", "Titik Aktif") : t("common.selectPoint", "Pilih Titik")}
                            </span>
                          </div>

                          {/* Nilai Sensor Besar & Unit */}
                          <div className="flex items-baseline gap-1.5 py-1 mb-1">
                            <span className="text-3xl font-black text-[#00ba88] tracking-tight font-mono">
                              {displayVal}
                            </span>
                            <span className="text-sm font-bold text-slate-400 font-sans">
                              {config.unit}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 mb-2 truncate">
                            {config.sensorName} • <span className="font-mono text-slate-400">{loc}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mt-auto">
                          <span>{t("common.telemetryStatus", "Status Telemetri")}</span>
                          <span className="font-semibold text-emerald-700 font-mono">{t("common.optimalPrecision", "Presisi Optimal")}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tampilan Standar Grid 8 Titik untuk Flex & Strain (Depan & Belakang) - Desain Loadcell Style (Gambar 2) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {config.locations.map((loc) => {
              const valObj = locationValues[loc] || {};
              const isSelected = activeLocation === loc;

              const displayF = formatSensorVal(valObj.front);
              const displayB = formatSensorVal(valObj.back);
              const numF = parseFloat(valObj.front) || 52.5;

              return (
                <div
                  key={loc}
                  onClick={() => setActiveLocation(loc)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveLocation(loc)}
                  className={`bg-white rounded-2xl p-5 border shadow-sm relative overflow-hidden group cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 shadow-xl ring-2 ring-emerald-500/25 bg-emerald-50/15 -translate-y-1'
                      : 'border-slate-100 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/15 hover:-translate-y-2'
                  }`}
                >
                  <div>
                    {/* Header Card: Judul Titik & Pill Status Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                        {LOCATION_LABELS[loc] || loc}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border shadow-2xs transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-slate-50 text-slate-500 border-slate-200 group-hover:border-emerald-200 group-hover:text-emerald-700 group-hover:bg-emerald-50'
                        }`}
                      >
                        {isSelected ? t("common.activePoint", "Titik Aktif") : t("common.selectPoint", "Pilih Titik")}
                      </span>
                    </div>

                    {/* Metrik Data Depan & Belakang */}
                    <div className="grid grid-cols-2 gap-2.5 py-1 mb-1">
                      <div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase font-mono tracking-wider mb-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{t("common.front", "Depan")}</span>
                        </div>
                        <div className="flex items-baseline gap-1 font-mono">
                          <span className="text-2xl sm:text-[26px] font-black text-[#00ba88] tracking-tight">
                            {displayF}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 font-sans">
                            {config.unit}
                          </span>
                        </div>
                      </div>

                      <div className="border-l border-slate-100 pl-2.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-rose-500 uppercase font-mono tracking-wider mb-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>{t("common.back", "Belakang")}</span>
                        </div>
                        <div className="flex items-baseline gap-1 font-mono">
                          <span className="text-2xl sm:text-[26px] font-black text-slate-800 tracking-tight">
                            {displayB}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 font-sans">
                            {config.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 mb-2">
                      {config.sensorName || 'Flex Sensor & Strain Gauge'}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mt-auto">
                    <span>{t("common.flexRange", "Rentang Fleksi")}</span>
                    <span className="font-semibold text-emerald-700 font-mono">{t("common.optimalPrecision", "Presisi Optimal")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Log Riwayat Sensor Smart Skin */}
      <SmartskinLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        mannequinId={mannequinId}
      />
    </div>
  );
}
