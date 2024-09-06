'use strict';

const express = require('express');
const router = express.Router();
const appRoutes = require('./api');
const adminRoutes = require('./admin');
const hospitalRoutes = require('./hospital');
const authService = require('../../auth/service/authService');

router.use('/admin', adminRoutes);
router.use('/api', appRoutes);
router.use('/hospital', hospitalRoutes);

router.get('/', (req, res, next) => {
    // authService.pmdcVerification('100008-P')
    res.send('welcome!');
});

module.exports = router;
