'use strict'

const controller = require('../../src/controller/witController')

let express = require('express');
let router = express.Router();

router.get('/', controller.index);
router.get('/acceleration', controller.getAcc);
router.get('/velocity', controller.getVelo);
router.get('/angle', controller.getAngle);
router.get('/magnetic', controller.getMag);
router.get('/quaternion', controller.getQ);
router.get('/pressure', controller.getPressure);
router.get('/:id', controller.show);
router.post('/', controller.store);

module.exports = router;
