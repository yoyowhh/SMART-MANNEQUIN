'use strict'

const controller = require('../../src/controller/bmeController')

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
 *    bme:
 *      type: object
 *      required:
 *        - x_axis
 *        - y_axis
 *        - z_axis
 *        - sensor_id
 *      properties:
 *        x_axis:
 *          type: integer
 *          description: value of bme
 *        y_axis:
 *          type: integer
 *          description: value of bme
 *        z_axis:
 *          type: integer
 *          description: value of bme
 *        sensor_id:
 *          type: integer
 *          description: sensor id of bme
 *        inputed_at:
 *          type: datetime
 *          description: inputed at
 */

/**
 * @swagger
 * tags:
 *  name: bme
 *  description: API Sensor bme
 * /sensor/bme:
 *  get:
 *    summary: Returns the list of all the bme
 *    tags: [bme]
 *    responses: 
 *      200:
 *        description: Success to retrieve all bme data
 *      404:
 *        description: data not found
 *      500:
 *        description: internal server error
 *  post:
 *    summary: Create a new bme data
 *    tags: [bme]
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
 *        description: Success to retrieve all bme data
 *      404:
 *        description: data not found
 *      500:
 *        description: internal server error
 */

/**
 * @swagger
 * 
 * tags:
 *  name: bme
 *  description: API Sensor bme
 * /sensor/bme/{id}:
 *  get:
 *    summary: Returns bme data by sewnsor_id
 *    tags: [bme]
 *    parameters:
 *      - name: sensor_id
 *        in: path
 *        required: true
 *        description: sensor id of bme
 *        schema:
 *          type: integer
 *          enum: [201, 202, 203, 204]
 *    consumes:
 *      application/x-www-form-urlencoded
 *    responses: 
 *      200:
 *        description: Success to retrieve all bme data
 *      404:
 *        description: data not found
 *      500:
 *        description: internal server error
 */