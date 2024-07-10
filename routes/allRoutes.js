const express = require("express")
const router = express.Router()

router

    .use('*', require('../services/allServices').isAuthorized)
    .use('/api', require('../services/allServices').isHasToken)

    .post('/user/login', require('../services/users').login)
    .use('/api/user', require('../routes/users'))
    .use('/api/patient', require('../routes/patient'))
    .use('/api/patientVisitLogs', require('../routes/patientVisitLogs'))


module.exports = router