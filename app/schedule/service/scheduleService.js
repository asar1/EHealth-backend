'use strict';

const RS = require('../../base/response/responseService');
const ScheduleStorage = require('../storage/ScheduleStorage');
const scheduleStorage = new ScheduleStorage();
const Schedule = require('../storage/model/Schedule');
const schedulePopulation = require('../storage/populate/schedulePopulation');
const unavailabilityService = require('../../unavailability/service/unavailabilityService');
const appointmentService = require('../../appointments/service/appointmentService');

const addSchedule = async (param, user) => {
    if (param.schedules.length > 0) {
        let continueToAdd = false;
        const previousSchedule = await scheduleStorage.list({ doctor: user._id }, schedulePopulation.list);
        console.log(previousSchedule, 'this is previous');
        if (previousSchedule.length > 0) {
            if (previousSchedule[0].timeToEntertainSlot === param.timeToEntertainSlot) {
                continueToAdd = true;
            }
        } else {
            continueToAdd = true;
        }

        if (continueToAdd) {
            console.log('going to add with adding methodology');
            const schedule = makeSchedule(
                param.schedules,
                param.timeToEntertainSlot,
                user
            );
            console.log(schedule, 'this is schedule');
            try {
                await Schedule.insertMany(schedule);
                return Promise.resolve(true);
            } catch (error) {
                return Promise.reject("couldn't add it.");
            }
        } else {
            console.log('going to add with new methodology');

            const previousUpdateSchedule = makeSchedule(previousSchedule, param.timeToEntertainSlot, user);

            console.log(previousUpdateSchedule, 'previous updated Schedule');

            for (let index = 0; index < previousUpdateSchedule.length; index++) {
                const element = previousUpdateSchedule[index];
                await scheduleStorage.update(previousSchedule[index]._id, element, user, schedulePopulation.find);
            }
            const newSchedule = makeSchedule(
                param.schedules,
                param.timeToEntertainSlot,
                user
            );

            try {
                await Schedule.insertMany(newSchedule);
                return Promise.resolve(true);
            } catch (error) {
                return Promise.reject("couldn't add it.");
            }
        }
    } else {
        return Promise.reject('Please add at least one slot !');
    }
};

const makeSchedule = (schedules, timeToEntertainSlot, user, type = 'regular') => {
    const finalSchedule = [];
    for (let index = 0; index < schedules.length; index++) {
        const element = schedules[index];
        const noOfHours = element.to - element.from;
        const noOfHoursInMinutes = HoursToMinutes(noOfHours);
        const noOfSlots = Math.floor(noOfHoursInMinutes / timeToEntertainSlot);
        if (noOfSlots > 0) {
            const objToDb = {
                type: type,
                numberOfSlots: noOfSlots,
                doctor: user._id,
                timeToEntertainSlot: timeToEntertainSlot,
                from: element.from,
                to: element.to
            };

            finalSchedule.push(objToDb);
        } else {
            return RS.errorMessage(
                'Please select appropriate time of slot for time from' + element.from + ' To' + element.to
            );
        }
    }
    return finalSchedule;
};

const HoursToMinutes = (noOfHours) => {
    return noOfHours * 60;
};

const getSchedule = (user) => {
    return scheduleStorage.list({ doctor: user._id }, schedulePopulation.list);
};
const getScheduleById = (doctor) => {
    return scheduleStorage.list({ doctor: doctor }, schedulePopulation.list);
};

const deleteSchedule = async (param) => {
    await scheduleStorage.deleteMany({ _id: { $in: param.scheduleIds } });
    return Promise.resolve('Schedule has been deleted !');
};

const updateSchedule = async (docId, param, user) => {
    const previousTime = await scheduleStorage.list({ doctor: user._id }, schedulePopulation.list);
    const dataToUpdate = makeSchedule([param], previousTime[0].timeToEntertainSlot, user);
    return scheduleStorage.update(docId, dataToUpdate[0], user, schedulePopulation.find);
};

const updateTimeForAllSlot = async (param, user) => {
    const previousSchedule = await scheduleStorage.list({ doctor: user._id, type: 'regular' }, schedulePopulation.list);
    const dataToUpdate = makeSchedule(previousSchedule, param.timeToEntertainSlot, user);
    for (let index = 0; index < dataToUpdate.length; index++) {
        const element = dataToUpdate[index];
        await scheduleStorage.update(previousSchedule[index]._id, element, user, schedulePopulation.find);
    }

    return Promise.resolve('updated your time for all slots');
};
const addIrregularSchedule = (schedule, timeToEntertainSlot, user) => {
    const schedules = makeSchedule([schedule], timeToEntertainSlot, user, 'irregular');

    return scheduleStorage.store(schedules[0], user, schedulePopulation.find);
};

const updateIrregularSchedule = async (schedule, timeToEntertainSlot, user) => {
    const actualSchedule = await scheduleStorage.find(schedule, {}, schedulePopulation.find);
    console.log(actualSchedule, 'actual schedule');
    if (timeToEntertainSlot === actualSchedule.timeToEntertainSlot) {
        return Promise.resolve(actualSchedule);
    } else {
        const schedules = makeSchedule([actualSchedule], timeToEntertainSlot, user, 'irregular');

        return scheduleStorage.update(schedule, schedules[0], user, schedulePopulation.find);
    }
};

const addOrUpdateSchedeAndUnavailability = async (param) => {
    console.log(param.doctor, 'param');
    try {
        if (param.avialbleDays.length > 0) {
            // delete all unavailabilities & add new
            await unavailabilityService.deleteAllUnAvailability(param.doctor);
            await unavailabilityService.addMultipleUnavailabilit(param.avialbleDays);
        } else {
            // delete all unavailabilities
            console.log(typeof unavailabilityService);
            await unavailabilityService.deleteAllUnAvailability(param.doctor);
        }

        if (param.slots.length > 0) {
            // delete all slots & add new
            await scheduleStorage.deleteMany({ doctor: param.doctor });
            const schedules = [];

            for (let index = 0; index < param.slots.length; index++) {
                const element = param.slots[index];

                schedules.push({ ...element, numberOfSlots: Math.floor(element.totalMinutes / param.timeToEntertainSlot), timeToEntertainSlot: param.timeToEntertainSlot });
            }

            await Schedule.insertMany(schedules);
        } else {
            // delete all slots
            await scheduleStorage.deleteMany({ doctor: param.doctor });
        }
        return Promise.resolve(RS.successMessage('Updated schedules', 'Updated schedules'));
    } catch (error) {
        console.log(error);
        return Promise.reject(RS.errorMessage(JSON.stringify(error)));
    }
};

const getSchedulesAndAvailability = async (param) => {
    try {
        const unavailability = await unavailabilityService.getAllUnAvailability(param);
        const schedules = await scheduleStorage.list({ doctor: param });
        console.log(schedules, 'schedules');
        if (schedules.length > 0) {
            const slots = await scheduleToSlots(schedules, new Date(), param);

            return Promise.resolve({ avialbleDays: unavailability, slots: slots, slotTime: schedules[0].timeToEntertainSlot, schedules: schedules });
        } else {
            return Promise.resolve({ avialbleDays: unavailability, slots: schedules, slotTime: '', schedules: schedules });
        }
    } catch (error) {
        return Promise.reject(RS.errorMessage(error.toString()));
    }
};

const getAllSchedules = (doctor) => {
    return scheduleStorage.list({ doctor: doctor });
};

const formatMinutesOrHours = (minutesOrHours) => {
    return minutesOrHours.toString().length > 1 ? minutesOrHours : ('0' + minutesOrHours);
};

const scheduleToSlots = async (schedules, date, doctor) => {
    let slots = [];

    for (let scheduleIndex = 0; scheduleIndex < schedules.length; scheduleIndex++) {
        const schedule = schedules[scheduleIndex];

        for (let hoursIndex = parseInt(schedule.from); hoursIndex < parseInt(schedule.to); hoursIndex++) {
            const hour = hoursIndex;

            let minutes = schedule.timeToEntertainSlot;

            if (hour === parseInt(schedule.from)) {
                const timeSlot = `${formatMinutesOrHours(hour)}:00`;

                const booked = await appointmentService.checkIfDoctorAvailableAtDateAndSchedule(date, schedule._id, doctor, timeSlot);

                slots.push({ text: timeSlot, selected: false, schedule: schedule._id, hour: parseFloat(`${formatMinutesOrHours(hour)}.00`), booked });
            }

            do {
                if (minutes === 60) {
                    const timeSlot = `${formatMinutesOrHours(hour + 1)}:00`;

                    const booked = await appointmentService.checkIfDoctorAvailableAtDateAndSchedule(date, schedule._id, doctor, timeSlot);

                    slots.push({ text: `${formatMinutesOrHours(hour + 1)}:00`, selected: false, schedule: schedule._id, hour: parseFloat(`${formatMinutesOrHours(hour + 1)}.00`), booked });
                } else {
                    const timeSlot = `${formatMinutesOrHours(hour)}:${formatMinutesOrHours(minutes)}`;

                    const booked = await appointmentService.checkIfDoctorAvailableAtDateAndSchedule(date, schedule._id, doctor, timeSlot);

                    slots.push({ text: `${formatMinutesOrHours(hour)}:${formatMinutesOrHours(minutes)}`, selected: false, schedule: schedule._id, hour: parseFloat(`${formatMinutesOrHours(hour)}.${formatMinutesOrHours(minutes)}`), booked });
                }
                minutes = minutes + schedule.timeToEntertainSlot;
            } while (minutes <= 60);
        }

        slots.pop();
    }

    slots = slots.sort((a, b) => a.hour - b.hour);

    return slots;
};

module.exports = {
    addSchedule,
    getSchedule,
    deleteSchedule,
    updateSchedule,
    updateTimeForAllSlot,
    addIrregularSchedule,
    updateIrregularSchedule,
    getScheduleById,
    addOrUpdateSchedeAndUnavailability,
    getSchedulesAndAvailability,
    getAllSchedules,
    scheduleToSlots
};
