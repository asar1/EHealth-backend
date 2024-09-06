'use strict';

const express = require('express');
const router = express.Router();
const specialityService = require('../service/specialityService');
const accessControl = require('../../..//base/service/middlewares/accessControl');
const RS = require('../../../base/response/responseService');
const upload = require('../../../base/service/multerService');

router.get('/', accessControl.assertUserIsAdmin, (req, res, next) => {
    return specialityService
        .getAllSpecialities()
        .then((data) => res.send(RS.successMessage(data)))
        .catch((err) => next(err));
});

router.post(
    '/',
    upload.any(),
    accessControl.assertUserIsAdmin,
    (req, res, next) => {
        return specialityService
            .addSpeciality(req.body, req.user, req.files)
            .then((data) => res.send(RS.successMessage(data)))
            .catch((err) => next(err));
    }
);

router.put(
    '/:id',
    upload.any(),
    accessControl.assertUserIsAdmin,
    (req, res, next) => {
        return specialityService
            .updateSpeciality(req.params.id, req.body, req.user, req.files)
            .then((data) => res.send(RS.successMessage(data)))
            .catch((err) => next(err));
    }
);

router.delete('/:id', accessControl.assertUserIsAdmin, (req, res, next) => {
    return specialityService
        .deleteSpeciality(req.params.id, req.user)
        .then((data) => res.send(RS.successMessage(null, data)))
        .catch((err) => next(err));
});

module.exports = router;
