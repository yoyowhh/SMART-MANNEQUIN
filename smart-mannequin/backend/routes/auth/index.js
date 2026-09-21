'use strict'

const controller = require('../../src/controller/auth/authController')

let express = require('express');
let router = express.Router();

// router.get('/', controller.index);
router.post('/signin', controller.signIn);
router.post('/signup', controller.signUp);

module.exports = router;