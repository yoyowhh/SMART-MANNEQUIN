'use strict'

const db = require('../dbconfig')
const moment = require('moment-timezone')

// constructor
const Lidar = function (lidar) {
  this.value = lidar.value
  this.kalmanvalue = lidar.kalmanvalue
  this.inputed_at = lidar.inputed_at
  this.sensor_id = lidar.sensor_id
  this.mannequin_id = lidar.mannequin_id || 1
}

const table = 'lidar'

Lidar.index = async (mannequinId) => {
  try {
    const query = `SELECT * FROM ${table} WHERE mannequin_id = ? order by event_id DESC`;

    const [rows, fields] = await db.execute(query, [mannequinId]);

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

Lidar.show = async (id, mannequinId, limit = 10) => {
  if(parseInt(id) !== 901){
    throw err
  }

  try {
    const safeLimit = Math.max(1, Math.min(parseInt(limit) || 10, 1000));
    const query = `SELECT * FROM ${table} WHERE sensor_id = ? AND mannequin_id = ? order by event_id DESC LIMIT ${safeLimit}`;
    const [rows, fields] = await db.execute(query, [id, mannequinId]);

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
  if(parseInt(newLidar.sensor_id) !== 901){
    throw {message: 'lidar not found'}
  }

  try {
    newLidar.inputed_at = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    const query = `INSERT INTO ${table} (value, kalmanvalue, sensor_id, mannequin_id, inputed_at) VALUES (?, ?, ?, ?, ?)`
    await db.execute(query, [newLidar.value, newLidar.kalmanvalue, newLidar.sensor_id, newLidar.mannequin_id, newLidar.inputed_at])
    
    return newLidar
  } catch (err) {
    console.error('Error in Lidar.store:', err)
    throw err
  }
}

module.exports = Lidar
