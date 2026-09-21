'use strict'

const controller = require('../../src/controller/mqController')

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
 *    mq:
 *      type: object
 *      required:
 *        - value
 *        - sensor_id 
 *      properties:
 *        value:
 *          type: integer
 *          description: value of mq
 *        sensor_id:
 *          type: integer
 *          description: sensor id of mq
 *        inputed_at:
 *          type: datetime
 *          description: inputed at
 */

/**
 * @swagger
 * tags:
 *  name: mq
 *  description: API Sensor mq
 * /sensor/mq:
 *  get:
 *    summary: Returns the list of all the mq
 *    tags: [mq]
 *    responses: 
 *      200:
 *        description: Success to retrieve all mq data
 *      404:
 *        description: data not found
 *      500:
 *        description: internal server error
 *  post:
 *    summary: Create a new mq data
 *    tags: [mq]
 */
