'use strict';

const MedicalRecordStorage = require('../storage/MedicalRecordStorage');
const medicalRecordStorage = new MedicalRecordStorage();
const medicalRecordPopulation = require('../storage/populate/medicalRecordPopulation');
const {
    imageUploadToGCS
} = require('../../base/service/integration/google-cloud-storage');

const addMedicalRecord = async (param, files, user) => {
    const dataToSend = {
        testName: param.testName,
        date: param.date,
        from: param.from,
        notes: param.notes,
        patient: param.patient,
        doctor: param.doctor
    };
    if (files && files.length > 0) {
        const images = [];
        for (let index = 0; index < files.length; index++) {
            const element = files[index];
            const imageUrl = await imageUploadToGCS(element);
            images.push(imageUrl);
        }
        dataToSend.attachment = images;
    }

    return medicalRecordStorage.store(
        dataToSend,
        user,
        medicalRecordPopulation.find
    );
};

const getMedicalRecordsAgainstAppointment = (appointmnetId) => {
    return medicalRecordStorage.list(
        { appointment: appointmnetId },
        medicalRecordPopulation.list
    );
};

const getMedicalRecordsbyDate = async (date) => {
    const previousFromThisDate = await medicalRecordStorage.list({ date: { $lt: date } }, medicalRecordPopulation.list, { date: -1 });
    const nextFromThisDate = await medicalRecordStorage.list({ date: { $gt: date } }, medicalRecordPopulation.list, { date: -1 });
    const forCurrentDate = await medicalRecordStorage.list({ date: date }, medicalRecordPopulation.list, { date: -1 });

    const previouExistence = previousFromThisDate.length > 0 ? previousFromThisDate[0].date : false;
    const futureExistence = nextFromThisDate.length > 0 ? nextFromThisDate[0].date : false;
    return Promise.resolve({ previous: previouExistence, future: futureExistence, current: forCurrentDate });
};

const getMedicalRecordsbyUser = async (user) => {
    return medicalRecordStorage.list({ patient: user }, medicalRecordPopulation.list, { date: -1 });
};

const updateMedicalRecord = async (medicalRecordId, param, files, user) => {
    const dataToSend = {
        testName: param.testName,
        date: param.date,
        from: param.from,
        reason: param.reason,
        notes: param.notes,
        attachment: param.attachment
    };
    if (files.length > 0) {
        for (let index = 0; index < files.length; index++) {
            const element = files[index];
            const imageUrl = await imageUploadToGCS(element);
            dataToSend.attachment.push(imageUrl);
        }
    }

    return medicalRecordStorage.update(
        medicalRecordId,
        dataToSend,
        user,
        medicalRecordPopulation.find
    );
};

const deleteMedicalRecord = async (medicalRecordId, user) => {
    try {
        await medicalRecordStorage.delete(medicalRecordId, user);
        return 'Medical record has been deleted';
    } catch (error) {
        return 'Something went wrong on server.';
    }
};

module.exports = {
    addMedicalRecord,
    getMedicalRecordsAgainstAppointment,
    updateMedicalRecord,
    deleteMedicalRecord,
    getMedicalRecordsbyDate,
    getMedicalRecordsbyUser
};
