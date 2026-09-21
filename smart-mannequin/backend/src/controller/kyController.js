'use strict'

const Ky = require('../model/kyModel')

const moment = require('moment-timezone')
const now = moment.tz(new Date(), 'Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')

exports.index = async (req, res) => {
  try {
    const data = await Ky.index(parseInt(req.query.mid) || 1)
    res.json(data)
  } catch (err) {
    res.status(500).send({
      status: 'failed',
      message: err?.message || 'Some error occurred while retrieving ky.',
    })
  }
}

exports.show = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const data = await Ky.show(req.params.id, parseInt(req.query.mid) || 1, limit)
    res.json(data)
  } catch (err) {
    if (err.kind === 'not_found') {
      res.status(404).send({
        status: 'failed',
        message: `Not found Ky with id ${req.params.id}.`,
      })
    } else {
      res.status(500).send({
        status: 'failed',
        message: `Error retrieving Ky with id ${req.params.id}.`,
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

  const ky = new Ky({
    value: req.body.value,
    sensor_id: req.body.sensor_id,
    mannequin_id: parseInt(req.query.mid) || 1,
    inputed_at: now,
  })

  try {
    const data = await Ky.store(ky)
    res.json({
      status: 'ok',
      message: 'success input ky data',
      data
    })
  } catch (err) {
    res.status(500).send({
      status: 'failed',
      message: err?.message || 'Some error occurred while creating the Ky.',
    })
  }
}
