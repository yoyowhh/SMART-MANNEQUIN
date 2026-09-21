import BaseCard from "../../components/Elements/Card";
import { useState, useEffect } from "react";
import ApexChart from "../../components/Elements/Chart";
import { fetchData } from "../../service/api";
import {
  ApiWitAcceleration,
  ApiWitMagnetic,
  ApiWitQuaternion,
  ApiWitVelocity,
  ApiWitPressure,
  ApiWitAngle,
} from "../../service/list_api";
import {
  createChartOptions,
  processData,
  useWitNewDataDetector,
} from "../../helpers/utils";
import { Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import LiveIndicatorBadge from "../../components/Dashboard/LiveIndicatorBadge";
import SensorInfoCard from "../../components/Dashboard/SensorInfoCard";

const WitPage = () => {
  const [series, setSeries] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const newDataFlags = useWitNewDataDetector(series);

  useEffect(() => {
    let intervalId;

    const fetchAndProcessData = async () => {
      try {
        const [
          ApiWitAccelerationData,
          ApiWitAngleData,
          ApiWitMagneticData,
          ApiWitPressureData,
          ApiWitQuaternionData,
          ApiWitVelocityData,
        ] = await Promise.all([
          fetchData(ApiWitAcceleration),
          fetchData(ApiWitAngle),
          fetchData(ApiWitMagnetic),
          fetchData(ApiWitPressure),
          fetchData(ApiWitQuaternion),
          fetchData(ApiWitVelocity),
        ]);

        const processedData = [
          ...processData(
            ApiWitAccelerationData,
            null,
            t("witmotionSensor.witAccel"),
            "Wit-Acceleration",
          ),
          ...processData(
            ApiWitAngleData,
            null,
            t("witmotionSensor.witAngle"),
            "Wit-Angle",
          ),
          ...processData(
            ApiWitMagneticData,
            null,
            t("witmotionSensor.witMagnetic"),
            "Wit-Magnetic",
          ),
          ...processData(
            ApiWitPressureData,
            null,
            t("witmotionSensor.witPressure"),
            "Wit-Pressure",
          ),
          ...processData(
            ApiWitQuaternionData,
            null,
            t("witmotionSensor.witQuaternion"),
            "Wit-Quaternion",
          ),
          ...processData(
            ApiWitVelocityData,
            null,
            t("witmotionSensor.witVelocity"),
            "Wit-Velocity",
          ),
        ].filter(Boolean);

        setLoading(false);

        const createOptions = processedData.map((data) =>
          createChartOptions(
            data.name.split(" ")[0], // Extracting the sensor type
            data.name, // Using the full name for title
            data.categories,
          ),
        );

        setOptions(createOptions);
        setSeries(processedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAndProcessData();
    intervalId = setInterval(fetchAndProcessData, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
        {/* Informasi Sensor Card (Pindah ke Atas) */}
        <SensorInfoCard
          title={t("informasiSensor", "Informasi Sensor")}
          sensorCode="WIT-MOTION / WT901 9-AXIS IMU"
          imageSrc="/images/information/witsensor-information.png"
          imageAlt="Wit Motion Sensor Information"
          description={t("witmotionSensor.deskripsiSensor")}
        />

        {/* Row 1: Telemetry Charts */}
        {!loading
          ? series.map((seriesData, index) => (
              <div key={index} className="col-span-full sm:col-span-3">
                <BaseCard>
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-700">
                        {seriesData.name}
                      </span>
                      <LiveIndicatorBadge
                        isActive={newDataFlags[index]}
                        label={newDataFlags[index] ? "Live Stream" : "Standby"}
                      />
                    </div>
                    <ApexChart
                      options={options[index]}
                      series={seriesData.data}
                      height="150%"
                    />
                  </div>
                </BaseCard>
              </div>
            ))
          : // Create a skeleton using for loop
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="col-span-full sm:col-span-3">
                <BaseCard>
                  <Skeleton variant="rectangular" height={210} className="rounded-2xl" />
                </BaseCard>
              </div>
            ))}
        {/* End Row 1 */}
      </div>
    </div>
  );
};

export default WitPage;
