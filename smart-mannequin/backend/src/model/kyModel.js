'use strict'

const db = require('../dbconfig')
const moment = require('moment-timezone')

// constructor
const Ky = function (ky) {
  this.value = ky.value
  this.inputed_at = ky.inputed_at
  this.sensor_id = ky.sensor_id
  this.mannequin_id = ky.mannequin_id || 1
}

Ky.index = async (mannequinId) => {
  try {
    const query1 = `SELECT * FROM ky_kanan WHERE mannequin_id = ? order by event_id DESC`
    const query2 = `SELECT * FROM ky_kiri WHERE mannequin_id = ? order by event_id DESC`

    const [rows1] = await db.execute(query1, [mannequinId]);
    const [rows2] = await db.execute(query2, [mannequinId]);

    return {
      status: 'ok',
      message: 'success to retrieve all ky data',
      data: {
        telinga_kanan: rows1,
        telinga_kiri: rows2,
      },
    };
  } catch (err) {
    console.error('Error in Ky.index:', err);
    throw err;
  }
}

Ky.show = async (id, mannequinId, limit = 10) => {
  let table
  switch (parseInt(id)) {
    case 601:
      table = 'ky_kanan';
      break;
    case 602:
      table = 'ky_kiri';
      break;
    default:
      break;
  }

  try {
    const safeLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 500);
    const query = `SELECT * FROM ${table} WHERE mannequin_id = ? order by event_id DESC LIMIT ${safeLimit}`;
    const [rows, fields] = await db.execute(query, [mannequinId]);

    let isHighValue = false
    const lastRow = await rows[0]
    const tresholdValue = 89

    if (lastRow && parseInt(lastRow.value) > tresholdValue) {
      isHighValue = true
    }

    return {
      is_high_value: isHighValue,
      status: 'ok',
      message: `success to retrieve ${table} data`,
      data: { data: rows },
    };
  } catch (err) {
    console.error('Error in Ky.show:', err);
    throw err;
  }
}

Ky.store = async (newKy) => {
  let table
  switch (parseInt(newKy.sensor_id)) {
    case 601:
      table = 'ky_kanan';
      break;
    case 602:
      table = 'ky_kiri';
      break;
    default:
      throw {error: 'ky not found'};
  }

  try {
    newKy.inputed_at = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    const query = `INSERT INTO ${table} (value, sensor_id, mannequin_id, inputed_at) VALUES (?, ?, ?, ?)`;
    await db.execute(query, [newKy.value, newKy.sensor_id, newKy.mannequin_id, newKy.inputed_at]);

    return newKy
  } catch (err) {
    console.error('Error in Ky.store:', err);
    throw err;
  }
}

module.exports = Ky;
