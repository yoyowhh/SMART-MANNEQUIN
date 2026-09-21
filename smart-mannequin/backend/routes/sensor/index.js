'use strict'

let express = require('express');
let router = express.Router();
const cors = require('cors')

router.get('/', cors(), function(req, res, next) {
  res.json('sensor');
});

router.use('/adxl', cors(), require('./adxl'));
router.use('/bme', cors(), require('./bme'));
router.use('/dht', cors(), require('./dht'));
router.use('/ky', cors(), require('./ky'));
router.use('/lidar', cors(), require('./lidar'));
router.use('/lidartest', cors(), require('./lidartest'));
router.use('/loadcell', cors(), require('./loadcell'));
router.use('/mpu', cors(), require('./mpu'));
router.use('/mq', cors(), require('./mq'));
router.use('/thermal', cors(), require('./thermal'));
router.use('/witsensor', cors(), require('./wit'));
router.use('/skin', cors(), require('./skin'));
router.use('/lora', cors(), require('./lora'));

module.exports = router;
