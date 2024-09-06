'use strict';

const BaseStorage = require('../../base/storage/BaseStorage');
const inboxModel = require('./model/Inbox');

class InboxStorage extends BaseStorage {
    constructor (props) {
        super({ ...props, Model: inboxModel });
    }

    store (data, user, populate) {
        return super.store(data, user, populate);
    }

    update (docId, updateData, user, populate) {
        return super.update(docId, updateData, user, populate);
    }
}

module.exports = InboxStorage;
