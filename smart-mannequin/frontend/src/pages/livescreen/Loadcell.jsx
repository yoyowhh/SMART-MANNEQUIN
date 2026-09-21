/* eslint-disable react-hooks/rules-of-hooks */
import BaseCard from "../../components/Elements/Card";
import { useState, useEffect } from "react";
import ApexChart from "../../components/Elements/Chart";
import {
  createChartOptions,
  processData,
  useWitNewDataDetector,
} from "../../helpers/utils";
import { Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useFetchSensor } from "../../hooks/useSensor";
import LiveIndicatorBadge from "../../components/Dashboard/LiveIndicatorBadge";
import SensorInfoCard from "../../components/Dashboard/SensorInfoCard";

const LoadcellPage = () => {
  const [series, setSeries] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const newDataFlags = useWitNewDataDetector(series);

  const params = useParams();
  const mannequinId = params?.id || 1;

  useEffect(() => {
    let intervalId;
    const sensorTypes = [
      t("loadcellSensor.loadcell-leher"),
      t("loadcellSensor.loadcell-leftThigh"),
      t("loadcellSensor.loadcell-rightThigh"),
      t("loadcellSensor.loadcell-leftFoot"),
      t("loadcellSensor.loadcell-rightFoot"),
    ];

    const FetchAndProcessData = async () => {
      try {
        const [
          ApiLoadCell_1Data,
          ApiLoadCell_2Data,
          ApiLoadCell_3Data,
          ApiLoadCell_4Data,
          ApiLoadCell_5Data,
        ] = await Promise.all([
          useFetchSensor("loadcell", 801, mannequinId),
          useFetchSensor("loadcell", 802, mannequinId),
          useFetchSensor("loadcell", 803, mannequinId),
          useFetchSensor("loadcell", 804, mannequinId),
          useFetchSensor("loadcell", 805, mannequinId),
        ]);

        const processedData = [
          ...(processData(
            ApiLoadCell_1Data,
            801,
            "Loadcell 1",
            "loadcell",
            mannequinId,
          ) || []),
          ...(processData(ApiLoadCell_2Data, 802, "Loadcell 2", "loadcell") || []),
          ...(processData(ApiLoadCell_3Data, 803, "Loadcell 3", "loadcell") || []),
          ...(processData(ApiLoadCell_4Data, 804, "Loadcell 4", "loadcell") || []),
          ...(processData(ApiLoadCell_5Data, 805, "Loadcell 5", "loadcell") || []),
        ].filter(Boolean);

        if (processedData.length > 0) {
          const createOptions = sensorTypes.map((type, index) =>
            createChartOptions(
              type,
              type,
              processedData[index]?.categories || [],
            ),
          );
          setOptions(createOptions);
          setSeries(processedData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    FetchAndProcessData();
    intervalId = setInterval(FetchAndProcessData, 3000);

    return () => clearInterval(intervalId);
  }, [mannequinId, t]);

  const sensorTypes = [
    t("loadcellSensor.loadcell-leher"),
    t("loadcellSensor.loadcell-leftThigh"),
    t("loadcellSensor.loadcell-rightThigh"),
    t("loadcellSensor.loadcell-leftFoot"),
    t("loadcellSensor.loadcell-rightFoot"),
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
        {/* Informasi Sensor Card (Pindah ke Atas) */}
        <SensorInfoCard
          title={t("informasiSensor") || "Informasi Sensor"}
          sensorCode="Load Cell Transducer (801 - 805)"
          description={t("loadcellSensor.dekripsiSensor")}>
          <div className="flex flex-wrap gap-4 mt-3">
            <div className="flex items-center justify-center">
              <img
                src="/images/information/loadcell-kaki-information.png"
                alt="loadcell-kaki"
                className="max-h-36 w-auto object-contain mix-blend-multiply"
              />
            </div>
            <div className="flex items-center justify-center">
              <img
                src="/images/information/loadcell-leher-information.png"
                alt="loadcell-leher"
                className="max-h-36 w-auto object-contain mix-blend-multiply"
              />
            </div>
          </div>
        </SensorInfoCard>

        {/* Row 1: 5 Charts */}
        {!loading && series.length > 0
          ? series.map((seriesData, index) => {
              const currentOption =
                options[index] ||
                createChartOptions(
                  sensorTypes[index] || `Loadcell ${index + 1}`,
                  sensorTypes[index] || `Loadcell ${index + 1}`,
                  seriesData?.categories || [],
                );
              return (
                <div key={index} className="col-span-full sm:col-span-2">
                  <BaseCard>
                    <div className="flex flex-col">
                      <div className="flex justify-end mb-2">
                        <LiveIndicatorBadge
                          isLive={Boolean(newDataFlags[index])}
                          label="CH-LOAD"
                        />
                      </div>
                      <ApexChart
                        options={currentOption}
                        series={seriesData.data}
                        height="150%"
                        type="line"
                      />
                    </div>
                  </BaseCard>
                </div>
              );
            })
          : Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="col-span-full sm:col-span-2">
                <BaseCard>
                  <Skeleton variant="rectangular" height={240} className="rounded-2xl" />
                </BaseCard>
              </div>
            ))}
        {/* End Row 1 */}
      </div>
    </div>
  );
};

export default LoadcellPage;

