'use strict'

const db = require('../dbconfig')
const moment = require('moment-timezone')

// constructor
const Lidar = function (lidar) {
  this.value = lidar.value
  this.inputed_at = lidar.inputed_at
  this.sensor_id = lidar.sensor_id
}

const table = 'lidartest'

Lidar.index = async () => {
  try {
    const query = `SELECT * FROM ${table} order by event_id DESC`;

    const [rows, fields] = await db.execute(query);

    return {
      status: 'ok',
      message: 'success',
      data: rows,
    };
  } catch (err) {
    console.error('Error in Lidar.index:', err);
    throw err;
  }
}

Lidar.show = async (id) => {
  if(parseInt(id) !== 902){
    throw err
  }

  try {
    const query = `SELECT * FROM ${table} WHERE sensor_id = ? order by event_id DESC LIMIT 10`;
    const [rows, fields] = await db.execute(query, [id]);

    return {
      status: 'ok',
      message: 'success',
      data: rows,
    };
  } catch (err) {
    console.error('Error in Lidar.show:', err);
    throw err;
  }
}

Lidar.store = async (newLidar) => {
  if(parseInt(newLidar.sensor_id) !== 902){
    throw {message: 'sensor not found'}
  }

  try {
    newLidar.inputed_at = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    const query = `INSERT INTO ${table} (value, sensor_id, inputed_at) VALUES (?, ?, ?)`
    await db.execute(query, [newLidar.value, newLidar.sensor_id, newLidar.inputed_at])

    return newLidar
  } catch (err) {
    console.error('Error in Lidar.store:', err)
    throw err
  }
}

module.exports = Lidar
