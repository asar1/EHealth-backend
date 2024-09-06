'use strict';

const express = require('express');
const router = express.Router();
const RS = require('../../base/response/responseService');
const UserStorage = require('../../auth/storage/UserStorage');
const userStorage = new UserStorage();
const SpecialityStorage = require('../../admin/specialities/storage/SpecialityStorage');
const specialityStorage = new SpecialityStorage();
const unavailabilityService = require('../../unavailability/service/unavailabilityService');
const profileService = require('../../user/service/profileService');
const userPopulation = require('../../auth/storage/populate/userPopulation');
const userService = require('../../admin/user/service/userService');
const upload = require('../../base/service/multerService');
const accessControl = require('../../base/service/middlewares/accessControl');
const openService = require('../openService');

router.get('/role/:role', (req, res, next) => {
    return userStorage
        .list(
            { suspend: false, $or: [{ role: req.params.role }] },
            userPopulation.list,
            { rating: -1 },
            10
        )
        .then(
            (data) => {
                return res.send(RS.successMessage(data));
            },
            (err) => next(err)
        );
});

router.get('/speciality', (req, res, next) => {
    return specialityStorage.list().then(
        (data) => {
            return res.send(RS.successMessage(data));
        },
        (err) => next(err)
    );
});

router.post('/check-appointment/', (req, res, next) => {
    return unavailabilityService.getIsAvailable(req.body).then(
        (data) => {
            return res.send(RS.successMessage(data));
        },
        (err) => next(err)
    );
});

router.get('/search-by-speciality/:id', (req, res, next) => {
    return profileService.getDoctorBySpecially(req.params.id).then(
        (data) => res.send(RS.successMessage(data)),
        (err) => next(err)
    );
});

router.post('/search-with-filters/', (req, res, next) => {
    return userService.searchDoctorWithFilters(req.body, null).then(
        (data) => {
            return res.send(RS.successMessage(data));
        },
        (err) => next(err)
    );
});

router.post('/upload-any-image', upload.any(), async (req, res, next) => {
    return openService
        .uploadImage(req.body, req.files, req.user)
        .then((data) => res.send(RS.successMessage(data)))
        .catch((err) => next(err));
});

router.post('/upload-chat-image', async (req, res, next) => {
    const dataBase64 = new Buffer(req.body.base64.toString(), 'base64');

    const abc = {
        originalname: 'photo.png',
        mimetype: 'image/jpg',
        buffer: dataBase64
    };

    return openService
        .uploadImage(req.body, [abc], req.user)
        .then((data) => res.send(RS.successMessage(data)))
        .catch((err) => next(err));
});

module.exports = router;
