'use strict';

const express = require('express');
const router = express.Router();
const scheduleService = require('../service/scheduleService');
const RS = require('../../base/response/responseService');

router.get('/:doctor', async (req, res, next) => {
    try {
        const data = await scheduleService.getSchedulesAndAvailability(req.params.doctor);
        return res.send(RS.successMessage(data));
    } catch (err) {
        return next(err);
    }
});

router.post('/', async (req, res, next) => {
    console.log(req.user, 'this is user token');
    try {
        const data = await scheduleService.addSchedule(req.body, req.user);
        return data === true ? res.send(RS.successMessage('', 'Schedule has been added')) : res.send(RS.errorMessage(data));
    } catch (err) {
        return next(err);
    }
});

router.post('/schedule-and-available', async (req, res, next) => {
    try {
        const data = await scheduleService.addOrUpdateSchedeAndUnavailability(req.body, req.user);
        return res.send(data);
    } catch (err) {
        return next(err);
    }
});

router.delete('/', async (req, res, next) => {
    try {
        const data = await scheduleService.deleteSchedule(req.body);
        return res.send(RS.successMessage(data));
    } catch (err) {
        return next(err);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const data = await scheduleService.updateSchedule(req.params.id, req.body, req.user);
        return res.send(RS.successMessage(data));
    } catch (err) {
        return next(err);
    }
});

router.post('/update-time/', async (req, res, next) => {
    try {
        const data = await scheduleService.updateTimeForAllSlot(req.body, req.user);
        return res.send(RS.successMessage(data));
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
