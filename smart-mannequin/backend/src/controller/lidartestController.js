'use strict'

const Lidar = require('../model/lidartestModel')

const moment = require('moment-timezone')
const now = moment.tz(new Date(), 'Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')

exports.index = async (req, res) => {
  try {
    const data = await Lidar.index()
    res.json(data)
  } catch (err) {
    res.status(500).send({
      status: 'failed',
      // message: err?.message || 'Some error occurred while retrieving lidar.',
      message: err?.message,
    })
  }
}

exports.show = async (req, res) => {
  try {
    const data = await Lidar.show(req.params.id)
    res.json(data)
  } catch (err) {
    if (err.kind === 'not_found') {
      res.status(404).send({
        status: 'failed',
        message: `Not found Lidar with id ${req.params.id}.`,
      })
    } else {
      res.status(500).send({
        status: 'failed',
        message: `Error retrieving Lidar with id ${req.params.id}.`,
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

  const lidar = new Lidar({
    value: req.body.value,
    sensor_id: req.body.sensor_id || 902,
    inputed_at: now,
  })

  try {
    const data = await Lidar.store(lidar)
    res.json({
      status: 'ok',
      message: 'success input lidar data',
      data
    })
  } catch (err) {
    res.status(500).send({
      status: 'failed',
      // message: err?.message || 'Some error occurred while retrieving lidar.',
      message: err?.message,
    })
  }
}
