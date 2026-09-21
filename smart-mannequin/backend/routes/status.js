'use strict'

let express = require('express');
let router = express.Router();
const cors = require('cors')

const controller = require('../src/controller/index')

router.get('/', cors(), controller.index)

module.exports = router;
