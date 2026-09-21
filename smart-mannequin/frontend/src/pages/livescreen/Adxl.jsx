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
import { useFetchSensor } from "../../hooks/useSensor";
import { useParams } from "react-router-dom";
import LiveIndicatorBadge from "../../components/Dashboard/LiveIndicatorBadge";
import SensorInfoCard from "../../components/Dashboard/SensorInfoCard";

const AdxlPage = () => {
  const [series, setSeries] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const params = useParams();
  const mannequinId = params?.id || 1;

  useEffect(() => {
    let intervalId;

    const fetchAndProcessData = async () => {
      try {
        const [Adxl201Data, Adxl202Data] = await Promise.all([
          useFetchSensor("adxl", 201, mannequinId),
          useFetchSensor("adxl", 202, mannequinId),
        ]);

        setLoading(false);

        const processedData = [
          ...processData(Adxl201Data, 201, "Tangan Kanan", "adxl"),
          ...processData(Adxl202Data, 202, "Tangan Kiri", "adxl"),
        ].filter(Boolean);

        const createOptions = [
          createChartOptions(
            "Adxl-201",
            t("adxlSensor.tanganKanan"),
            processedData[0].categories,
          ),
          createChartOptions(
            "Adxl-202",
            t("adxlSensor.tanganKiri"),
            processedData[1].categories,
          ),
        ];

        setOptions(createOptions);
        setSeries(processedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAndProcessData();
    intervalId = setInterval(fetchAndProcessData, 3000);

    return () => clearInterval(intervalId);
  }, [mannequinId, t]);

  const isNewData1 = useNewDataDetector(series[0]?.data);
  const isNewData2 = useNewDataDetector(series[1]?.data);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
        {/* Informasi Sensor Card (Pindah ke Atas) */}
        <SensorInfoCard
          title={t("informasiSensor") || "Informasi Sensor"}
          sensorCode="ADXL345 Triple-Axis Accelerometer"
          imageSrc="/images/information/adxl-information.png"
          imageAlt="adxl-information"
          description={t("adxlSensor.dekripsiSensor")}
        />

        {/* Row 1: Charts */}
        {!loading ? (
          series.map((seriesData, index) => {
            const isNewData = index === 0 ? isNewData1 : isNewData2;
            return (
              <div key={index} className="col-span-full sm:col-span-3">
                <BaseCard>
                  <div className="flex flex-col">
                    <div className="flex justify-end mb-2">
                      <LiveIndicatorBadge isLive={isNewData} label="TELEMETRI G-FORCE" />
                    </div>
                    <ApexChart
                      options={options[index]}
                      series={seriesData.data}
                      height="150%"
                    />
                  </div>
                </BaseCard>
              </div>
            );
          })
        ) : (
          <>
            <div className="col-span-full sm:col-span-3">
              <BaseCard>
                <Skeleton variant="rectangular" height={260} className="rounded-2xl" />
              </BaseCard>
            </div>
            <div className="col-span-full sm:col-span-3">
              <BaseCard>
                <Skeleton variant="rectangular" height={260} className="rounded-2xl" />
              </BaseCard>
            </div>
          </>
        )}
        {/* End Row 1 */}
      </div>
    </div>
  );
};

export default AdxlPage;

