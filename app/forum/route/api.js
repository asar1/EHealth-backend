'use strict';

const express = require('express');
const router = express.Router();
const forumService = require('../service/forumService');
const upload = require('../../base/service/multerService');
const accessControl = require('../../base/service/middlewares/accessControl');
const RS = require('../../base/response/responseService');

router.get('/get-a-post/:id', (req, res, next) => {
    console.log('he');
    return forumService
        .getAPost(req.params.id)
        .then(data => res.send(RS.successMessage(data)))
        .catch(err => next(err));
});

router.get('/:publish', (req, res, next) => {
    console.log(req.params.publish, 'this is req body');
    return forumService
        .getAllPosts(req.params.publish)
        .then(data => res.send(RS.successMessage(data)))
        .catch(err => next(err));
});

router.get('/comments/:publish', (req, res, next) => {
    console.log(req.params.publish, 'this is req body');
    return forumService
        .getAllComments(req.params.publish)
        .then(data => res.send(RS.successMessage(data)))
        .catch(err => next(err));
});

router.get('/search/:txt', (req, res, next) => {
    console.log(req.params.txt, 'this is req bodyss');
    return forumService
        .searchForum(req.params.txt)
        .then(data => res.send(RS.successMessage(data)))
        .catch(err => next(err));
});

router.post('/', upload.any(), (req, res, next) => {
    return forumService
        .addPost(req.body, req.files, req.user)
        .then((data) => res.send(RS.successMessage(data)))
        .catch((err) => next(err));
});

router.post('/comment/:id', upload.any(), (req, res, next) => {
    console.log(req.files, 'these are files');
    return forumService
        .addComments(req.params.id, req.body, req.files, req.user)
        .then((data) => res.send(RS.successMessage(null, data)))
        .catch((err) => next(err));
});

router.put('/:id', accessControl.assertUserIsAdmin, (req, res, next) => {
    return forumService
        .publishPost(req.params.id, req.body, req.user)
        .then((data) => res.send(RS.successMessage(data)))
        .catch((err) => next(err));
});

router.put('/comment/:id', accessControl.assertUserIsAdmin, (req, res, next) => {
    return forumService
        .publishComment(req.params.id, req.body, req.user)
        .then((data) => res.send(RS.successMessage(data)))
        .catch((err) => next(err));
});

module.exports = router;
