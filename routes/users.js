const express = require('express');
const router = express.Router();
const userService = require('../services/users');

router
    .post('/get', userService.get)
    .post('/create', userService.create)
    .put('/update', userService.update)



module.exports = router;