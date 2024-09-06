'use strict';

const _ = require('lodash');
const bcryptjs = require('bcryptjs');
const moment = require('moment');
const RS = require('../../base/response/responseService');
const User = require('../../auth/storage/model/User');
const UserStorage = require('../../auth/storage/UserStorage');
const UserValidator = require('../../auth/storage/validation/UserValidator');
const userStorage = new UserStorage({
    Model: User,
    CustomValidator: UserValidator
});
const userPopulation = require('../../auth/storage/populate/userPopulation');
const feedbackService = require('../../feedback/service/feedbackService');
const unavailabilityService = require('../../unavailability/service/unavailabilityService');
const scheduleService = require('../../schedule/service/scheduleService');

// const updateUser = async (userId, param, user) => {
//     try {
//         if (param.oldPassword && param.newPassword) {
//             const changeUserPassword = await changePassword(userId, param.oldPassword, param.newPassword);
//             return changeUserPassword;
//         }
//         const updateData = { ...param };
//         return userStorage.update(userId, updateData, user, userPopulation.find);
//     } catch (err) {
//         return Promise.reject(RS.errorMessage(err.message));
//     }
// };

const updateUser = async (userId, param, user) => {
    try {
        let updateData = {};
        if ((param.email && user.email) && param.email !== user.email) {
            console.log('going to find user');
            var existUserWithEmail = await User.findOne({ email: param.email });
        }
        // if (param.password) {
        //     const user = User.findOne({ _id: userId }).populate(userPopulation.find);
        //     if (user) {
        //         // const password = bcryptjs.hashSync(param.password, 10);
        //         if (existUserWithEmail) {
        //             return Promise.reject(RS.errorMessage('Oops this email is already registered!'));
        //         }
        //         // updateData = { ...param, password };
        //         updateData = { ...param };
        //         return userStorage.update(userId, updateData, user, userPopulation.find);
        //     } else {
        //         return Promise.reject(RS.errorMessage('User not found'));
        //     }
        // } else
        else if (existUserWithEmail) {
            return Promise.reject(
                RS.errorMessage('Oops this email is already registered!')
            );
        }
        updateData = { ...param, isProfileCompleted: true };
        return userStorage.update(userId, updateData, user, userPopulation.find);
    } catch (err) {
        return Promise.reject(RS.errorMessage(err.message));
    }
};

const getAUser = async (param) => {
    try {
        let schedules = [];
        let slots = [];
        let nextAvailableDate;
        const user = await userStorage.findOne({ _id: param.userId }, userPopulation.find);
        console.log(user, 'user');
        const feedbacks = await feedbackService.getAllFeedbackAgainstADoctor(param.userId);
        const available = typeof await unavailabilityService.getIsAvailable({ date: param.date, doctor: param.userId }) === 'object';
        if (param.schedule) {
            schedules = await scheduleService.getAllSchedules(param.userId);
            slots = await scheduleService.scheduleToSlots(schedules, param.date, param.userId);

            if (!available) {
                let counter = 1;
                let prevAvailable = false;
                while (!prevAvailable) {
                    nextAvailableDate = new Date(new Date(param.date).getTime() + Number(counter * 24 * 60 * 60 * 1000));
                    prevAvailable = typeof await unavailabilityService.getIsAvailable({ date: nextAvailableDate, doctor: param.userId }) === 'object';
                    counter++;
                }
            }
        }
        return Promise.resolve({ user: user, feedbacks: feedbacks, available: available, schedules: schedules, nextAvailableDate: nextAvailableDate, slots: slots });
    } catch (err) {
        console.log(err, 'error');
        return Promise.reject(RS.errorMessage(err.message));
    }
};

const changePassword = (userId, newPassword) => {
    return User.findOne({ _id: userId })
        .populate(userPopulation.find)
        .then((user) => {
            if (user) {
                const updatePassword = { password: bcryptjs.hashSync(newPassword, 10) };
                return userStorage.update(
                    userId,
                    updatePassword,
                    user,
                    userPopulation.find
                );
            } else {
                return Promise.reject(RS.errorMessage('User not found'));
            }
        });
};

const addAllergies = (param, user) => {
    console.log(param.allergies[0], 'param');
    const allergies = param.allergies;
    if (allergies[0]._id !== '') {
        console.log('in if');
        const propsToUpdate = {};

        propsToUpdate['allergies.$.allergyType'] = allergies[0].allergyType;
        propsToUpdate['allergies.$.reaction'] = allergies[0].reaction;
        propsToUpdate['allergies.$.serverity'] = allergies[0].serverity;
        propsToUpdate['allergies.$.Notes'] = allergies[0].Notes;

        return userStorage.updateOne(
            { _id: user, 'allergies._id': allergies[0]._id },
            propsToUpdate
        );
    } else {
        delete allergies[0]._id;
        console.log('in else');
        return userStorage.updateOne(
            { _id: user },
            { $push: { allergies: allergies[0] } }
        );
    }
};

const addSpecialities = (param, user) => {
    const specialities = param.specialities;

    return userStorage.updateOne(
        { _id: user._id },
        { $addToSet: { specialities: { $each: specialities } } },
        {},
        userPopulation.find
    );
};

const removeAllergies = async (param, user) => {
    const allergies = param.allergies;
    try {
        await User.update(
            { _id: user },
            { $pull: { allergies: { $in: allergies } } },
            { multi: true }
        );

        return Promise.resolve('allergies removed successfully');
    } catch (ex) {
        console.log(ex, 'ex');
        return Promise.reject(RS.errorMessage("couldn't remove alllergies"));
    }
};

const removeSpecailities = async (param, user) => {
    const specialities = param.specialities;
    try {
        await User.update(
            { _id: user._id },
            { $pull: { specialities: { $in: specialities } } },
            { multi: true }
        );

        return Promise.resolve('speciality removed successfully');
    } catch (ex) {
        console.log(ex, 'ex');
        return Promise.reject(RS.errorMessage("couldn't remove spcially"));
    }
};

const getDoctorBySpecially = (specialty) => {
    return userStorage.list({ specialities: { $in: specialty } }, userPopulation.list);
};

module.exports = {
    updateUser,
    getAUser,
    addAllergies,
    removeAllergies,
    addSpecialities,
    removeSpecailities,
    getDoctorBySpecially
};
