'use strict';

var express = require('express');
var controller = require('./spots.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:park/:type/:spotId', controller.spot);

module.exports = router;