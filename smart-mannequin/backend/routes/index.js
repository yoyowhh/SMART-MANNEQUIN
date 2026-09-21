"use strict";

let express = require("express");
let router = express.Router();
const cors = require("cors");

const fsrController = require("../src/controller/dbController");
const loraController = require("../src/controller/loraController");
const { decodeRAKPayload } = require("../src/middleware");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "STAS - RG" });
});

router.get("/sensors", cors(), function (req, res, next) {
  res.json("sensors");
});

router.get("/sensor-types", cors(), function (req, res, next) {
  res.json("sensor types");
});

router.post("/db", cors(), fsrController.dbFsr);
router.post("/lora", cors(), decodeRAKPayload, loraController.store);

module.exports = router;

// Swagger
// Sensors
/**
 * @swagger
 * components:
 *  schemas:
 *    Sensor:
 *      type: object
 *      properties:
 *        sensor_id:
 *          type: integer
 *          description: sensor id
 *        sensor_name:
 *          type: string
 *          description: sensor name
 *        sensor_type_id:
 *          type: integer
 *          description: sensor type id
 */
/**
 * @swagger
 * tags:
 *  name: Sensor
 *  description: API Sensor
 * /sensors:
 *  get:
 *    summary: Returns the list of all sensors
 *    tags: [Sensor]
 *    responses:
 *      200:
 *        description: Success to retrieve all sensor data
 *      404:
 *        description: data not found
 *      500:
 *        description: internal server error
 */

// Sensor Types
/**
 * @swagger
 * components:
 *  schemas:
 *    Sensor Types:
 *      type: object
 *      properties:
 *        sensor_type_id:
 *          type: integer
 *          description: sensor type id
 *        sensor_type:
 *          type: string
 *          description: sensor type
 */
/**
 * @swagger
 * tags:
 *  name: sensor types
 *  description: API sensor types
 * /sensor-types:
 *  get:
 *    summary: Returns the list of all sensor types
 *    tags: [sensor types]
 *    responses:
 *      200:
 *        description: Success to retrieve all sensor data
 *      404:
 *        description: data not found
 *      500:
 *        description: internal server error
 */
