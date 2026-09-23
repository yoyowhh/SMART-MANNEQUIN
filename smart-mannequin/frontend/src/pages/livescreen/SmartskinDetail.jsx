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
    locations: ['back', 'left-arm', 'right-arm', 'left-leg', 'right-leg'],
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
    locations: ['back', 'left-arm', 'right-arm', 'left-leg', 'right-leg'],
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
    locations: ['back', 'left-arm', 'right-arm', 'left-leg', 'right-leg'],
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
    locations: ['back', 'left-arm', 'right-arm', 'left-leg', 'right-leg'],
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
    locations: ['back', 'left-arm', 'right-arm', 'left-leg', 'right-leg'],
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
    locations: ['back', 'left-arm', 'right-arm', 'left-leg', 'right-leg'],
  },
  flex: {
    key: 'flex',
    backendType: 'flex',
    title: 'Flex & Strain Gauge',
    unit: 'µε / Ω',
    sensorName: 'Flex Sensor & Strain Gauge',
    desc: 'Monitoring artikulasi kelengkungan sendi & regangan tubuh (Depan & Belakang)',
    icon: ArrowLeftRight,
    initialVal: 52400,
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
    initialVal: 52400,
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
  back: 'Punggung (Back)',
  'left-arm': 'Lengan Kiri (L-Arm)',
  'right-arm': 'Lengan Kanan (R-Arm)',
  'left-leg': 'Kaki Kiri (L-Leg)',
  'right-leg': 'Kaki Kanan (R-Leg)',
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

export default function SmartskinDetailPage() {
  const { sensorKey } = useParams();
  const params = useParams();
  const navigate = useNavigate();
  const mannequinId = Number(params?.id) || 1;

  const config = SENSOR_CONFIGS[sensorKey] || SENSOR_CONFIGS.temp;
  const IconComponent = config.icon;

  const [activeLocation, setActiveLocation] = useState(config.locations[0]);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [locationValues, setLocationValues] = useState(() => {
    const init = {};
    config.locations.forEach((loc) => {
      const base = config.initialVal;
      init[loc] = {
        front: base,
        back: Number((base + (config.unit === 'Ω' ? 2400 : 0.8)).toFixed(config.unit === 'Ω' ? 0 : 2)),
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
      frontData.push(Number((base + varianceF).toFixed(config.unit === 'Ω' ? 0 : 2)));
      backData.push(Number((base + varianceB).toFixed(config.unit === 'Ω' ? 0 : 2)));
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

            const cur = next[normLoc] ? { ...next[normLoc] } : { front: rawVal, back: rawVal };
            if (isBack) {
              cur.back = rawVal;
            } else {
              cur.front = rawVal;
            }
            next[normLoc] = cur;

            if (normLoc === activeLocation) {
              if (isBack) activeBackVal = rawVal;
              else activeFrontVal = rawVal;
            }
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
      colors: ['#10b981', '#ef4444'], // Green for Depan, Red for Belakang
      stroke: {
        width: [3, 3],
        curve: 'smooth',
      },
      markers: {
        size: 3,
        hover: {
          size: 6,
        },
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'left',
        offsetX: -6,
        offsetY: -6,
        fontSize: '12px',
        fontWeight: 600,
        markers: {
          width: 10,
          height: 10,
          radius: 12,
        },
        itemMargin: {
          horizontal: 10,
          vertical: 2,
        },
        onItemHover: {
          highlightDataSeries: true,
        },
        onItemClick: {
          toggleDataSeries: true,
        },
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
  }, [config.key, config.title, activeLocation, history.categories]);

  const chartSeries = useMemo(
    () => [
      {
        name: 'Depan',
        data: history.frontData || [],
      },
      {
        name: 'Belakang',
        data: history.backData || [],
      },
    ],
    [history.frontData, history.backData]
  );

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
          <span>Lihat Log Riwayat Sensor</span>
        </button>
      </div>

      {/* Main Grid: Chart + Anatomy SVG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
        {/* Left: Real-time Chart (2 cols) */}
        <div className="lg:col-span-2">
          <BaseCard height="h-[460px]" mobileHeight="min-h-[420px]" className="h-full flex flex-col justify-between">
            <div className="flex flex-col h-full justify-between pb-1">
              {/* Header: Kiri ada Judul, Kanan ada Badge Nilai Data Sensor */}
              <div className="flex flex-wrap justify-between items-center mb-1 gap-2">
                <h3 className="font-bold text-base text-slate-800 tracking-tight">
                  {config.title} - {LOCATION_LABELS[activeLocation] || activeLocation}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>
                      Depan:{' '}
                      {locationValues[activeLocation]?.front !== undefined
                        ? config.unit === 'Ω'
                          ? Number(locationValues[activeLocation].front).toLocaleString()
                          : Number(locationValues[activeLocation].front).toFixed(2)
                        : '--'}{' '}
                      {config.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-300 text-rose-800 px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>
                      Belakang:{' '}
                      {locationValues[activeLocation]?.back !== undefined
                        ? config.unit === 'Ω'
                          ? Number(locationValues[activeLocation].back).toLocaleString()
                          : Number(locationValues[activeLocation].back).toFixed(2)
                        : '--'}{' '}
                      {config.unit}
                    </span>
                  </div>
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

        {/* Right: Mannequin SVG Hotspot (1 col) - Disamakan Tingginya */}
        <div>
          <BaseCard height="h-[460px]" mobileHeight="min-h-[420px]" className="h-full flex flex-col justify-between">
            <div className="flex flex-col h-full justify-between items-center text-center pb-1">
              <div className="w-full flex justify-between items-center mb-2">
                <p className="font-bold text-sm text-slate-800">Pilih Titik Anatomi</p>
                <span className="text-[10px] font-semibold text-slate-400">Interaktif</span>
              </div>

              <div className="flex-1 w-full flex items-center justify-center my-1">
                <div className="w-[185px] h-[260px] flex items-center justify-center">
                  <MannequinHotspotSVG
                    className="w-full h-full object-contain"
                    activePart={activeLocation}
                    onClickPart={(part) => {
                      if (config.locations.includes(part)) {
                        setActiveLocation(part);
                      }
                    }}
                    imageHref="/images/mannequin/Mannequin Back Full Body.png"
                  />
                </div>
              </div>

              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 mt-auto">
                <p className="text-[11px] text-slate-500 font-medium">
                  Titik Aktif Terpilih:
                </p>
                <p className="text-xs font-bold text-emerald-700 truncate">
                  {LOCATION_LABELS[activeLocation] || activeLocation}
                </p>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      {/* Grid: Details Per Body Location */}
      <div className="mt-8 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-800">
              Rincian Bacaan Sensor per Titik Lokasi ({config.locations.length} Titik)
            </h3>
          </div>
        </div>

        <div
          className={
            config.locations.length === 5
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4"
              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          }
        >
          {config.locations.map((loc, index) => {
            const valObj = locationValues[loc] || {};
            const isSelected = activeLocation === loc;
            const isOmega = config.unit === 'Ω' || config.unit === 'µε / Ω';

            const displayF =
              valObj.front !== undefined
                ? isOmega
                  ? Number(valObj.front).toLocaleString()
                  : Number(valObj.front).toFixed(2)
                : '--';

            const displayB =
              valObj.back !== undefined
                ? isOmega
                  ? Number(valObj.back).toLocaleString()
                  : Number(valObj.back).toFixed(2)
                : '--';

            const colSpanClass =
              config.locations.length === 5
                ? index < 3
                  ? "sm:col-span-1 lg:col-span-2"
                  : index === 4
                  ? "sm:col-span-2 lg:col-span-3"
                  : "sm:col-span-1 lg:col-span-3"
                : "col-span-1";

            return (
              <div
                key={loc}
                onClick={() => setActiveLocation(loc)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setActiveLocation(loc)}
                className={`${colSpanClass} bg-white rounded-2xl p-5 border shadow-sm relative overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20 bg-emerald-50/15'
                    : 'border-slate-100 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/15 hover:-translate-y-1'
                }`}
              >
                {/* Header Titik Lokasi: Nama Titik di kiri & Icon Sensor di kanan (Persis Gambar 1) */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-xs font-bold text-slate-500 tracking-wider font-mono uppercase truncate pr-2"
                    title={LOCATION_LABELS[loc] || loc}
                  >
                    {LOCATION_LABELS[loc] || loc}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-emerald-500 text-white shadow-2xs'
                        : 'bg-emerald-50 text-[#00ba88]'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                </div>

                {/* Nilai Utama Depan & Belakang: Bersih, Rapi & Proporsional (Tidak Mepet) */}
                <div className="grid grid-cols-2 gap-3 py-1 mb-3">
                  {/* Sisi Depan */}
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase font-mono tracking-wider flex items-center gap-1 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Depan
                    </span>
                    <div className="flex items-baseline gap-1 font-mono">
                      <span
                        className={`font-black text-slate-800 tracking-tight ${
                          isOmega ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
                        }`}
                      >
                        {displayF}
                      </span>
                      <span className="text-xs font-medium text-slate-400 font-sans">
                        {config.unit}
                      </span>
                    </div>
                  </div>

                  {/* Sisi Belakang */}
                  <div className="border-l border-slate-100 pl-3">
                    <span className="text-[10px] font-bold text-rose-600 uppercase font-mono tracking-wider flex items-center gap-1 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Belakang
                    </span>
                    <div className="flex items-baseline gap-1 font-mono">
                      <span
                        className={`font-black text-slate-800 tracking-tight ${
                          isOmega ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
                        }`}
                      >
                        {displayB}
                      </span>
                      <span className="text-xs font-medium text-slate-400 font-sans">
                        {config.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Card: Badge Status & Nama Hardware Sensor */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2.5 border-t border-slate-50 mt-auto">
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    {isSelected ? 'Titik Aktif' : 'Pilih Titik'}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px] truncate pl-1">
                    {config.sensorName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
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
