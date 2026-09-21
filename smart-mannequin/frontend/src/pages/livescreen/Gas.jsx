/* eslint-disable react-hooks/rules-of-hooks */
import BaseCard from "../../components/Elements/Card";
import { useState, useEffect } from "react";
import ApexChart from "../../components/Elements/Chart";
import {
  createChartOptions,
  processData,
  useNewDataDetector,
} from "../../helpers/utils";
import { Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useFetchSensor } from "../../hooks/useSensor";
import LiveIndicatorBadge from "../../components/Dashboard/LiveIndicatorBadge";
import SensorInfoCard from "../../components/Dashboard/SensorInfoCard";

const GasPage = () => {
  const [series, setSeries] = useState([]);

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();

  const params = useParams();
  const mannequinId = params?.id || 1;

  useEffect(() => {
    let intervalId;

    const FetchAndProcessData = async () => {
      try {
        // Ambil data sensor 103 saja untuk mannequinId 1
        const [fetchSensorData1, fetchSensorData2, fetchSensorData3] = await Promise.all([
          useFetchSensor("mq", 101, mannequinId, true),
          useFetchSensor("mq", 102, mannequinId, true),
          useFetchSensor("mq", 103, mannequinId, true),
        ]);

        let apiData;
        let apiStructure;
        let sensorIdForChart;

        if (String(mannequinId) === "1") {
          // default for mannequin 1: use sensor 101 and 102 (legacy)
          apiData = await Promise.all([fetchSensorData1, fetchSensorData2]);
          apiStructure = "mq";
          sensorIdForChart = 101;
        } else if (String(mannequinId) === "2") {
          // mannequin 2 uses mics/103
          apiData = await fetchSensorData3;
          apiStructure = "mics";
          sensorIdForChart = 103;
        } else {
          apiData = await Promise.all([fetchSensorData1, fetchSensorData2]);
          apiStructure = "mq";
          sensorIdForChart = 101;
        }

        const processedData = processData(
          apiData,
          sensorIdForChart,
          "Gas Sensor",
          apiStructure,
        );

        setLoading(false);

        const createOptions = createChartOptions(
          "MQ-103",
          "Gas Chart",
          processedData[0].categories,
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

  const isNewData = useNewDataDetector(series[0]?.data);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
        {/* Informasi Sensor Card (Pindah ke Atas) */}
        <SensorInfoCard
          title={t("informasiSensor") || "Informasi Sensor"}
          sensorCode="MQ-2 / MiCS-6814"
          imageSrc="/images/information/gas-information.png"
          imageAlt="mq2-information"
          description={t("gasSensor.deskripsiSensor")}
        />

        {/* Row 1: Charts */}
        {!loading ? (
          series.map((seriesData) => {
            return (
              <div key={seriesData.name || "gas-chart"} className="col-span-full">
                <BaseCard>
                  <div className="flex flex-col">
                    <div className="flex justify-end mb-2">
                      <LiveIndicatorBadge isLive={isNewData} label="TELEMETRI GAS" />
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

      </div>
    </div>
  );
};

export default GasPage;

