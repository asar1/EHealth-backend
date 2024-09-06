'use strict';
const ForumStorage = require('../storage/ForumStorage');
const forumStorage = new ForumStorage();
const Forum = require('../storage/model/Forum');
const forumPopulation = require('../storage/populate/forumPopulation');
const {
    imageUploadToGCS
} = require('../../base/service/integration/google-cloud-storage');
const { populate } = require('../storage/model/Forum');
const spamFiltering = require('../../base/service/spamFiltering');
// const { reject } = require("lodash");

const addPost = async (param, files, user) => {
    const dataToSend = {
        title: param.title,
        content: param.content,
        published: false,
        image: param.image
    };
    var options = { string: param.content + param.title };
    if (files && files.length > 0) {
        const images = [];
        for (let index = 0; index < files.length; index++) {
            const element = files[index];
            const imageUrl = await imageUploadToGCS(element);
            images.push(imageUrl);
        }
        dataToSend.image = images;
    }

    return new Promise(async (resolve, reject) => {
        spamFiltering(options, async (err, results) => {
            console.log('err:', err);
            console.log('results:', results);
            if (results.spam) {
                console.log('these are going to retun');
                await forumStorage.store(dataToSend, user, forumPopulation.find);
                reject({
                    message: 'Content of the post is in spam ! please refine it'
                });
            } else {
                dataToSend.published = true;
                return resolve(
                    forumStorage.store(dataToSend, user, forumPopulation.find)
                );
                //  return "added post"
            }
        });
    });
    // return await
};

const addComments = async (postId, param, files, user) => {
    return new Promise(async (resolve, reject) => {
        console.log(files, 'these are files');
        const dataToSend = {
            content: param.content,
            user: user._id,
            published: false,
            dateEntered: new Date(),
            image: param.image
        };
        if (files && files.length > 0) {
            const images = [];
            for (let index = 0; index < files.length; index++) {
                const element = files[index];
                const imageUrl = await imageUploadToGCS(element);
                images.push(imageUrl);
            }
            dataToSend.image = images;
        }

        var options = { string: param.content };
        // let results = await spamFiltering.checkSpam(options,() => {
        //   console.log("this is callback")
        // });
        // console.log(results, "asdfasdfasd")
        spamFiltering(options, async (err, results) => {
            console.log('err:', err);
            console.log('results:', results);
            if (results.spam) {
                console.log('these are going to retun');
                await Forum.update({ _id: postId }, { $push: { comments: dataToSend } });
                return reject({
                    message: 'Content of the comment is in spam ! please refine it'
                });
            } else {
                dataToSend.published = true;
                await Forum.update({ _id: postId }, { $push: { comments: dataToSend } });
                return resolve(
                    'your comment has been added'
                );
            }
        });
    });
};

const publishPost = (postId, param, user) => {
    const dataToUpdate = {
        published: param.publish
    };

    return forumStorage.update(postId, dataToUpdate, user, populate.find);
};

const publishComment = (commentId, param, user) => {
    return Forum.updateOne(
        {
            'comments._id': commentId
        },
        { $set: { 'comments.$.published': param.publish } }
    );
};

const getAllPosts = (isPublish) => {
    return forumStorage.list({ published: isPublish }, forumPopulation.find, {
        createdAt: -1
    });
};

const getAPost = (id) => {
    console.log("here it si");
    return forumStorage.list({ _id: id }, forumPopulation.find);
};

const getAllComments = (isPublish) => {
    return forumStorage.list(
        { 'comments.published': isPublish },
        forumPopulation.find,
        { createdAt: -1 }
    );
};

const searchForum = async (txt) => {
    const resultsTitle = await forumStorage.list({ title: { $regex: txt, $options: 'i' }, published: true }, forumPopulation.find, {
        createdAt: -1
    });
    const resultsContent = await forumStorage.list({ content: { $regex: txt, $options: 'i' }, published: true }, forumPopulation.find, {
        createdAt: -1
    });
    const results = [...resultsTitle, ...resultsContent];

    return results.filter((item, index, self) =>
        index === self.findIndex((t) => (
            t._id.toString() === item._id.toString()
        ))
    );
};

module.exports = {
    addPost,
    addComments,
    publishPost,
    publishComment,
    getAllPosts,
    getAllComments,
    searchForum,
    getAPost
};
