'use strict'

const Bme = require('../model/bmeModel')

const moment = require('moment-timezone')
const now = moment.tz(new Date(), 'Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')

exports.index = async (req, res) => {
  try {
    const data = await Bme.index(parseInt(req.query.mid) || 1)
    res.json(data)
  } catch (err) {
    res.status(500).send({
      status: 'failed',
      message: err?.message || 'Some error occurred while retrieving bme.',
    })
  }
}

exports.show = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const data = await Bme.show(req.params.id, parseInt(req.query.mid) || 1, limit)
    res.json(data)
  } catch (err) {
    if (err.kind === 'not_found') {
      res.status(404).send({
        status: 'failed',
        message: `Not found Bme with id ${req.params.id}.`,
      })
    } else {
      res.status(500).send({
        status: 'failed',
        message: `Error retrieving Bme with id ${req.params.id}.`,
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

  const bme = new Bme({
    temperature: req.body.temperature,
    humidity: req.body.humidity,
    pressure: req.body.pressure,
    approximate_altitude: req.body.approximate_altitude,
    sensor_id: req.body.sensor_id || 1001,
    mannequin_id: parseInt(req.query.mid) || 1,
    inputed_at: now,
  })

  try {
    const data = await Bme.store(bme)
    res.json({
      status: 'ok',
      message: 'success input bme data',
      data
    })
  } catch (err) {
    res.status(500).send({
      status: 'failed',
      message: err?.message || 'Some error occurred while creating the Bme.',
    })
  }
}