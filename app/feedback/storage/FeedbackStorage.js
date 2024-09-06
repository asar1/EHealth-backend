'use strict';

const BaseStorage = require('../../base/storage/BaseStorage');
const feedbackModel = require('./model/Feedback');

class FeedbackStorage extends BaseStorage {
    constructor (props) {
        super({ ...props, Model: feedbackModel });
    }

    store (data, user, populate) {
        return super.store(data, user, populate);
    }

    update (docId, updateData, user, populate) {
        return super.update(docId, updateData, user, populate);
    }
}

module.exports = FeedbackStorage;
