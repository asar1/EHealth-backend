'use strict';

const express = require('express');
const router = express.Router();
const authService = require('../service/authService');
const userAuthMiddleware = require('../../../auth/service/middlewares/userAuthMiddleware');
const RS = require('../../../base/response/responseService');

// Admin login
router.post('/login', userAuthMiddleware, (req, res, next) => {
    return authService.adminLogin(req.body)
        .then(data => {
            return res.send(RS.successMessage(data));
        }, err => next(err));
});

module.exports = router;
