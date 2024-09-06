'use strict';

const express = require('express');
const router = express.Router();
const appointmentService = require('../service/appointmentService');
const RS = require('../../base/response/responseService');

router.post('/', (req, res, next) => {
    console.log(req.body, 'req.body');
    console.log(req.user, 'this is user');

    return appointmentService.addSchedule(req.body, req.user)
        .then(data => res.send(RS.successMessage(data)))
        .catch(err => next(err));
});

router.put('/', (req, res, next) => {
    return appointmentService.changeAppointmentStatus(req.body, req.user)
        .then(data => res.send(RS.successMessage(data)))
        .catch(err => next(err));
});

module.exports = router;
