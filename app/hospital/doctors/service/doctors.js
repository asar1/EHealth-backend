'use strict';

'use strict';

const UserStorage = require('../../../auth/storage/UserStorage');
const userStorage = new UserStorage();
const userPopulation = require('../../../auth/storage/populate/userPopulation');
const User = require('../../../auth/storage/model/User');
const RS = require('../../../base/response/responseService');

const getAllDoctorsWithInHospital = (user) => {
    return userStorage.findOne({ _id: user._id }, userPopulation.find);
};

const addDoctorsToHospital = (param, user) => {
    const doctorArray = param.doctors;
    return userStorage.updateOne({ _id: user._id }, { $addToSet: { doctors: { $each: doctorArray } } });
};

const removeDoctorsFromHospital = async (param, user) => {
    const doctorToRemove = param.doctorId;
    // return userStorage.updateOne({_id:doctorToRemove},{ $pull: { doctors: doctorToRemove } },{ safe: true, multi:true, remove: true },function(err, obj) {
    //     //do something smart
    // });
    await User.update({ _id: user._id }, { $pull: { doctors: doctorToRemove } }, { safe: true, multi: true }, (err, obj) => {
        // do something smart
    });
    return 'Success';
};

module.exports = {
    addDoctorsToHospital,
    getAllDoctorsWithInHospital,
    removeDoctorsFromHospital
};
