'use strict'

const controller = require('../../src/controller/kyController')

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
 *    Ky:
 *      type: object
 *      required:
 *        - value
 *        - sensor_id 
 *      properties:
 *        value:
 *          type: integer
 *          description: value of ky
 *        sensor_id:
 *          type: integer
 *          description: sensor id of ky
 *        inputed_at:
 *          type: datetime
 *          description: inputed at
 */

/**
 * @swagger
 * tags:
 *  name: Ky
 *  description: API Sensor KY
 * /sensor/ky:
 *  get:
 *    summary: Returns the list of all the ky
 *    tags: [Ky]
 *    responses: 
 *      200:
 *        description: Success to retrieve all ky data
 *      404:
 *        description: data not found
 *      500:
 *        description: internal server error
 *  post:
 *    summary: Create a new ky data
 *    tags: [Ky]
 */
