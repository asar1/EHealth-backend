'use strict';

const _ = require('lodash');
const ES = require('../../../base/response/responseService');

module.exports = (req, res, next) => {
    if (!_.get(req, 'body.email')) return next(ES.errorMessage('Email is required'));
    // if (!_.get(req, 'body.password')) return next(ES.errorMessage('Password is required'));
    return next();
};
