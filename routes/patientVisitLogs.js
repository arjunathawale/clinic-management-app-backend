const express = require('express');
const router = express.Router();
const patientVisitLogsService = require('../services/patientVisitLogs');

router
    .post('/get', patientVisitLogsService.get)
    .post('/create', patientVisitLogsService.create)
    .put('/update', patientVisitLogsService.update)


module.exports = router;