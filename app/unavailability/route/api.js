'use strict';

const express = require('express');
const router = express.Router();
const unavailabilityService = require('../service/unavailabilityService');
const RS = require('../../base/response/responseService');

router.get('/', (req, res, next) => {
    unavailabilityService.getAllUnAvailability(req.user)
        .then(data => res.send(RS.successMessage(data)))
        .catch(err => next(err));
});

router.post('/', (req, res, next) => {
    unavailabilityService.addUnavailability(req.body, req.user)
        .then(data => res.send(RS.successMessage(data)))
        .catch(err => next(err));
});

router.put('/:id', (req, res, next) => {
    unavailabilityService.updateUnAvailability(req.params.id, req.body, req.user)
        .then(data => res.send(RS.successMessage(data)))
        .catch(err => next(err));
});

router.delete('/:id', (req, res, next) => {
    unavailabilityService.deleteUnavailability(req.params.id, req.user)
        .then(data => res.send(RS.successMessage(null, 'Availability has been deleted')))
        .catch(err => next(err));
});

module.exports = router;
