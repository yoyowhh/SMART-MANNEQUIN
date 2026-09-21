import BaseCard from "../../components/Elements/Card";
import { useState, useEffect, useRef } from "react";
import ApexChart from "../../components/Elements/Chart";
import { ApiBme } from "../../service/list_api";
import {
  createChartOptions,
  processData,
  useNewDataDetector,
  getLatestData,
} from "../../helpers/utils";
import { Skeleton } from "@mui/material";
import GaugeComponent from "react-gauge-component";
import { useTranslation } from "react-i18next";
import { useFetchSensor } from "../../hooks/useSensor";
import { useParams } from "react-router-dom";
import LiveIndicatorBadge from "../../components/Dashboard/LiveIndicatorBadge";
import SensorInfoCard from "../../components/Dashboard/SensorInfoCard";

const BmePage = () => {
  const [series, setSeries] = useState([]);
  const [gaugeData, setGaugeData] = useState({ temperature: 0, humidity: 0 });
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const latestDataRefTemperature = useRef(0);
  const latestDataRefHumidity = useRef(0);
  const latestDataRefPressure = useRef(0);
  const { t } = useTranslation();

  const params = useParams();
  const mannequinId = params?.id || 1;

  useEffect(() => {
    let intervalId;

    const FetchAndProcessData = async () => {
      try {
        const ApiBmeData = await useFetchSensor("bme", 1001, mannequinId);

        const processedData = processData(
          ApiBmeData,
          1001,
          "Environmental Sensor",
          "bme",
        );

        setLoading(false);

        const latestDataBme = getLatestData(ApiBmeData);

        const latestValueTemperature = parseFloat(latestDataBme?.temperature || 0);
        const latestValueHumidity = parseFloat(latestDataBme?.humidity || 0);
        const latestValuePressure = parseFloat(latestDataBme?.pressure || 0);

        latestDataRefTemperature.current = latestValueTemperature;
        latestDataRefHumidity.current = latestValueHumidity;
        latestDataRefPressure.current = latestValuePressure;

        // Only update state if the value has changed
        setGaugeData((prevData) => {
          if (
            prevData.temperature !== latestValueTemperature ||
            prevData.humidity !== latestValueHumidity ||
            prevData.pressure !== latestValuePressure
          ) {
            return {
              temperature: latestValueTemperature,
              humidity: latestValueHumidity,
              pressure: latestValuePressure,
            };
          }
          return prevData;
        });

        const types = ["temperature", "humidity", "pressure", "altitude"];
        const createOptions = types.map((type, index) =>
          createChartOptions(type, type, processedData[index].categories),
        );
        setOptions(createOptions);
        setSeries(processedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    FetchAndProcessData();
    intervalId = setInterval(FetchAndProcessData, 3000);

    return () => clearInterval(intervalId);
  }, [mannequinId]);

  const isNewData = useNewDataDetector(series.data);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
        {/* Informasi Sensor Card (Pindah ke Atas) */}
        <SensorInfoCard
          title={t("informasiSensor") || "Informasi Sensor"}
          sensorCode="BME280 Environmental Sensor"
          imageSrc="/images/information/bme-information.png"
          imageAlt="bme-information"
          description={t("bmeSensor.dekripsiSensor")}
        />

        {/* Row 1: Gauges */}

        <div className="col-span-full sm:col-span-2">
          <BaseCard height="h-[340px]">
            <div className="flex flex-col gap-3 justify-between h-full">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 text-base">
                  {t("Kelembapan")}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600">
                  HUMIDITY (%)
                </span>
              </div>
              <div className="flex-grow flex items-center justify-center">
                <GaugeComponent
                  type="semicircle"
                  arc={{
                    width: 0.2,
                    padding: 0.005,
                    cornerRadius: 1,
                    colorArray: ["#00FF15", "#FF2121"],
                    subArcs: [
                      {
                        limit: 15,

                        showTick: true,
                      },
                      {
                        limit: 37,

                        showTick: true,
                      },
                      {
                        limit: 58,

                        showTick: true,
                      },
                      {
                        limit: 75,

                        showTick: true,
                      },
                      {
                        showTick: true,
                      },
                    ],
                  }}
                  pointer={{
                    color: "#000",
                    baseColor: "#000",
                    length: 0.8,
                    width: 15,
                    type: "arrow",
                  }}
                  labels={{
                    valueLabel: {
                      formatTextValue: (value) => {
                        return latestDataRefHumidity.current.toFixed(2) + "%";
                      },
                      style: {
                        fontSize: 34,
                        fill: "#000",
                      },
                    },
                    tickLabels: {
                      type: "outer",
                      defaultTickValueConfig: {
                        style: {
                          fontSize: 10,
                          fill: "#000",
                          fontWeight: "bold",
                        },
                      },
                    },
                  }}
                  value={latestDataRefHumidity.current}
                  style={{
                    height: "fit",
                    width: "100%",
                  }}
                />
              </div>
            </div>
          </BaseCard>
        </div>
        <div className="col-span-full sm:col-span-2">
          <BaseCard height="h-[340px]">
            <div className="flex flex-col gap-3 justify-between h-full">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 text-base">
                  {t("Temperatur")}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#00ba88]">
                  SUHU (°C)
                </span>
              </div>
              <div className="flex-grow flex items-center justify-center">
                <GaugeComponent
                  type="semicircle"
                  arc={{
                    width: 0.2,
                    padding: 0.005,
                    cornerRadius: 1,
                    subArcs: [
                      {
                        limit: 15 + (70 - 15) / 3, // Calculate the limit for the cold section
                        color: "#3B82F6", // Blue for cold
                        showTick: true,
                        tooltip: {
                          text: "Cold temperature!",
                        },
                      },
                      {
                        limit: 15 + (2 * (70 - 15)) / 3, // Calculate the limit for the medium section
                        color: "#00BA88", // Green for normal
                        showTick: true,
                        tooltip: {
                          text: "Normal temperature!",
                        },
                      },
                      {
                        color: "#EF4444", // Red for hot
                        tooltip: {
                          text: "Hot temperature!",
                        },
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
                        return (
                          latestDataRefTemperature.current.toFixed(2) + "°C"
                        );
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
                        formatTextValue: (value) => {
                          return value + "°C";
                        },
                        style: {
                          fontSize: 11,
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
                  value={latestDataRefTemperature.current}
                  minValue={15}
                  maxValue={70}
                  style={{
                    height: "fit",
                    width: "100%",
                  }}
                />
              </div>
            </div>
          </BaseCard>
        </div>

        <div className="col-span-full sm:col-span-2">
          <BaseCard height="h-[340px]">
            <div className="flex flex-col gap-3 justify-between h-full">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 text-base">
                  {t("Tekanan Udara")}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">
                  PRESSURE (hPa)
                </span>
              </div>
              <div className="flex-grow flex items-center justify-center">
                <GaugeComponent
                  type="semicircle"
                  arc={{
                    width: 0.2,
                    padding: 0.005,
                    cornerRadius: 1,
                    colorArray: ["#00BA88", "#EF4444"],
                    subArcs: [
                      {
                        limit: 15,
                        showTick: true,
                      },
                      {
                        limit: 37,
                        showTick: true,
                      },
                      {
                        limit: 58,
                        showTick: true,
                      },
                      {
                        limit: 75,
                        showTick: true,
                      },
                      {
                        showTick: true,
                      },
                    ],
                  }}
                  pointer={{
                    color: "#1e293b",
                    baseColor: "#fff",
                    length: 0.8,
                    width: 14,
                    type: "arrow",
                  }}
                  labels={{
                    valueLabel: {
                      formatTextValue: () => {
                        return latestDataRefPressure.current.toFixed(2) + " hPa";
                      },
                      style: {
                        fontSize: 28,
                        fill: "#1e293b",
                        fontWeight: "bold",
                      },
                    },
                    tickLabels: {
                      type: "outer",
                      defaultTickValueConfig: {
                        style: {
                          fontSize: 10,
                          fill: "#64748b",
                          fontWeight: "bold",
                        },
                      },
                    },
                  }}
                  value={latestDataRefPressure.current}
                  style={{
                    height: "fit",
                    width: "100%",
                  }}
                />
              </div>
            </div>
          </BaseCard>
        </div>

        {/* End Row 1 */}

        {/* Row 2: Charts */}
        {!loading
          ? series.map((seriesData, index) => {
              return (
                <div key={index} className="col-span-full sm:col-span-3">
                  <BaseCard>
                    <div className="flex flex-col">
                      <div className="flex justify-end mb-2">
                        <LiveIndicatorBadge isLive={isNewData} label="TELEMETRI" />
                      </div>
                      <ApexChart
                        options={options[index]}
                        series={[seriesData]}
                        height="150%"
                      />
                    </div>
                  </BaseCard>
                </div>
              );
            })
          : Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="col-span-full sm:col-span-3">
                <BaseCard>
                  <Skeleton variant="rectangular" height={260} className="rounded-2xl" />
                </BaseCard>
              </div>
            ))}
        {/* End Row 2 */}
      </div>
    </div>
  );
};

export default BmePage;
