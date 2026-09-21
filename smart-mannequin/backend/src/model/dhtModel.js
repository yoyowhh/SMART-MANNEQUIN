"use strict";

const db = require("../dbconfig");
const moment = require("moment-timezone");

// constructor
const Dht = function (dht) {
  this.temperature = dht.temperature;
  this.humidity = dht.humidity;
  this.inputed_at = dht.inputed_at;
  this.sensor_id = dht.sensor_id;
  this.mannequin_id = dht.mannequin_id || 1;
};

Dht.index = async (mannequinId = 1) => {
  let table = "dht11";
  try {
    const query = `SELECT * FROM ${table} WHERE mannequin_id = ? order by event_id DESC`;

    const [rows, fields] = await db.execute(query, [mannequinId]);

    return {
      status: "ok",
      message: "success",
      data: { data: rows },
    };
  } catch (err) {
    console.error("Error in Dht.index:", err);
    throw err;
  }
};

Dht.show = async (id, mannequinId = 1) => {
  let table;
  if (parseInt(id) === 701) {
    table = "dht11";
  }

  try {
    const query = `SELECT * FROM ${table} WHERE sensor_id = ? AND mannequin_id = ? order by event_id DESC LIMIT 10`;
    const [rows, fields] = await db.execute(query, [id, mannequinId]);

    return {
      status: "ok",
      message: "success",
      data: rows,
    };

    // if (rows.length) {
    //   return {
    //     status: 'ok',
    //     message: 'success',
    //     data: rows,
    //   };
    // } else {
    //   throw { kind: 'not_found' };
    // }
  } catch (err) {
    console.error("Error in Dht.show:", err);
    throw err;
  }
};

Dht.store = async (newDht) => {
  let table;
  if (parseInt(newDht.sensor_id) === 701) {
    table = "dht11";
  }

  try {
    const query = `INSERT INTO ${table} SET ?`;
    await db.execute(query, newDht);

    return {
      status: "ok",
      message: "success",
      data: { newDht },
    };
  } catch (err) {
    console.error("Error in Dht.store:", err);
    throw err;
  }
};

module.exports = Dht;
