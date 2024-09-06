'use strict';

const UserStorage = require('../../../auth/storage/UserStorage');
const userStorage = new UserStorage();
const userPopulation = require('../../../auth/storage/populate/userPopulation');
const RS = require('../../../base/response/responseService');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const hospitalLogin = (param) => {
    var email = param.email.toLowerCase();
    return userStorage.findOne({ email: email, role: 'hospital' }, userPopulation.find)
        .then(user => {
            if (user && bcryptjs.compareSync(param.password, user.password)) {
                const token = authToken(user);
                return Promise.resolve({ token: token, user: user });
            } else {
                return Promise.reject(RS.errorMessage('Authentication Failed'));
            }
        });
};

const authToken = (user) => {
    return jwt.sign(
        {
            email: user.email,
            _id: user._id,
            role: user.role
        },
        process.env.SECRET_KEY,
        {
            expiresIn: process.env.TOKEN_EXPIRY_TIME
        }
    );
};

module.exports = {
    hospitalLogin
};
