'use strict';

const BaseStorage = require('../../base/storage/BaseStorage');
const unavailabilityModel = require('./model/Unavailability');

class UnavailabilityStorage extends BaseStorage {
    constructor (props) {
        super({ ...props, Model: unavailabilityModel });
    }

    store (data, user, populate) {
        return super.store(data, user, populate);
    }

    update (docId, updateDate, user, populate) {
        return super.update(docId, updateDate, user, populate);
    }
}

module.exports = UnavailabilityStorage;
