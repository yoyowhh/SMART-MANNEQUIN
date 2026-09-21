import React from "react";
import Chart from "react-apexcharts";

const ApexChart = ({ series, options, height }) => {
  return (
    <div>
      <Chart options={options} series={series} type="line" height={height} />
    </div>
  );
};

export default ApexChart;
