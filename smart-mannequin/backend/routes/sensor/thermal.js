'use strict'

const controller = require('../../src/controller/thermalController')

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
 *    thermal:
 *      type: object
 *      required:
 *        - value
 *        - sensor_id 
 *      properties:
 *        value:
 *          type: integer
 *          description: value of thermal
 *        sensor_id:
 *          type: integer
 *          description: sensor id of thermal
 *        inputed_at:
 *          type: datetime
 *          description: inputed at
 */

/**
 * @swagger
 * tags:
 *  name: thermal
 *  description: API Sensor thermal
 * /sensor/thermal:
 *  get:
 *    summary: Returns the list of all the thermal
 *    tags: [thermal]
 *    responses: 
 *      200:
 *        description: Success to retrieve all thermal data
 *      404:
 *        description: data not found
 *      500:
 *        description: internal server error
 *  post:
 *    summary: Create a new thermal data
 *    tags: [thermal]
 */
