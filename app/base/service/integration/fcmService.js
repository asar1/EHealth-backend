'use strict';

var _ = require('lodash');
const Promise = require('bluebird');
const config = require('config');
const FCM = require('fcm-push');
let fcmObj;

const getFCMObj = () => {
    if (fcmObj) {
        return fcmObj;
    }

    fcmObj = new FCM(config.fcm.serverKey);

    return fcmObj;
};

const extractDeviceTokensByType = (deviceTokens) => {
    var response = {
        android: [],
        ios: []
    };

    response.android = _.map(deviceTokens, (token) => {
        return (token.indexOf('ANDROID:') === -1) ? null : token.replace('ANDROID:', '');
    });

    response.ios = _.map(deviceTokens, (token) => {
        return (token.indexOf('IOS:') === -1) ? null : token.replace('IOS:', '');
    });

    response.android = _.filter(response.android);
    response.ios = _.filter(response.ios);

    return response;
};

const sendNotification = (deviceTokens, message) => {
    const fcm = getFCMObj();
    message.priority = 'high';
    var deviceTypes = extractDeviceTokensByType(deviceTokens);
    console.log(deviceTypes);
    for (var tokens of deviceTypes) {
        if (tokens && tokens.length === 0) continue;
        tokens.forEach(async (token) => {
            message.to = token;
            try {
                const response = await fcm.send(message);
                console.log('Successfully sent with response: ', response);
            } catch (error) {
                console.log('Something has gone wrong!', error);
            }
        });
    }
};

module.exports = {
    sendNotification
};
