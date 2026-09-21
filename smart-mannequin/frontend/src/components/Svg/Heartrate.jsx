import * as React from "react";
const SvgHeartrate = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={800} height={800} viewBox="0 0 24 24" {...props}>
    <defs>
      <style>
        {".heartrate_svg__cls-1{fill:none;stroke:white;stroke-miterlimit:10;stroke-width:1.91px}"}
      </style>
    </defs>
    <g id="heartrate_svg__heartrate">
      <path
        d="M14.86 13h-.95l-1-1.91-1.9 3.82-1.87-4.8L7.23 13H3.41l-.33-.33A5.4 5.4 0 1 1 10.72 5L12 6.3 13.28 5a5.4 5.4 0 1 1 7.64 7.63l-.33.33L12 21.57l-5.93-5.93M15.82 12.98h1.91"
        className="heartrate_svg__cls-1"
      />
    </g>
  </svg>
);
export default SvgHeartrate;
