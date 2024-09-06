'use strict';

const express = require('express');
const router = express.Router();
const authRoute = require('../../auth/route/api');
const authMiddleware = require('../service/middlewares/authMiddleware');
const profileRoute = require('../../user/route/api');
const forumRoute = require('../../forum/route/api');
const openEndedApis = require('../../openEnded/route/api');
const scheduleRoute = require('../../schedule/route/api');
const availablityRoute = require('../../unavailability/route/api');
const appointmentsRoute = require('../../appointments/route/api');
const medicalRecordApi = require('../../medicalRecords/route/api');
const feedbackApi = require('../../feedback/route/api');
/*
 * authentication api
 */

router.use('/auth', authRoute);
router.use('/open', openEndedApis);
router.use('/user', profileRoute);
router.use('/schedule', scheduleRoute);

/*
 *apis which dont need authorization
*/

/*
 * middleware for all below api's
 */
router.use(authMiddleware);

/*
 * other api's
 */
// router.use("/user", userRoute)
router.use('/appointment', appointmentsRoute);
router.use('/forum', forumRoute);
router.use('/availability', availablityRoute);
router.use('/medical-records', medicalRecordApi);
router.use('/feedback', feedbackApi);

module.exports = router;
