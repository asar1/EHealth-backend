'use strict';

const express = require('express');
const router = express.Router();
const doctors = require('../service/doctors');
const accessControl = require('../../../base/service/middlewares/accessControl');
const UserStorage = require('../../../auth/storage/UserStorage');
const userStorage = new UserStorage();
const RS = require('../../../base/response/responseService');
// get doctor with in hospital
router.get('/', accessControl.assertUserIsHospital, (req, res, next) => {
    return doctors.getAllDoctorsWithInHospital(req.user)
        .then(data => {
            return res.send(RS.successMessage(data));
        }, err => next(err));
});
// add doctors to hospitals
router.post('/', accessControl.assertUserIsHospital, (req, res, next) => {
    return doctors.addDoctorsToHospital(req.body, req.user)
        .then(data => {
            return res.send(RS.successMessage(data));
        }, err => next(err));
});

router.post('/removeDoctors', accessControl.assertUserIsHospital, (req, res, next) => {
    return doctors.removeDoctorsFromHospital(req.body, req.user)
        .then(data => {
            return res.send(RS.successMessage(data));
        }, err => next(err));
});

// get doctors
router.get('/doctors', accessControl.assertUserIsHospital, (req, res, next) => {
    console.log('asdfasdasdfasdfad');
    return userStorage.list({ suspend: false, role: 'doctor' })
        .then(data => {
            return res.send(RS.successMessage(data));
        }, err => next(err));
});

module.exports = router;
