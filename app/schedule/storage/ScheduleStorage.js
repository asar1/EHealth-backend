'use strict';

const BaseStorage = require('../../base/storage/BaseStorage');
const ScheduleModel = require('./model/Schedule');

class ScheduleStorage extends BaseStorage {
    constructor (props) {
        super({ ...props, Model: ScheduleModel });
    }

    store (data, user, populate) {
        return super.store(data, user, populate);
    }

    update (docId, updateDate, user, populate) {
        return super.update(docId, updateDate, user, populate);
    }
}

module.exports = ScheduleStorage;
