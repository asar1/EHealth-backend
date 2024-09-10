'use strict';

const express = require('express');
const router = express.Router();
const authService = require('../service/authService');
const userAuthMiddleware = require('../service/middlewares/userAuthMiddleware');
const facebookSigninMiddleware = require('../service/middlewares/facebookSigninMiddleware');
const googleSigninMiddleware = require('../service/middlewares/googleSigninMiddleware');
const RS = require('../../base/response/responseService');

// Get a user against email
router.get('/check', (req, res, next) => {
    return authService.userExistsWithEmail(req.query.email)
        .then(data => {
            return res.send(RS.successMessage(data));
        }, err => next(err));
});

// User signup
router.post('/signup', (req, res, next) => {
    return authService.userSignup(req.body)
        .then(data => {
            return res.send(RS.successMessage(data));
        }, err => next(err));
});

// User login
router.post('/login', userAuthMiddleware, (req, res, next) => {
    console.log(req, 'in login');
    return authService.userLogin(req.body)
        .then(data => {
            return res.send(RS.successMessage(data));
        }, err => next(err));
});

// check duplication in social logins
router.post('/checkDuplicate', (req, res, next) => {
    const obj = req.body.credentails;
    if (obj.loginThrough === 'facebook') {
        return authService.userExistsWithFacebook(obj)
            .then(data => {
                return res.send(RS.successMessage(data));
            }, err => next(err));
    } else if (obj.loginThrough === 'google') {
        return authService.userExistsWithGoogle(obj)
            .then(data => {
                return res.send(RS.successMessage(data));
            }, err => next(err));
    } else {
        return authService.userExistsPhoneNo(obj)
            .then(data => {
                return res.send(RS.successMessage(data));
            }, err => next(err));
    }
});
// Signin by facebook
router.post('/facebooksignin', (req, res, next) => {
    const socialType = 'facebook';
    return authService.socialSignin(req.body, socialType)
        .then(data => {
            return res.send(RS.successMessage(data));
        }, err => next(err));
});

// Signin by google
router.post('/googlesignin', (req, res, next) => {
    const socialType = 'google';
    return authService.socialSigninWithGoogle(req.body, socialType)
        .then(data => {
            console.log(data, 'data');
            return res.send(RS.successMessage(data));
        }, err => next(err));
});

// Signin by phoneNo
router.post('/phonenosignin', (req, res, next) => {
    return authService.phoneNoSignin(req.body)
        .then(data => {
            return res.send(RS.successMessage(data));
        }, err => next(err));
});

router.post('/get-token', (req, res, next) => {
    return authService.generateAuthToken()
        .then(data => {
            return res.send(RS.successMessage(data));
        }, err => next(err));
});

module.exports = router;
