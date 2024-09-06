'use strict';

const express = require('express');
const router = express.Router();
const authRoute = require('../../auth/route/api');
const authMiddleware = require('../service/middlewares/authMiddleware');
// const dashboardRoute = require('../../admin/dashboard/route/api');
const userRoute = require('../../admin/user/route/api');
const specialityRoute = require('../../admin/specialities/route/api');

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
router.use('/user', userRoute);
router.use('/speciality', specialityRoute);

module.exports = router;
