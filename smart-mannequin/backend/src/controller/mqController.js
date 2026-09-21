'use strict'

const Mq = require('../model/mqModel')

const moment = require('moment-timezone')
const now = moment.tz(new Date(), 'Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')

exports.index = async (req, res) => {
  try {
    const data = await Mq.index(parseInt(req.query.mid) || 1)
    res.json(data)
  } catch {
    res.status(500).send({
      status: 'failed',
      message: err?.message || 'Some error occurred while retrieving mq.',
    })
  }
}

exports.show = async (req, res) => {
  try {
    const data = await Mq.show(req.params.id, parseInt(req.query.mid) || 1)
    res.json(data)
  } catch (err) {
    if (err.kind === 'not_found') {
      res.status(404).send({
        status: 'failed',
        message: `Not found Mq with id ${req.params.id}.`,
      })
    } else {
      res.status(500).send({
        status: 'failed',
        message: `Error retrieving Mq with id ${req.params.id}.`,
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

  const mq = new Mq({
    value: req.body.value || 0,
    co: req.body.co || 0,
    co2: req.body.co2 || 0,
    nh3: req.body.nh3 || 0,
    no2: req.body.no2 || 0,
    smoke: req.body.smoke || 0,
    sensor_id: req.body.sensor_id || 101,
    mannequin_id: parseInt(req.query.mid) || 1,
    inputed_at: now,
  })

  try {
    const data = await Mq.store(mq)
    res.json({
      status: 'ok',
      message: 'success input mq data',
      data
    })
  } catch (err) {
    res.status(500).send({
      status: 'failed',
      message: err?.message || 'Some error occurred while creating the Mq.',
    })
  }
}