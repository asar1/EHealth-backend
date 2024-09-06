'use strict';

class ErrorMessage extends Error {
    constructor (message) {
        super();
        this.message = message;
    }
}

module.exports = ErrorMessage;
