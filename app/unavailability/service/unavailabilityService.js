'use strict';

const UnavailabilityStorage = require('../storage/UnavailabilityStorage');
const unavailabilityStorage = new UnavailabilityStorage();
const unavailabilityPopulation = require('../storage/populate/unavailabilityPopulation');
const Unavailability = require('../storage/model/Unavailability');
// const scheduleService = require('../../schedule/service/scheduleService');

const Days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Satureday'];

const addUnavailability = async (param, user) => {
    const dataToSave = {
        day: param.day,
        availability: param.availability,
        schedule: '',
        doctor: user._id
    };
    if (param.availability === 'partially available') {
        if (typeof (param.schedule) === 'object') {
            // const results = await scheduleService.addIrregularSchedule(param.schedule, param.timeForASlot, user);
            console.log(results, 'these are results');
            dataToSave.schedule = results._id;
        } else {
            dataToSave.schedule = param.schedule;
        }
    } else {
        dataToSave.schedule = null;
    }
    return unavailabilityStorage.store(dataToSave, user, unavailabilityPopulation.find);
};

const updateUnAvailability = async (docId, updatedData, user) => {
    const dataToSave = {
        day: updatedData.day,
        availability: updatedData.availability,
        schedule: '',
        doctor: user._id
    };
    if (updatedData.availability === 'partially available') {
        if (typeof (updatedData.schedule) === 'object') {
            // const results = await scheduleService.addIrregularSchedule(updatedData.schedule, updatedData.timeForASlot, user);
            console.log(results, 'these are results');
            dataToSave.schedule = results._id;
        } else {
            dataToSave.schedule = updatedData.schedule;
        }
    } else {
        dataToSave.schedule = null;
    }
    return unavailabilityStorage.update(docId, dataToSave, user, unavailabilityPopulation.find);
};

const deleteUnavailability = (docId, user) => {
    return unavailabilityStorage.delete(docId, user);
};

const getAllUnAvailability = (user) => {
    return unavailabilityStorage.list({ doctor: user });
};

const getIsAvailable = async (param) => {
    const date = new Date(param.date);
    const day = Days[date.getDay()];
    console.log(date, 'this is day date');
    console.log(date.getDay(), 'this is day');
    const status = await unavailabilityStorage.list({ day: day, doctor: param.doctor }, unavailabilityPopulation.find);
    console.log(status, 'status');
    if (status.length > 0) {
        if (status[0].availability === 'partially available') {
            return Promise.resolve([status]);
        } else {
            return Promise.resolve('Sorry doctor saab is not available.');
        }
    } else {
        // const schedules = await scheduleService.getScheduleById(param.doctor);
        return Promise.resolve([]);
    }
};

const deleteAllUnAvailability = (param) => {
    return unavailabilityStorage.deleteMany({ doctor: param });
};

const addMultipleUnavailabilit = (param) => {
    return Unavailability.insertMany(param);
};

module.exports = {
    addUnavailability,
    updateUnAvailability,
    deleteUnavailability,
    getAllUnAvailability,
    getIsAvailable,
    deleteAllUnAvailability,
    addMultipleUnavailabilit
};
