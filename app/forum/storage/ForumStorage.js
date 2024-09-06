'use strict';

const BaseStorage = require('../../base/storage/BaseStorage');
const ForumModel = require('./model/Forum');

class ForumStorage extends BaseStorage {
    constructor (props) {
        super({ ...props, Model: ForumModel });
    }

    store (data, user, populate) {
        return super.store(data, user, populate);
    }

    update (docId, updateData, user, populate) {
        return super.update(docId, updateData, user, populate);
    }
}

module.exports = ForumStorage;
