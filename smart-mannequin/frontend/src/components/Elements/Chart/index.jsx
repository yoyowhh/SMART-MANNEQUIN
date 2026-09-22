import React from "react";
import Chart from "react-apexcharts";

const ApexChart = ({ series, options, height, type }) => {
  if (!options || !series) return null;
  const chartType = type || options?.chart?.type || "line";

  return (
    <div>
      <Chart options={options} series={series} type={chartType} height={height} />
    </div>
  );
};

export default ApexChart;
