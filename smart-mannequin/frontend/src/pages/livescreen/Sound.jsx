/* eslint-disable react-hooks/rules-of-hooks */
import BaseCard from "../../components/Elements/Card";
import { useState, useEffect, useCallback } from "react";
import ApexChart from "../../components/Elements/Chart";
import {
  createChartOptions,
  processData,
  useNewDataDetector,
  getLatestData,
} from "../../helpers/utils";
import { Skeleton } from "@mui/material";
import LinearGauge from "../../components/Elements/LinearGauge";
import { useTranslation } from "react-i18next";
import { useFetchSensor } from "../../hooks/useSensor";
import { useParams } from "react-router-dom";
import HighHeartRateDialog from "../../components/Elements/AlertDialog";
import LiveIndicatorBadge from "../../components/Dashboard/LiveIndicatorBadge";
import SensorInfoCard from "../../components/Dashboard/SensorInfoCard";

const SoundSensorPage = () => {
  const { t } = useTranslation();
  const [series, setSeries] = useState([]);
  const [gaugeDataKy601, setGaugeDataKy601] = useState(0);
  const [gaugeDataKy602, setGaugeDataKy602] = useState(0);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHigh, setIsHigh] = useState(false);
  const [showHighMessage, setShowHighMessage] = useState(false);
  const [ky601IsHigh, setKy601IsHigh] = useState(false);
  const [ky602IsHigh, setKy602IsHigh] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [lastDismissedTime, setLastDismissedTime] = useState(0);

  const params = useParams();
  const mannequinId = params?.id || 1;

  const fetchAndProcessData = useCallback(async () => {
    try {
      const [ky601Response, ky602Response] = await Promise.all([
        useFetchSensor("ky", 601, mannequinId, true),
        useFetchSensor("ky", 602, mannequinId, true),
      ]);

      setLoading(false);

      const ky601Data = ky601Response.data;
      const ky602Data = ky602Response.data;

      const processedData = [
        processData(ky601Data, 601, "Sound Sensor 1", "ky"),
        processData(ky602Data, 602, "Sound Sensor 2", "ky"),
      ].filter(Boolean);

      const latestDataKy601 = getLatestData(ky601Data);
      const latestDataKy602 = getLatestData(ky602Data);

      setGaugeDataKy601(latestDataKy601?.value || 0);
      setGaugeDataKy602(latestDataKy602?.value || 0);

      const createOptions = [
        createChartOptions(
          "KY-601",
          t("soundSensor.sensorSuara1"),
          processedData[0].categories,
        ),
        createChartOptions(
          "KY-602",
          t("soundSensor.sensorSuara2"),
          processedData[1].categories,
        ),
      ];

      setKy601IsHigh(ky601Response.is_high_value);
      setKy602IsHigh(ky602Response.is_high_value);
      setOptions(createOptions);
      setSeries(processedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [mannequinId, t]);

  useEffect(() => {
    fetchAndProcessData();
    const intervalId = setInterval(fetchAndProcessData, 3000);
    return () => clearInterval(intervalId);
  }, [fetchAndProcessData]);

  useEffect(() => {
    const newIsHigh = ky601IsHigh || ky602IsHigh;
    setIsHigh(newIsHigh);
    setShowHighMessage(newIsHigh);

    if (newIsHigh) {
      const currentTime = Date.now();
      if (currentTime - lastDismissedTime > 10 * 1000) {
        // 10 seconds
        setShowDialog(true);
      }
    } else {
      setShowDialog(false);
    }
  }, [ky601IsHigh, ky602IsHigh, lastDismissedTime]);

  const handleCloseDialog = () => {
    setShowDialog(false);
    setLastDismissedTime(Date.now());
  };

  const isNewData1 = useNewDataDetector(series[0]?.data);
  const isNewData2 = useNewDataDetector(series[1]?.data);



  return (
    <div className="w-full">
      <HighHeartRateDialog isOpen={showDialog} onClose={handleCloseDialog} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
        {/* Informasi Sensor Card (Pindah ke Atas) */}
        <SensorInfoCard
          title={t("informasiSensor") || "Informasi Sensor"}
          sensorCode="KY-601 / KY-602"
          imageSrc="/images/information/sound-information.png"
          imageAlt="sound-information"
          description={t("soundSensor.deskripsiSensor")}
        />

        {/* Row 1 */}

        <div className="col-span-full sm:col-span-2">
          <BaseCard>
            <div className="flex flex-col gap-4 justify-between h-full">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 text-base">
                  {t("soundSensor.telinga-kiri")}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                  KY-602
                </span>
              </div>
              <div className="flex justify-evenly items-end w-full flex-grow">
                <div className="flex items-baseline gap-1.5 font-mono mb-4">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#00ba88]">
                    {gaugeDataKy602}
                  </span>
                  <span className="text-sm font-bold text-slate-400">dB</span>
                </div>
                <LinearGauge
                  GHeight={170}
                  GWidth={100}
                  height={150}
                  width={50}
                  max={100}
                  value={gaugeDataKy602}
                />
              </div>
            </div>
          </BaseCard>
        </div>
        <div className="col-span-full sm:col-span-2">
          <BaseCard>
            <div className="flex flex-col gap-4 justify-between h-full">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 text-base">
                  {t("soundSensor.telinga-kanan")}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                  KY-601
                </span>
              </div>
              <div className="flex justify-evenly items-end w-full flex-grow">
                <div className="flex items-baseline gap-1.5 font-mono mb-4">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#00ba88]">
                    {gaugeDataKy601}
                  </span>
                  <span className="text-sm font-bold text-slate-400">dB</span>
                </div>
                <LinearGauge
                  GHeight={170}
                  GWidth={100}
                  height={150}
                  width={50}
                  max={100}
                  value={gaugeDataKy601}
                />
              </div>
            </div>
          </BaseCard>
        </div>
        <div className="col-span-full sm:col-span-2">
          <BaseCard>
            <div className="flex flex-col gap-4 justify-between h-full">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-slate-800 text-base">
                  Heartrate Monitor
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#00ba88]">
                  PULSE
                </span>
              </div>
              <div className="relative self-center flex items-center justify-center py-4">
                <div
                  className={`absolute rounded-full ${isHigh && showHighMessage ? "bg-red-400" : "bg-emerald-400"}`}
                  style={{
                    width: "120px",
                    height: "120px",
                    animation: `heartPulse ${isHigh && showHighMessage ? "0.5s" : "1s"} ease-in-out infinite`,
                    opacity: 0.3,
                  }}
                />
                <div
                  className={`absolute rounded-full ${isHigh && showHighMessage ? "bg-red-300" : "bg-emerald-300"}`}
                  style={{
                    width: "90px",
                    height: "90px",
                    animation: `heartPulse ${isHigh && showHighMessage ? "0.5s" : "1s"} ease-in-out infinite`,
                    animationDelay: "0.1s",
                    opacity: 0.4,
                  }}
                />
                <img
                  src="/images/heart.png"
                  alt="heartrate"
                  style={{
                    width: "80px",
                    position: "relative",
                    animation: `heartBeat ${isHigh && showHighMessage ? "0.5s" : "1s"} ease-in-out infinite`,
                    filter: isHigh && showHighMessage
                      ? "drop-shadow(0 0 12px rgba(239,68,68,0.8))"
                      : "drop-shadow(0 0 8px rgba(0,186,136,0.6))",
                  }}
                />
              </div>
              <style>{`
                @keyframes heartBeat {
                  0%   { transform: scale(1); }
                  15%  { transform: scale(1.18); }
                  30%  { transform: scale(1); }
                  45%  { transform: scale(1.12); }
                  60%  { transform: scale(1); }
                  100% { transform: scale(1); }
                }
                @keyframes heartPulse {
                  0%   { transform: scale(0.8); opacity: 0.4; }
                  50%  { transform: scale(1.3); opacity: 0; }
                  100% { transform: scale(0.8); opacity: 0; }
                }
              `}</style>
              <div className="flex justify-center pb-1">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isHigh && showHighMessage
                      ? "bg-red-100 text-red-600 border border-red-200"
                      : "bg-emerald-50 text-[#00ba88] border border-emerald-200/60"
                  }`}>
                  {isHigh && showHighMessage ? t("HighHeart") : t("LowHeart")}
                </span>
              </div>
            </div>
          </BaseCard>
        </div>
        {/* End Row 1 */}

        {/* Row 2 */}
        {!loading ? (
          series.map((seriesData, index) => {
            const isNewData = index === 0 ? isNewData1 : isNewData2;
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
        ) : (
          <>
            <div className="col-span-full sm:col-span-3">
              <div className="flex gap-4">
                <BaseCard>
                  <Skeleton variant="rectangular" height={210} />
                </BaseCard>
              </div>
            </div>
            <div className="col-span-full sm:col-span-3">
              <BaseCard>
                <Skeleton variant="rectangular" height={210} />
              </BaseCard>
            </div>
          </>
        )}
        {/* End Row 2 */}
      </div>
    </div>
  );
};

export default SoundSensorPage;
