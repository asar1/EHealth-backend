'use strict';

const RS = require('../../../base/response/responseService');
const BaseValidator = require('../../../base/storage/validation/BaseValidator');
const UserModel = require('../model/User');

class UserValidator extends BaseValidator {
    constructor (props) {
        super({ ...props, Model: UserModel });
    }

    store (data, user) {
        return super.store()
            .then(() => {
                if (!data.email || data.email === '') return Promise.resolve();
                return this.Model.findOne({ email: data.email });
            })
            .then(user => {
                if (user) return Promise.reject(RS.errorMessage('User with that email does already exist'));
                return Promise.resolve();
            });
    }
}

module.exports = UserValidator;
