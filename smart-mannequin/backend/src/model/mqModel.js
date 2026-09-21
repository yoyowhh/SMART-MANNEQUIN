'use strict'

const db = require('../dbconfig')
const moment = require('moment-timezone')

// constructor
const Mq = function (mq) {
  this.value = mq.value || 0
  this.co = mq.co || 0
  this.co2 = mq.co2 || 0
  this.nh3 = mq.nh3 || 0
  this.no2 = mq.no2 || 0
  this.smoke = mq.smoke || 0
  this.inputed_at = mq.inputed_at
  this.sensor_id = mq.sensor_id
  this.mannequin_id = mq.mannequin_id || 1
}

const table = 'mq2'

Mq.index = async (mannequinId) => {
  try {
    const query = `SELECT * FROM ${table} WHERE mannequin_id = ? order by event_id DESC`

    const [rows, fields] = await db.execute(query, [mannequinId])

    return {
      status: 'ok',
      message: 'success to retrieve all mq data',
      data: rows,
    }
  } catch (err) {
    console.error('Error in Mq.index:', err)
    throw err
  }
}

Mq.show = async (id, mannequinId, limit = 10) => {
  if(parseInt(id) !== 101 && parseInt(id) !== 102 && parseInt(id) !== 103){
    table = null
  }

  try {
    const safeLimit = Math.max(1, parseInt(limit) || 10);
    const query = `SELECT * FROM ${table} WHERE sensor_id = ? AND mannequin_id = ? order by event_id DESC LIMIT ${safeLimit}`
    const [rows] = await db.execute(query, [id, mannequinId])

    // if (!rows.length) {
    //   throw { kind: 'not_found' }
    // }

    return {
      status: 'ok',
      message: `success to retrieve ${table} data`,
      data: { data: rows },
    }
  } catch (err) {
    console.error('Error in Mq.show:', err)
    throw err
  }
}

Mq.store = async (newMq) => {
  if(parseInt(newMq.sensor_id) !== 101 && parseInt(newMq.sensor_id) !== 102 && parseInt(newMq.sensor_id) !== 103){
    table = null
  }

  try {
    newMq.inputed_at = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    
    // const query = `INSERT INTO ${table} (value, sensor_id) VALUES (?, ?)`
    // await db.execute(query, [newMq.value, newMq.sensor_id])

    const query = `INSERT INTO ${table} (value, co, co2, nh3, no2, smoke, sensor_id, mannequin_id, inputed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    await db.execute(query, [newMq.value, newMq.co, newMq.co2, newMq.nh3, newMq.no2, newMq.smoke, newMq.sensor_id, newMq.mannequin_id, newMq.inputed_at])

    return newMq
  } catch (err) {
    console.error('Error in Mq.store:', err)
    throw err
  }
}

module.exports = Mq
