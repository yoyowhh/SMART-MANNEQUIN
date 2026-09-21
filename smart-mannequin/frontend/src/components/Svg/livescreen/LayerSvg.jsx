const LayerSvg = ({ color = "black" }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1 16.4444L12 22L23 16.4444M1 12L12 17.5556L23 12M12 2L1 7.55556L12 13.1111L23 7.55556L12 2Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default LayerSvg;
