'use strict'

const Skin = require('../model/skinModel')

const moment = require('moment-timezone')
const now = moment.tz(new Date(), 'Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')

exports.index = async (req, res) => {
  try {
    const data = await Skin.index(parseInt(req.query.mid) || 1)
    res.json(data)
  } catch (err) {
    res.status(500).send({
      status: 'failed',
      message: err?.message || 'Some error occurred while retrieving Skin.',
    })
  }
}

exports.show = async (req, res) => {
  try {
    const data = await Skin.show(req.params.id, parseInt(req.query.mid) || 1)
    res.json(data)
  } catch (err) {
    if (err.kind === 'not_found') {
      res.status(404).send({
        status: 'failed',
        message: `Not found Skin with id ${req.params.id}.`,
      })
    } else {
      res.status(500).send({
        status: 'failed',
        message: `Error retrieving Skin with id ${req.params.id}.`,
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

  const skin = new Skin({
    value: req.body.value,
    pressure_value : req.body.pressure_value,
    force_value : req.body.force_value,
    sensor_id: req.body.sensor_id,
    mannequin_id: parseInt(req.query.mid) || 1,
    inputed_at: now,
  })

  try {
    const data = await Skin.store(skin)
    res.json({
      status: 'ok',
      message: 'success input skin data',
      data
    })
  } catch (err) {
    res.status(500).send({
      status: 'failed',
      message: err?.message || 'Some error occurred while creating the skin.',
    })
  }
}
