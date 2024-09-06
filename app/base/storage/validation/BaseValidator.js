'use strict';

const Promise = require('bluebird');
const RS = require('../../response/responseService');
const crudValidator = require('./CRUDValidator');
const UserModel = require('../../../auth/storage/model/User');

class BaseValidator {
    constructor ({ Model }) {
        this.Model = Model;
    }

    store (data, user) {
        const userIsRequired = Boolean(this.Model.modelName !== 'User');
        if (userIsRequired && !user) return Promise.reject(RS.errorMessage('User is required'));
        if (user) return crudValidator.validateDocExist(UserModel, user._id);
        return Promise.resolve();
    }

    update (docId, updateData, user) {
        return crudValidator.validateDocExist(this.Model, docId);
    }

    delete (docId, user) {
        return crudValidator.validateDocExist(this.Model, docId);
    }

    find (docId, params) {
        return Promise.resolve();
    }

    findOne (params) {
        return Promise.resolve();
    }

    list (params) {
        return Promise.resolve();
    }
}

module.exports = BaseValidator;
