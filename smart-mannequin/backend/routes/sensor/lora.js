'use strict'
const controller = require('../../src/controller/loraController')

let express = require('express');
let router = express.Router();

router.post('/', controller.store);
router.get('/health', controller.health);
router.get('/diagnostics', controller.diagnostics);

module.exports = router;
