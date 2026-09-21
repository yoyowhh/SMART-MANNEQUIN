import * as React from "react";
const SvgVibration = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={800}
    height={800}
    fill="none"
    viewBox="0 0 48 48"
    {...props}
  >
    <path
      stroke="white"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={4}
      fill="none"
      d="M6 14v-2a6 6 0 0 1 6-6h24a6 6 0 0 1 6 6v2M32 18v12M40 20v8M24 15v18M16 18v12M8 20v8M6 34v2a6 6 0 0 0 6 6h24a6 6 0 0 0 6-6v-2"
    />
  </svg>
);
export default SvgVibration;
