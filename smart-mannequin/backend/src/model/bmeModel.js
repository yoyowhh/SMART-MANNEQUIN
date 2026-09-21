"use strict";

const db = require("../dbconfig");
const moment = require("moment-timezone");

// constructor
const Bme = function (bme) {
  this.temperature = bme.temperature;
  this.pressure = bme.pressure;
  this.approximate_altitude = bme.approximate_altitude;
  this.humidity = bme.humidity;
  this.inputed_at = bme.inputed_at;
  this.sensor_id = bme.sensor_id || 1001;
  this.mannequin_id = bme.mannequin_id || 1;
};

const table = "bme280";

Bme.index = async (mannequinId) => {
  try {
    const query = `SELECT * FROM ${table} WHERE mannequin_id = ? order by event_id DESC`;

    const [rows, fields] = await db.execute(query, [mannequinId]);

    return {
      status: "ok",
      message: "success to retrieve all bme data",
      data: rows,
    };
  } catch (err) {
    console.error("Error in Bme.index:", err);
    throw err;
  }
};

Bme.show = async (id, mannequinId) => {
  if (parseInt(id) !== 1001) {
    throw err;
  }

  try {
    const query = `SELECT * FROM ${table} WHERE sensor_id = ? AND mannequin_id = ? order by event_id DESC LIMIT 10`;
    const [rows, fields] = await db.execute(query, [id, mannequinId]);

    return {
      status: "ok",
      message: "success",
      data: { data: rows },
    };

    // if (rows.length) {
    //   return {
    //     status: 'ok',
    //     message: 'success',
    //     data: { data: rows },
    //   };
    // } else {
    //   throw { kind: 'not_found' };
    // }
  } catch (err) {
    console.error("Error in Bme.show:", err);
    throw err;
  }
};

Bme.store = async (newBme) => {
  if (parseInt(newBme.sensor_id) !== 1001) {
    throw { kind: "bme not found" };
  }

  try {
    newBme.inputed_at = moment()
      .tz("Asia/Jakarta")
      .format("YYYY-MM-DD HH:mm:ss");
    const query = `INSERT INTO ${table} (temperature, humidity, pressure, approximate_altitude, sensor_id, mannequin_id, inputed_at) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    await db.execute(query, [
      newBme.temperature,
      newBme.humidity,
      newBme.pressure,
      newBme.approximate_altitude,
      newBme.sensor_id,
      newBme.mannequin_id,
      newBme.inputed_at,
    ]);

    return {
      ...newBme,
    };
  } catch (err) {
    console.error("Error in Bme.store:", err);
    throw err;
  }
};

module.exports = Bme;
