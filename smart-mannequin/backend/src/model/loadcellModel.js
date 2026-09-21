"use strict";

const db = require("../dbconfig");
const moment = require("moment-timezone");

// constructor
const Loadcell = function (loadcell) {
  this.value = loadcell.value;
  this.kalmanvalue = loadcell.kalmanvalue ?? 0;
  this.inputed_at = loadcell.inputed_at;
  this.sensor_id = loadcell.sensor_id;
  this.mannequin_id = loadcell.mannequin_id ?? 1;
  this.lateral_value = loadcell.lateral_value ?? 0;
  this.extension_value = loadcell.extension_value ?? 0;
  this.flexion_value = loadcell.flexion_value ?? 0;
};

// Loadcell.index = async (mannequinId = 1) => {
//   try {
//     const query = `
//       SELECT * FROM loadcell_1
//       UNION
//       SELECT * FROM loadcell_2
//       UNION
//       SELECT * FROM loadcell_3
//       UNION
//       SELECT * FROM loadcell_4
//       UNION
//       SELECT * FROM loadcell_5
//       UNION
//       SELECT * FROM loadcell_6
//       WHERE mannequin_id = ?
//       order by event_id DESC
//     `;

//     const [rows, fields] = await db.execute(query, [mannequinId]);

//     return {
//       status: "ok",
//       message: "must be included with sensor id",
//     };
//   } catch (err) {
//     console.error("Error in Loadcell.index:", err);
//     throw err;
//   }
// };

Loadcell.show = async (id, mannequinId) => {
  let table;
  switch (parseInt(id)) {
    case 801:
      table = "loadcell_1";
      break;
    case 802:
      table = "loadcell_2";
      break;
    case 803:
      table = "loadcell_3";
      break;
    case 804:
      table = "loadcell_4";
      break;
    case 805:
      table = "loadcell_5";
      break;
    case 806:
      table = "loadcell_6";
      break;
    default:
      throw { error: "loadcell not found" };
  }

  try {
    const query = `SELECT * FROM ${table} WHERE sensor_id = ? AND mannequin_id = ? order by event_id DESC LIMIT 10`;
    const [rows, fields] = await db.execute(query, [id, mannequinId]);

    return {
      status: "ok",
      message: "success",
      data: { data: rows },
    };
  } catch (err) {
    console.error("Error in Loadcell.show:", err);
    throw err;
  }
};

Loadcell.store = async (newLoadcell) => {
  let table;
  switch (parseInt(newLoadcell.sensor_id)) {
    case 801:
      table = "loadcell_1";
      break;
    case 802:
      table = "loadcell_2";
      break;
    case 803:
      table = "loadcell_3";
      break;
    case 804:
      table = "loadcell_4";
      break;
    case 805:
      table = "loadcell_5";
      break;
    case 806:
      table = "loadcell_6";
      break;
    default:
      throw { error: "loadcell not found" };
  }

  try {
    newLoadcell.inputed_at = moment()
      .tz("Asia/Jakarta")
      .format("YYYY-MM-DD HH:mm:ss");

    const data = [
      newLoadcell.value,
      newLoadcell.kalmanvalue,
      newLoadcell.sensor_id,
      newLoadcell.mannequin_id,
      newLoadcell.inputed_at,
    ];

    if (
      parseInt(newLoadcell.sensor_id) === 801 &&
      parseInt(newLoadcell.mannequin_id) === 2
    ) {
      const query = `INSERT INTO loadcell_1 (value, kalmanvalue, sensor_id, mannequin_id, inputed_at, lateral_value, extension_value, flexion_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      await db.execute(query, [
        ...data,
        newLoadcell.lateral_value,
        newLoadcell.extension_value,
        newLoadcell.flexion_value,
      ]);
    } else {
      const query = `INSERT INTO ${table} (value, kalmanvalue, sensor_id, mannequin_id, inputed_at) VALUES (?, ?, ?, ?, ?)`;
      await db.execute(query, data);
    }

    return newLoadcell;
  } catch (err) {
    console.error("Error in Loadcell.store:", err);
    throw err;
  }
};

module.exports = Loadcell;
