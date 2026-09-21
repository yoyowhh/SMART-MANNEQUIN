function decodeUplink(input) {
  var bytes = input.bytes;

  function readInt16(i) {
    var v = (bytes[i] << 8) | bytes[i + 1];
    return v > 32767 ? v - 65536 : v;
  }

  return {
    data: {
      uplink_message: {
        decoded_payload: {
          micro: 3,
          mid: 1,
          fsr1Data: {
            fsr1: readInt16(0),
            sensor_id: 1101,
          },
          fsr2Data: {
            fsr2: readInt16(2),
            sensor_id: 1102,
          },
          fsr3Data: {
            fsr3: readInt16(4),
            sensor_id: 1103,
          },
          fsr4Data: {
            fsr4: readInt16(6),
            sensor_id: 1104,
          },
          fsr5Data: {
            fsr5: readInt16(8),
            sensor_id: 1105,
          },
          fsr6Data: {
            fsr6: readInt16(10),
            sensor_id: 1106,
          },
          fsr7Data: {
            fsr7: readInt16(12),
            sensor_id: 1107,
          },
          fsr8Data: {
            fsr8: readInt16(14),
            sensor_id: 1108,
          },
        },
      },
    },
  };
}
