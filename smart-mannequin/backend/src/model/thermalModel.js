"use strict";

const db = require("../dbconfig");
const moment = require("moment-timezone");

const table = "thermal_camera";

// constructor
const Thermal = function (thermal) {
  this.value = thermal.value;
  this.low_temp = thermal.low_temp;
  this.center_temp = thermal.center_temp;
  this.high_temp = thermal.high_temp;
  this.sensor_id = thermal.sensor_id;
  this.mannequin_id = thermal.mannequin_id || 1;
  this.inputed_at = thermal.inputed_at;
};

Thermal.index = async (mannequinId) => {
  try {
    const query = `SELECT * FROM ${table} WHERE mannequin_id = ? order by event_id DESC`;

    const [rows] = await db.execute(query, [mannequinId]);

    return {
      status: "ok",
      message: `success to retrieve ${table} data`,
      data: { data: rows },
    };
  } catch (err) {
    console.error("Error in Thermal.index:", err);
    throw err;
  }
};

Thermal.show = async (id, mannequinId) => {
  if (parseInt(id) !== 702) {
    table = null;
  }

  try {
    const query = `SELECT * FROM ${table} WHERE sensor_id = ? AND mannequin_id = ? order by event_id DESC LIMIT 10`;
    const [rows, fields] = await db.execute(query, [id, mannequinId]);

    return {
      status: "ok",
      message: "success",
      data: rows,
    };
  } catch (err) {
    console.error("Error in Thermal.show:", err);
    throw err;
  }
};

Thermal.store = async (newThermal) => {
  if (parseInt(newThermal.sensor_id) !== 702) {
    throw { kind: "thermal not found" };
  }

  try {
    newThermal.inputed_at = moment()
      .tz("Asia/Jakarta")
      .format("YYYY-MM-DD HH:mm:ss");
    const query = `INSERT INTO ${table} (value, low_temp, center_temp, high_temp, sensor_id, mannequin_id, inputed_at) VALUES (?, ?, ?, ?, ? ,?, ?)`;
    await db.execute(query, [
      newThermal.value,
      newThermal.low_temp,
      newThermal.center_temp,
      newThermal.high_temp,
      newThermal.sensor_id,
      newThermal.mannequin_id,
      newThermal.inputed_at,
    ]);

    console.log(query);

    return newThermal;
  } catch (err) {
    console.error("Error in Thermal.store:", err);
    throw err;
  }
};

module.exports = Thermal;
