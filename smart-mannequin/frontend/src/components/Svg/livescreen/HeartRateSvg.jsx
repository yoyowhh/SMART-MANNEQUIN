const HeartRateSvg = ({ color = "black" }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15.9395 18.7315C14.5265 19.8191 13.112 20.6125 12 21C8.5 19.7803 2 14.5364 2 8.76822C2 5.58259 4.4625 3 7.5 3C9.36 3 11.005 3.96854 12 5.45097C12.5072 4.69334 13.1809 4.07503 13.9642 3.64839C14.7475 3.22175 15.6174 2.99935 16.5 3C19.5375 3 22 5.58259 22 8.76822C22 9.68432 21.836 10.5868 21.5465 11.462M13.5 14.5364H15.5L17 12.4389L18.5 16.634L19.981 14.5364H22"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default HeartRateSvg;
