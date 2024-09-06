'use strict';

const express = require('express');
const router = express.Router();
const profileService = require('../service/profileService');
const accessControl = require('../../base/service/middlewares/accessControl');
const RS = require('../../base/response/responseService');
const UserStorage = require('../../auth/storage/UserStorage');
const userStorage = new UserStorage();
const appointmentService = require('../../appointments/service/appointmentService');
const feedbackService = require('../../feedback/service/feedbackService');
const medicalRecords = require('../../medicalRecords/service/medicalRecords');

router.get(
    '/my-doctors/:userId/:date',
    // accessControl.assertUserIsPatient,
    (req, res, next) => {
        return appointmentService
            .getDoctorsAgainstAppointmentByUser({ userId: req.params.userId, date: req.params.date })
            .then(
                (data) => res.send(RS.successMessage(data)),
                (err) => next(err)
            );
    }
);

router.get(
    '/my-patients/:userId/',
    // accessControl.assertUserIsDoctor,
    (req, res, next) => {
        return appointmentService
            .getPatientsAgainstAppointmentsByDoctor({ doctor: req.params.userId })
            .then(
                (data) => res.send(RS.successMessage(data)),
                (err) => next(err)
            );
    }
);

router.get(
    '/my-appointments/:userId',
    // accessControl.assertUserIsPatient,
    (req, res, next) => {
        return appointmentService
            .getAppointmentsByUserId(req.params.userId)
            .then(
                (data) => res.send(RS.successMessage(data)),
                (err) => next(err)
            );
    }
);

router.get(
    '/my-appointments-doctor/:userId',
    // accessControl.assertUserIsPatient,
    (req, res, next) => {
        return appointmentService
            .getAppointmentsByDoctorId(req.params.userId)
            .then(
                (data) => res.send(RS.successMessage(data)),
                (err) => next(err)
            );
    }
);

router.get(
    '/doctor-appointments/:doctor/:date',
    (req, res, next) => {
        return appointmentService
            .doctorAppointments(req.params.doctor, req.params.date)
            .then(
                (data) => res.send(RS.successMessage(data)),
                (err) => next(err)
            );
    }
);

router.get(
    '/my-medical-records/:date',
    accessControl.assertUserIsPatient,
    (req, res, next) => {
        return medicalRecords
            .getMedicalRecordsbyDate(req.params.date)
            .then(
                (data) => res.send(RS.successMessage(data)),
                (err) => next(err)
            );
    }
);

router.get(
    '/medical-records-list/:userId',
    // accessControl.assertUserIsPatient,
    (req, res, next) => {
        return medicalRecords
            .getMedicalRecordsbyUser(req.params.userId)
            .then(
                (data) => res.send(RS.successMessage(data)),
                (err) => next(err)
            );
    }
);

router.get(
    '/doctor-full-profile',
    (req, res, next) => {
        const { userId, date, schedule } = req.query;
        return profileService.getAUser({ userId, date, schedule })
            .then((data) => res.send(RS.successMessage(data)),
                (err) => next(err)
            );
    }
);
// get user by Id
router.get('/:id', (req, res, next) => {
    const userId = req.params.id;
    console.log(userId, 'userId');
    return profileService.getAUser({userId: userId}).then(
        (data) => {
            return res.send(RS.successMessage(data));
        },
        (err) => next(err)
    );
});

// get user by Id
router.get('/role/:role', (req, res, next) => {
    return userStorage
        .list({ suspend: false, $or: [{ role: req.params.role }] })
        .then(
            (data) => {
                return res.send(RS.successMessage(data));
            },
            (err) => next(err)
        );
});

// update user and change password
router.put('/:id', (req, res, next) => {
    const userId = req.params.id;
    return profileService.updateUser(userId, req.body, req.user).then(
        (user) => {
            return res.send(RS.successMessage(user));
        },
        (err) => next(err)
    );
});

router.post(
    '/addAllergies/:userId',
    // accessControl.assertUserIsPatient,
    (req, res, next) => {
        console.log(req.body, 'req');
        return profileService.addAllergies(req.body, req.params.userId).then(
            (user) => {
                return res.send(RS.successMessage(user));
            },
            (err) => next(err)
        );
    }
);

router.post(
    '/removeAllergies',
    accessControl.assertUserIsPatient,
    (req, res, next) => {
        return profileService.removeAllergies(req.body, req.user).then(
            (user) => {
                return res.send(RS.successMessage(user));
            },
            (err) => next(err)
        );
    }
);

router.post(
    '/addSpecialities',
    accessControl.assertUserIsDoctor,
    (req, res, next) => {
        return profileService.addSpecialities(req.body, req.user).then(
            (user) => {
                return res.send(RS.successMessage(user));
            },
            (err) => next(err)
        );
    }
);

router.post(
    '/removeSpecialities',
    accessControl.assertUserIsDoctor,
    (req, res, next) => {
        return profileService.removeSpecailities(req.body, req.user).then(
            (user) => {
                return res.send(RS.successMessage(user));
            },
            (err) => next(err)
        );
    }
);

module.exports = router;
