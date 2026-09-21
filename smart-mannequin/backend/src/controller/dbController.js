"use strict";

const db = require("../dbconfig");

exports.dbFsr = async (req, res) => {
  const createFsrTableQuery = `
  CREATE TABLE IF NOT EXISTS fsr (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    inputed_at DATETIME,
    sensor_id INT,
    ${Array.from({ length: 64 }, (_, i) => `fsr${i + 1} DECIMAL(10,2) NULL`).join(", ")}
  )
  `;

  // console.log(createFsrTableQuery);

  // return res.json({ status: "ok", message: "Fsr table created successfully" });

  db.execute(createFsrTableQuery)
    .then(() => {
      console.log("Fsr table created successfully");
      res
        .status(200)
        .send({ status: "ok", message: "Fsr table created successfully" });
    })
    .catch((err) => {
      console.error("Error creating Fsr table:", err);
      res
        .status(500)
        .send({ status: "error", message: "Error while creating Fsr table" });
      throw err;
    });

    // const insertQuery = `
    // INSERT INTO fsr (inputed_at, sensor_id, ${Array.from({ length: 64 }, (_, i) => `fsr${i + 1}`).join(", ")})
    // VALUES ('2021-09-01 12:00:00', 1, ${Array.from({ length: 64 }, (_, i) => `${Math.random() * 100}`).join(", ")})
    // `

    // db.execute(insertQuery)

    // return res.json({ status: "ok", message: "Fsr table created successfully" });

  // try {
  // } catch (error) {
  //   console.error("Error in Fsr:", error);
  //   res
  //     .status(500)
  //     .send({ status: "error", message: "Error while creating Fsr table" });
  //   throw error;
  // }
};
