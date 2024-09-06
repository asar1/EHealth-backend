'use strict';

const _ = require('lodash');
const ES = require('../../../base/response/responseService');

module.exports = (req, res, next) => {
    if (!_.get(req, 'body.googleId')) return next(ES.errorMessage('GoogleId is required'));
    return next();
};
