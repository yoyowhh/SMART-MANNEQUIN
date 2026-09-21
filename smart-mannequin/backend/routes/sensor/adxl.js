'use strict'

const controller = require('../../src/controller/adxlController');

let express = require('express');
let router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.store);

module.exports = router;

// Swagger
/**
 * @swagger
 * components:
 *  schemas:
 *    adxl:
 *      type: object
 *      required:
 *        - x_axis
 *        - y_axis
 *        - z_axis
 *        - sensor_id
 *      properties:
 *        x_axis:
 *          type: integer
 *          description: value of adxl
 *        y_axis:
 *          type: integer
 *          description: value of adxl
 *        z_axis:
 *          type: integer
 *          description: value of adxl
 *        sensor_id:
 *          type: integer
 *          description: sensor id of adxl
 *        inputed_at:
 *          type: datetime
 *          description: inputed at
 */

/**
 * @swagger
 * tags:
 *  name: adxl
 *  description: API Sensor adxl
 * /sensor/adxl:
 *  get:
 *    summary: Returns the list of all the adxl
 *    tags: [adxl]
 *    responses: 
 *      200:
 *        description: Success to retrieve all adxl data
 *      404:
 *        description: data not found
 *      500:
 *        description: internal server error
 *  post:
 *    summary: Create a new adxl data
 *    tags: [adxl]
 *    description: 
 *      sensor_id
 *      | 201 = tangan kanan 
 *      | 202 = tangan kiri 
 *      | 203 = kaki kanan 
 *      | 204 = kaki kiri 
 *    requestBody:
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema: 
 *            type: object
 *            properties:
 *              x_axis:
 *                type: integer
 *              y_axis:
 *                type: integer
 *              z_axis:
 *                type: integer
 *              sensor_id:
 *                type: integer
 *                enum: [201, 202, 203, 204]
 *    consumes:
 *      application/x-www-form-urlencoded
 *    responses: 
 *      200:
 *        description: Success to retrieve all adxl data
 *      404:
 *        description: data not found
 *      500:
 *        description: internal server error
 */

/**
 * @swagger
 * 
 * tags:
 *  name: adxl
 *  description: API Sensor adxl
 * /sensor/adxl/{id}:
 *  get:
 *    summary: Returns adxl data by sewnsor_id
 *    tags: [adxl]
 *    parameters:
 *      - name: sensor_id
 *        in: path
 *        required: true
 *        description: sensor id of adxl
 *        schema:
 *          type: integer
 *          enum: [201, 202, 203, 204]
 *    consumes:
 *      application/x-www-form-urlencoded
 *    responses: 
 *      200:
 *        description: Success to retrieve all adxl data
 *      404:
 *        description: data not found
 *      500:
 *        description: internal server error
 */