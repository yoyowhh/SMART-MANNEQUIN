"use strict";

const Mpu = require("../model/mpuModel");

const moment = require("moment-timezone");
const now = moment.tz(new Date(), "Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

exports.index = async (req, res) => {
  try {
    const data = await Mpu.index(parseInt(req.query.mid) || 1);
    res.json(data);
  } catch (err) {
    res.status(500).send({
      status: "failed",
      message: err?.message || "Some error occurred while retrieving mpu.",
    });
  }
};

exports.show = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await Mpu.show(req.params.id, parseInt(req.query.mid) || 1, limit);
    res.json(data);
  } catch (err) {
    if (err.kind === "not_found") {
      res.status(404).send({
        status: "failed",
        message: `Not found Mpu with id ${req.params.id}.`,
      });
    } else {
      res.status(500).send({
        status: "failed",
        message: `Error retrieving Mpu with id ${req.params.id}.`,
      });
    }
  }
};

exports.store = async (req, res) => {
  const body = req.body;
  const isLora = !!req.query.lora;
  const loraData = isLora && body.uplink_message.decoded_payload.mpuData;

  if (!req.body) {
    res.status(400).send({
      status: "failed",
      message: "Content can not be empty!",
    });
    return;
  }

  const mpu = new Mpu(
    isLora
      ? loraData
      : {
          temperature: req.body.temperature,
          x_acceleration: req.body.x_acceleration,
          y_acceleration: req.body.y_acceleration,
          z_acceleration: req.body.z_acceleration,
          x_kalman: req.body.x_kalman,
          y_kalman: req.body.y_kalman,
          z_kalman: req.body.z_kalman,
          x_rotation: req.body.x_rotation,
          y_rotation: req.body.y_rotation,
          z_rotation: req.body.z_rotation,
          sensor_id: req.body.sensor_id || 1002,
          mannequin_id: parseInt(req.query.mid) || 1,
          inputed_at: now,
        },
  );

  try {
    const data = await Mpu.store(mpu);
    res.json({
      status: "ok",
      message: "success input mpu data",
      data,
    });
  } catch (err) {
    res.status(500).send({
      status: "failed",
      message: err?.message || "Some error occurred while creating the Mpu.",
    });
  }
};
