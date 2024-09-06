'use strict';

const express = require('express');
const router = express.Router();
const userAuthMiddleware = require('../../../auth/service/middlewares/userAuthMiddleware');
const authService = require('../service/authService');
const RS = require('../../../base/response/responseService');

// hospital login
router.post('/login', userAuthMiddleware, (req, res, next) => {
    return authService.hospitalLogin(req.body)
        .then(data => {
            return res.send(RS.successMessage(data));
        }, err => next(err));
});

module.exports = router;
