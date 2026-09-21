"use strict";

const db = require("../dbconfig");

const table = "skin";

const Fsr = function (skin) {
  this.inputed_at = skin.inputed_at;
  this.sensor_id = skin.sensor_id;

  for (let i = 1; i <= 64; i++) {
    this["fsr" + i] = skin["fsr" + i];
  }
};


Fsr.index = async () => {
  try {
    const query = `SELECT * FROM ${table} order by event_id DESC`;

    const [rows, fields] = await db.execute(query);

    return {
      status: "ok",
      message: "success to retrieve all skin data",
      data: rows,
    };
  } catch (err) {
    console.error("Error in Skin.index:", err);
    throw err;
  }
};

Fsr.store = async (newSkin) => {
  try {
    const query = `INSERT INTO ${table} SET ?`;
    const [rows] = await db.execute(query, [newSkin]);

    return {
      status: "ok",
      message: "success",
      data: { data: rows },
    };
  } catch (err) {
    console.error("Error in Skin.store:", err);
    throw err;
  }
};

module.exports = Fsr;
