const express = require('express');
const router = express.Router();
const patientService = require('../services/patient');

router
    .post('/get', patientService.get)
    .post('/create', patientService.create)
    .put('/update', patientService.update)
    
    .post('/createPatientEntry', patientService.createPatientEntry)
    .post('/getAllPatient', patientService.getAllPatient)
    .post('/getDashboardCount', patientService.getDashboardCount)
    .post('/getTop10DueAmountPatient', patientService.getTop10DueAmountPatient)
    .post('/getPatientDetails', patientService.getPatientDetails)
    .post('/getDailyCount', patientService.getDailyCount)
    .post('/deletePatientEntry', patientService.deletePatientEntry)
    .post('/updatePatientEntry', patientService.updatePatientEntry)



    


module.exports = router;