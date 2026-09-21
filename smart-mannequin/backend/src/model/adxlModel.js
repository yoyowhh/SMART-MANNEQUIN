"use strict";

const db = require("../dbconfig");
const moment = require("moment-timezone");

// constructor
const Adxl = function (adxl) {
  this.x_axis = adxl.x_axis;
  this.y_axis = adxl.y_axis;
  this.z_axis = adxl.z_axis;
  this.x_kalman = adxl.x_kalman;
  this.y_kalman = adxl.y_kalman;
  this.z_kalman = adxl.z_kalman;
  this.inputed_at = adxl.inputed_at;
  this.sensor_id = adxl.sensor_id;
  this.mannequin_id = adxl.mannequin_id || 1;
};

Adxl.index = async (mannequinId) => {
  try {
    const query1 = `SELECT * FROM adxl_tangan_kanan where mannequin_id = ? order by event_id DESC`;
    const query2 = `SELECT * FROM adxl_tangan_kiri where mannequin_id = ? order by event_id DESC`;
    const query3 = `SELECT * FROM adxl_kaki_kanan where mannequin_id = ? order by event_id DESC`;
    const query4 = `SELECT * FROM adxl_kaki_kiri where mannequin_id = ? order by event_id DESC`;

    const [rows, fields] = await db.execute(query1, [mannequinId]);
    const [rows2, fields2] = await db.execute(query2, [mannequinId]);
    const [rows3, fields3] = await db.execute(query3, [mannequinId]);
    const [rows4, fields4] = await db.execute(query4, [mannequinId]);

    return {
      status: "ok",
      message: "success to retrieve all adxl data",
      data: {
        tangan_kanan: rows,
        tangan_kiri: rows2,
        kaki_kanan: rows3,
        kaki_kiri: rows4,
      },
    };
  } catch (err) {
    console.error("Error in Adxl.index:", err);
    throw err;
  }
};

Adxl.show = async (id, mannequinId) => {
  let table;
  switch (parseInt(id)) {
    case 201:
      table = "adxl_tangan_kanan";
      break;
    case 202:
      table = "adxl_tangan_kiri";
      break;
    case 203:
      table = "adxl_kaki_kanan";
      break;
    case 204:
      table = "adxl_kaki_kiri";
      break;
    default:
      break;
  }

  try {
    const query = `SELECT * FROM ${table} WHERE sensor_id = ? AND mannequin_id = ? order by event_id DESC LIMIT 10`;
    const [rows, fields] = await db.execute(query, [id, mannequinId]);

    return {
      status: "ok",
      message: `success to retrieve ${table} data`,
      data: { data: rows },
    };

    // if (rows.length) {
    //   return {
    //     status: 'ok',
    //     message: `success to retrieve ${table} data`,
    //     data: { data: rows },
    //   };
    // } else {
    //   throw { kind: 'not_found' };
    // }
  } catch (err) {
    console.error("Error in Adxl.show:", err);
    throw err;
  }
};

Adxl.store = async (newAdxl) => {
  let table;
  switch (parseInt(newAdxl.sensor_id)) {
    case 201:
      table = "adxl_tangan_kanan";
      break;
    case 202:
      table = "adxl_tangan_kiri";
      break;
    case 203:
      table = "adxl_kaki_kanan";
      break;
    case 204:
      table = "adxl_kaki_kiri";
      break;
    default:
      throw { kind: "adxl not found" };
  }

  try {
    // const query = `INSERT INTO ${table} SET ?`
    // newAdxl.inputed_at = moment.tz(new Date(), 'Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')
    newAdxl.inputed_at = moment()
      .tz("Asia/Jakarta")
      .format("YYYY-MM-DD HH:mm:ss");
    const query = `INSERT INTO ${table} (x_axis, y_axis, z_axis, x_kalman, y_kalman, z_kalman, sensor_id, mannequin_id, inputed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await db.execute(query, [
      newAdxl.x_axis,
      newAdxl.y_axis,
      newAdxl.z_axis,
      newAdxl.x_kalman,
      newAdxl.y_kalman,
      newAdxl.z_kalman,
      newAdxl.sensor_id,
      newAdxl.mannequin_id,
      newAdxl.inputed_at,
    ]);

    return {
      ...newAdxl,
    };
  } catch (err) {
    console.error("Error in Adxl.store:", err);
    throw err;
  }
};

module.exports = Adxl;
