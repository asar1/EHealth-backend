'use strict';

const BaseStorage = require('../../base/storage/BaseStorage');
const medicalRecordModel = require('./model/MedicalRecord');

class MedicalRecordStorage extends BaseStorage {
    constructor (props) {
        super({ ...props, Model: medicalRecordModel });
    }

    store (data, user, populate) {
        return super.store(data, user, populate);
    }

    update (docId, updateData, user, populate) {
        return super.update(docId, updateData, user, populate);
    }
}

module.exports = MedicalRecordStorage;
