'use strict';

const ErrorMessage = require('./errorMessage');
const SuccessMessage = require('./successMessage');

module.exports = {
    errorMessage: (error) => {
        if (error.message) {
            return new ErrorMessage(error);
        }
        return new ErrorMessage(error);
    },
    successMessage: (message, acutalMessage = '') => {
        return new SuccessMessage(message, acutalMessage);
    }
};
