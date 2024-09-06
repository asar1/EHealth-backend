'use strict';

const InboxStorage = require('../storage/InboxStorage');
const inboxStorage = new InboxStorage();
const inboxPopulation = require('../storage/populate/inboxPopulation');
const InboxModel = require('../storage/model/Inbox');
const RS = require('../../base/response/responseService');
const jwt = require('jsonwebtoken');
const { imageUploadToGCS } = require('../../base/service/integration/google-cloud-storage');

const decodeUser = (tokenReceived) => {
    try {
        const token = tokenReceived.split(' ')[1];

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        return decoded;
    } catch (error) {
        return null;
    }
};
const createThread = async (param) => {
    const user = await decodeUser(param.user);
    if (user) {
        const dataToServer = {
            sender: param.sender,
            receiver: param.receiver,
            hasUnreadMessages: true,
            date: param.message.date,
            messages: [{
                text: param.message.text,
                date: param.message.date,
                img: param.message.img,
                read: false,
                from: param.sender,
                sent: true
            }]
        };
        dataToServer[param.from + 'Socket'] = param.socketId;
        if (param.from === 'doctor') {
            dataToServer[param.from + 'Read'] = true;
            dataToServer.patientRead = false;
        } else {
            dataToServer[param.from + 'Read'] = true;
            dataToServer.doctorRead = false;
        }

        const previousChatAsSender = await inboxStorage.findOne({ $and: [{ sender: dataToServer.sender }, { receiver: dataToServer.receiver }] }, inboxPopulation.find);
        const previousChatAsReceiver = await inboxStorage.findOne({ $and: [{ receiver: dataToServer.sender }, { sender: dataToServer.receiver }] }, inboxPopulation.find);

        if (!previousChatAsReceiver && !previousChatAsSender) {
            return inboxStorage.store(dataToServer, user, inboxPopulation.find);
        } else {
            const perviousId = previousChatAsSender ? previousChatAsSender._id : previousChatAsReceiver._id;
            const updatesOnDoc = {
                $push: { messages: dataToServer.messages[0] },
                $set: { patientRead: dataToServer.patientRead, doctorRead: dataToServer.doctorRead }
            };
            await InboxModel.update({ _id: perviousId }, updatesOnDoc);
        }
    } else {
        console.log('asdf');
        return RS.errorMessage('Auth failed');
    }
};

const getMessages = async (param) => {
    console.log(param.from, 'fetch messages from');
    let messages = await inboxStorage.findOne({ $and: [{ sender: param.sender }, { receiver: param.receiver }] }, inboxPopulation.find);
    if (!messages) {
        messages = await inboxStorage.findOne({ $and: [{ receiver: param.sender }, { sender: param.receiver }] }, inboxPopulation.find);
    }
    const updateProp = {};
    updateProp[param.from + 'Read'] = true;
    await inboxStorage.updateOne(
        { _id: messages._id },
        updateProp,
        {},
        inboxPopulation.find
    );
    return messages;
};

const storeSockets = async (param) => {
    let messages = await inboxStorage.findOne({ $and: [{ sender: param.sender }, { receiver: param.receiver }] }, inboxPopulation.find);
    if (!messages) {
        messages = await inboxStorage.findOne({ $and: [{ receiver: param.sender }, { sender: param.receiver }] }, inboxPopulation.find);
    }
    if (messages) {
        if (param.from === 'patient') {
            inboxStorage.updateOne(
                { _id: messages._id },
                {
                    patientSocket: param.socket
                },
                {},
                inboxPopulation.find
            );
        } else {
            inboxStorage.updateOne(
                { _id: messages._id },
                {
                    doctorSocket: param.socket
                },
                {},
                inboxPopulation.find
            );
        }
    }
};

const getInbox = async (param) => {
    const threads = await inboxStorage.list({ $or: [{ sender: param.sender }, { receiver: param.sender }] }, inboxPopulation.find);

    return threads;
};

const markAsRead = async (param) => {
    const dataToServer = {};

    console.log(param, 'this is param');

    if (param.from === 'doctor') {
        dataToServer[param.from + 'Read'] = true;
    } else if (param.from === 'patient') {
        dataToServer[param.from + 'Read'] = true;
    }

    inboxStorage.updateOne(
        { _id: param._id },
        dataToServer,
        {},
        inboxPopulation.find
    );
};

module.exports = {
    createThread,
    getMessages,
    getInbox,
    storeSockets,
    markAsRead
};
