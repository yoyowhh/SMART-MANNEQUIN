import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import moment from "moment";
import { useState, useEffect } from "react";
import _ from "lodash";

const svgBasePath = "/svg/livescreen/";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getSvgUrl = (fileName) => `${svgBasePath}${fileName}`;

export const processData = (
  data,
  sensorId,
  sensorName,
  apiStructure,
  mannequidId,
) => {
  switch (apiStructure) {
    case "ky":
      return {
        name: sensorName,
        data: data.data.map((item) => parseFloat(item.value) || 0).reverse(),
        categories: data.data
          .map((item) =>
            new Date(item.inputed_at)
              .toISOString()
              .split(".")[0]
              .replace("T", " "),
          )
          .reverse(),
      };
    case "mq": {
      const rawData = Array.isArray(data[0]?.data?.data) ? data[0].data.data : Array.isArray(data[0]?.data) ? data[0].data : [];
      const sensor101Data = rawData.filter(
        (item) => item.sensor_id === 101,
      );

      const combinedData = sensor101Data.map((item) => ({
        smoke: parseFloat(item.smoke) || 0,
        nh3: parseFloat(item.nh3) || 0,
        co2: parseFloat(item.co2) || 0,
        co: parseFloat(item.co) || 0,
        inputed_at: item.inputed_at,
      }));

      return [
        {
          name: sensorName,
          data: [
            {
              name: "Smoke",
              data: combinedData.map((item) => item.smoke).reverse(),
            },
            {
              name: "NH3",
              data: combinedData.map((item) => item.nh3).reverse(),
            },
            {
              name: "CO2",
              data: combinedData.map((item) => item.co2).reverse(),
            },
            {
              name: "CO",
              data: combinedData.map((item) => item.co).reverse(),
            },
          ],
          categories: combinedData
            .map((item) =>
              new Date(item.inputed_at)
                .toISOString()
                .split(".")[0]
                .replace("T", " "),
            )
            .reverse(),
        },
      ];
    }
    case "mics": {
      const micsRows = Array.isArray(data?.data?.data) ? data.data.data : Array.isArray(data?.data) ? data.data : [];
      return [
        {
          name: sensorName,
          data: [
            {
              name: "CO",
              data: micsRows.map((item) => parseFloat(item.co) || 0).reverse(),
            },
            {
              name: "CO2",
              data: micsRows.map((item) => parseFloat(item.co2) || 0).reverse(),
            },
            {
              name: "NH3",
              data: micsRows.map((item) => parseFloat(item.nh3) || 0).reverse(),
            },
            {
              name: "SMOKE",
              data: micsRows.map((item) => parseFloat(item.smoke) || 0).reverse(),
            },
          ],
          categories: micsRows
            .map((item) =>
              new Date(item.inputed_at)
                .toISOString()
                .split(".")[0]
                .replace("T", " "),
            )
            .reverse(),
        },
      ];
    }
    case "thermal": {
      const thermalRows = Array.isArray(data) ? data : data?.data || [];

      return [
        {
          name: sensorName,
          data: [
            {
              name: "Center Temperature",
              data: thermalRows
                .map((item) => parseFloat(item.center_temp) || 0)
                .reverse(),
            },
            {
              name: "Low Temperature",
              data: thermalRows
                .map((item) => parseFloat(item.low_temp) || 0)
                .reverse(),
            },
            {
              name: "High Temperature",
              data: thermalRows
                .map((item) => parseFloat(item.high_temp) || 0)
                .reverse(),
            },
          ],
          categories: thermalRows
            .map((item) =>
              new Date(item.inputed_at)
                .toISOString()
                .split(".")[0]
                .replace("T", " "),
            )
            .reverse(),
        },
      ];
    }
    case "lidar":
      if (!Array.isArray(data)) {
        // Handle the case where data is not an array
        console.error("Expected 'data' to be an array, received:", typeof data);
        return { name: sensorName, data: [], categories: {} };
      }

      return {
        name: sensorName,
        data: data.map((item) => parseInt(item.value) || 0).reverse(),
        categories: data
          .map((item) => {
            try {
              const date = new Date(item.inputed_at);
              if (isNaN(date.getTime())) {
                throw new Error("Invalid date");
              }
              return date.toISOString().split(".")[0].replace("T", " ");
            } catch (error) {
              console.error("Error parsing date:", item.inputed_at, error);
              return "Invalid Date";
            }
          })
          .reverse(),
      };
    case "adxl":
      return [
        {
          name: sensorName,
          data: [
            {
              name: "X-Axis",
              data: data.data
                .map((item) => parseFloat(item.x_axis) || 0)
                .reverse(),
            },
            {
              name: "Y-Axis",
              data: data.data
                .map((item) => parseFloat(item.y_axis) || 0)
                .reverse(),
            },
            {
              name: "Z-Axis",
              data: data.data
                .map((item) => parseFloat(item.z_axis) || 0)
                .reverse(),
            },
          ],
          categories: data.data
            .map((item) =>
              new Date(item.inputed_at)
                .toISOString()
                .split(".")[0]
                .replace("T", " "),
            )
            .reverse(),
        },
      ];
    //End of Case "adxl"
    case "Wit-Acceleration":
      return [
        {
          name: sensorName,
          data: [
            {
              name: "X-Acceleration",
              data: data
                .map((item) => parseFloat(item.x_acceleration) || 0)
                .reverse(),
            },
            {
              name: "Y-Acceleration",
              data: data
                .map((item) => parseFloat(item.y_acceleration) || 0)
                .reverse(),
            },
            {
              name: "Z-Acceleration",
              data: data
                .map((item) => parseFloat(item.z_acceleration) || 0)
                .reverse(),
            },
          ],
          categories: data
            .map((item) =>
              new Date(item.inputed_at)
                .toISOString()
                .split(".")[0]
                .replace("T", " "),
            )
            .reverse(),
        },
      ];

    case "Wit-Angle":
      return [
        {
          name: sensorName,
          data: [
            {
              name: "X-Angle",
              data: data.map((item) => parseFloat(item.x_angle) || 0).reverse(),
            },
            {
              name: "Y-Angle",
              data: data.map((item) => parseFloat(item.y_angle) || 0).reverse(),
            },
            {
              name: "Z-Angle",
              data: data.map((item) => parseFloat(item.z_angle) || 0).reverse(),
            },
          ],
          categories: data
            .map((item) =>
              new Date(item.inputed_at)
                .toISOString()
                .split(".")[0]
                .replace("T", " "),
            )
            .reverse(),
        },
      ];

    case "Wit-Magnetic":
      return [
        {
          name: sensorName,
          data: [
            {
              name: "X-Magnetic",
              data: data
                .map((item) => parseFloat(item.x_magnetic) || 0)
                .reverse(),
            },
            {
              name: "Y-Magnetic",
              data: data
                .map((item) => parseFloat(item.y_magnetic) || 0)
                .reverse(),
            },
            {
              name: "Z-Magnetic",
              data: data
                .map((item) => parseFloat(item.z_magnetic) || 0)
                .reverse(),
            },
          ],
          categories: data
            .map((item) =>
              new Date(item.inputed_at)
                .toISOString()
                .split(".")[0]
                .replace("T", " "),
            )
            .reverse(),
        },
      ];

    case "Wit-Pressure":
      return [
        {
          name: sensorName,
          data: [
            {
              name: "Pressure",
              data: data
                .map((item) => parseFloat(item.pressure) || 0)
                .reverse(),
            },
          ],
          categories: data
            .map((item) =>
              new Date(item.inputed_at)
                .toISOString()
                .split(".")[0]
                .replace("T", " "),
            )
            .reverse(),
        },
      ];

    case "Wit-Quaternion":
      return [
        {
          name: sensorName,
          data: [
            {
              name: "Q0-Quaternion",
              data: data
                .map((item) => parseFloat(item.q0_quaternion) || 0)
                .reverse(),
            },
            {
              name: "Q1-Quaternion",
              data: data
                .map((item) => parseFloat(item.q1_quaternion) || 0)
                .reverse(),
            },
            {
              name: "Q2-Quaternion",
              data: data
                .map((item) => parseFloat(item.q2_quaternion) || 0)
                .reverse(),
            },
            {
              name: "Q3-Quaternion",
              data: data
                .map((item) => parseFloat(item.q3_quaternion) || 0)
                .reverse(),
            },
          ],
          categories: data
            .map((item) =>
              new Date(item.inputed_at)
                .toISOString()
                .split(".")[0]
                .replace("T", " "),
            )
            .reverse(),
        },
      ];

    case "Wit-Velocity":
      return [
        {
          name: sensorName,
          data: [
            {
              name: "X-Velocity",
              data: data
                .map((item) => parseFloat(item.x_velocity) || 0)
                .reverse(),
            },
            {
              name: "Y-Velocity",
              data: data
                .map((item) => parseFloat(item.y_velocity) || 0)
                .reverse(),
            },
            {
              name: "Z-Velocity",
              data: data
                .map((item) => parseFloat(item.z_velocity) || 0)
                .reverse(),
            },
          ],
          categories: data
            .map((item) =>
              new Date(item.inputed_at)
                .toISOString()
                .split(".")[0]
                .replace("T", " "),
            )
            .reverse(),
        },
      ];

    case "mpu":
      return [
        {
          name: sensorName,
          data: [
            {
              name: "X-Acceleration",
              data: data.data
                .map((item) => parseFloat(item.x_acceleration) || 0)
                .reverse(),
            },
            {
              name: "Y-Acceleration",
              data: data.data
                .map((item) => parseFloat(item.y_acceleration) || 0)
                .reverse(),
            },
            {
              name: "Z-Acceleration",
              data: data.data
                .map((item) => parseFloat(item.z_acceleration) || 0)
                .reverse(),
            },
          ],
          categories: data.data
            .map((item) =>
              new Date(item.inputed_at)
                .toISOString()
                .split(".")[0]
                .replace("T", " "),
            )
            .reverse(),
        },
      ];

    case "bme":
      return [
        {
          name: sensorName,
          data: data.data
            .map((item) => parseFloat(item.temperature) || 0)
            .reverse(),
          categories: data.data
            .map((item) =>
              new Date(item.inputed_at)
                .toISOString()
                .split(".")[0]
                .replace("T", " "),
            )
            .reverse(),
        },
        {
          name: sensorName,
          data: data.data
            .map((item) => parseFloat(item.humidity) || 0)
            .reverse(),
          categories: data.data
            .map((item) =>
              new Date(item.inputed_at)
                .toISOString()
                .split(".")[0]
                .replace("T", " "),
            )
            .reverse(),
        },
        {
          name: sensorName,
          data: data.data
            .map((item) => parseFloat(item.pressure) || 0)
            .reverse(),
          categories: data.data
            .map((item) =>
              new Date(item.inputed_at)
                .toISOString()
                .split(".")[0]
                .replace("T", " "),
            )
            .reverse(),
        },
        {
          name: sensorName,
          data: data.data
            .map((item) => parseFloat(item.approximate_altitude) || 0)
            .reverse(),
          categories: data.data
            .map((item) =>
              new Date(item.inputed_at)
                .toISOString()
                .split(".")[0]
                .replace("T", " "),
            )
            .reverse(),
        },
      ];

    case "loadcell": {
      const rows = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      if (sensorName === "Loadcell 1" && String(mannequidId) === "2") {
        return [
          {
            name: sensorName,
            data: [
              {
                name: "Extension",
                data: rows
                  .map((item) => parseFloat(item.extension_value) || 0)
                  .reverse(),
              },
            ],
            categories: rows
              .map((item) =>
                new Date(item.inputed_at)
                  .toISOString()
                  .split(".")[0]
                  .replace("T", " "),
              )
              .reverse(),
          },
        ];
      }

      return [
        {
          name: sensorName,
          data: [
            {
              name: "Value",
              data: rows
                .map((item) => parseFloat(item.kalmanvalue ?? item.value) || 0)
                .reverse(),
            },
          ],
          categories: rows
            .map((item) =>
              new Date(item.inputed_at)
                .toISOString()
                .split(".")[0]
                .replace("T", " "),
            )
            .reverse(),
        },
      ];
    }
    case "skin":
      return [
        {
          name: sensorName,
          data: [
            {
              name: "Depan",
              data: data.data.map((item) => item.pressure_value).reverse(),
            },
            {
              name: "Belakang",
              data: data.data.map((item) => item.force_value).reverse(),
            },
          ],
          categories: data.data
            .map((item) =>
              new Date(item.inputed_at)
                .toISOString()
                .split(".")[0]
                .replace("T", " "),
            )
            .reverse(),
        },
      ];

    default:
      return null;
  }
};
export const useNewDataDetector = (data) => {
  const [lastData, setLastData] = useState(null);
  const [isNewData, setIsNewData] = useState(false);

  useEffect(() => {
    if (lastData !== null && !_.isEqual(data, lastData)) {
      setIsNewData(true);
    } else {
      setIsNewData(false);
    }
    setLastData(data);
  }, [data, lastData]);

  return isNewData;
};

export const useWitNewDataDetector = (dataSeries) => {
  const [lastDataSeries, setLastDataSeries] = useState(null);
  const [newDataFlags, setNewDataFlags] = useState([]);

  useEffect(() => {
    if (lastDataSeries !== null) {
      const flags = dataSeries.map(
        (series, index) => !_.isEqual(series.data, lastDataSeries[index]?.data),
      );
      setNewDataFlags(flags);
    }
    setLastDataSeries(dataSeries);
  }, [dataSeries, lastDataSeries]);

  return newDataFlags;
};

export const getLatestData = (data) => {
  if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
    return data.data.reduce((prev, current) =>
      prev.event_id > current.event_id ? prev : current,
    );
  } else if (data && Array.isArray(data) && data.length > 0) {
    return data.reduce(
      (prev, current) => (prev.event_id > current.event_id ? prev : current),
      { event_id: -Infinity }, // Initial value with very low event_id
    );
  } else {
    return null;
  }
};

const formatChartTimeWIB = (value, outputFormat) => {
  if (!value) {
    return "-";
  }

  const raw = String(value).trim();
  if (!raw) {
    return "-";
  }

  // Categories are mostly built from toISOString() without timezone suffix,
  // so treat them as UTC first, then convert to WIB (+07:00).
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const parsed = moment.utc(normalized);

  if (!parsed.isValid()) {
    return raw;
  }

  return parsed.utcOffset(7).format(outputFormat);
};

export const createChartOptions = (chartId, chartTitle, categories) => ({
  chart: {
    id: chartId,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
    fontFamily: "inherit",
  },
  colors: ["#00ba88", "#0284c7", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"],
  stroke: {
    curve: "smooth",
    width: 2.5,
  },
  markers: {
    size: 0,
    hover: {
      size: 5,
    },
  },
  tooltip: {
    theme: "light",
    x: {
      show: true,
      formatter: function (value, timestamp) {
        const date = categories[timestamp.dataPointIndex];
        return formatChartTimeWIB(date, "DD MMM YYYY HH:mm:ss");
      },
    },
  },
  yaxis: {
    show: true,
    labels: {
      show: true,
      style: {
        fontSize: "11px",
        colors: "#64748b",
        fontWeight: "500",
      },
    },
  },
  xaxis: {
    categories: categories || [],
    axisBorder: {
      color: "#e2e8f0",
    },
    axisTicks: {
      color: "#e2e8f0",
    },
    labels: {
      type: "category",
      show: true,
      rotate: 0,
      style: {
        fontSize: "11px",
        colors: "#64748b",
        fontWeight: "500",
      },
      formatter: function (timestamp) {
        return formatChartTimeWIB(timestamp, "HH:mm:ss");
      },
    },
  },
  title: {
    text: chartTitle,
    align: "left",
    style: {
      fontSize: "15px",
      fontWeight: "700",
      color: "#1e293b",
      fontFamily: "inherit",
    },
  },
  grid: {
    borderColor: "#f1f5f9",
    strokeDashArray: 3,
    xaxis: {
      lines: { show: false },
    },
    yaxis: {
      lines: { show: true },
    },
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    position: "top",
    horizontalAlign: "right",
    floating: true,
    offsetY: -20,
    offsetX: -5,
    fontSize: "11px",
    fontWeight: "600",
    labels: {
      colors: "#475569",
    },
  },
  noData: {
    text: "Menunggu data telemetri...",
    align: "center",
    style: {
      color: "#94a3b8",
      fontSize: "13px",
    },
  },
});
