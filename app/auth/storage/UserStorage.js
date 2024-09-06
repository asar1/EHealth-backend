'use strict';

const BaseStorage = require('../../base/storage/BaseStorage');
const UserModel = require('./model/User');

class UserStorage extends BaseStorage {
    constructor (props) {
        super({ ...props, Model: UserModel });
    }

    store (data, user, populate) {
        return super.store(data, user, populate);
    }

    update (docId, updateData, user, populate) {
        return super.update(docId, updateData, user, populate);
    }
}

module.exports = UserStorage;
