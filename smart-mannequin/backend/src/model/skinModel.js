'use strict'

const db = require('../dbconfig')
const moment = require('moment-timezone')

// constructor
const Skin = function (skin) {
  this.value = skin.value
  this.pressure_value = skin.pressure_value
  this.force_value = skin.force_value
  this.inputed_at = skin.inputed_at
  this.sensor_id = skin.sensor_id
  this.mannequin_id = skin.mannequin_id
}

Skin.index = async () => {
  try {
    const query = `
      SELECT * FROM rp_tangan_kiri
      UNION
      SELECT * FROM rp_tangan_kanan
      UNION
      SELECT * FROM flex_tangan_kiri
      UNION
      SELECT * FROM flex_tangan_kanan
      UNION
      SELECT * FROM rp_kaki_kiri
      UNION
      SELECT * FROM rp_kaki_kanan
      UNION
      SELECT * FROM flex_kaki_kiri
      UNION
      SELECT * FROM flex_kaki_kanan
      order by event_id DESC
    `

    const [rows, fields] = await db.execute(query)

    return {
      status: 'ok',
      message: 'success',
      data: rows,
    }
  } catch (err) {
    console.error('Error in Skin.index:', err)
    throw err
  }
}

Skin.show = async (id, mannequinId) => {
  let table
  switch (parseInt(id)) {
    case 1101:
      table = 'rp_tangan_kiri'
      break
    case 1102:
      table = 'rp_tangan_kanan'
      break
    case 1103:
      table = 'flex_tangan_kiri'
      break
    case 1104:
      table = 'flex_tangan_kanan'
      break
    case 1105:
      table = 'rp_kaki_kiri'
      break
    case 1106:
      table = 'rp_kaki_kanan'
      break
    case 1107:
      table = 'flex_kaki_kiri'
      break
    case 1108:
      table = 'flex_kaki_kanan'
      break
    default:
      break
  }

  try {
    const query = `SELECT * FROM ${table} WHERE sensor_id = ? AND mannequin_id = ? order by event_id DESC LIMIT 10`
    const [rows, fields] = await db.execute(query, [id, mannequinId])

    return {
      status: 'ok',
      message: 'success',
      data: { data: rows },
    }
  } catch (err) {
    console.error('Error in Skin.show:', err)
    throw err
  }
}

Skin.store = async (newSkin) => {
  let table
  switch (parseInt(newSkin.sensor_id)) {
    case 1101:
      table = 'rp_tangan_kiri'
      break
    case 1102:
      table = 'rp_tangan_kanan'
      break
    case 1103:
      table = 'flex_tangan_kiri'
      break
    case 1104:
      table = 'flex_tangan_kanan'
      break
    case 1105:
      table = 'rp_kaki_kiri'
      break
    case 1106:
      table = 'rp_kaki_kanan'
      break
    case 1107:
      table = 'flex_kaki_kiri'
      break
    case 1108:
      table = 'flex_kaki_kanan'
      break
    default:
      throw { error: 'sensor not found' }
  }

  try {
    newSkin.inputed_at = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    const query = `INSERT INTO ${table} (value, pressure_value, force_value, sensor_id, mannequin_id, inputed_at) VALUES (?, ?, ?, ?, ?, ?)`
    await db.execute(query, [newSkin.value, newSkin.pressure_value, newSkin.force_value, newSkin.sensor_id, newSkin.mannequin_id, newSkin.inputed_at])

    return newSkin
  } catch (err) {
    console.error('Error in Skin.store:', err)
    throw err
  }
}

module.exports = Skin
