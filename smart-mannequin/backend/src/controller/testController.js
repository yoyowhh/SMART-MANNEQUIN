"use strict";

const db = require("../dbconfig");

// const Adxl = require("../model/adxlModel");
const Bme = require("../model/bmeModel");
// const Fsr = require("../model/skinModel");
const Ky = require("../model/kyModel");
// const Lidar = require("../model/lidarModel");
const Mpu = require("../model/mpuModel");
// const Mq = require("../model/mqModel");

exports.store = async (req, res) => {
  const param = req.query;
  const body = req.body.object;
  const { mpuData, bmeData, soundData1, soundData2 } = body;

  if (!req.body) {
    res.status(400).send({
      status: "failed",
      message: "Payload can not be empty!",
    });
    return;
  }

  // initial mannequin id
  let mannequinId = 1;

  // using query params for sensor
  try {
    let responseData = {};

    // micro 1
    const bme = new Bme({ ...bmeData, mannequin_id: mannequinId });
    const mpu = new Mpu({ ...mpuData, mannequin_id: mannequinId });
    const ky1 = new Ky({ ...soundData1, mannequin_id: mannequinId });
    const ky2 = new Ky({ ...soundData2, mannequin_id: mannequinId });

    responseData = {
      bmeData: await Bme.store(bme),
      mpuData: await Mpu.store(mpu),
      ky1Data: await Ky.store(ky1),
      ky2Data: await Ky.store(ky2),
    };

    res.json({
      status: "ok",
      message: "success to store lora data",
      data: {
        ...responseData,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message:
        error?.message || error || "Some error occurred while store lora data.",
    });
  }
};
