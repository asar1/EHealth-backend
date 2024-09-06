'use strict';

const BaseStorage = require('../../../base/storage/BaseStorage');
const SpecialityModel = require('./model/Speciality');

class SpecialityStorage extends BaseStorage {
    constructor (props) {
        super({ ...props, Model: SpecialityModel });
    }

    store (data, user, populate) {
        return super.store(data, user, populate);
    }

    update (docId, updateData, user, populate) {
        return super.update(docId, updateData, user, populate);
    }
}

module.exports = SpecialityStorage;
