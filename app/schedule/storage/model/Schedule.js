'use strict';

const mongoose = require('mongoose');

const scheduleSchema = mongoose.Schema({
    from: {
        type: String
    },
    to: {
        type: String
    },
    doctor: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    error: {
        type: String
    },
    actualTimefrom: {
        type: Date
    },
    actualTimeto: {
        type: Date
    },
    type: {
        type: String
    },
    totalMinutes: {
        type: Number
    },
    numberOfSlots: {
        type: Number
    },
    timeToEntertainSlot: {
        type: Number
    }
}, { timestamps: true });

const scheduleModel = mongoose.model('Schedule', scheduleSchema);

module.exports = scheduleModel;
