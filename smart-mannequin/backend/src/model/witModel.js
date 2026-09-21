'use strict'

const db = require('../dbconfig')
const moment = require('moment-timezone')

// constructor
const Witsensor = function (witsensor) {
  this.x_acc = witsensor.x_acc
  this.y_acc = witsensor.y_acc
  this.z_acc = witsensor.z_acc
  this.a_acc = witsensor.a_acc
  this.x_vel = witsensor.x_vel
  this.y_vel = witsensor.y_vel
  this.z_vel = witsensor.z_vel
  this.w_vel = witsensor.w_vel
  this.x_angle = witsensor.x_angle
  this.y_angle = witsensor.y_angle
  this.z_angle = witsensor.z_angle
  this.x_mag = witsensor.x_mag
  this.y_mag = witsensor.y_mag
  this.z_mag = witsensor.z_mag
  this.h_mag = witsensor.h_mag
  this.pressure = witsensor.pressure
  this.height = witsensor.height
  this.q0 = witsensor.q0
  this.q1 = witsensor.q1
  this.q2 = witsensor.q2
  this.q3 = witsensor.q3
  this.inputed_at = witsensor.inputed_at
  this.sensor_id = witsensor.sensor_id
  this.mannequin_id = witsensor.mannequin_id || 1
}

Witsensor.index = async (mannequinId) => {
  try {
    const query = `SELECT * FROM witsensor WHERE mannequin_id = ? order by event_id DESC`

    const [rows] = await db.execute(query, [mannequinId])

    return rows
  } catch(err) {
    console.error('Error in Witsensor.index:', err)
    throw err
  }
}

Witsensor.show = async (id, mannequinId) => {
  if(parseInt(id) !== 1010) throw new Error('sensor id is not found')

  try {
    const query = `SELECT * FROM witsensor WHERE sensor_id = ? AND mannequin_id = ? order by event_id DESC LIMIT 10`
    const [rows] = await db.execute(query, [id, mannequinId])

    return rows
  } catch(err) {
    console.error('Error in Witsensor.show:', err)
    throw err
  }
}

Witsensor.store = async (newWitsensor) => {
  if(parseInt(newWitsensor.sensor_id) !== 1010) throw new Error('sensor id is not found')
  
  try {
    newWitsensor.inputed_at = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')
    const query = `
      INSERT INTO witsensor (x_acceleration, y_acceleration, z_acceleration, a_acceleration, x_velocity, y_velocity, z_velocity, w_velocity, x_angle, y_angle, z_angle, x_magnetic, y_magnetic, z_magnetic, h_magnetic, pressure, height, q0_quaternion, q1_quaternion, q2_quaternion, q3_quaternion, inputed_at, sensor_id, mannequin_id)
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    await db.execute(query, [
      newWitsensor.x_acc,
      newWitsensor.y_acc,
      newWitsensor.z_acc,
      newWitsensor.a_acc,
      newWitsensor.x_vel,
      newWitsensor.y_vel,
      newWitsensor.z_vel,
      newWitsensor.w_vel,
      newWitsensor.x_angle,
      newWitsensor.y_angle,
      newWitsensor.z_angle,
      newWitsensor.x_mag,
      newWitsensor.y_mag,
      newWitsensor.z_mag,
      newWitsensor.h_mag,
      newWitsensor.pressure,
      newWitsensor.height,
      newWitsensor.q0,
      newWitsensor.q1,
      newWitsensor.q2,
      newWitsensor.q3,
      newWitsensor.inputed_at,
      newWitsensor.sensor_id,
      newWitsensor.mannequin_id
    ])

    return newWitsensor
  } catch (err) {
    console.error('Error in Witsensor.store:', err)
    throw err
  }
}

Witsensor.getAcc = async () => {
  try {
    const query = `SELECT event_id, x_acceleration, y_acceleration, z_acceleration, a_acceleration, inputed_at, sensor_id FROM witsensor order by event_id DESC LIMIT 10`
    const [rows] = await db.execute(query)

    return rows
  } catch (err) {
    console.error('Error in Witsensor.getAcc:', err);
    throw err;
  }
}

Witsensor.getVelo = async () => {
  try {
    const query = `SELECT event_id, x_velocity, y_velocity, z_velocity, w_velocity, inputed_at, sensor_id FROM witsensor order by event_id DESC LIMIT 10`
    const [rows] = await db.execute(query)

    return rows
  } catch (err) {
    console.error('Error in Witsensor.getVelo:', err);
    throw err;
  }
}

Witsensor.getAngle = async () => {
  try {
    const query = `SELECT event_id, x_angle, y_angle, z_angle, inputed_at, sensor_id FROM witsensor order by event_id DESC LIMIT 10`
    const [rows] = await db.execute(query)

    return rows
  } catch (err) {
    console.error('Error in Witsensor.getAcc:', err);
    throw err;
  }
}

Witsensor.getMag = async () => {
  try {
    const query = `SELECT event_id, x_magnetic, y_magnetic, z_magnetic, h_magnetic, inputed_at, sensor_id FROM witsensor order by event_id DESC LIMIT 10`
    const [rows] = await db.execute(query)

    return rows
  } catch (err) {
    console.error('Error in Witsensor.getVelo:', err);
    throw err;
  }
}

Witsensor.getQ = async () => {
  try {
    const query = `SELECT event_id, q0_quaternion, q1_quaternion, q2_quaternion, q3_quaternion, inputed_at, sensor_id FROM witsensor order by event_id DESC LIMIT 10`
    const [rows] = await db.execute(query)

    return rows
  } catch (err) {
    console.error('Error in Witsensor.getVelo:', err);
    throw err;
  }
}

Witsensor.getPressure = async () => {
  try {
    const query = `SELECT event_id, pressure, height, inputed_at, sensor_id FROM witsensor order by event_id DESC LIMIT 10`
    const [rows] = await db.execute(query)

    return rows
  } catch (err) {
    console.error('Error in Witsensor.getVelo:', err);
    throw err;
  }
}

module.exports = Witsensor