import React, { useEffect, useRef, useState } from "react";

const ThermalDataViewer = () => {
  const [thermalData, setThermalData] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetch("https://senate-nappy-calibrate.ngrok-free.dev/thermal_data")
      .then((response) => response.json())
      .then((data) => setThermalData(data))
      .catch((error) => console.error("Error fetching thermal data:", error));
  }, []);

  useEffect(() => {
    if (thermalData.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const blockSize = 10; // Size of each block representing a temperature value

      thermalData.forEach((row, rowIndex) => {
        row.forEach((temp, colIndex) => {
          ctx.fillStyle = `hsl(${Math.min(temp, 120)}, 100%, 50%)`; // Example color mapping
          ctx.fillRect(
            colIndex * blockSize,
            rowIndex * blockSize,
            blockSize,
            blockSize,
          );
        });
      });
    }
  }, [thermalData]);

  return (
    <div>
      <h2>Thermal Data</h2>
      <canvas ref={canvasRef} width="640" height="480"></canvas>
    </div>
  );
};

export default ThermalDataViewer;
