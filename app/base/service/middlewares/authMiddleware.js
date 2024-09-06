'use strict';

const jwt = require('jsonwebtoken');
const RS = require('../../response/responseService');
module.exports = (req, res, next) => {
    try {
        console.log(req, 'req');
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            console.log(token, 'asdfasdfsd');
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            req.user = decoded;
            console.log(decoded, 'asdfsdfsdf');
            return next();
        }
    } catch (error) {
        console.log('that', error);
        return Promise.reject(RS.errorMessage('Auth failed'));
    }
};
