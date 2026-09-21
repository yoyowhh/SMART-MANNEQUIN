import * as React from "react";
const SvgTemperature = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 16a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0 0v-4m0 5 .007.007M16 17a4 4 0 1 1-7-2.646V6a3 3 0 1 1 6 0v8.354c.622.705 1 1.631 1 2.646Z"
    />
  </svg>
);
export default SvgTemperature;
