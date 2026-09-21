import BaseCard from "../../components/Elements/Card";
import { useState, useEffect, useRef } from "react";
import ApexChart from "../../components/Elements/Chart";
import {
  createChartOptions,
  processData,
  useNewDataDetector,
  getLatestData,
} from "../../helpers/utils";
import { Skeleton } from "@mui/material";
import GaugeComponent from "react-gauge-component";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useFetchSensor } from "../../hooks/useSensor";
import LiveIndicatorBadge from "../../components/Dashboard/LiveIndicatorBadge";
import SensorInfoCard from "../../components/Dashboard/SensorInfoCard";

const ThermalPage = () => {
  const [series, setSeries] = useState([]);
  const [cameraUrl, setCameraUrl] = useState("");
  const [showInput, setShowInput] = useState(true);

  const [gaugeData, setGaugeData] = useState(0);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const latestDataRef = useRef(0);
  const { t } = useTranslation();

  const params = useParams();
  const mannequinId = params?.id || 1;

  useEffect(() => {
    let intervalId;

    const FetchAndProcessData = async () => {
      try {
        const ApiThermalData = await useFetchSensor(
          "thermal",
          702,
          mannequinId,
        );

        const processedData = processData(
          ApiThermalData,
          702,
          "Thermal Sensor",
          "thermal",
        );

        const latestDataThermal = getLatestData(ApiThermalData);
        const latestValue = parseFloat(latestDataThermal?.center_temp || 0);

        latestDataRef.current = latestValue;

        // Only update state if the value has changed
        setGaugeData((prevData) => {
          if (prevData !== latestDataThermal && latestDataThermal !== null) {
            return latestDataThermal;
          }
          return prevData;
        });

        const createOptions = createChartOptions(
          "Thermal-702",
          "Thermal Temperature Chart",
          processedData[0].categories,
        );

        setOptions(createOptions);
        setSeries(processedData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    FetchAndProcessData();
    intervalId = setInterval(FetchAndProcessData, 3000);

    return () => clearInterval(intervalId);
  }, [mannequinId]);

  const isNewData = useNewDataDetector(series.data);

  const handleButtonClick = () => {
    if (!cameraUrl || !isValidUrl(cameraUrl)) {
      const newUrl = prompt("Please enter a valid URL:");
      if (newUrl) {
        setCameraUrl(newUrl);
        setShowInput(false);
      }
    }
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
        {/* Informasi Sensor Card (Pindah ke Atas) */}
        <SensorInfoCard
          title={t("informasiSensor") || "Informasi Sensor"}
          sensorCode="MLX90640 Thermal Array"
          imageSrc="/images/information/camera-information.png"
          imageAlt="thermal-information"
          description={t("cameraSensor.deskripsiSensor")}
        />

        {/* Row 1: Gauge & Video Feed */}
        <div className="col-span-full md:col-span-1 lg:col-span-3">
          <BaseCard>
            <div className="flex flex-col gap-4 justify-between h-full">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 text-base">
                  {t("cameraSensor.suhu") || "Suhu Titik Pusat"}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                  CENTER_TEMP
                </span>
              </div>
              <div className="flex justify-center items-center flex-grow py-2">
                <GaugeComponent
                  type="semicircle"
                  arc={{
                    width: 0.2,
                    padding: 0.005,
                    cornerRadius: 1,
                    subArcs: [
                      {
                        limit: 15 + (70 - 15) / 3,
                        color: "#3B82F6",
                        showTick: true,
                        tooltip: { text: "Suhu Dingin" },
                      },
                      {
                        limit: 15 + (2 * (70 - 15)) / 3,
                        color: "#00BA88",
                        showTick: true,
                        tooltip: { text: "Suhu Normal / Nyaman" },
                      },
                      {
                        color: "#EF4444",
                        tooltip: { text: "Suhu Sangat Panas" },
                      },
                    ],
                  }}
                  pointer={{
                    color: "#1e293b",
                    baseColor: "#fff",
                    length: 0.8,
                    width: 14,
                    elasticity: true,
                    type: "arrow",
                  }}
                  labels={{
                    valueLabel: {
                      matchColorWithArc: true,
                      formatTextValue: () => {
                        return latestDataRef.current !== null
                          ? latestDataRef.current.toFixed(2) + "°C"
                          : "N/A";
                      },
                      style: {
                        fill: "#00BA88",
                        fontSize: 32,
                        fontWeight: "bold",
                      },
                    },
                    tickLabels: {
                      type: "outer",
                      defaultTickValueConfig: {
                        style: {
                          fontSize: 12,
                          fill: "#64748b",
                          fontWeight: "bold",
                        },
                      },
                      ticks: [
                        { value: 15 },
                        { value: 15 + (70 - 15) / 2 },
                        { value: 70 },
                      ],
                    },
                  }}
                  value={latestDataRef.current}
                  minValue={15}
                  maxValue={70}
                  style={{
                    height: "auto",
                    width: "fit",
                  }}
                />
              </div>
            </div>
          </BaseCard>
        </div>

        <div className="col-span-full md:col-span-1 lg:col-span-3">
          <BaseCard>
            <div className="flex flex-col gap-3 justify-between h-full">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 text-base">
                  {t("cameraSensor.kamera") || "Live Video Stream"}
                </h3>
                {showInput && (
                  <button
                    onClick={handleButtonClick}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs">
                    Set URL Kamera
                  </button>
                )}
              </div>
              <div className="flex-grow flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden min-h-[220px]">
                {cameraUrl ? (
                  <iframe
                    height={300}
                    className="w-full h-full rounded-2xl"
                    src={cameraUrl}
                    title="Live Video Feed"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                    <p className="text-xs font-semibold">
                      Belum ada URL streaming kamera yang disetel.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Klik tombol &ldquo;Set URL Kamera&rdquo; untuk menghubungkan RTSP / WebRTC stream.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </BaseCard>
        </div>
        {/* End Row 1 */}

        {/* Row 2: Chart */}
        {!loading ? (
          series.map((seriesData, index) => {
            return (
              <div key={index} className="col-span-full">
                <BaseCard>
                  <div className="flex flex-col">
                    <div className="flex justify-end mb-2">
                      <LiveIndicatorBadge isLive={isNewData} label="TELEMETRI TERMAL" />
                    </div>
                    <ApexChart
                      options={options}
                      series={seriesData.data}
                      height="150%"
                    />
                  </div>
                </BaseCard>
              </div>
            );
          })
        ) : (
          <div className="col-span-full">
            <BaseCard>
              <Skeleton variant="rectangular" height={260} className="rounded-2xl" />
            </BaseCard>
          </div>
        )}
        {/* End Row 2 */}
      </div>
    </div>
  );
};

export default ThermalPage;
