"use strict";

const Loadcell = require("../model/loadcellModel");

const moment = require("moment-timezone");
const now = moment.tz(new Date(), "Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

exports.index = async (req, res) => {
  try {
    // const data = await Loadcell.index(parseInt(req.query.mid) || 1);
    // res.json(data);
    res.status(400).send({
      status: "failed",
      message: "Please use sensor id route to get the loadcell data",
    })
  } catch (err) {
    res.status(500).send({
      status: "failed",
      message: err?.message || "Some error occurred while retrieving loadcell.",
    });
  }
};

exports.show = async (req, res) => {
  try {
    const data = await Loadcell.show(
      req.params.id,
      parseInt(req.query.mid) || 1,
    );
    res.json(data);
  } catch (err) {
    if (err.kind === "not_found") {
      res.status(404).send({
        status: "failed",
        message: `Not found Loadcell with id ${req.params.id}.`,
      });
    } else {
      res.status(500).send({
        status: "failed",
        message: `Error retrieving Loadcell with id ${req.params.id}.`,
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

  const loadcell = new Loadcell({
    value: req.body.value,
    kalmanvalue: req.body.kalmanvalue,
    sensor_id: req.body.sensor_id,
    mannequin_id: parseInt(req.query.mid) || 1,
    lateral_value: req.body.lateral,
    extension_value: req.body.extension,
    flexion_value: req.body.flexion,
    inputed_at: now,
  });

  try {
    const data = await Loadcell.store(loadcell);
    res.json({
      status: "ok",
      message: "success input loadcell data",
      data,
    });
  } catch (err) {
    res.status(500).send({
      status: "failed",
      message:
        err?.message || "Some error occurred while creating the Loadcell.",
    });
  }
};
