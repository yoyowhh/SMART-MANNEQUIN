"use strict";

const db = require("../dbconfig");

const Adxl = require("../model/adxlModel");
const Bme = require("../model/bmeModel");
const Fsr = require("../model/skinModel");
const Ky = require("../model/kyModel");
const Lidar = require("../model/lidarModel");
const Mpu = require("../model/mpuModel");
const Mq = require("../model/mqModel");
const smartskinService = require("../service/smartskinService");

const LOCATION_BY_ID = {
  1: 'right arm',
  2: 'left arm',
  3: 'back',
  4: 'right leg',
  5: 'left leg',
  6: 'right elbow',
  7: 'left elbow',
  8: 'right knee',
  9: 'left knee',
};

const SENSOR_TYPE_BY_ID = {
  1: 'temperature',
  2: 'pressure',
  3: 'vibration',
  4: 'flex',
  5: 'strain',
};

const normalizeMpuPayload = (payload = {}) => {
  if (!payload || typeof payload !== "object") return {};
  return {
    temperature: payload.temperature ?? 0,
    x_acceleration: payload.x_acceleration ?? payload.x_axis,
    y_acceleration: payload.y_acceleration ?? payload.y_axis,
    z_acceleration: payload.z_acceleration ?? payload.z_axis,
    x_kalman: payload.x_kalman ?? 0,
    y_kalman: payload.y_kalman ?? 0,
    z_kalman: payload.z_kalman ?? 0,
    x_rotation: payload.x_rotation ?? payload.gx ?? 0,
    y_rotation: payload.y_rotation ?? payload.gy ?? 0,
    z_rotation: payload.z_rotation ?? payload.gz ?? 0,
    sensor_id: 1002,
  };
};

const normalizeAdxlPayload = (payload = {}, sensorId) => {
  if (!payload || typeof payload !== "object") return null;
  return {
    x_axis: payload.x_axis ?? 0,
    y_axis: payload.y_axis ?? 0,
    z_axis: payload.z_axis ?? 0,
    x_kalman: payload.x_kalman ?? 0,
    y_kalman: payload.y_kalman ?? 0,
    z_kalman: payload.z_kalman ?? 0,
    sensor_id: sensorId,
  };
};

const checkMannequinId = async (mannequinId) => {
  const query = `SELECT * FROM mannequin WHERE id = ?`;
  const [rows] = await db.execute(query, [mannequinId]);
  return rows.length > 0;
};

exports.store = async (req, res) => {
  // ✅ Support RAK7268 dan ChirpStack
  const body =
    req.body?.uplink_message?.decoded_payload ||
    req.body?.object?.uplink_message?.decoded_payload ||
    req.body?.object ||
    req.body?.decoded_payload ||
    req.body || // ← RAK7268 sudah di-decode oleh middleware
    {};

  try {
    console.log('\x1b[36m[LoRa]\x1b[0m Raw body:', JSON.stringify(req.body || {}));
    console.log('\x1b[36m[LoRa]\x1b[0m Resolved body:', JSON.stringify(body || {}));
  } catch (e) {
    console.log('Error logging:', e?.message);
  }

  const param = req.query;
  const micro = String(body.micro ?? param.micro ?? "");
  const midValue = param.mid ?? body.mid ?? 1;

  const {
    mpuData,
    bmeData,
    soundData1,
    soundData2,
    adxlData,
    adxl345Data,
    adxlRightData,
    lidarData,
    mpu6050Data,
    mqData,
    mqData2,
    fsr1Data,
    fsr2Data,
    fsr3Data,
    fsr4Data,
    fsr5Data,
    fsr6Data,
    fsr7Data,
    fsr8Data,
  } = body;

  if (!req.body) {
    return res.status(400).send({
      status: "failed",
      message: "Payload can not be empty!",
    });
  }

  let mannequinId = 1;

  if (parseInt(midValue) > 1) {
    const isFound = await checkMannequinId(parseInt(midValue));
    if (!isFound) {
      return res.status(404).send({
        status: "failed",
        message: "Mannequin id is not found!",
      });
    }
    mannequinId = parseInt(midValue);
  }

  try {
    // ✅ Check if this is a Smart Skin Format C payload ({ m: 1, r: [...] })
    if (Array.isArray(body.r) && body.r.length > 0) {
      const mid = Number(body.m || midValue || 1);
      const readings = body.r.map((tuple) => {
        const [locId, sensorNum, typeId, val] = tuple;
        return {
          location: LOCATION_BY_ID[locId] || 'back',
          sensorNumber: sensorNum || 1,
          sensorType: SENSOR_TYPE_BY_ID[typeId] || 'temperature',
          value: Number(val) || 0,
        };
      });

      const result = await smartskinService.saveBatchReadings(readings, mid);
      return res.json({
        status: "ok",
        message: "success to store smartskin lora data",
        count: result.count,
      });
    }

    let responseData = {};

    const resolvedAdxlRightData = normalizeAdxlPayload(
      adxlRightData || adxl345Data || adxlData, 202
    );

    // micro 1 - COSMIC
    if (micro == "1") {
      const bme = new Bme({ ...bmeData, sensor_id: bmeData?.sensor_id ?? 1001, mannequin_id: mannequinId });
      const mpu = new Mpu({ ...normalizeMpuPayload(mpuData), mannequin_id: mannequinId });
      const ky1 = new Ky({ ...soundData1, sensor_id: soundData1?.sensor_id ?? 601, mannequin_id: mannequinId });
      const ky2 = new Ky({ ...soundData2, sensor_id: soundData2?.sensor_id ?? 602, mannequin_id: mannequinId });

      responseData = {
        bmeData: await Bme.store(bme),
        mpuData: await Mpu.store(mpu),
        ky1Data: await Ky.store(ky1),
        ky2Data: await Ky.store(ky2),
      };
    }

    // micro 2 - TTGO
    if (micro == "2") {
      // adxlData → tangan kiri (202), mpu6050Data → tangan kanan (201)
      const adxlLeft = resolvedAdxlRightData
        ? new Adxl({ ...resolvedAdxlRightData, mannequin_id: mannequinId })
        : null;
      const adxlRight = mpu6050Data ? new Adxl({
        x_axis: mpu6050Data.x_acceleration ?? mpu6050Data.x_axis ?? 0,
        y_axis: mpu6050Data.y_acceleration ?? mpu6050Data.y_axis ?? 0,
        z_axis: mpu6050Data.z_acceleration ?? mpu6050Data.z_axis ?? 0,
        x_kalman: mpu6050Data.x_kalman ?? 0,
        y_kalman: mpu6050Data.y_kalman ?? 0,
        z_kalman: mpu6050Data.z_kalman ?? 0,
        sensor_id: 201,
        mannequin_id: mannequinId,
      }) : null;
      const normalizedLidar = {
        value: lidarData?.value ?? lidarData?.distance ?? 0,
        kalmanvalue: lidarData?.kalmanvalue ?? 0,
        sensor_id: lidarData?.sensor_id ?? 901,
      };
      const lidar = new Lidar({ ...normalizedLidar, mannequin_id: mannequinId });
      const normalizedMq = {
        value: mqData?.value ?? 0,
        co: mqData?.co ?? 0,
        co2: mqData?.co2 ?? 0,
        nh3: mqData?.nh3 ?? mqData?.nh4 ?? 0,
        no2: mqData?.no2 ?? 0,
        smoke: mqData?.smoke ?? mqData?.raw ?? 0,
        sensor_id: mqData?.sensor_id ?? 101,
      };
      const normalizedMq2 = mqData2 ? {
        value: mqData2?.value ?? 0,
        co: mqData2?.co ?? 0,
        co2: mqData2?.co2 ?? 0,
        nh3: mqData2?.nh3 ?? mqData2?.nh4 ?? 0,
        no2: mqData2?.no2 ?? 0,
        smoke: mqData2?.smoke ?? mqData2?.smoke_level ?? mqData2?.smoke_raw ?? 0,
        sensor_id: mqData2?.sensor_id ?? 102,
      } : null;
      const mq = new Mq({ ...normalizedMq, mannequin_id: mannequinId });
      const mq2 = normalizedMq2 ? new Mq({ ...normalizedMq2, mannequin_id: mannequinId }) : null;

      responseData = {
        adxlRightData: adxlRight ? await Adxl.store(adxlRight) : null,
        adxlLeftData: adxlLeft ? await Adxl.store(adxlLeft) : null,
        lidarData: await Lidar.store(lidar),
        mqData: await Mq.store(mq),
        mqData2: mq2 ? await Mq.store(mq2) : null,
      };
    }

    // micro 3
    if (micro == "3") {
      const fsr1 = new Fsr({ ...fsr1Data, mannequin_id: mannequinId });
      const fsr2 = new Fsr({ ...fsr2Data, mannequin_id: mannequinId });
      const fsr3 = new Fsr({ ...fsr3Data, mannequin_id: mannequinId });
      const fsr4 = new Fsr({ ...fsr4Data, mannequin_id: mannequinId });
      const fsr5 = new Fsr({ ...fsr5Data, mannequin_id: mannequinId });
      const fsr6 = new Fsr({ ...fsr6Data, mannequin_id: mannequinId });
      const fsr7 = new Fsr({ ...fsr7Data, mannequin_id: mannequinId });
      const fsr8 = new Fsr({ ...fsr8Data, mannequin_id: mannequinId });

      responseData = {
        fsr1Data: await Fsr.store(fsr1),
        fsr2Data: await Fsr.store(fsr2),
        fsr3Data: await Fsr.store(fsr3),
        fsr4Data: await Fsr.store(fsr4),
        fsr5Data: await Fsr.store(fsr5),
        fsr6Data: await Fsr.store(fsr6),
        fsr7Data: await Fsr.store(fsr7),
        fsr8Data: await Fsr.store(fsr8),
      };
    }

    if (!micro || parseInt(micro) > 3) {
      return res.status(400).send({
        status: "failed",
        message: "Params 'micro' is incorrect!",
      });
    }

    res.json({
      status: "ok",
      message: "success to store lora data",
      data: { ...responseData },
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: error?.message || "Some error occurred while store lora data.",
    });
  }
};

exports.health = (req, res) => {
  const mid = Number(req.query.mid || 1);
  res.json(smartskinService.getHealth(mid));
};

exports.diagnostics = (req, res) => {
  const mid = Number(req.query.mid || 1);
  res.json({ mid, status: 'ok', health: smartskinService.getHealth(mid) });
};
