'use strict'

const controller = require('../../src/controller/mannequin/mannequinController')

let express = require('express');
let router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);

module.exports = router;