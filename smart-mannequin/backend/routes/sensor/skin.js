'use strict'

// const controller = require('../../src/controller/loadcellController')
const controller = require('../../src/controller/skinController')

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
 *    skin:
 *      type: object
 *      required:
 *        - value
 *        - sensor_id
 *      properties:
 *        value:
 *          type: integer
 *          description: value of skin
 *        sensor_id:
 *          type: integer
 *          description: sensor id of skin
 *        inputed_at:
 *          type: datetime
 *          description: inputed at
 */

/**
 * @swagger
 * tags:
 *  name: skin
 *  description: API Sensor skin
 * /sensor/skin:
 *  get:
 *    summary: Returns the list of all the skin
 *    tags: [skin]
 *    responses:
 *      200:
 *        description: Success to retrieve all skin data
 *      404:
 *        description: data not found
 *      500:
 *        description: internal server error
 *  post:
 *    summary: Create a new skin data
 *    tags: [skin]
 *    description:
 *      sensor_id
 *      | 1101 = lengan atas kanan
 *      | 1102 = siku kanan
 *      | 1103 = lengan bawah kanan
 *      | 1104 = lengan atas kiri
 *      | 1105 = siku kiri
 *      | 1106 = lengan bawah kiri
 *    requestBody:
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            type: object
 *            properties:
 *              value:
 *                type: integer
 *              sensor_id:
 *                type: integer
 *                enum: [1101,1102,1103,1104,1105,1106]
 *    consumes:
 *      application/x-www-form-urlencoded
 *    responses:
 *      200:
 *        description: Success to retrieve all skin data
 *      404:
 *        description: data not found
 *      500:
 *        description: internal server error
 */

/**
 * @swagger
 *
 * tags:
 *  name: skin
 *  description: API Sensor skin
 * /sensor/skin/{id}:
 *  get:
 *    summary: Returns skin data by sensor_id
 *    tags: [skin]
 *    parameters:
 *      - name: sensor_id
 *        in: path
 *        required: true
 *        description: sensor id of skin
 *        schema:
 *          type: integer
 *          enum: [1101,1102,1103,1104,1105,1106]
 *    consumes:
 *      application/x-www-form-urlencoded
 *    responses:
 *      200:
 *        description: Success to retrieve all skin data
 *      404:
 *        description: data not found
 *      500:
 *        description: internal server error
 */
