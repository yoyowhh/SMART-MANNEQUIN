'use strict'

const controller = require('../../src/controller/lidartestController')

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
 *    lidar:
 *      type: object
 *      required:
 *        - value
 *        - sensor_id
 *      properties:
 *        value:
 *          type: integer
 *          description: value of lidar
 *        sensor_id:
 *          type: integer
 *          description: sensor id of lidar
 *        inputed_at:
 *          type: datetime
 *          description: inputed at
 */

/**
 * @swagger
 * tags:
 *  name: lidar
 *  description: API Sensor Lidar
 * /sensor/lidar:
 *  get:
 *    summary: Returns the list of all the lidar
 *    tags: [lidar]
 *    responses:
 *      200:
 *        description: Success to retrieve all lidar data
 *      404:
 *        description: data not found
 *      500:
 *        description: internal server error
 *  post:
 *    summary: Create a new lidar data
 *    tags: [lidar]
 */
