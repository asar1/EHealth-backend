'use strict';

const BaseStorage = require('../../base/storage/BaseStorage');
const appointmentModel = require('./model/Appointment');

class AppointmentStorage extends BaseStorage {
    constructor (props) {
        super({ ...props, Model: appointmentModel });
    }

    store (data, user, populate) {
        return super.store(data, user, populate);
    }

    update (docId, updateData, user, populate) {
        return super.update(docId, updateData, user, populate);
    }
}

module.exports = AppointmentStorage;
