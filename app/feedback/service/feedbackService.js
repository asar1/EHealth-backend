'use strict';

const FeedbackStorage = require('../storage/FeedbackStorage');
const feedbackStorage = new FeedbackStorage();
const feedbackPopulation = require('../storage/populate/feedbackPopulation');
const UserStorage = require('../../auth/storage/UserStorage');
const userStorage = new UserStorage();
const userPopulation = require('../../auth/storage/populate/userPopulation');
const AppointmentStorage = require('../../appointments/storage/AppointmentStorage');
const appointmentPopulation = require('../../appointments/storage/populate/appointmentPopulation');
const appointmentStorage = new AppointmentStorage();
const RS = require('../../base/response/responseService');

const addFeedback = async (param, user) => {
    const dataToSend = {
        rating: param.rating,
        feedback: param.feedback,
        appointment: param.appointment,
        // doctor: param.doctor,
        user: user._id
    };

    const doctorId = await appointmentStorage.find(param.appointment, {}, appointmentPopulation.find);
    console.log(doctorId.doctor._id, 'these are doctor id');

    dataToSend.doctor = doctorId.doctor._id;

    const results = await feedbackStorage.store(dataToSend, user, feedbackPopulation.find);
    console.log(results, 'these are results');
    const previousFeedBacks = await feedbackStorage.list({ doctor: doctorId.doctor._id }, feedbackPopulation.list);
    console.log(previousFeedBacks, 'these are previous feedbacks');

    let previousRating = 0;
    let ratingShouldBe = 0;
    if (previousFeedBacks.length > 0) {
        for (let index = 0; index < previousFeedBacks.length; index++) {
            const element = previousFeedBacks[index];
            previousRating = previousRating + element.rating;
        }

        ratingShouldBe = calculateRating(previousRating, previousFeedBacks.length);
    } else {
        ratingShouldBe = param.rating;
    }

    await userStorage.update(doctorId.doctor._id, { rating: ratingShouldBe, feedbacks: previousFeedBacks.length }, user, userPopulation.find);

    return results;
};

const calculateRating = (total, totalLength, maxPercentage = 5) => {
    return (total / (totalLength * maxPercentage) * maxPercentage).toFixed(1);
};

const getAllFeedbackAgainstADoctor = (doctorId) => {
    return feedbackStorage.list({ doctor: doctorId }, feedbackPopulation.list);
};

module.exports = {
    addFeedback,
    getAllFeedbackAgainstADoctor
};
