'use strict';

var express = require('express');
var ics = require('./ics');

var router = express.Router();

router.get('/', function(req, res, next) {
    ics.sendIcsInResponse(res);
});


module.exports = router;

