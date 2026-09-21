function decodeUplink(input) {
  var bytes = Array.isArray(input.bytes) ? input.bytes : [];

  if (bytes.length < 38) {
    return {
      data: {
        micro: 2,
        mid: 1,
      },
      errors: ["Invalid payload length: expected at least 38 bytes"],
    };
  }

  function readInt16(i) {
    var v = (bytes[i] << 8) | bytes[i + 1];
    return v > 32767 ? v - 65536 : v;
  }

  return {
    data: {
      micro: 2,
      mid: 1,
      adxlRightData: {
        x_axis: readInt16(0) / 100.0,
        y_axis: readInt16(2) / 100.0,
        z_axis: readInt16(4) / 100.0,
        x_kalman: readInt16(6) / 100.0,
        y_kalman: readInt16(8) / 100.0,
        z_kalman: readInt16(10) / 100.0,
        sensor_id: 201,
      },
      adxlLeftData: {
        x_axis: readInt16(0) / 100.0,
        y_axis: readInt16(2) / 100.0,
        z_axis: readInt16(4) / 100.0,
        x_kalman: readInt16(6) / 100.0,
        y_kalman: readInt16(8) / 100.0,
        z_kalman: readInt16(10) / 100.0,
        sensor_id: 202,
      },
      lidarData: {
        value: readInt16(12),
        kalmanvalue: readInt16(14),
        sensor_id: 901,
      },
      mpu6050Data: {
        temperature: readInt16(16) / 100.0,
        x_axis: readInt16(18) / 100.0,
        y_axis: readInt16(20) / 100.0,
        z_axis: readInt16(22) / 100.0,
        x_kalman: readInt16(24) / 100.0,
        y_kalman: readInt16(26) / 100.0,
        z_kalman: readInt16(28) / 100.0,
        gx: readInt16(30) / 100.0,
        gy: readInt16(32) / 100.0,
        gz: readInt16(34) / 100.0,
        sensor_id: 1002,
      },
      mqData: {
        value: readInt16(36),
        sensor_id: 101,
      },
    },
  };
}
