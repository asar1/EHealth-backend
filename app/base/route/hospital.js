'use strict';

const express = require('express');
const router = express.Router();
const authRoute = require('../../hospital/auth/route/api');
const authMiddleware = require('../service/middlewares/authMiddleware');
// const dashboardRoute = require('../../admin/dashboard/route/api');
const doctorRoute = require('../../hospital/doctors/route/api');

/*
 * authentication api
 */

router.use('/auth', authRoute);

/*
 * middleware for all below api's
 */
router.use(authMiddleware);

/*
 * other api's
 */
// router.use("/user", userRoute)
// router.use('/dashboard', dashboardRoute);
router.use('/doctors', doctorRoute);

module.exports = router;
