'use strict'

const Dht = require('../model/dhtModel')

const moment = require('moment-timezone')
const now = moment.tz(new Date(), 'Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')

exports.index = async (req, res) => {
  try {
    const data = await Dht.index()
    res.json(data)
  } catch (err) {
    res.status(500).send({
      status: 'failed',
      message: err?.message || 'Some error occurred while retrieving dht.',
    })
  }
}

exports.show = async (req, res) => {
  try {
    const data = await Dht.show(req.params.id)
    res.json(data)
  } catch (err) {
    if (err.kind === 'not_found') {
      res.status(404).send({
        status: 'failed',
        message: `Not found Dht with id ${req.params.id}.`,
      })
    } else {
      res.status(500).send({
        status: 'failed',
        message: `Error retrieving Dht with id ${req.params.id}.`,
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

  const dht = new Dht({
    temperature: req.body.temperature,
    humidity: req.body.humidity,
    sensor_id: req.body.sensor_id,
    inputed_at: now,
  })

  try {
    const data = await Dht.store(dht)
    res.json(data)
  } catch (err) {
    res.status(500).send({
      status: 'failed',
      message: err?.message || 'Some error occurred while creating the Dht.',
    })
  }
}