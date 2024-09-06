'use strict';

const RS = require('../../response/responseService');

module.exports = {
    validateDocExist: (Model, id) => {
        return Model.findById(id)
            .then(doc => {
                if (!doc) return Promise.reject(RS.errorMessage('Doc does not exist'));
                return Promise.resolve(doc);
            });
    }
};
