'use strict';

const mongoose = require('mongoose');

const inbox = mongoose.Schema(
    {
        sender: {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        },
        receiver: {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        },
        date: {
            type: Date
        },
        hasUnreadMessages: {
            type: Boolean,
            default: true
        },
        doctorRead: {
            type: Boolean,
            default: false
        },
        patientRead: {
            type: Boolean,
            default: false
        },
        messages: [
            {
                text: String,
                date: Date,
                img: String,
                read: Boolean,
                from: mongoose.Types.ObjectId,
                sent: Boolean
            }
        ],
        doctorSocket: {
            type: String
        },
        patientSocket: {
            type: String
        }
    },
    { timestamps: true }
);

const inboxModel = mongoose.model('Inbox', inbox);

module.exports = inboxModel;
