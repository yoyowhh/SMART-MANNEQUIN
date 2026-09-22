"use strict";

const Thermal = require("../model/thermalModel");

const moment = require("moment-timezone");
const now = moment.tz(new Date(), "Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

exports.index = async (req, res) => {
  try {
    const data = await Thermal.index(parseInt(req.query.mid) || 1);
    res.json(data);
  } catch (err) {
    res.status(500).send({
      status: "failed",
      message: err?.message || "Some error occurred while retrieving thermal.",
    });
  }
};

exports.show = async (req, res) => {
  try {
    const data = await Thermal.show(
      req.params.id,
      parseInt(req.query.mid) || 1,
      parseInt(req.query.limit) || 10,
    );
    res.json(data);
  } catch (err) {
    if (err.kind === "not_found") {
      res.status(404).send({
        status: "failed",
        message: `Not found Thermal with id ${req.params.id}.`,
      });
    } else {
      res.status(500).send({
        status: "failed",
        message: `Error retrieving Thermal with id ${req.params.id}.`,
      });
    }
  }
};

exports.store = async (req, res) => {
  if (!req.body) {
    res.status(400).send({
      status: "failed",
      message: "Content can not be empty!",
    });
    return;
  }

  const thermal = new Thermal({
    value: req.body.value ?? 0,
    low_temp: req.body.low_temp ?? 0,
    center_temp: req.body.center_temp ?? 0,
    high_temp: req.body.high_temp ?? 0,
    sensor_id: req.body.sensor_id || 702,
    mannequin_id: parseInt(req.query.mid) || 1,
    inputed_at: now,
  });

  try {
    const data = await Thermal.store(thermal);
    res.json({
      status: "ok",
      message: "success input thermal data",
      data,
    });
  } catch (err) {
    res.status(500).send({
      status: "failed",
      message:
        err?.message || "Some error occurred while creating the Thermal.",
    });
  }
};
