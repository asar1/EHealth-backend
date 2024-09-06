'use strict';
const SpecialityStorage = require('../storage/SpecialityStorage');
const specialityStorage = new SpecialityStorage();
const specialityPopulation = require('../storage/populate/specialityPopulation');
const User = require('../../../auth/storage/model/User');
const {
    imageUploadToGCS
} = require('../../../base/service/integration/google-cloud-storage');
const RS = require('../../../base/response/responseService');

const addSpeciality = async (param, user, files) => {
    const dataToSend = {
        speciality: param.speciality,
        color: param.color
    };
    if (files.length > 0) {
        const element = files[0];
        const imageUrl = await imageUploadToGCS(element);
        dataToSend.imageUrl = imageUrl;
        return specialityStorage.store(dataToSend, user, specialityPopulation.find);
    } else {
        return Promise.reject(RS.errorMessage('Please add an image to Speciality.'));
    }
};

const getAllSpecialities = () => {
    return specialityStorage.list({}, specialityPopulation.find, {
        createdAt: -1
    });
};

const deleteSpeciality = (specialityId, user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const allergiesToDelete = [];
            allergiesToDelete[0] = specialityId;
            await User.update(
                { _id: user._id },
                { $pull: { allergies: { $in: allergiesToDelete } } },
                { multi: true }
            );
            await specialityStorage.delete(specialityId, user);
            resolve('speciality has been deleted');
        } catch (error) {
            reject('could not delete.');
        }
    });
};

const updateSpeciality = async (specialityId, param, user, files) => {
    const dataToSend = {
        speciality: param.speciality,
        color: param.color
    };

    if (files.length > 0) {
        const element = files[0];
        console.log('---------------------------------------------');
        const imageUrl = await imageUploadToGCS(element);
        dataToSend.imageUrl = imageUrl;
        return specialityStorage.update(
            specialityId,
            dataToSend,
            user,
            specialityPopulation.find
        );
    } else {
        return specialityStorage.update(
            specialityId,
            dataToSend,
            user,
            specialityPopulation.find
        );
    }
};

module.exports = {
    addSpeciality,
    getAllSpecialities,
    deleteSpeciality,
    updateSpeciality
};
