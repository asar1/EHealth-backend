'use strict';

const express = require('express');
const router = express.Router();
const userService = require('../service/userService');
const UserStorage = require('../../../auth/storage/UserStorage');
const userPopulation = require('../../../auth/storage/populate/userPopulation');
const userStorage = new UserStorage();
const updateUserMiddleware = require('../../../user/service/middlewares/updateUserMiddleware');
const accessControl = require('../../../base/service/middlewares/accessControl');
const User = require('../../../auth/storage/model/User');
const Forum = require('../../../forum/storage/model/Forum');
const RS = require('../../../base/response/responseService');
const { assertUserIsAdmin } = require('../../../base/service/middlewares/accessControl');

// delete user
router.delete('/:id', accessControl.assertUserIsAdmin, (req, res, next) => {
    console.log('sdfghjkkdsdlsdfghjkl');
    const userId = req.params.id;
    return userService.deleteUser(userId, req.user).then(
        (data) => {
            return res.send(RS.successMessage(data));
        },
        (err) => next(err)
    );
});

router.get('/downloadlist', (req, res, next) => {
    console.log('in route');
    return userService.usersData().then(
        (data) => {
            return res.send(RS.successMessage(data));
        },
        (err) => next(err)
    );
});

// download FC user list

router.get('/downloadFClist', (req, res, next) => {
    console.log('in route');
    return userService.FcusersData().then(
        (data) => {
            return res.send(RS.successMessage(data));
        },
        (err) => next(err)
    );
});

// get doctor
router.get('/doctors', accessControl.assertUserIsAdmin, (req, res, next) => {
    console.log('asdfasdasdfasdfad');
    return userStorage.list({ suspend: false, $or: [{ role: 'doctor' }] }).then(
        (data) => {
            return res.send(RS.successMessage(data));
        },
        (err) => next(err)
    );
});

router.get(
    '/getAllHospitals',
    // accessControl.assertUserIsAdmin,
    (req, res, next) => {
        return userStorage.list({ role: 'hospital' }, userPopulation.find).then(
            (data) => {
                return res.send(RS.successMessage(data));
            },
            (err) => next(err)
        );
    }
);

// get stats
router.get('/get-stats', accessControl.assertUserIsAdmin, async (req, res, next) => {
    const doctorCount = await User.countDocuments({ suspend: false, role: 'doctor' });
    const patientCount = await User.countDocuments({ suspend: false, role: 'user' });
    const hospitalCount = await User.countDocuments({
        suspend: false,
        role: 'hospital'
    });
    const forumCount = await Forum.countDocuments({ published: true });
    const finalizedObject = {
        doctorCount: doctorCount,
        patientCount: patientCount,
        hospitalCount: hospitalCount,
        forumCount: forumCount
    };

    return res.send(finalizedObject);
    // return userStorage.list({ suspend: false, $or:[{role: 'doctor'}] })
    //     .then(data => {
    //         return res.send(RS.successMessage(data));
    //     }, err => next(err));
});
// Search user
// router.get('/search', (req, res, next) => {
//     const regex = new RegExp('^' + req.query.name + '.*$', 'i');
//     return User.find({ $or: [{ $text: { $search: req.query.name } }, { name: { $regex: regex } }] }, { score: { $meta: 'textScore' } })
//         .then(data => {
//             return res.send(RS.successMessage(data));
//         }, err => next(err));
// });
// update user and change password
router.put(
    '/:id',
    updateUserMiddleware,
    accessControl.assertUserIsAdmin,
    (req, res, next) => {
        const userId = req.params.id;
        return userService.updateUser(userId, req.body, req.user).then(
            (user) => {
                return res.send(user);
            },
            (err) => next(err)
        );
    }
);
// get user by Id
router.get('/:id', accessControl.assertUserIsAdmin, (req, res, next) => {
    const userId = req.params.id;
    return userService.getAUser(userId).then(
        (data) => {
            return res.send(RS.successMessage(data));
        },
        (err) => next(err)
    );
});
// create hospitals
router.post('/', accessControl.assertUserIsAdmin, (req, res, next) => {
    const param = req.body;
    return userService.createHospital(param, req.user).then(
        (data) => {
            return res.send(RS.successMessage(data));
        },
        (err) => next(err)
    );
});

// change user role
router.post('/:id/role', accessControl.assertUserIsAdmin, (req, res, next) => {
    const userId = req.params.id;
    return userService.changeUserRole(userId, req.body.role, req.user).then(
        (data) => {
            return res.send(RS.successMessage(data));
        },
        (err) => next(err)
    );
});

// block user
router.post('/:id/block', accessControl.assertUserIsAdmin, (req, res, next) => {
    const userId = req.params.id;
    return userService.blockUser(userId, req.user).then(
        (data) => {
            return res.send(RS.successMessage(data));
        },
        (err) => next(err)
    );
});

// unblock user
router.post(
    '/:id/unblock',
    accessControl.assertUserIsAdmin,
    (req, res, next) => {
        const userId = req.params.id;
        return userService.unblockUser(userId, req.user).then(
            (data) => {
                return res.send(RS.successMessage(data));
            },
            (err) => next(err)
        );
    }
);

// script for add users and reviews from google form
router.post('/upload', accessControl.assertUserIsAdmin, (req, res, next) => {
    return userService.readExcelFile(req.user).then(
        (data) => {
            return res.send(RS.successMessage(data));
        },
        (err) => next(err)
    );
});

// hard delete user
router.delete('/delete/:id', (req, res, next) => {
    const userId = req.params.id;
    console.log(userId, 'user id');
    return userService.deleteUserForever(userId, req.user).then(
        (data) => {
            return res.send(RS.successMessage(data));
        },
        (err) => next(err)
    );
});

// mark doctor as sponsored
router.post('/mark-sponsor/', accessControl.assertUserIsAdmin, (req, res, next) => {
    console.log('going to mark');
    return userService.markDoctorAsSponsored(req.body, req.user).then(
        (data) => {
            return res.send(RS.successMessage(data));
        },
        (err) => next(err)
    );
});

module.exports = router;
