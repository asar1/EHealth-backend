'use strict';
const RS = require('../../response/responseService');
const User = require('../../../auth/storage/model/User');

const modelByBaseUrl = {
    '/api/user': User
};

const getIsCreator = req => {
    const resObj = { isCreator: false };
    const Model = modelByBaseUrl[req.baseUrl];
    return Model.findById(req.params.id)
        .then(doc => {
            if (!doc) return Promise.reject(RS.errorMessage('Could not find object.'));
            if (Model.modelName === 'User') {
                resObj.isCreator = (doc._id.toString() === req.user._id.toString());
            } else {
                resObj.isCreator = (doc.user.toString() === req.user._id.toString());
            }
            return Promise.resolve(resObj);
        });
};

const getIsAdmin = req => {
    const resObj = { isAdmin: false };
    return User.findById(req.user._id)
        .then(doc => {
            if (!doc) return Promise.reject(RS.errorMessage('Could not find object.'));
            if (doc.role && doc.role === 'admin') {
                resObj.isAdmin = true;

                return Promise.resolve(resObj);
            }
            return Promise.resolve(resObj);
        });
};
const getIsHospital = req => {
    const resObj = { isHospital: false };
    return User.findById(req.user._id)
        .then(doc => {
            if (!doc) return Promise.reject(RS.errorMessage('Could not find object.'));
            if (doc.role && doc.role === 'hospital') {
                resObj.isHospital = true;

                return Promise.resolve(resObj);
            }
            return Promise.resolve(resObj);
        });
};

const getIsPatient = req => {
    const resObj = { isUser: false };
    return User.findById(req.user._id)
        .then(doc => {
            if (!doc) return Promise.reject(RS.errorMessage('Could not find object.'));
            if (doc.role && doc.role === 'user') {
                resObj.isUser = true;

                return Promise.resolve(resObj);
            }
            return Promise.resolve(resObj);
        });
};

const getIsDoctor = req => {
    const resObj = { isDoctor: false };
    return User.findById(req.user._id)
        .then(doc => {
            if (!doc) return Promise.reject(RS.errorMessage('Could not find object.'));
            if (doc.role && doc.role === 'doctor') {
                resObj.isDoctor = true;

                return Promise.resolve(resObj);
            }
            return Promise.resolve(resObj);
        });
};

module.exports = {
    assertUserInParam: (req, res, next) => {
        const userIdInParam = req.params.userId || req.userId;
        if (req.user._id.toString() !== userIdInParam) return next(RS.errorMessage('User does not have permission to this action'));
        return next();
    },
    assertUserIsNotInParam: (req, res, next) => {
        const userIdInParam = req.params.userId || req.userId;
        if (req.user._id.toString() === userIdInParam) return next(RS.errorMessage('User can not perform this action on itself'));
        return next();
    },
    assertUserIsCreator: (req, res, next) => {
        return getIsCreator(req)
            .then(resObj => {
                if (!resObj.isCreator) {
                    return Promise.reject(RS.errorMessage('User does not have access to this action'));
                }
                return Promise.resolve();
            })
            .then(() => next(), err => next(err));
    },

    assertUserIsNotCreator: (req, res, next) => {
        return getIsCreator(req)
            .then(resObj => {
                if (resObj.isCreator) {
                    return Promise.reject(RS.errorMessage('User can not perform this action on her own object'));
                }
                return Promise.resolve();
            })
            .then(() => next(), err => next(err));
    },
    assertUserIsAdmin: (req, res, next) => {
        return getIsAdmin(req)
            .then(resObj => {
                console.log(resObj);
                if (!resObj.isAdmin) {
                    return Promise.reject(RS.errorMessage('User does not have access to this action'));
                }
                return Promise.resolve();
            })
            .then(() => next(), err => next(err));
    },
    assertUserIsHospital: (req, res, next) => {
        return getIsHospital(req)
            .then(resObj => {
                console.log(resObj);
                if (!resObj.isHospital) {
                    return Promise.reject(RS.errorMessage('User does not have access to this action'));
                }
                return Promise.resolve();
            })
            .then(() => next(), err => next(err));
    },
    assertUserIsPatient: (req, res, next) => {
        return getIsPatient(req)
            .then(resObj => {
                console.log(resObj);
                if (!resObj.isUser) {
                    return Promise.reject(RS.errorMessage('User does not have access to this action'));
                }
                return Promise.resolve();
            })
            .then(() => next(), err => next(err));
    },
    assertUserIsDoctor: (req, res, next) => {
        return getIsDoctor(req)
            .then(resObj => {
                console.log(resObj);
                if (!resObj.isDoctor) {
                    return Promise.reject(RS.errorMessage('User does not have access to this action'));
                }
                return Promise.resolve();
            })
            .then(() => next(), err => next(err));
    }

};
