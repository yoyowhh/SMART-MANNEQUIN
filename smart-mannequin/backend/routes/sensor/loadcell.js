'use strict'

const controller = require('../../src/controller/loadcellController')

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
 *    loadcell:
 *      type: object
 *      required:
 *        - x_axis
 *        - y_axis
 *        - z_axis
 *        - sensor_id
 *      properties:
 *        x_axis:
 *          type: integer
 *          description: value of loadcell
 *        y_axis:
 *          type: integer
 *          description: value of loadcell
 *        z_axis:
 *          type: integer
 *          description: value of loadcell
 *        sensor_id:
 *          type: integer
 *          description: sensor id of loadcell
 *        inputed_at:
 *          type: datetime
 *          description: inputed at
 */

/**
 * @swagger
 * tags:
 *  name: loadcell
 *  description: API Sensor loadcell
 * /sensor/loadcell:
 *  get:
 *    summary: Returns the list of all the loadcell
 *    tags: [loadcell]
 *    responses: 
 *      200:
 *        description: Success to retrieve all loadcell data
 *      404:
 *        description: data not found
 *      500:
 *        description: internal server error
 *  post:
 *    summary: Create a new loadcell data
 *    tags: [loadcell]
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
 *        description: Success to retrieve all loadcell data
 *      404:
 *        description: data not found
 *      500:
 *        description: internal server error
 */

/**
 * @swagger
 * 
 * tags:
 *  name: loadcell
 *  description: API Sensor loadcell
 * /sensor/loadcell/{id}:
 *  get:
 *    summary: Returns loadcell data by sewnsor_id
 *    tags: [loadcell]
 *    parameters:
 *      - name: sensor_id
 *        in: path
 *        required: true
 *        description: sensor id of loadcell
 *        schema:
 *          type: integer
 *          enum: [201, 202, 203, 204]
 *    consumes:
 *      application/x-www-form-urlencoded
 *    responses: 
 *      200:
 *        description: Success to retrieve all loadcell data
 *      404:
 *        description: data not found
 *      500:
 *        description: internal server error
 */