import React from "react";

const LinearGauge = ({
  GWidth = 100,
  GHeight = 300,
  width = 0,
  height = 0,
  value = 0,
  max = 100,
  min = 0,
}) => {
  const calcPos = () => {
    return ((-value + max) * GHeight) / max;
  };

  return (
    <svg width={GWidth} height={GHeight}>
      <defs>
        <linearGradient
          id="gradient"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
          spreadMethod="pad">
          <stop offset="0%" stopColor="#c00" stopOpacity="1"></stop>
          <stop offset="50%" stopColor="yellow" stopOpacity="1"></stop>
          <stop offset="100%" stopColor="#0c0" stopOpacity="1"></stop>
        </linearGradient>
      </defs>
      <g>
        <rect
          x="0"
          y="0"
          width={width}
          height="100%"
          fill="url(#gradient)"></rect>
      </g>
      <g>
        <line
          x1={width}
          y1={calcPos()}
          x2="0"
          y2={calcPos()}
          strokeWidth="3"
          stroke="black"></line>
      </g>
      <g>
        <circle cx={width / 2} cy={calcPos()} r="10"></circle>
      </g>
    </svg>
  );
};

export default LinearGauge;
