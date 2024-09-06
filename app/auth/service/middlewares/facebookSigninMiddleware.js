'use strict';

const _ = require('lodash');
const ES = require('../../../base/response/responseService');

module.exports = (req, res, next) => {
    if (!_.get(req, 'body.facebookId')) return next(ES.errorMessage('FacebookId is required'));
    return next();
};
