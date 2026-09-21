'use strict'

const Witsensor = require('../model/witModel')

const moment = require('moment-timezone')
const now = moment.tz(new Date(), 'Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')

exports.index = async (req, res) => {
  try {
    const data = await Witsensor.index(parseInt(req.query.mid) || 1)
    res.json({  
      status: 'ok',
      message: 'success',
      data
    })
  } catch (err) {
    res.status(500).send({
      status: 'failed',
      message: err?.message || 'Some error occurred while retrieving wit.',
    })
  }
}

exports.show = async (req, res) => {
  try {
    const data = await Witsensor.show(req.params.id, parseInt(req.query.mid) || 1)
    res.json({
      status: 'ok',
      message: 'success',
      data
    })
  } catch (err) {
    if (err.kind === 'not_found') {
      res.status(404).send({
        status: 'failed',
        message: `Not found Witsensor with id ${req.params.id}.`,
      })
    } else {
      res.status(500).send({
        status: 'failed',
        message: `Error retrieving Witsensor with id ${req.params.id}.`,
      })
    }
  }
}

exports.store = async (req, res) => {
  if (!req.body) {
    res.status(400).send({
      status: 'failed',
      message: 'Content can not be empty!',
    })
    return
  }

  const witsensor = new Witsensor({
    x_acc: req.body.x_acc,
    y_acc: req.body.y_acc,
    z_acc: req.body.z_acc,
    a_acc: req.body.a_acc,
    x_vel: req.body.x_vel,
    y_vel: req.body.y_vel,
    z_vel: req.body.z_vel,
    w_vel: req.body.w_vel,
    x_angle: req.body.x_angle,
    y_angle: req.body.y_angle,
    z_angle: req.body.z_angle,
    x_mag: req.body.x_mag,
    y_mag: req.body.y_mag,
    z_mag: req.body.z_mag,
    h_mag: req.body.h_mag,
    pressure: req.body.pressure,
    height: req.body.height,
    q0: req.body.q0,
    q1: req.body.q1,
    q2: req.body.q2,
    q3: req.body.q3,
    inputed_at: now,
    sensor_id: req.body.sensor_id || 1010,
    mannequin_id: parseInt(req.query.mid) || 1,
  })

  try {
    const data = await Witsensor.store(witsensor)
    res.json({
      status: 'ok',
      message: 'success input witsensor data',
      data
    })
  } catch (err) {
    res.status(500).send({
      status: 'failed',
      message: err?.message || 'Some error occurred while creating the Witsensor.',
    })
  }
}

exports.getAcc = async (req, res) => {
  try {
    const data = await Witsensor.getAcc()

    res.json({
      status: 'ok',
      message: 'success',
      data
    })
  } catch (err) {
    res.status(500).send({
      status: 'failed',
      message: err?.message || 'Some error occurred while retrieving wit.',
    })
  }
}

exports.getVelo = async (req, res) => {
  try {
    const data = await Witsensor.getVelo()

    res.json({
      status: 'ok',
      message: 'success',
      data
    })
  } catch (err) {
    res.status(500).send({
      status: 'failed',
      message: err?.message || 'Some error occurred while retrieving wit.',
    })
  }
}

exports.getAngle = async (req, res) => {
  try {
    const data = await Witsensor.getAngle()

    res.json({
      status: 'ok',
      message: 'success',
      data
    })
  } catch (err) {
    res.status(500).send({
      status: 'failed',
      message: err?.message || 'Some error occurred while retrieving wit.',
    })
  }
}

exports.getMag = async (req, res) => {
  try {
    const data = await Witsensor.getMag()

    res.json({
      status: 'ok',
      message: 'success',
      data
    })
  } catch (err) {
    res.status(500).send({
      status: 'failed',
      message: err?.message || 'Some error occurred while retrieving wit.',
    })
  }
}


exports.getQ = async (req, res) => {
  try {
    const data = await Witsensor.getQ()

    res.json({
      status: 'ok',
      message: 'success',
      data
    })
  } catch (err) {
    res.status(500).send({
      status: 'failed',
      message: err?.message || 'Some error occurred while retrieving wit.',
    })
  }
}

exports.getPressure = async (req, res) => {
  try {
    const data = await Witsensor.getPressure()

    res.json({
      status: 'ok',
      message: 'success',
      data
    })
  } catch (err) {
    res.status(500).send({
      status: 'failed',
      message: err?.message || 'Some error occurred while retrieving wit.',
    })
  }
}