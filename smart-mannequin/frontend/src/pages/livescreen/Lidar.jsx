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

const LidarPage = () => {
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
        const ApiLidarData = await useFetchSensor("lidar", 901, mannequinId);

        const processedData = processData(ApiLidarData, 901, "LIDAR", "lidar");
        setLoading(false);

        const createOptions = createChartOptions(
          "LIDAR-901",
          "LIDAR Perimeter Chart",
          processedData.categories,
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
          sensorCode="LiDAR TF-Mini / 3D"
          imageSrc="/images/information/lidar-information.png"
          imageAlt="lidar-information"
          description={t("lidarSensor.deskripsiSensor")}
        />

        {/* Row 1: Chart */}
        {!loading ? (
          <div className="col-span-full">
            <BaseCard>
              <div className="flex flex-col">
                <div className="flex justify-end mb-2">
                  <LiveIndicatorBadge isLive={isNewData} label="TELEMETRI JARAK" />
                </div>
                <ApexChart options={options} series={[series]} height="150%" />
              </div>
            </BaseCard>
          </div>
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

export default LidarPage;

