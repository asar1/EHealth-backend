'use strict';

const express = require('express');
const router = express.Router();
const feedbackService = require('../service/feedbackService');
const RS = require('../../base/response/responseService');

router.post('/', (req, res, next) => {
    return feedbackService.addFeedback(req.body, req.user)
        .then(data => res.send(RS.successMessage(data)))
        .catch(err => next(err));
});

module.exports = router;
