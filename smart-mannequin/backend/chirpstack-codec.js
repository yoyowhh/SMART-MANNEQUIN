/*
 * ChirpStack codec for Web-Manekin.
 *
 * One uplink = one micro only.
 * Use fPort to select the micro:
 * - fPort 1 -> micro 1
 * - fPort 2 -> micro 2
 * - fPort 3 -> micro 3
 *
 * Expected uplink payload format:
 * - JSON string in bytes
 * - The JSON may contain `mid`
 * - The JSON must contain only the sensor group for that micro
 */

function bytesToString(bytes) {
  return bytes
    .map(function (byte) {
      return String.fromCharCode(byte);
    })
    .join("");
}

function tryParseJson(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function normalizeMicro1(payload) {
  return {
    micro: 1,
    mid: payload.mid ?? 1,
    bmeData: payload.bmeData || null,
    mpuData: payload.mpuData || null,
    soundData1: payload.soundData1 || null,
    soundData2: payload.soundData2 || null,
  };
}

function normalizeMicro2(payload) {
  return {
    micro: 2,
    mid: payload.mid ?? 1,
    adxlData: payload.adxlData || payload.adxl345Data || null,
    adxl345Data: payload.adxl345Data || payload.adxlData || null,
    lidarData: payload.lidarData || null,
    mpu6050Data: payload.mpu6050Data || null,
    mqData: payload.mqData || null,
    mqData2: payload.mqData2 || null,
  };
}

function normalizeMicro3(payload) {
  return {
    micro: 3,
    mid: payload.mid ?? 1,
    fsr1Data: payload.fsr1Data || null,
    fsr2Data: payload.fsr2Data || null,
    fsr3Data: payload.fsr3Data || null,
    fsr4Data: payload.fsr4Data || null,
    fsr5Data: payload.fsr5Data || null,
    fsr6Data: payload.fsr6Data || null,
    fsr7Data: payload.fsr7Data || null,
    fsr8Data: payload.fsr8Data || null,
  };
}

function decodeByMicro(micro, payload) {
  if (micro === "1") {
    return normalizeMicro1(payload);
  }

  if (micro === "2") {
    return normalizeMicro2(payload);
  }

  if (micro === "3") {
    return normalizeMicro3(payload);
  }

  return {
    micro: payload.micro ?? null,
    mid: payload.mid ?? 1,
    payload: payload,
  };
}

function decodeUplink(input) {
  var rawBytes = Array.isArray(input.bytes) ? input.bytes : [];
  var rawText = bytesToString(rawBytes).trim();
  var payload = tryParseJson(rawText);
  var micro = String(input.fPort || (payload && payload.micro) || "");

  if (!payload) {
    return {
      data: {
        micro: input.fPort || null,
        raw: rawText,
      },
      warnings: ["Payload is not valid JSON. Send JSON text for this codec."],
      errors: [],
    };
  }

  return {
    data: decodeByMicro(micro, payload),
    warnings: [],
    errors: [],
  };
}

function encodeDownlink(input) {
  var payload = input.data || {};
  var json = JSON.stringify(payload);
  var bytes = [];

  for (var index = 0; index < json.length; index += 1) {
    bytes.push(json.charCodeAt(index));
  }

  return {
    bytes: bytes,
    fPort: input.fPort,
    warnings: [],
    errors: [],
  };
}
