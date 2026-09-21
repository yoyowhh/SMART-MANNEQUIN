'use strict'

const Adxl = require('../model/adxlModel');

const moment = require('moment-timezone')
const now = moment.tz(new Date(), 'Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')

exports.index = async (req, res) => {
  try {
    const data = await Adxl.index(parseInt(req.query.mid) || 1);
    res.json(data);
  } catch (err) {
    res.status(500).send({
      status: 'failed',
      message: err?.message || 'Some error occurred while retrieving adxl.',
    });
  }
}

exports.show = async (req, res) => {
  try {
    const data = await Adxl.show(req.params.id, parseInt(req.query.mid) || 1);
    res.json(data);
  } catch (err) {
    if (err.kind === 'not_found') {
      res.status(404).send({
        status: 'failed',
        message: `Not found Adxl with id ${req.params.id}.`,
      });
    } else {
      res.status(500).send({
        status: 'failed',
        message: `Error retrieving Adxl with id ${req.params.id}.`,
      });
    }
  }
};

exports.store = async (req, res) => {
  if (!req.body) {
    res.status(400).send({
      status: 'failed',
      message: 'Content can not be empty!',
    });
    return;
  }

  const adxl = new Adxl({
    x_axis: req.body.x_axis,
    y_axis: req.body.y_axis,
    z_axis: req.body.z_axis,
    x_kalman: req.body.x_kalman,
    y_kalman: req.body.y_kalman,
    z_kalman: req.body.z_kalman,
    sensor_id: req.body.sensor_id,
    mannequin_id: parseInt(req.query.mid) || 1,
    inputed_at: now,
  });

  try {
    const data = await Adxl.store(adxl);
    res.json({
      status: 'ok',
      message: 'success input adxl data',
      data
    });
  } catch (err) {
    res.status(500).send({
      status: 'failed',
      message: err.message || 'Some error occurred while creating the Adxl.',
    });
  }
};
