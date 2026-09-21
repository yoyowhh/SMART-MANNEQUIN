'use strict'

const db = require('../dbconfig')
const moment = require('moment-timezone')

// constructor
const Mpu = function (mpu) {
  this.temperature = mpu.temperature
  this.x_acceleration = mpu.x_acceleration
  this.y_acceleration = mpu.y_acceleration
  this.z_acceleration = mpu.z_acceleration
  this.x_kalman = mpu.x_kalman
  this.y_kalman = mpu.y_kalman
  this.z_kalman = mpu.z_kalman
  this.x_rotation = mpu.x_rotation
  this.y_rotation = mpu.y_rotation
  this.z_rotation = mpu.z_rotation
  this.inputed_at = mpu.inputed_at
  this.sensor_id = mpu.sensor_id
  this.mannequin_id = mpu.mannequin_id || 1
}

const table = 'mpu6050'

Mpu.index = async (mannequinId) => {
  try {
    const query = `SELECT * FROM ${table} WHERE mannequin_id = ? order by event_id DESC`

    const [rows, fields] = await db.execute(query, [mannequinId])

    return {
      status: 'ok',
      message: 'success',
      data: rows,
    }
  } catch (err) {
    console.error('Error in Mpu.index:', err)
    throw err
  }
}

Mpu.show = async (id, mannequinId) => {
  if(parseInt(id) !== 1002) {
    table = null
  }

  try {
    const query = `SELECT * FROM ${table} WHERE mannequin_id = ? order by event_id DESC LIMIT 10`
    const [rows, fields] = await db.execute(query, [mannequinId])

    // if (!rows.length) {
    //   throw { kind: 'not_found' }
    // }

    return {
      status: 'ok',
      message: 'success',
      data: { data: rows },
    }
  } catch (err) {
    console.error('Error in Mpu.show:', err)
    throw err
  }
}

Mpu.store = async (newMpu) => {
  if(parseInt(newMpu.sensor_id) !== 1002) {
    throw { kind: 'mpu not found' }
  }

  try {
    newMpu.inputed_at = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    const query = `
      INSERT INTO ${table}
      (temperature, x_acceleration, y_acceleration, z_acceleration, x_kalman, y_kalman, z_kalman, x_rotation, y_rotation, z_rotation, sensor_id, mannequin_id, inputed_at)
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

    await db.execute(query, [
      newMpu.temperature,
      newMpu.x_acceleration,
      newMpu.y_acceleration,
      newMpu.z_acceleration,
      newMpu.x_kalman,
      newMpu.y_kalman,
      newMpu.z_kalman,
      newMpu.x_rotation,
      newMpu.y_rotation,
      newMpu.z_rotation,
      newMpu.sensor_id,
      newMpu.mannequin_id,
      newMpu.inputed_at
    ])

    return newMpu
  } catch (err) {
    console.error('Error in Mpu.store:', err)
    throw err
  }
}

module.exports = Mpu
