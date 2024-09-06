'use strict';

const UserStorage = require('../../../auth/storage/UserStorage');
const userStorage = new UserStorage();
const userPopulation = require('../../../auth/storage/populate/userPopulation');
const RS = require('../../../base/response/responseService');
const bcryptjs = require('bcryptjs');

const adminLogin = (param) => {
    var email = param.email.toLowerCase();
    return userStorage.findOne({ email: email, $or: [{ role: 'admin' }, { role: 'hospital' }] }, userPopulation.find)
        .then(user => {
            if (user && bcryptjs.compareSync(param.password, user.password)) {
                const token = authToken(user);
                return Promise.resolve({ token: token, user: user });
            } else {
                return Promise.reject(RS.errorMessage('Authentication Failed'));
            }
        });
};

module.exports = {
    adminLogin
};
