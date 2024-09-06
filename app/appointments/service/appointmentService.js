'use strict';

const AppointmentStorage = require('../storage/AppointmentStorage');
const appointmentStorage = new AppointmentStorage();
const appointmentPopulation = require('../storage/populate/appointmentPopulation');
const Appointment = require('../storage/model/Appointment');
const ScheduleStorage = require('../../schedule/storage/ScheduleStorage');
const scheduleStorage = new ScheduleStorage();
const schedulePopulation = require('../../schedule/storage/populate/schedulePopulation');
const RS = require('../../base/response/responseService');
const unavailabilityService = require('../../unavailability/service/unavailabilityService');

const addSchedule = async (param, user) => {
    const dataToServer = {
        schedule: param.schedule,
        doctor: param.doctor,
        date: param.date,
        patient: param.patient,
        timeSlot: param.timeSlot,
        timeLable: param.timeLable,
        attachments: param.attachments,
        notes: param.notes
    };
    const shouldCreateAppointment = await checkIfDoctorAvailableAtDateAndSchedule(
        dataToServer.date,
        dataToServer.schedule,
        param.doctor,
        param.timeSlot
    );
    if (shouldCreateAppointment) {
        return Promise.reject(RS.errorMessage('Sorry ! This slot is full of appointments'));
    } else {
        console.log(dataToServer, 'data to server');
        return appointmentStorage.store(
            dataToServer,
            user,
            appointmentPopulation.find
        );
    }
};

const checkIfDoctorAvailableAtDateAndSchedule = async (
    date,
    schedule,
    doctor,
    timeSlot
) => {
    console.log(date, 'date');
    const previousDay = new Date(date);
    console.log(previousDay, 'date previous');
    previousDay.setDate(previousDay.getDate() - 1);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    console.log(previousDay, 'previous day');
    console.log(nextDay, 'next day');

    const appointmentsCount = await Appointment.countDocuments({
        $and: [{ date: { $lt: nextDay.toISOString() } }, { date: { $gt: previousDay.toISOString() } }, { doctor: doctor }, { schedule }, { timeSlot }, { status: 'booked' }]
    });

    // const appointmentsCount = await Appointment.countDocuments({
    //   doctor: doctor,
    //   schedule: schedule,
    //   date: date,
    //   timeSlot: timeSlot,
    //   status: 'booked'
    // });

    console.log(appointmentsCount, 'appointmentsCount');

    return appointmentsCount !== 0;
};

const getDoctorsAgainstAppointmentByUser = async (param) => {
    const appointments = await appointmentStorage.list({ patient: param.userId }, appointmentPopulation.find);

    const myDoctors = [];

    for (let index = 0; index < appointments.length; index++) {
        const element = appointments[index];
        if (!myDoctors.find(x => x.doctor._id == element.doctor._id)) {
            const available = typeof await unavailabilityService.getIsAvailable({ date: param.date, doctor: element.doctor._id }) === 'object';

            myDoctors.push({
                doctor: element.doctor,
                available
            });
        }
    };

    return myDoctors;
};

const getPatientsAgainstAppointmentsByDoctor = async (param) => {
    const appointments = await appointmentStorage.list({ doctor: param.doctor }, appointmentPopulation.find, { createdAt: -1 });

    const myPatients = [];

    for (let index = 0; index < appointments.length; index++) {
        const element = appointments[index];
        if (!myPatients.find(x => x.patient._id == element.patient._id)) {
            myPatients.push(element);
        }
    };

    return myPatients;
};

const getAppointmentsByUserId = (user) => {
    return appointmentStorage.list({ patient: user }, appointmentPopulation.find);
};

const getAppointmentsByDoctorId = (doctor) => {
    return appointmentStorage.list({ doctor: doctor }, appointmentPopulation.find);
};

const doctorAppointments = (user, date) => {
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    console.log(previousDay.toISOString(), 'previous day');
    console.log(nextDay.toISOString(), 'next day');
    // return appointmentStorage.list({ doctor: user, date: date }, appointmentPopulation.find);
    return appointmentStorage.list({ doctor: user, $and: [{ date: { $lt: nextDay.toISOString() } }, { date: { $gt: previousDay.toISOString() } }] }, appointmentPopulation.find);
};

const changeAppointmentStatus = (appointment, user) => {
    return appointmentStorage.update(appointment.id, { status: appointment.status }, user, appointmentPopulation.find);
};

module.exports = {
    addSchedule,
    getDoctorsAgainstAppointmentByUser,
    getAppointmentsByUserId,
    doctorAppointments,
    changeAppointmentStatus,
    checkIfDoctorAvailableAtDateAndSchedule,
    getPatientsAgainstAppointmentsByDoctor,
    getAppointmentsByDoctorId
};
