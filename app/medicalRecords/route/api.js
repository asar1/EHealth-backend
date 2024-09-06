'use strict';

const medicalRecordService = require('../service/medicalRecords');
const express = require('express');
const router = express.Router();
const upload = require('../../base/service/multerService');
const accessControl = require('../../base/service/middlewares/accessControl');
const RS = require('../../base/response/responseService');

router.post('/', upload.any(), (req, res, next) => {
    return medicalRecordService
        .addMedicalRecord(req.body, req.files, req.user)
        .then((data) => res.send(RS.successMessage(data)))
        .catch((err) => next(err));
});

router.get('/:id', accessControl.assertUserIsDoctor, (req, res, next) => {
    return medicalRecordService
        .getMedicalRecordsAgainstAppointment(req.params.id)
        .then((data) => res.send(RS.successMessage(data)))
        .catch((err) => next(err));
});

router.put('/:id', upload.any(), accessControl.assertUserIsDoctor, (req, res, next) => {
    return medicalRecordService
        .updateMedicalRecord(req.params.id, req.body, req.files, req.user)
        .then((data) => res.send(RS.successMessage(data)))
        .catch((err) => next(err));
});

router.delete('/:id', accessControl.assertUserIsDoctor, (req, res, next) => {
    return medicalRecordService
        .deleteMedicalRecord(req.params.id, req.user)
        .then((data) => res.send(RS.successMessage(data)))
        .catch((err) => next(err));
});

module.exports = router;
