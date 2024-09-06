'use strict';

class SuccessMessage {
    constructor (data, message = '') {
        this.status = 1;
        this.data = data;
        this.message = message;
    }
}

module.exports = SuccessMessage;
